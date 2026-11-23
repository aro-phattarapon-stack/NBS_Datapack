import { drizzle } from 'drizzle-orm/postgres-js';
import { desc, eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';
import type {
  AuditLogItem,
  HallOfFameEntry,
  InGameStats,
  PlayerEventItem,
  PlayerProfileResponse,
  PlayerStatsHistoryPoint,
  PlayerStatus,
  QuestHistoryItem,
  SnapshotPoint,
  TeamColor,
  TeamInfo,
  TeamMemberHistoryItem,
} from '../../shared/types';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pgClient: ReturnType<typeof postgres> | null = null;
let dbReady = false;

// In-Memory fallback when PostgreSQL is unavailable or degraded at runtime
const memoryQuests: QuestHistoryItem[] = [];
const memorySnapshots: SnapshotPoint[] = [];
const memoryAudits: AuditLogItem[] = [];
const memoryPlayers = new Map<string, PlayerStatus>();
const memoryPlayerEvents: PlayerEventItem[] = [];
const memoryPlayerStatsHistory: Array<PlayerStatsHistoryPoint & { uuid: string }> = [];
const memoryTeamMembers: TeamMemberHistoryItem[] = [];
const memoryHallOfFame: HallOfFameEntry[] = [];
let memorySeasonStartedAt: string | null = null;
let memSeq = 1;

export function computeKd(kills: number, deaths: number): number {
  if (deaths <= 0) return Number(kills.toFixed(2));
  return Number((kills / deaths).toFixed(2));
}

function markDbDegraded(context: string, err: unknown): void {
  if (dbReady) {
    console.warn(`[DB] ${context} failed, switching to In-Memory store:`, (err as Error).message);
  }
  dbReady = false;
}

export async function initDatabase(): Promise<boolean> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('[DB] DATABASE_URL not set — running with In-Memory history store');
    dbReady = false;
    return false;
  }

  try {
    pgClient = postgres(url, {
      max: 5,
      connect_timeout: 3,
      idle_timeout: 20,
    });
    await pgClient`SELECT 1`;
    await pgClient`
      CREATE TABLE IF NOT EXISTS seasons (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        started_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS team_snapshots (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL,
        team_name TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        diamonds INTEGER NOT NULL DEFAULT 0,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS flash_quests (
        id SERIAL PRIMARY KEY,
        item TEXT NOT NULL,
        count INTEGER NOT NULL,
        display_name TEXT NOT NULL,
        source TEXT NOT NULL,
        ai_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        payload TEXT NOT NULL DEFAULT '{}',
        result TEXT NOT NULL DEFAULT 'OK',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS players (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        online BOOLEAN NOT NULL DEFAULT FALSE,
        first_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS player_stats (
        uuid TEXT PRIMARY KEY,
        team_id INTEGER NOT NULL DEFAULT 0,
        career_id INTEGER NOT NULL DEFAULT 0,
        pvp_kills INTEGER NOT NULL DEFAULT 0,
        kills INTEGER NOT NULL DEFAULT 0,
        deaths INTEGER NOT NULL DEFAULT 0,
        kill_streak INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        playtime_seconds INTEGER NOT NULL DEFAULT 0,
        quests_completed INTEGER NOT NULL DEFAULT 0,
        boss_score INTEGER NOT NULL DEFAULT 0,
        in_game_stats_json TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS in_game_stats_json TEXT NOT NULL DEFAULT '{}';
      CREATE TABLE IF NOT EXISTS player_events (
        id SERIAL PRIMARY KEY,
        uuid TEXT NOT NULL,
        username TEXT NOT NULL,
        type TEXT NOT NULL,
        summary TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS player_stats_history (
        id SERIAL PRIMARY KEY,
        uuid TEXT NOT NULL,
        kills INTEGER NOT NULL DEFAULT 0,
        deaths INTEGER NOT NULL DEFAULT 0,
        playtime_seconds INTEGER NOT NULL DEFAULT 0,
        recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        uuid TEXT NOT NULL,
        username TEXT NOT NULL,
        team_id INTEGER NOT NULL,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS hall_of_fame (
        id SERIAL PRIMARY KEY,
        season_label TEXT NOT NULL,
        world_id INTEGER NOT NULL DEFAULT 0,
        champion_team_name TEXT NOT NULL,
        champion_team_color TEXT NOT NULL DEFAULT 'red',
        champion_team_score INTEGER NOT NULL DEFAULT 0,
        top_killer_name TEXT NOT NULL,
        top_killer_uuid TEXT NOT NULL DEFAULT '',
        top_killer_kills INTEGER NOT NULL DEFAULT 0,
        mvp_name TEXT NOT NULL,
        mvp_uuid TEXT NOT NULL DEFAULT '',
        mvp_kd TEXT NOT NULL DEFAULT '0.00',
        ended_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    dbInstance = drizzle(pgClient, { schema });
    dbReady = true;

    // Hydrate in-memory caches from PostgreSQL so server restarts never emit duplicate
    // JOIN / team_members events and 7-day leaderboard deltas work immediately on boot
    try {
      const existingRows = await dbInstance
        .select()
        .from(schema.players)
        .leftJoin(schema.playerStats, eq(schema.players.uuid, schema.playerStats.uuid));
      for (const { players: pl, player_stats: st } of existingRows) {
        const kills = st?.kills ?? 0;
        const deaths = st?.deaths ?? 0;
        let inGameStats: InGameStats | undefined;
        try {
          const parsed = st?.inGameStatsJson
            ? (JSON.parse(st.inGameStatsJson) as Partial<InGameStats>)
            : null;
          if (parsed && typeof parsed.mobKills === 'number') {
            inGameStats = parsed as InGameStats;
          }
        } catch {
          // ignore
        }
        memoryPlayers.set(pl.uuid, {
          uuid: pl.uuid,
          name: pl.username,
          online: pl.online,
          teamId: st?.teamId ?? 0,
          careerId: st?.careerId ?? 0,
          pvpKills: st?.pvpKills ?? 0,
          kills,
          deaths,
          kd: computeKd(kills, deaths),
          killStreak: st?.killStreak ?? 0,
          bestStreak: st?.bestStreak ?? 0,
          playtimeSeconds: st?.playtimeSeconds ?? 0,
          questsCompleted: st?.questsCompleted ?? 0,
          bossScore: st?.bossScore ?? 0,
          inGameStats,
          firstSeenAt: pl.firstSeenAt.toISOString(),
          lastSeenAt: pl.lastSeenAt.toISOString(),
        });
      }

      const histRows = await dbInstance
        .select()
        .from(schema.playerStatsHistory)
        .orderBy(desc(schema.playerStatsHistory.id))
        .limit(600);
      memoryPlayerStatsHistory.length = 0;
      for (const r of histRows.reverse()) {
        memoryPlayerStatsHistory.push({
          uuid: r.uuid,
          kills: r.kills,
          deaths: r.deaths,
          kd: computeKd(r.kills, r.deaths),
          playtimeSeconds: r.playtimeSeconds,
          recordedAt: r.recordedAt.toISOString(),
        });
      }
    } catch (hydrateErr) {
      console.warn('[DB] Cache hydration warning:', (hydrateErr as Error).message);
    }

    console.log('[DB] PostgreSQL connected & schema verified');
    return true;
  } catch (err) {
    console.warn('[DB] PostgreSQL unavailable, using In-Memory fallback:', (err as Error).message);
    dbReady = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return dbReady;
}

export function seedDemoPlayersStore(
  initialPlayers: PlayerStatus[],
  initialEvents: PlayerEventItem[],
  initialTeamHistory: TeamMemberHistoryItem[] = [],
  initialSnapshots: SnapshotPoint[] = [],
): void {
  const now = Date.now();
  for (const p of initialPlayers) {
    if (!memoryPlayers.has(p.uuid)) {
      memoryPlayers.set(p.uuid, p);

      // Seed 5 progressive history points across the last 7 days so Combat Graph,
      // Stats History, and Last 7 Days delta rankings show authentic progression
      const progressions = [
        { minsAgo: 4320, ratio: 0.35 },
        { minsAgo: 2880, ratio: 0.55 },
        { minsAgo: 1440, ratio: 0.72 },
        { minsAgo: 360, ratio: 0.88 },
        { minsAgo: 0, ratio: 1.0 },
      ];
      let prevK = -1;
      let prevD = -1;
      for (const step of progressions) {
        const k = Math.max(0, Math.round(p.kills * step.ratio));
        const d = Math.max(0, Math.round(p.deaths * step.ratio));
        const ptSec = Math.max(60, Math.round(p.playtimeSeconds * step.ratio));
        if (k === prevK && d === prevD && step.ratio < 1.0) continue;
        prevK = k;
        prevD = d;
        memoryPlayerStatsHistory.push({
          uuid: p.uuid,
          kills: k,
          deaths: d,
          kd: computeKd(k, d),
          playtimeSeconds: ptSec,
          recordedAt: new Date(now - step.minsAgo * 60_000).toISOString(),
        });
      }
    }
  }
  if (memoryPlayerEvents.length === 0) {
    for (const ev of initialEvents) {
      memoryPlayerEvents.push(ev);
    }
  }
  if (memoryTeamMembers.length === 0) {
    for (const tm of initialTeamHistory) {
      memoryTeamMembers.push(tm);
    }
  }
  if (memorySnapshots.length === 0 && initialSnapshots.length > 0) {
    for (const snap of initialSnapshots) {
      memorySnapshots.push(snap);
    }
  }
  if (memoryHallOfFame.length === 0) {
    memoryHallOfFame.push({
      id: 1,
      seasonLabel: 'Pre-Season (Test World)',
      worldId: 100000,
      championTeamName: 'Team 1',
      championTeamColor: 'red',
      championTeamScore: 280,
      topKillerName: 'Steve',
      topKillerUuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      topKillerKills: 18,
      mvpName: 'Steve',
      mvpUuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      mvpKd: 3.6,
      endedAt: new Date(now - 10 * 24 * 3600 * 1000).toISOString(),
    });
  }
}

async function appendPlayerEvents(events: Omit<PlayerEventItem, 'id'>[]): Promise<void> {
  if (events.length === 0) return;

  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.playerEvents).values(
        events.map((e) => ({
          uuid: e.uuid,
          username: e.username,
          type: e.type,
          summary: e.summary,
          createdAt: new Date(e.createdAt),
        })),
      );
      return;
    } catch (err) {
      markDbDegraded('appendPlayerEvents', err);
    }
  }

  for (const ev of events) {
    memoryPlayerEvents.unshift({
      id: memSeq++,
      ...ev,
    });
  }
  if (memoryPlayerEvents.length > 200) {
    memoryPlayerEvents.length = 200;
  }
}

export async function syncOnlinePlayers(
  onlineList: PlayerStatus[],
  teamNameById?: Map<number, string>,
): Promise<void> {
  const nowIso = new Date().toISOString();
  const nowDate = new Date(nowIso);
  const onlineUuids = new Set(onlineList.map((p) => p.uuid));
  const newEvents: Omit<PlayerEventItem, 'id'>[] = [];
  const newTeamJoins: Omit<TeamMemberHistoryItem, 'id'>[] = [];

  for (const p of onlineList) {
    const prev = memoryPlayers.get(p.uuid);
    if (!prev) {
      newEvents.push({
        uuid: p.uuid,
        username: p.name,
        type: 'JOIN',
        summary: `${p.name} เข้าร่วมเซิร์ฟเวอร์`,
        createdAt: nowIso,
      });
      if (p.teamId > 0) {
        newTeamJoins.push({ uuid: p.uuid, username: p.name, teamId: p.teamId, joinedAt: nowIso });
      }
    } else {
      if (p.kills > prev.kills) {
        newEvents.push({
          uuid: p.uuid,
          username: p.name,
          type: 'KILL',
          summary: `${p.name} สังหารผู้เล่น (+${p.kills - prev.kills} Kill)`,
          createdAt: nowIso,
        });
      }
      if (p.deaths > prev.deaths) {
        newEvents.push({
          uuid: p.uuid,
          username: p.name,
          type: 'DEATH',
          summary: `${p.name} ถูกสังหาร / เสียชีวิต`,
          createdAt: nowIso,
        });
      }
      if (p.questsCompleted > prev.questsCompleted) {
        newEvents.push({
          uuid: p.uuid,
          username: p.name,
          type: 'QUEST',
          summary: `${p.name} ส่งเควส The Citadel สำเร็จ`,
          createdAt: nowIso,
        });
      }
      if (p.teamId > 0 && p.teamId !== prev.teamId) {
        const teamLabel = teamNameById?.get(p.teamId) ?? `Team ${p.teamId}`;
        newEvents.push({
          uuid: p.uuid,
          username: p.name,
          type: 'TEAM',
          summary: `${p.name} เข้าร่วม ${teamLabel}`,
          createdAt: nowIso,
        });
        newTeamJoins.push({ uuid: p.uuid, username: p.name, teamId: p.teamId, joinedAt: nowIso });
      }
    }
    memoryPlayers.set(p.uuid, {
      ...p,
      firstSeenAt: prev?.firstSeenAt ?? p.firstSeenAt,
      lastSeenAt: nowIso,
      online: true,
    });
  }

  for (const [uuid, existing] of memoryPlayers.entries()) {
    if (!onlineUuids.has(uuid) && existing.online) {
      memoryPlayers.set(uuid, { ...existing, online: false });
    }
  }

  await appendPlayerEvents(newEvents);

  if (newTeamJoins.length > 0) {
    if (dbReady && dbInstance) {
      try {
        await dbInstance.insert(schema.teamMembers).values(
          newTeamJoins.map((tm) => ({
            uuid: tm.uuid,
            username: tm.username,
            teamId: tm.teamId,
            joinedAt: new Date(tm.joinedAt),
          })),
        );
      } catch (err) {
        markDbDegraded('appendTeamMembers', err);
      }
    }
    if (!dbReady) {
      for (const tm of newTeamJoins) {
        memoryTeamMembers.unshift({ id: memSeq++, ...tm });
      }
      if (memoryTeamMembers.length > 100) memoryTeamMembers.length = 100;
    }
  }

  if (dbReady && dbInstance) {
    try {
      await dbInstance.update(schema.players).set({ online: false });
      for (const p of onlineList) {
        await dbInstance
          .insert(schema.players)
          .values({
            uuid: p.uuid,
            username: p.name,
            online: true,
            firstSeenAt: nowDate,
            lastSeenAt: nowDate,
          })
          .onConflictDoUpdate({
            target: schema.players.uuid,
            set: {
              username: p.name,
              online: true,
              lastSeenAt: nowDate,
            },
          });

        await dbInstance
          .insert(schema.playerStats)
          .values({
            uuid: p.uuid,
            teamId: p.teamId,
            careerId: p.careerId,
            pvpKills: p.pvpKills,
            kills: p.kills,
            deaths: p.deaths,
            killStreak: p.killStreak,
            bestStreak: p.bestStreak,
            playtimeSeconds: p.playtimeSeconds,
            questsCompleted: p.questsCompleted,
            bossScore: p.bossScore,
            inGameStatsJson: JSON.stringify(p.inGameStats ?? {}),
            updatedAt: nowDate,
          })
          .onConflictDoUpdate({
            target: schema.playerStats.uuid,
            set: {
              teamId: p.teamId,
              careerId: p.careerId,
              pvpKills: p.pvpKills,
              kills: p.kills,
              deaths: p.deaths,
              killStreak: p.killStreak,
              bestStreak: p.bestStreak,
              playtimeSeconds: p.playtimeSeconds,
              questsCompleted: p.questsCompleted,
              bossScore: p.bossScore,
              inGameStatsJson: JSON.stringify(p.inGameStats ?? {}),
              updatedAt: nowDate,
            },
          });
      }
    } catch (err) {
      markDbDegraded('syncOnlinePlayers', err);
    }
  }
}

export async function getAllPlayers(options?: {
  q?: string;
  status?: 'all' | 'online' | 'offline';
  period?: 'season' | '7d';
}): Promise<PlayerStatus[]> {
  let list: PlayerStatus[] = [];

  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.players)
        .leftJoin(schema.playerStats, eq(schema.players.uuid, schema.playerStats.uuid));
      list = rows.map(({ players: pl, player_stats: st }) => {
        const kills = st?.kills ?? 0;
        const deaths = st?.deaths ?? 0;
        let inGameStats: InGameStats | undefined;
        try {
          const parsed = st?.inGameStatsJson ? (JSON.parse(st.inGameStatsJson) as Partial<InGameStats>) : null;
          if (parsed && typeof parsed.mobKills === 'number') {
            inGameStats = parsed as InGameStats;
          }
        } catch {
          // ignore malformed json
        }
        return {
          uuid: pl.uuid,
          name: pl.username,
          online: pl.online,
          teamId: st?.teamId ?? 0,
          careerId: st?.careerId ?? 0,
          pvpKills: st?.pvpKills ?? 0,
          kills,
          deaths,
          kd: computeKd(kills, deaths),
          killStreak: st?.killStreak ?? 0,
          bestStreak: st?.bestStreak ?? 0,
          playtimeSeconds: st?.playtimeSeconds ?? 0,
          questsCompleted: st?.questsCompleted ?? 0,
          bossScore: st?.bossScore ?? 0,
          inGameStats,
          firstSeenAt: pl.firstSeenAt.toISOString(),
          lastSeenAt: pl.lastSeenAt.toISOString(),
        };
      });
    } catch (err) {
      markDbDegraded('getAllPlayers', err);
    }
  }

  if (list.length === 0) {
    list = Array.from(memoryPlayers.values());
  }

  if (options?.period === '7d') {
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 3600 * 1000;
    list = list.map((p) => {
      const pts = memoryPlayerStatsHistory
        .filter((h) => h.uuid === p.uuid && new Date(h.recordedAt).getTime() >= sevenDaysAgoMs)
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
      if (pts.length >= 2) {
        const baseline = pts[0]!;
        const deltaKills = Math.max(0, p.kills - baseline.kills);
        const deltaDeaths = Math.max(0, p.deaths - baseline.deaths);
        const deltaPlaytime = Math.max(0, p.playtimeSeconds - baseline.playtimeSeconds);
        return {
          ...p,
          kills: deltaKills,
          deaths: deltaDeaths,
          kd: computeKd(deltaKills, deltaDeaths),
          playtimeSeconds: deltaPlaytime,
        };
      }
      return p;
    });
  }

  const query = options?.q?.trim().toLowerCase() ?? '';
  const statusFilter = options?.status ?? 'all';

  return list
    .filter((p) => {
      if (statusFilter === 'online' && !p.online) return false;
      if (statusFilter === 'offline' && p.online) return false;
      if (query && !p.name.toLowerCase().includes(query) && !p.uuid.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => Number(b.online) - Number(a.online) || b.kills - a.kills || b.bossScore - a.bossScore || a.name.localeCompare(b.name));
}

export async function getPlayerProfile(uuidOrName: string): Promise<PlayerProfileResponse | null> {
  const all = await getAllPlayers();
  const sortedByScore = [...all].sort(
    (a, b) => b.kills * 15 + b.bossScore - (a.kills * 15 + a.bossScore) || b.kd - a.kd,
  );
  const needle = uuidOrName.trim().toLowerCase();
  const idx = sortedByScore.findIndex(
    (p) => p.uuid.toLowerCase() === needle || p.name.toLowerCase() === needle,
  );
  if (idx === -1) return null;

  const target = sortedByScore[idx]!;
  let events: PlayerEventItem[] = [];

  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.playerEvents)
        .where(eq(schema.playerEvents.uuid, target.uuid))
        .orderBy(desc(schema.playerEvents.id))
        .limit(20);
      events = rows.map((r) => ({
        id: r.id,
        uuid: r.uuid,
        username: r.username,
        type: r.type as PlayerEventItem['type'],
        summary: r.summary,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      markDbDegraded('getPlayerProfile', err);
    }
  }

  if (events.length === 0) {
    events = memoryPlayerEvents.filter((e) => e.uuid === target.uuid).slice(0, 20);
  }

  let history: PlayerStatsHistoryPoint[] = [];
  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.playerStatsHistory)
        .where(eq(schema.playerStatsHistory.uuid, target.uuid))
        .orderBy(desc(schema.playerStatsHistory.id))
        .limit(20);
      history = rows.reverse().map((r) => ({
        kills: r.kills,
        deaths: r.deaths,
        kd: computeKd(r.kills, r.deaths),
        playtimeSeconds: r.playtimeSeconds,
        recordedAt: r.recordedAt.toISOString(),
      }));
    } catch (err) {
      markDbDegraded('getPlayerStatsHistory', err);
    }
  }
  if (history.length === 0) {
    history = memoryPlayerStatsHistory
      .filter((h) => h.uuid === target.uuid)
      .slice(-20)
      .map(({ kills, deaths, kd, playtimeSeconds, recordedAt }) => ({
        kills,
        deaths,
        kd,
        playtimeSeconds,
        recordedAt,
      }));
  }

  return {
    player: target,
    events,
    history,
    rank: idx + 1,
    totalPlayers: sortedByScore.length,
  };
}

export async function getTeamMemberHistory(limit = 30): Promise<TeamMemberHistoryItem[]> {
  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.teamMembers)
        .orderBy(desc(schema.teamMembers.id))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        uuid: r.uuid,
        username: r.username,
        teamId: r.teamId,
        joinedAt: r.joinedAt.toISOString(),
      }));
    } catch (err) {
      markDbDegraded('getTeamMemberHistory', err);
    }
  }
  return memoryTeamMembers.slice(0, limit);
}

export async function recordPlayerStatsHistory(playersList: PlayerStatus[]): Promise<void> {
  if (playersList.length === 0) return;

  // Deduplicate consecutive identical rows: only record if kills or deaths changed,
  // or playtime increased by >= 300s (5 minutes) since the player's last recorded point
  const changedPlayers = playersList.filter((p) => {
    for (let i = memoryPlayerStatsHistory.length - 1; i >= 0; i--) {
      const prev = memoryPlayerStatsHistory[i]!;
      if (prev.uuid === p.uuid) {
        return (
          prev.kills !== p.kills ||
          prev.deaths !== p.deaths ||
          Math.abs(p.playtimeSeconds - prev.playtimeSeconds) >= 300
        );
      }
    }
    return true;
  });

  if (changedPlayers.length === 0) return;

  const now = new Date();
  const iso = now.toISOString();
  for (const p of changedPlayers) {
    memoryPlayerStatsHistory.push({
      uuid: p.uuid,
      kills: p.kills,
      deaths: p.deaths,
      kd: p.kd,
      playtimeSeconds: p.playtimeSeconds,
      recordedAt: iso,
    });
  }
  if (memoryPlayerStatsHistory.length > 600) {
    memoryPlayerStatsHistory.splice(0, memoryPlayerStatsHistory.length - 600);
  }

  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.playerStatsHistory).values(
        changedPlayers.map((p) => ({
          uuid: p.uuid,
          kills: p.kills,
          deaths: p.deaths,
          playtimeSeconds: p.playtimeSeconds,
          recordedAt: now,
        })),
      );
    } catch (err) {
      markDbDegraded('recordPlayerStatsHistory', err);
    }
  }
}

export async function getRecentEvents(limit = 20): Promise<PlayerEventItem[]> {
  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.playerEvents)
        .orderBy(desc(schema.playerEvents.id))
        .limit(limit);
      return rows.map((r) => ({
        id: r.id,
        uuid: r.uuid,
        username: r.username,
        type: r.type as PlayerEventItem['type'],
        summary: r.summary,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      markDbDegraded('getRecentEvents', err);
    }
  }
  return memoryPlayerEvents.slice(0, limit);
}

export async function getHallOfFame(): Promise<HallOfFameEntry[]> {
  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.hallOfFame)
        .orderBy(desc(schema.hallOfFame.id))
        .limit(20);
      return rows.map((r) => ({
        id: r.id,
        seasonLabel: r.seasonLabel,
        worldId: r.worldId,
        championTeamName: r.championTeamName,
        championTeamColor: r.championTeamColor as TeamColor,
        championTeamScore: r.championTeamScore,
        topKillerName: r.topKillerName,
        topKillerUuid: r.topKillerUuid,
        topKillerKills: r.topKillerKills,
        mvpName: r.mvpName,
        mvpUuid: r.mvpUuid,
        mvpKd: Number.parseFloat(r.mvpKd) || 0,
        endedAt: r.endedAt.toISOString(),
      }));
    } catch (err) {
      markDbDegraded('getHallOfFame', err);
    }
  }
  return [...memoryHallOfFame];
}

export async function archiveSeasonToHallOfFame(
  entry: Omit<HallOfFameEntry, 'id' | 'endedAt'>,
): Promise<void> {
  const now = new Date();
  memoryHallOfFame.unshift({
    id: memSeq++,
    ...entry,
    endedAt: now.toISOString(),
  });
  if (memoryHallOfFame.length > 30) memoryHallOfFame.length = 30;

  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.hallOfFame).values({
        seasonLabel: entry.seasonLabel,
        worldId: entry.worldId,
        championTeamName: entry.championTeamName,
        championTeamColor: entry.championTeamColor,
        championTeamScore: entry.championTeamScore,
        topKillerName: entry.topKillerName,
        topKillerUuid: entry.topKillerUuid,
        topKillerKills: entry.topKillerKills,
        mvpName: entry.mvpName,
        mvpUuid: entry.mvpUuid,
        mvpKd: entry.mvpKd.toFixed(2),
        endedAt: now,
      });
    } catch (err) {
      markDbDegraded('archiveSeasonToHallOfFame', err);
    }
  }
}

export async function getActiveSeasonStart(): Promise<string | null> {
  if (dbReady && dbInstance) {
    try {
      const rows = await dbInstance
        .select()
        .from(schema.seasons)
        .where(eq(schema.seasons.active, true))
        .orderBy(desc(schema.seasons.id))
        .limit(1);
      if (rows[0]) {
        memorySeasonStartedAt = rows[0].startedAt.toISOString();
        return memorySeasonStartedAt;
      }
    } catch (err) {
      markDbDegraded('getActiveSeasonStart', err);
    }
  }
  return memorySeasonStartedAt;
}

export async function markSeasonStarted(label = 'Active Season', at = new Date()): Promise<string> {
  const iso = at.toISOString();
  memorySeasonStartedAt = iso;
  if (dbReady && dbInstance) {
    try {
      await dbInstance.update(schema.seasons).set({ active: false });
      await dbInstance.insert(schema.seasons).values({
        name: label,
        active: true,
        startedAt: at,
      });
    } catch (err) {
      markDbDegraded('markSeasonStarted', err);
    }
  }
  return iso;
}

export async function clearActiveSeasonStart(): Promise<void> {
  memorySeasonStartedAt = null;
  if (dbReady && dbInstance) {
    try {
      await dbInstance.update(schema.seasons).set({ active: false });
    } catch (err) {
      markDbDegraded('clearActiveSeasonStart', err);
    }
  }
}

export async function resetSeasonData(seasonLabel = 'New Season'): Promise<void> {
  memoryPlayers.clear();
  memoryPlayerEvents.length = 0;
  memoryPlayerStatsHistory.length = 0;
  memoryTeamMembers.length = 0;
  memorySnapshots.length = 0;
  memoryQuests.length = 0;
  memorySeasonStartedAt = null;

  if (dbReady && dbInstance) {
    try {
      await dbInstance.update(schema.seasons).set({ active: false });
      await dbInstance.insert(schema.seasons).values({ name: seasonLabel, active: true });
      await dbInstance.delete(schema.playerStatsHistory);
      await dbInstance.delete(schema.teamMembers);
      await dbInstance.delete(schema.playerEvents);
      await dbInstance.delete(schema.playerStats);
      await dbInstance.delete(schema.players);
      await dbInstance.delete(schema.teamSnapshots);
      await dbInstance.delete(schema.flashQuests);
    } catch (err) {
      markDbDegraded('resetSeasonData', err);
    }
  }
}

export async function recordTeamSnapshots(teams: TeamInfo[]): Promise<void> {
  const activeTeams = teams.filter((t) => t.active);
  if (activeTeams.length === 0) return;
  const now = new Date();

  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.teamSnapshots).values(
        activeTeams.map((t) => ({
          teamId: t.id,
          teamName: t.name,
          score: t.score,
          diamonds: t.diamonds,
          recordedAt: now,
        })),
      );
      return;
    } catch (err) {
      markDbDegraded('recordTeamSnapshots', err);
    }
  }

  for (const t of activeTeams) {
    memorySnapshots.push({
      teamId: t.id,
      score: t.score,
      diamonds: t.diamonds,
      recordedAt: now.toISOString(),
    });
  }
  if (memorySnapshots.length > 400) {
    memorySnapshots.splice(0, memorySnapshots.length - 400);
  }
}

export async function recordFlashQuest(entry: {
  item: string;
  count: number;
  displayName: string;
  source: 'AI' | 'POOL' | 'MANUAL';
  aiReason?: string;
}): Promise<void> {
  const now = new Date();
  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.flashQuests).values({
        item: entry.item,
        count: entry.count,
        displayName: entry.displayName,
        source: entry.source,
        aiReason: entry.aiReason ?? null,
        createdAt: now,
      });
      return;
    } catch (err) {
      markDbDegraded('recordFlashQuest', err);
    }
  }
  memoryQuests.unshift({
    id: memSeq++,
    item: entry.item,
    count: entry.count,
    displayName: entry.displayName,
    source: entry.source,
    aiReason: entry.aiReason ?? null,
    createdAt: now.toISOString(),
  });
  if (memoryQuests.length > 50) memoryQuests.length = 50;
}

export async function recordAuditLog(action: string, payload: unknown, result: string): Promise<void> {
  const now = new Date();
  const payloadStr = JSON.stringify(payload ?? {});
  if (dbReady && dbInstance) {
    try {
      await dbInstance.insert(schema.auditLogs).values({
        action,
        payload: payloadStr,
        result,
        createdAt: now,
      });
      return;
    } catch (err) {
      markDbDegraded('recordAuditLog', err);
    }
  }
  memoryAudits.unshift({
    id: memSeq++,
    action,
    payload: payloadStr,
    result,
    createdAt: now.toISOString(),
  });
  if (memoryAudits.length > 50) memoryAudits.length = 50;
}

export async function getHistoryData(): Promise<{
  quests: QuestHistoryItem[];
  snapshots: SnapshotPoint[];
  audits: AuditLogItem[];
}> {
  if (dbReady && dbInstance) {
    try {
      const [questsRows, snapRows, auditRows] = await Promise.all([
        dbInstance.select().from(schema.flashQuests).orderBy(desc(schema.flashQuests.id)).limit(20),
        dbInstance.select().from(schema.teamSnapshots).orderBy(desc(schema.teamSnapshots.id)).limit(160),
        dbInstance.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.id)).limit(20),
      ]);
      return {
        quests: questsRows.map((q) => ({
          id: q.id,
          item: q.item,
          count: q.count,
          displayName: q.displayName,
          source: q.source,
          aiReason: q.aiReason,
          createdAt: q.createdAt.toISOString(),
        })),
        snapshots: snapRows
          .reverse()
          .map((s) => ({
            teamId: s.teamId,
            score: s.score,
            diamonds: s.diamonds,
            recordedAt: s.recordedAt.toISOString(),
          })),
        audits: auditRows.map((a) => ({
          id: a.id,
          action: a.action,
          payload: a.payload,
          result: a.result,
          createdAt: a.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      markDbDegraded('getHistoryData', err);
    }
  }

  return {
    quests: [...memoryQuests],
    snapshots: [...memorySnapshots],
    audits: [...memoryAudits],
  };
}
