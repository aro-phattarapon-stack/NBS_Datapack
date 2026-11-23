import { Elysia, t } from 'elysia';
import { MC_QUEST_WHITELIST, type TeamColor } from '../../shared/types';
import { generateSmartFlashQuest } from '../ai/quest-director';
import {
  clearActiveSeasonStart,
  getHistoryData,
  markSeasonStarted,
  recordAuditLog,
  recordFlashQuest,
  syncOnlinePlayers,
} from '../db';
import {
  extractClientKey,
  timingSafeTokenMatch,
  type AdminRateLimiter,
} from '../middleware/auth';
import type { GameStateManager } from '../rcon/poller';
import type { RconCommandService } from '../services/rcon-commands';

export function sanitizeMcString(input: string, maxLen = 32): string {
  return input.replace(/["\\\r\n{}]/g, '').trim().slice(0, maxLen);
}

export interface AdminRoutesDeps {
  adminSecret: string;
  rateLimiter: AdminRateLimiter;
  game: GameStateManager;
  commandService: RconCommandService;
}

export function createAdminRoutes({
  adminSecret,
  rateLimiter,
  game,
  commandService,
}: AdminRoutesDeps) {
  return new Elysia({ prefix: '/api/admin' })
    .onBeforeHandle(({ request, headers, set }) => {
      const clientKey = extractClientKey(request);
      const limit = rateLimiter.check(clientKey);
      if (!limit.allowed) {
        set.status = 429;
        set.headers['retry-after'] = String(limit.retryAfterSec);
        return {
          ok: false,
          error: `ลองรหัสผ่านผิดเกินกำหนด กรุณารอ ${limit.retryAfterSec} วินาที`,
        };
      }

      if (!timingSafeTokenMatch(headers['x-admin-token'], adminSecret)) {
        rateLimiter.recordFailure(clientKey);
        set.status = 401;
        return { ok: false, error: 'Unauthorized: รหัสผ่าน Admin ไม่ถูกต้อง' };
      }

      rateLimiter.reset(clientKey);
    })
    .post('/verify', () => ({ ok: true }))
    .post('/sync', async () => {
      const started = performance.now();
      await game.pollOnce();
      const latencyMs = Math.round(performance.now() - started);
      const st = game.getState();
      await recordAuditLog('system:force_sync', {}, `OK (${latencyMs}ms)`);
      return {
        ok: true,
        mode: st.mode,
        dbConnected: st.dbConnected,
        onlinePlayers: st.onlinePlayers,
        worldId: st.worldId,
        latencyMs,
        updatedAt: st.updatedAt,
      };
    })
    .post('/season/reset', async () => {
      await game.resetForNewSeason(game.getState().worldId + 1, `Season ${new Date().toISOString().slice(0, 10)}`);
      await recordAuditLog('season:reset', {}, 'OK');
      return { ok: true, result: 'ล้างสถิติเว็บและเริ่มต้นซีซันใหม่เรียบร้อยแล้ว' };
    })
    .post(
      '/game/action',
      async ({ body, set }) => {
        const map: Record<string, string> = {
          start: 'function nbs:game/start',
          do_start: 'function nbs:game/do_start',
          auto_ready: 'function nbs:game/auto_ready',
          raid_on: 'function nbs:game/raid_on',
          raid_off: 'function nbs:game/raid_off',
          reset: 'function nbs:game/reset',
        };

        const cmd = map[body.action];
        if (!cmd) {
          set.status = 400;
          return { ok: false, error: 'Invalid action' };
        }

        if (body.action === 'start' && game.mode === 'demo') {
          const unready = game
            .getState()
            .players.filter((p) => p.online && (p.teamId <= 0 || p.careerId <= 0));
          if (unready.length > 0) {
            const names = unready.map((p) => p.name).join(', ');
            const errMsg = `ยังไม่สามารถเริ่มเกมได้: ${names} ยังไม่ได้เลือกทีมหรือสายอาชีพ (กด "สุ่มทีม + อาชีพ" หรือ "บังคับเริ่มเกม")`;
            await recordAuditLog('game:start', body, `BLOCKED (${names})`);
            set.status = 400;
            return { ok: false, error: errMsg };
          }
        }

        const execRes = await commandService.execute(cmd, (draft) => {
          if (body.action === 'auto_ready') {
            const activeTeamIds = draft.teams.filter((t) => t.active).map((t) => t.id);
            const fallbackTeamIds = activeTeamIds.length > 0 ? activeTeamIds : [1, 2, 3, 4];
            draft.players = draft.players.map((p, idx) => ({
              ...p,
              teamId: p.teamId > 0 ? p.teamId : fallbackTeamIds[idx % fallbackTeamIds.length]!,
              careerId: p.careerId > 0 ? p.careerId : ((idx % 4) + 1),
            }));
          }
          if (body.action === 'start' || body.action === 'do_start') {
            draft.gameState = 1;
            const started = new Date();
            draft.seasonStartedAt = started.toISOString();
            draft.gracePeriodEndsAt = new Date(started.getTime() + 48 * 3600 * 1000).toISOString();
            draft.raidDay = false;
          }
          if (body.action === 'reset') {
            draft.gameState = 0;
            draft.raidDay = false;
            draft.seasonStartedAt = null;
            draft.gracePeriodEndsAt = null;
          }
          if (body.action === 'raid_on') draft.raidDay = true;
          if (body.action === 'raid_off') draft.raidDay = false;
        });

        if (execRes.ok && body.action === 'auto_ready' && game.mode === 'demo') {
          const teamNameMap = new Map(game.getState().teams.map((t) => [t.id, t.name]));
          await syncOnlinePlayers(game.getState().players, teamNameMap);
        }

        if (execRes.ok && body.action === 'start' && game.mode === 'rcon' && game.getState().gameState === 0) {
          const errMsg =
            'ยังไม่สามารถเริ่มเกมได้: มีผู้เล่นในเซิร์ฟเวอร์ยังเลือกทีมหรือสายอาชีพไม่ครบ (กด "สุ่มทีม + อาชีพ" หรือ "บังคับเริ่มเกม")';
          await recordAuditLog('game:start', body, 'BLOCKED_BY_READY_CHECK');
          set.status = 400;
          return { ok: false, error: errMsg };
        }

        if (execRes.ok && (body.action === 'start' || body.action === 'do_start')) {
          await markSeasonStarted(`World ${game.getState().worldId}`);
        } else if (execRes.ok && body.action === 'reset') {
          await clearActiveSeasonStart();
        }

        await recordAuditLog(`game:${body.action}`, body, execRes.result ?? execRes.error ?? 'ERROR');
        if (!execRes.ok) {
          set.status = execRes.status;
          return { ok: false, error: execRes.error };
        }
        return { ok: true, result: execRes.result };
      },
      {
        body: t.Object({
          action: t.Union([
            t.Literal('start'),
            t.Literal('do_start'),
            t.Literal('auto_ready'),
            t.Literal('raid_on'),
            t.Literal('raid_off'),
            t.Literal('reset'),
          ]),
        }),
      },
    )
    .post(
      '/team/count',
      async ({ body, set }) => {
        const count = Math.max(1, Math.min(8, body.count));
        const execRes = await commandService.execute(
          `function nbs:team/set_count {count:${count}}`,
          (draft) => {
            for (const team of draft.teams) {
              team.active = team.id <= count;
            }
          },
        );
        await recordAuditLog('team:set_count', { count }, execRes.result ?? execRes.error ?? 'ERROR');
        if (!execRes.ok) {
          set.status = execRes.status;
          return { ok: false, error: execRes.error };
        }
        return { ok: true, result: execRes.result };
      },
      {
        body: t.Object({
          count: t.Integer({ minimum: 1, maximum: 8 }),
        }),
      },
    )
    .post(
      '/team/rename',
      async ({ body, set }) => {
        const safeName = sanitizeMcString(body.name, 24);
        if (!safeName) {
          set.status = 400;
          return { ok: false, error: 'ชื่อทีมห้ามว่างเปล่า' };
        }
        const execRes = await commandService.execute(
          `function nbs:team/rename {team:${body.team},name:"${safeName}"}`,
          (draft) => {
            const target = draft.teams.find((t) => t.id === body.team);
            if (target) target.name = safeName;
          },
        );
        await recordAuditLog('team:rename', { team: body.team, name: safeName }, execRes.result ?? execRes.error ?? 'ERROR');
        if (!execRes.ok) {
          set.status = execRes.status;
          return { ok: false, error: execRes.error };
        }
        return { ok: true, result: execRes.result };
      },
      {
        body: t.Object({
          team: t.Integer({ minimum: 1, maximum: 8 }),
          name: t.String({ minLength: 1, maxLength: 32 }),
        }),
      },
    )
    .post(
      '/team/color',
      async ({ body, set }) => {
        const execRes = await commandService.execute(
          `function nbs:team/set_color {team:${body.team},color:"${body.color}"}`,
          (draft) => {
            const target = draft.teams.find((t) => t.id === body.team);
            if (target) target.color = body.color as TeamColor;
          },
        );
        await recordAuditLog('team:set_color', body, execRes.result ?? execRes.error ?? 'ERROR');
        if (!execRes.ok) {
          set.status = execRes.status;
          return { ok: false, error: execRes.error };
        }
        return { ok: true, result: execRes.result };
      },
      {
        body: t.Object({
          team: t.Integer({ minimum: 1, maximum: 8 }),
          color: t.Union([
            t.Literal('red'),
            t.Literal('blue'),
            t.Literal('green'),
            t.Literal('yellow'),
            t.Literal('light_purple'),
            t.Literal('aqua'),
            t.Literal('gold'),
            t.Literal('white'),
            t.Literal('dark_red'),
            t.Literal('dark_aqua'),
          ]),
        }),
      },
    )
    .post('/team/auto_assign', async ({ set }) => {
      const execRes = await commandService.execute('function nbs:team/auto_assign', (draft) => {
        const activeTeamIds = draft.teams.filter((t) => t.active).map((t) => t.id);
        const fallbackTeamIds = activeTeamIds.length > 0 ? activeTeamIds : [1, 2, 3, 4];
        draft.players = draft.players.map((p, idx) => ({
          ...p,
          teamId: p.teamId > 0 ? p.teamId : fallbackTeamIds[idx % fallbackTeamIds.length]!,
        }));
      });
      if (execRes.ok && game.mode === 'demo') {
        const teamNameMap = new Map(game.getState().teams.map((t) => [t.id, t.name]));
        await syncOnlinePlayers(game.getState().players, teamNameMap);
      }
      await recordAuditLog('team:auto_assign', {}, execRes.result ?? execRes.error ?? 'ERROR');
      if (!execRes.ok) {
        set.status = execRes.status;
        return { ok: false, error: execRes.error };
      }
      return { ok: true, result: execRes.result };
    })
    .post('/team/reset', async ({ set }) => {
      const execRes = await commandService.execute('function nbs:team/reset_teams', (draft) => {
        const defaults: TeamColor[] = ['red', 'blue', 'green', 'yellow', 'light_purple', 'aqua', 'gold', 'white'];
        for (const team of draft.teams) {
          team.name = `Team ${team.id}`;
          team.color = defaults[team.id - 1]!;
          team.active = team.id <= 4;
        }
      });
      await recordAuditLog('team:reset', {}, execRes.result ?? execRes.error ?? 'ERROR');
      if (!execRes.ok) {
        set.status = execRes.status;
        return { ok: false, error: execRes.error };
      }
      return { ok: true, result: execRes.result };
    })
    .post('/quest/ai', async ({ set }) => {
      const history = await getHistoryData();
      const recentItems = history.quests.slice(0, 4).map((q) => q.item);
      const quest = await generateSmartFlashQuest(game.getState(), recentItems);

      const applyQuest = (draft: ReturnType<GameStateManager['getState']>) => {
        draft.flashQuest = {
          active: true,
          item: quest.item,
          count: quest.count,
          name: quest.displayName,
          remainingSeconds: 1500,
          maxSeconds: 1500,
          source: quest.source,
          reason: quest.reason,
        };
      };

      const cmd = `function nbs:citadel/set_flash_quest {item:"${quest.item}",count:${quest.count},name:"${quest.displayName}"}`;
      const execRes = await commandService.execute(cmd, applyQuest, applyQuest);
      if (!execRes.ok) {
        await recordAuditLog('quest:ai_generate', quest, execRes.error ?? 'ERROR');
        set.status = execRes.status;
        return { ok: false, error: execRes.error };
      }

      await recordFlashQuest({
        item: quest.item,
        count: quest.count,
        displayName: quest.displayName,
        source: quest.source,
        aiReason: quest.reason,
      });
      await recordAuditLog('quest:ai_generate', quest, execRes.result ?? 'OK');
      return { ok: true, quest, result: execRes.result };
    })
    .post(
      '/quest/custom',
      async ({ body, set }) => {
        const entry = MC_QUEST_WHITELIST.find((w) => w.item === body.item);
        if (!entry) {
          set.status = 400;
          return { ok: false, error: 'Item ไม่อยู่ใน Whitelist ของ Minecraft 26.3' };
        }
        const count = Math.max(entry.minCount, Math.min(entry.maxCount, body.count));
        const safeName =
          sanitizeMcString(body.displayName ?? `${entry.thaiName} x${count}`, 40) ||
          `${entry.thaiName} x${count}`;

        const applyQuest = (draft: ReturnType<GameStateManager['getState']>) => {
          draft.flashQuest = {
            active: true,
            item: entry.item,
            count,
            name: safeName,
            remainingSeconds: 1500,
            maxSeconds: 1500,
            source: 'MANUAL',
            reason: 'กำหนดโดยแอดมินผ่านหน้า Web Dashboard',
          };
        };

        const cmd = `function nbs:citadel/set_flash_quest {item:"${entry.item}",count:${count},name:"${safeName}"}`;
        const execRes = await commandService.execute(cmd, applyQuest, applyQuest);
        if (!execRes.ok) {
          await recordAuditLog('quest:custom', { item: entry.item, count, safeName }, execRes.error ?? 'ERROR');
          set.status = execRes.status;
          return { ok: false, error: execRes.error };
        }

        await recordFlashQuest({
          item: entry.item,
          count,
          displayName: safeName,
          source: 'MANUAL',
          aiReason: 'กำหนดโดยแอดมินผ่าน Web Dashboard',
        });
        await recordAuditLog('quest:custom', { item: entry.item, count, safeName }, execRes.result ?? 'OK');
        return { ok: true, result: execRes.result };
      },
      {
        body: t.Object({
          item: t.String(),
          count: t.Integer({ minimum: 1, maximum: 64 }),
          displayName: t.Optional(t.String()),
        }),
      },
    );
}
