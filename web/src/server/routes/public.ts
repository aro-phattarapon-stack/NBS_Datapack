import { Elysia, t } from 'elysia';
import { MC_QUEST_WHITELIST } from '../../shared/types';
import {
  getAllPlayers,
  getHallOfFame,
  getHistoryData,
  getPlayerProfile,
  getRecentEvents,
  getTeamMemberHistory,
} from '../db';
import type { GameStateManager } from '../rcon/poller';

const skinCache = new Map<string, { bytes: Uint8Array; expiresAt: number }>();

export function createPublicRoutes(game: GameStateManager) {
  return new Elysia()
    .get('/api/skin/:identifier', async ({ params, set }) => {
      const rawId = decodeURIComponent(params.identifier).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!rawId) {
        set.status = 400;
        return { error: 'Invalid skin identifier' };
      }

      const now = Date.now();
      const cached = skinCache.get(rawId.toLowerCase());
      if (cached && cached.expiresAt > now) {
        return new Response(new Uint8Array(cached.bytes), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=900',
          },
        });
      }

      const urls = [
        `https://mc-heads.net/skin/${encodeURIComponent(rawId)}`,
        `https://minotar.net/skin/${encodeURIComponent(rawId)}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
          if (res.ok) {
            const bytes = new Uint8Array(await res.arrayBuffer());
            if (bytes.byteLength > 64) {
              skinCache.set(rawId.toLowerCase(), {
                bytes,
                expiresAt: now + 15 * 60_000,
              });
              if (skinCache.size > 64) {
                const oldest = skinCache.keys().next().value;
                if (oldest) skinCache.delete(oldest);
              }
              return new Response(new Uint8Array(bytes), {
                headers: {
                  'Content-Type': 'image/png',
                  'Cache-Control': 'public, max-age=900',
                },
              });
            }
          }
        } catch {
          // try fallback provider
        }
      }

      set.status = 404;
      return { error: 'Skin not available' };
    })
    .get('/api/health', () => ({
      ok: true,
      mode: game.getState().mode,
      dbConnected: game.getState().dbConnected,
    }))
    .get('/api/state', () => game.getState())
    .get('/api/history', async () => getHistoryData())
    .get('/api/whitelist', () => MC_QUEST_WHITELIST)
    .get(
      '/api/players',
      async ({ query }) => {
        const status =
          query.status === 'online' || query.status === 'offline' ? query.status : 'all';
        return getAllPlayers({ q: query.q, status });
      },
      {
        query: t.Object({
          q: t.Optional(t.String()),
          status: t.Optional(t.String()),
        }),
      },
    )
    .get('/api/players/:uuid', async ({ params, set }) => {
      const profile = await getPlayerProfile(decodeURIComponent(params.uuid));
      if (!profile) {
        set.status = 404;
        return { error: 'ไม่พบข้อมูลผู้เล่นนี้ในระบบ' };
      }
      return profile;
    })
    .get('/api/events', async () => {
      const [recentEvents, history] = await Promise.all([getRecentEvents(30), getHistoryData()]);
      return {
        recentEvents,
        quests: history.quests,
      };
    })
    .get(
      '/api/leaderboard',
      async ({ query }) => {
        const period = query.period === '7d' ? '7d' : 'season';
        const players = await getAllPlayers({ status: 'all', period });
        const teams = [...game.getState().teams]
          .filter((t) => t.active)
          .sort((a, b) => b.score - a.score);
        return {
          players,
          teams,
          period,
        };
      },
      {
        query: t.Object({
          period: t.Optional(t.String()),
        }),
      },
    )
    .get('/api/hall-of-fame', async () => getHallOfFame())
    .get('/api/teams', async () => {
      const [players, teamHistory, history, recentEvents] = await Promise.all([
        getAllPlayers({ status: 'all' }),
        getTeamMemberHistory(30),
        getHistoryData(),
        getRecentEvents(40),
      ]);
      return {
        teams: game.getState().teams,
        players,
        teamHistory,
        snapshots: history.snapshots,
        recentEvents,
      };
    })
    .get('/api/stream', ({ request }) => {
      const encoder = new TextEncoder();
      let unsubscribe: (() => void) | null = null;
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      const stream = new ReadableStream({
        start(controller) {
          const push = (data: unknown) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          };
          push(game.getState());
          unsubscribe = game.subscribe((next) => push(next));
          heartbeat = setInterval(() => {
            controller.enqueue(encoder.encode(': ping\n\n'));
          }, 15_000);

          request.signal.addEventListener('abort', () => {
            if (unsubscribe) unsubscribe();
            if (heartbeat) clearInterval(heartbeat);
            try {
              controller.close();
            } catch {
              // already closed
            }
          });
        },
        cancel() {
          if (unsubscribe) unsubscribe();
          if (heartbeat) clearInterval(heartbeat);
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    });
}
