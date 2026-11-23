import { afterAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { join } from 'node:path';
import { isMojangUuid } from '../../components/portal/PlayerAvatar';
import { createApp } from '../app';
import { pickWeightedFallback } from '../ai/quest-director';
import { recordPlayerStatsHistory } from '../db';
import { AdminRateLimiter, timingSafeTokenMatch, validateAdminSecret } from '../middleware/auth';
import { RconClient } from '../rcon/client';
import {
  GameStateManager,
  evaluateGracePeriod,
  fallbackPlayerUuid,
  parseMcUuid,
  parseTeamQuestCounts,
} from '../rcon/poller';

describe('Admin Auth & Rate Limiting (P0)', () => {
  test('rejects missing, short, and known default ADMIN_TOKEN secrets', () => {
    expect(() => validateAdminSecret(undefined)).toThrow();
    expect(() => validateAdminSecret('')).toThrow();
    expect(() => validateAdminSecret('short123')).toThrow();
    expect(() => validateAdminSecret('nbs-admin')).toThrow();
    expect(() => validateAdminSecret('change_this_admin_password')).toThrow();
    expect(validateAdminSecret('super-strong-secret-99')).toBe('super-strong-secret-99');
  });

  test('constant-time token matching works accurately', () => {
    expect(timingSafeTokenMatch('secret-token-12345', 'secret-token-12345')).toBe(true);
    expect(timingSafeTokenMatch('secret-token-12346', 'secret-token-12345')).toBe(false);
    expect(timingSafeTokenMatch(undefined, 'secret-token-12345')).toBe(false);
  });

  test('rate limiter blocks after max failed attempts and returns retryAfter', () => {
    const limiter = new AdminRateLimiter(3, 60_000);
    const now = 1_000_000;
    expect(limiter.check('1.2.3.4', now).allowed).toBe(true);
    limiter.recordFailure('1.2.3.4', now);
    limiter.recordFailure('1.2.3.4', now + 100);
    limiter.recordFailure('1.2.3.4', now + 200);
    const blocked = limiter.check('1.2.3.4', now + 300);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);

    limiter.reset('1.2.3.4');
    expect(limiter.check('1.2.3.4', now + 300).allowed).toBe(true);
  });
});

describe('Demo vs Production RCON Isolation & Endpoints', () => {
  const SECRET = 'test-strong-admin-token-42';

  test('returns 401 on invalid token and 429 after brute-force threshold', async () => {
    const game = new GameStateManager({ mode: 'demo' });
    const app = createApp({
      adminSecret: SECRET,
      game,
      rateLimiter: new AdminRateLimiter(2, 60_000),
    });

    const res1 = await app.handle(
      new Request('http://localhost/api/admin/verify', {
        method: 'POST',
        headers: { 'x-admin-token': 'wrong' },
      }),
    );
    expect(res1.status).toBe(401);

    const res2 = await app.handle(
      new Request('http://localhost/api/admin/verify', {
        method: 'POST',
        headers: { 'x-admin-token': 'wrong' },
      }),
    );
    expect(res2.status).toBe(401);

    const res3 = await app.handle(
      new Request('http://localhost/api/admin/verify', {
        method: 'POST',
        headers: { 'x-admin-token': SECRET },
      }),
    );
    expect(res3.status).toBe(429);

    game.stopPoller();
  });

  test('never fakes success when RCON is offline in production rcon mode (503)', async () => {
    const deadClient = new RconClient('127.0.0.1', 59999, 'valid-rcon-secret', 150);
    const game = new GameStateManager({ mode: 'rcon', rconClient: deadClient });
    const app = createApp({
      adminSecret: SECRET,
      game,
    });

    const res = await app.handle(
      new Request('http://localhost/api/admin/game/action', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': SECRET,
        },
        body: JSON.stringify({ action: 'start' }),
      }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { ok: boolean; error?: string };
    expect(json.ok).toBe(false);

    game.stopPoller();
  });
});

describe('RCON Mock Server Integration & Single-flight Polling (P1)', () => {
  const sockets: net.Socket[] = [];
  let commandLog: string[] = [];

  const server = net.createServer((sock) => {
    sockets.push(sock);
    let buf: Buffer = Buffer.alloc(0);

    const sendPacket = (id: number, type: number, body: string) => {
      const bodyBuf = Buffer.from(body, 'utf8');
      const pktLen = 4 + 4 + bodyBuf.length + 2;
      const out = Buffer.alloc(4 + pktLen);
      out.writeInt32LE(pktLen, 0);
      out.writeInt32LE(id, 4);
      out.writeInt32LE(type, 8);
      bodyBuf.copy(out, 12);
      out.writeInt16LE(0, 12 + bodyBuf.length);
      sock.write(out);
    };

    sock.on('data', (chunk: Buffer | string) => {
      const part = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      buf = Buffer.concat([buf, part]);
      while (buf.length >= 4) {
        const len = buf.readInt32LE(0);
        if (buf.length < 4 + len) return;
        const id = buf.readInt32LE(4);
        const type = buf.readInt32LE(8);
        const payload = buf.subarray(12, 4 + len - 2).toString('utf8');
        buf = buf.subarray(4 + len);

        if (type === 3) {
          sendPacket(payload === 'mock-rcon-pass' ? id : -1, 2, '');
          continue;
        }
        commandLog.push(payload);
        if (payload === 'list') {
          sendPacket(id, 0, 'There are 2 of a max of 20 players online: Alpha, Beta');
        } else if (payload === 'scoreboard players get #game_state game_state') {
          sendPacket(id, 0, '#game_state has 1 [game_state]');
        } else if (payload === 'scoreboard players get #raid_day game_state') {
          sendPacket(id, 0, '#raid_day has 0 [game_state]');
        } else if (payload === 'scoreboard players get #flash_timer rnd_temp') {
          sendPacket(id, 0, '#flash_timer has 900 [rnd_temp]');
        } else if (payload === 'bossbar get nbs:flash_quest max') {
          sendPacket(id, 0, 'Bossbar [⚡] has a maximum of 1800');
        } else if (payload === 'data get storage nbs:citadel flash') {
          sendPacket(id, 0, 'Storage nbs:citadel has the following contents: {item:"minecraft:blaze_rod",count:12,name:"Blaze Rod x12"}');
        } else if (payload.includes('_active game_state')) {
          sendPacket(id, 0, payload.includes('#t1_active') || payload.includes('#t2_active') ? 'has 1 [game_state]' : 'has 0 [game_state]');
        } else if (payload.includes('UUID')) {
          sendPacket(id, 0, 'Alpha has the following entity data: [I; 17, 34, 51, 68]');
        } else if (payload.includes('flag_anchor')) {
          sendPacket(id, 0, 'Test passed, count: 2');
        } else if (payload.includes('team_id')) {
          sendPacket(id, 0, 'Player has 1 [team_id]');
        } else if (payload.includes('career_id')) {
          sendPacket(id, 0, 'Player has 2 [career_id]');
        } else if (payload.includes('team_score')) {
          sendPacket(id, 0, 'ทีมที่_1 has 240 [team_score]');
        } else {
          sendPacket(id, 0, 'has 0 [score]');
        }
      }
    });
  });

  afterAll(() => {
    for (const s of sockets) s.destroy();
    server.close();
  });

  test('single-flight poll deduplicates concurrent polls and skips inactive teams', async () => {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const addr = server.address() as net.AddressInfo;
    commandLog = [];

    const client = new RconClient('127.0.0.1', addr.port, 'mock-rcon-pass', 1000);
    const game = new GameStateManager({ mode: 'rcon', rconClient: client });

    // Fire 3 concurrent pollOnce calls simultaneously -> must share 1 flight!
    await Promise.all([game.pollOnce(), game.pollOnce(), game.pollOnce()]);

    const listCalls = commandLog.filter((c) => c === 'list');
    expect(listCalls.length).toBe(1);

    // Inactive teams (3..8) must NOT be polled for chest/diamonds/boss breakdown
    const team3ScoreCalls = commandLog.filter((c) => c.includes('ทีมที่_3 team_score'));
    expect(team3ScoreCalls.length).toBe(0);

    const state = game.getState();
    expect(state.gameState).toBe(1);
    expect(state.flashQuest.maxSeconds).toBe(1800);
    expect(state.players.length).toBe(2);
    expect(state.teams[0]!.flags).toBe(2);
    expect(state.teams[0]!.score).toBe(240);

    game.stopPoller();
  });
});

describe('Weighted AI Pool Fallback (P2)', () => {
  test('never picks late-only tier items during early game stage', () => {
    const baseState = new GameStateManager({ mode: 'demo' }).getState();
    baseState.raidDay = false;
    for (const t of baseState.teams) t.score = 100;

    for (let i = 0; i < 25; i++) {
      const q = pickWeightedFallback([], baseState);
      expect(q.item).not.toBe('minecraft:sculk_catalyst');
    }
  });
});

describe('Player UUID Tracking, Search & Profile API (Milestone 1)', () => {
  test('converts Minecraft [I; a, b, c, d] int array to canonical dashed UUID', () => {
    const uuid = parseMcUuid('Steve has the following entity data: [I; -2040022415, -1202044924, -1353431686, -1758138665]');
    expect(uuid).toBe('8667ba71-b85a-4004-af54-457a9734eed7');
    expect(parseMcUuid('invalid data')).toBeNull();
  });

  test('parses Citadel 16-quest completion per team from NBT storage', () => {
    const map = parseTeamQuestCounts(
      'Storage nbs:citadel has the following contents: {q11: {t1: 1b, t2: 1b}, q14: {t1: 1b}, q22: {t3: 1b}}',
    );
    expect(map.get(1)).toBe(2);
    expect(map.get(2)).toBe(1);
    expect(map.get(3)).toBe(1);
    expect(map.get(4)).toBeUndefined();
  });

  test('keeps Raid OFF during first 48h Grace Period and enables automatically afterwards', () => {
    const startIso = '2026-11-20T12:00:00Z';
    const startMs = new Date(startIso).getTime();

    // At 0h -> still in grace period (48h remaining)
    const atStart = evaluateGracePeriod(startIso, startMs, 48);
    expect(atStart.inGracePeriod).toBe(true);
    expect(atStart.remainingSeconds).toBe(48 * 3600);

    // At 47h 59m -> still in grace period
    const at47h59m = evaluateGracePeriod(startIso, startMs + (47 * 3600 + 59 * 60) * 1000, 48);
    expect(at47h59m.inGracePeriod).toBe(true);
    expect(at47h59m.remainingSeconds).toBe(60);

    // At 48h 01m -> grace period ended -> auto Raid 24/7 triggers
    const after48h = evaluateGracePeriod(startIso, startMs + (48 * 3600 + 60) * 1000, 48);
    expect(after48h.inGracePeriod).toBe(false);
    expect(after48h.remainingSeconds).toBe(0);
  });

  test('supports public search, online/offline filtering, profile lookup + history, teams, and 404', async () => {
    const game = new GameStateManager({ mode: 'demo' });
    const app = createApp({ adminSecret: 'test-strong-admin-token-42', game });

    const searchRes = await app.handle(new Request('http://localhost/api/players?q=Steve'));
    expect(searchRes.status).toBe(200);
    const matches = (await searchRes.json()) as Array<{ uuid: string; name: string; kd: number }>;
    expect(matches.length).toBe(1);
    expect(matches[0]!.name).toBe('Steve');
    expect(matches[0]!.kd).toBe(3.5);

    const offlineRes = await app.handle(new Request('http://localhost/api/players?status=offline'));
    const offlineList = (await offlineRes.json()) as Array<{ name: string; online: boolean }>;
    expect(offlineList.some((p) => p.name === 'Notch' && !p.online)).toBe(true);

    const profileRes = await app.handle(
      new Request(`http://localhost/api/players/${matches[0]!.uuid}`),
    );
    expect(profileRes.status).toBe(200);
    const profile = (await profileRes.json()) as {
      player: {
        uuid: string;
        name: string;
        online: boolean;
        teamId: number;
        careerId: number;
        pvpKills: number;
        kills: number;
        deaths: number;
        kd: number;
        killStreak: number;
        bestStreak: number;
        playtimeSeconds: number;
        questsCompleted: number;
        bossScore: number;
        firstSeenAt: string;
        lastSeenAt: string;
      };
      history: Array<{ kills: number; deaths: number; playtimeSeconds: number }>;
      rank: number;
    };
    expect(profile.player.name).toBe('Steve');
    expect(profile.rank).toBeGreaterThanOrEqual(1);
    expect(profile.history.length).toBeGreaterThanOrEqual(4);

    // Deduplication test: recording identical stats must NOT add duplicate rows
    const beforeLen = profile.history.length;
    await recordPlayerStatsHistory([profile.player]);
    const profileAfterDup = (await (
      await app.handle(new Request(`http://localhost/api/players/${matches[0]!.uuid}`))
    ).json()) as { history: unknown[] };
    expect(profileAfterDup.history.length).toBe(beforeLen);

    // Recording changed stats MUST add a new history row
    await recordPlayerStatsHistory([
      {
        ...profile.player,
        kills: profile.player.kills + 1,
      },
    ]);
    const profileAfterChange = (await (
      await app.handle(new Request(`http://localhost/api/players/${matches[0]!.uuid}`))
    ).json()) as { history: unknown[] };
    expect(profileAfterChange.history.length).toBe(beforeLen + 1);

    const teamsRes = await app.handle(new Request('http://localhost/api/teams'));
    expect(teamsRes.status).toBe(200);
    const teamsJson = (await teamsRes.json()) as {
      teams: Array<{ questsDone: number }>;
      teamHistory: unknown[];
      snapshots: unknown[];
      recentEvents: unknown[];
    };
    expect(teamsJson.teams[0]!.questsDone).toBe(4);
    expect(teamsJson.teamHistory.length).toBeGreaterThanOrEqual(1);
    expect(teamsJson.snapshots.length).toBeGreaterThanOrEqual(4);
    expect(teamsJson.recentEvents.length).toBeGreaterThanOrEqual(1);

    const missingRes = await app.handle(new Request('http://localhost/api/players/non-existent-uuid'));
    expect(missingRes.status).toBe(404);

    const eventsRes = await app.handle(new Request('http://localhost/api/events'));
    expect(eventsRes.status).toBe(200);

    const lbRes = await app.handle(new Request('http://localhost/api/leaderboard?period=7d'));
    expect(lbRes.status).toBe(200);
    const lbJson = (await lbRes.json()) as { players: unknown[]; teams: unknown[]; period: string };
    expect(lbJson.players.length).toBeGreaterThanOrEqual(4);
    expect(lbJson.teams.length).toBe(4);
    expect(lbJson.period).toBe('7d');

    const seasonResetRes = await app.handle(
      new Request('http://localhost/api/admin/season/reset', {
        method: 'POST',
        headers: { 'x-admin-token': 'test-strong-admin-token-42' },
      }),
    );
    expect(seasonResetRes.status).toBe(200);
    const afterReset = await app.handle(new Request('http://localhost/api/players'));
    const clearedPlayers = (await afterReset.json()) as unknown[];
    expect(clearedPlayers.length).toBe(0);

    // Hall of Fame should retain archived champion after season reset
    const hofRes = await app.handle(new Request('http://localhost/api/hall-of-fame'));
    expect(hofRes.status).toBe(200);
    const hofEntries = (await hofRes.json()) as Array<{ championTeamName: string }>;
    expect(hofEntries.length).toBeGreaterThanOrEqual(1);

    game.stopPoller();
  });

  test('distinguishes real Mojang UUIDs from SHA-256 fallback UUIDs for skin resolution', () => {
    expect(isMojangUuid('8667ba71-b85a-4004-af54-457a9734eed7')).toBe(true);
    expect(isMojangUuid('ec561538-f3fd-461d-aff5-086b22154bce')).toBe(true);
    const fake = fallbackPlayerUuid('NBs_Admin');
    expect(fake.length).toBe(36);
    expect(isMojangUuid(fake)).toBe(false);
  });

  test('enforces Ready Check on game/action start until auto_ready assigns team & career', async () => {
    const SECRET = 'test-strong-admin-token-42';
    const game = new GameStateManager({ mode: 'demo' });
    const app = createApp({ adminSecret: SECRET, game });

    // Initially KuySprite is online with teamId=0, careerId=0 -> start must be blocked (400)
    const blockedRes = await app.handle(
      new Request('http://localhost/api/admin/game/action', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': SECRET,
        },
        body: JSON.stringify({ action: 'start' }),
      }),
    );
    expect(blockedRes.status).toBe(400);
    expect(game.getState().gameState).toBe(0);

    // Run auto_ready -> assigns missing teams & careers
    const readyRes = await app.handle(
      new Request('http://localhost/api/admin/game/action', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': SECRET,
        },
        body: JSON.stringify({ action: 'auto_ready' }),
      }),
    );
    expect(readyRes.status).toBe(200);
    expect(game.getState().players.every((p) => p.teamId > 0 && p.careerId > 0)).toBe(true);

    // Now start succeeds!
    const startRes = await app.handle(
      new Request('http://localhost/api/admin/game/action', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': SECRET,
        },
        body: JSON.stringify({ action: 'start' }),
      }),
    );
    expect(startRes.status).toBe(200);
    expect(game.getState().gameState).toBe(1);

    game.stopPoller();
  });

  test('verifies Datapack critical bug fixes (best_streak init, lobby guard, pts_dragon/wither, attacker combat_tag, quest 43 predicate)', () => {
    const root = join(import.meta.dir, '../../../../data/nbs');
    const killSys = readFileSync(join(root, 'function/kill_reward/kill_system.mcfunction'), 'utf8');
    expect(killSys).toContain('scoreboard players add @a best_streak 0');

    const resetFn = readFileSync(join(root, 'function/game/reset.mcfunction'), 'utf8');
    expect(resetFn).toContain('advancement revoke @a everything');
    expect(resetFn).toContain('kill @e[type=minecraft:marker,tag=flag_anchor]');
    expect(resetFn).toContain('scoreboard players set @a team_id 0');

    const recalc = readFileSync(join(root, 'function/scoreboard/recalc_scores.mcfunction'), 'utf8');
    expect(recalc).toContain('execute if score #game_state game_state matches 1 run function nbs:career/check_team_advs');
    expect(recalc).toContain('execute if score #t1_active game_state matches 1 if score #team_1 team_diamonds > #max_dia item_count');

    const stats1hz = readFileSync(join(root, 'function/scoreboard/stats_tick_1hz.mcfunction'), 'utf8');
    expect(stats1hz).toContain('scoreboard players set @a pts_dragon 0');
    expect(stats1hz).toContain('scoreboard players set @a pts_wither 0');

    const attackerAdv = readFileSync(join(root, 'advancement/combat_tag_attacker.json'), 'utf8');
    expect(attackerAdv).toContain('minecraft:player_hurt_entity');

    const submitQuest = readFileSync(join(root, 'function/citadel/submit_quest.mcfunction'), 'utf8');
    expect(submitQuest).toContain('minecraft:name_tag[!minecraft:custom_data]');
  });
});
