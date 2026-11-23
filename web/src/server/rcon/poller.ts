import { createHash } from 'node:crypto';
import type {
  PlayerEventItem,
  PlayerStatus,
  ServerState,
  TeamColor,
  TeamInfo,
  TeamMemberHistoryItem,
} from '../../shared/types';
import {
  archiveSeasonToHallOfFame,
  clearActiveSeasonStart,
  computeKd,
  getActiveSeasonStart,
  getAllPlayers,
  isDbConnected,
  markSeasonStarted,
  recordAuditLog,
  recordPlayerStatsHistory,
  recordTeamSnapshots,
  resetSeasonData,
  seedDemoPlayersStore,
  syncOnlinePlayers,
} from '../db';
import { RconClient } from './client';

export type AppMode = 'demo' | 'rcon';

const DEFAULT_COLORS: TeamColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'light_purple',
  'aqua',
  'gold',
  'white',
];

export function resolveAppMode(env = process.env): AppMode {
  const explicit = env.APP_MODE?.trim().toLowerCase();
  if (explicit === 'demo' || explicit === 'rcon') {
    return explicit;
  }
  const rconPw = env.RCON_PASSWORD?.trim();
  if (rconPw && rconPw !== 'change_this_rcon_password') {
    return 'rcon';
  }
  return 'demo';
}

/**
 * Converts Minecraft NBT `[I; a, b, c, d]` signed 32-bit int array into canonical dashed UUID string.
 */
export function parseMcUuid(raw: string): string | null {
  const match = raw.match(/\[I;\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\]/);
  if (!match) return null;
  const parts = [1, 2, 3, 4].map((idx) => {
    const val = Number.parseInt(match[idx]!, 10) >>> 0;
    return val.toString(16).padStart(8, '0');
  });
  const hex = parts.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function fallbackPlayerUuid(name: string): string {
  const hex = createHash('sha256').update(`offline:${name}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-0000-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function createInitialTeams(): TeamInfo[] {
  const demoScores = [195, 160, 125, 90];
  const demoDiamonds = [24, 18, 32, 12];
  const demoFlags = [2, 2, 1, 1];
  const demoQuestsDone = [4, 3, 2, 1];
  const demoBreakdowns = [
    { chestAndBonus: 70, quest: 50, career: 25, adv: 20, boss: 30 },
    { chestAndBonus: 65, quest: 35, career: 30, adv: 15, boss: 15 },
    { chestAndBonus: 95, quest: 0, career: 20, adv: 10, boss: 0 },
    { chestAndBonus: 45, quest: 25, career: 10, adv: 10, boss: 0 },
  ];

  return Array.from({ length: 8 }, (_, idx) => {
    const id = idx + 1;
    const isDefaultActive = id <= 4;
    return {
      id,
      name: `Team ${id}`,
      color: DEFAULT_COLORS[idx]!,
      active: isDefaultActive,
      score: isDefaultActive ? demoScores[idx]! : 0,
      diamonds: isDefaultActive ? demoDiamonds[idx]! : 0,
      flags: isDefaultActive ? demoFlags[idx]! : 0,
      questsDone: isDefaultActive ? demoQuestsDone[idx]! : 0,
      breakdown: isDefaultActive
        ? demoBreakdowns[idx]!
        : { chestAndBonus: 0, quest: 0, career: 0, adv: 0, boss: 0 },
    };
  });
}

function createDemoPlayersAndEvents(): {
  players: PlayerStatus[];
  events: PlayerEventItem[];
  teamHistory: TeamMemberHistoryItem[];
} {
  const now = Date.now();
  const isoAgo = (mins: number) => new Date(now - mins * 60_000).toISOString();
  const players: PlayerStatus[] = [
    {
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      name: 'Steve',
      online: true,
      teamId: 1,
      careerId: 2,
      pvpKills: 6,
      kills: 14,
      deaths: 4,
      kd: 3.5,
      killStreak: 3,
      bestStreak: 5,
      playtimeSeconds: 51420,
      questsCompleted: 5,
      bossScore: 95,
      inGameStats: {
        mobKills: 412,
        damageDealt: 18450,
        damageTaken: 6210,
        distanceKm: 84.6,
        survivedMinutes: 265,
        animalsBred: 34,
        fishCaught: 12,
        diamondsMined: 64,
        ancientDebrisMined: 14,
        villagerTrades: 88,
        bossKills: { dragon: 1, wither: 2, warden: 1, elder: 2, raidWins: 3 },
        favoriteWeapon: 'minecraft:netherite_sword',
        favoriteWeaponUses: 642,
      },
      firstSeenAt: isoAgo(1200),
      lastSeenAt: isoAgo(0),
    },
    {
      uuid: 'ec561538-f3fd-461d-aff5-086b22154bce',
      name: 'Alex',
      online: true,
      teamId: 2,
      careerId: 1,
      pvpKills: 4,
      kills: 9,
      deaths: 5,
      kd: 1.8,
      killStreak: 1,
      bestStreak: 4,
      playtimeSeconds: 42800,
      questsCompleted: 4,
      bossScore: 70,
      inGameStats: {
        mobKills: 295,
        damageDealt: 12140,
        damageTaken: 4980,
        distanceKm: 62.3,
        survivedMinutes: 190,
        animalsBred: 118,
        fishCaught: 46,
        diamondsMined: 42,
        ancientDebrisMined: 6,
        villagerTrades: 134,
        bossKills: { dragon: 0, wither: 1, warden: 0, elder: 2, raidWins: 2 },
        favoriteWeapon: 'minecraft:bow',
        favoriteWeaponUses: 418,
      },
      firstSeenAt: isoAgo(1100),
      lastSeenAt: isoAgo(0),
    },
    {
      uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
      name: 'Notch',
      online: false,
      teamId: 3,
      careerId: 4,
      pvpKills: 3,
      kills: 11,
      deaths: 6,
      kd: 1.83,
      killStreak: 0,
      bestStreak: 3,
      playtimeSeconds: 36900,
      questsCompleted: 3,
      bossScore: 60,
      inGameStats: {
        mobKills: 340,
        damageDealt: 14320,
        damageTaken: 5840,
        distanceKm: 91.2,
        survivedMinutes: 140,
        animalsBred: 18,
        fishCaught: 9,
        diamondsMined: 51,
        ancientDebrisMined: 9,
        villagerTrades: 52,
        bossKills: { dragon: 1, wither: 0, warden: 1, elder: 1, raidWins: 1 },
        favoriteWeapon: 'minecraft:mace',
        favoriteWeaponUses: 289,
      },
      firstSeenAt: isoAgo(2400),
      lastSeenAt: isoAgo(42),
    },
    {
      uuid: fallbackPlayerUuid('NBs_Admin'),
      name: 'NBs_Admin',
      online: true,
      teamId: 3,
      careerId: 4,
      pvpKills: 2,
      kills: 5,
      deaths: 2,
      kd: 2.5,
      killStreak: 2,
      bestStreak: 2,
      playtimeSeconds: 28400,
      questsCompleted: 2,
      bossScore: 45,
      inGameStats: {
        mobKills: 180,
        damageDealt: 7850,
        damageTaken: 2400,
        distanceKm: 48.5,
        survivedMinutes: 310,
        animalsBred: 12,
        fishCaught: 6,
        diamondsMined: 28,
        ancientDebrisMined: 4,
        villagerTrades: 41,
        bossKills: { dragon: 0, wither: 1, warden: 0, elder: 1, raidWins: 1 },
        favoriteWeapon: 'minecraft:trident',
        favoriteWeaponUses: 196,
      },
      firstSeenAt: isoAgo(900),
      lastSeenAt: isoAgo(0),
    },
    {
      uuid: fallbackPlayerUuid('KuySprite'),
      name: 'KuySprite',
      online: true,
      teamId: 0,
      careerId: 0,
      pvpKills: 0,
      kills: 0,
      deaths: 1,
      kd: 0,
      killStreak: 0,
      bestStreak: 0,
      playtimeSeconds: 1850,
      questsCompleted: 0,
      bossScore: 0,
      inGameStats: {
        mobKills: 14,
        damageDealt: 420,
        damageTaken: 310,
        distanceKm: 2.4,
        survivedMinutes: 18,
        animalsBred: 2,
        fishCaught: 0,
        diamondsMined: 0,
        ancientDebrisMined: 0,
        villagerTrades: 3,
        bossKills: { dragon: 0, wither: 0, warden: 0, elder: 0, raidWins: 0 },
        favoriteWeapon: 'minecraft:iron_sword',
        favoriteWeaponUses: 22,
      },
      firstSeenAt: isoAgo(35),
      lastSeenAt: isoAgo(0),
    },
  ];

  const events: PlayerEventItem[] = [
    {
      id: 1,
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      username: 'Steve',
      type: 'KILL',
      summary: 'Steve สังหารผู้เล่นในช่วง Raid Day (+1 Kill)',
      createdAt: isoAgo(4),
    },
    {
      id: 2,
      uuid: 'ec561538-f3fd-461d-aff5-086b22154bce',
      username: 'Alex',
      type: 'QUEST',
      summary: 'Alex ส่งเควส The Citadel สำเร็จ (Honey Bottle x8)',
      createdAt: isoAgo(11),
    },
    {
      id: 3,
      uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
      username: 'Notch',
      type: 'KILL',
      summary: 'Notch สังหารผู้เล่นบริเวณ The Citadel (0,0)',
      createdAt: isoAgo(19),
    },
    {
      id: 4,
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      username: 'Steve',
      type: 'QUEST',
      summary: 'Steve ส่งเควส The Citadel สำเร็จ (Blaze Rod x12)',
      createdAt: isoAgo(24),
    },
    {
      id: 5,
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      username: 'Steve',
      type: 'DEATH',
      summary: 'Steve ถูกสังหารระหว่างป้องกันธง Team 1',
      createdAt: isoAgo(26),
    },
    {
      id: 6,
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      username: 'Steve',
      type: 'TEAM',
      summary: 'Steve เข้าร่วม Team 1',
      createdAt: isoAgo(28),
    },
  ];

  const teamHistory: TeamMemberHistoryItem[] = [
    {
      id: 901,
      uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
      username: 'Steve',
      teamId: 1,
      joinedAt: isoAgo(1200),
    },
    {
      id: 902,
      uuid: 'ec561538-f3fd-461d-aff5-086b22154bce',
      username: 'Alex',
      teamId: 2,
      joinedAt: isoAgo(1100),
    },
    {
      id: 903,
      uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
      username: 'Notch',
      teamId: 3,
      joinedAt: isoAgo(950),
    },
  ];

  return { players, events, teamHistory };
}

/**
 * Counts completed Citadel quests (out of 16) per team from `data get storage nbs:citadel quests`.
 */
export function parseTeamQuestCounts(raw: string): Map<number, number> {
  const counts = new Map<number, number>();
  const questBlocks = raw.matchAll(/q\d+:\s*\{([^}]*)\}/g);
  for (const m of questBlocks) {
    const inner = m[1] ?? '';
    for (const tm of inner.matchAll(/\bt([1-8]):\s*1b/g)) {
      const tid = Number.parseInt(tm[1]!, 10);
      counts.set(tid, (counts.get(tid) ?? 0) + 1);
    }
  }
  return counts;
}

function parseScoreResult(raw: string): number | null {
  const match = raw.match(/has\s+(-?\d+)\s+\[/i);
  return match ? Number.parseInt(match[1]!, 10) : null;
}

function parseEntityCount(raw: string): number {
  const countMatch = raw.match(/count:\s*(\d+)/i);
  if (countMatch) return Number.parseInt(countMatch[1]!, 10);
  if (/Test passed/i.test(raw)) return 1;
  return 0;
}

function parseBossbarMax(raw: string): number | null {
  const match = raw.match(/maximum of\s+(\d+)/i);
  return match ? Number.parseInt(match[1]!, 10) : null;
}

function parseTeamStorage(raw: string): { name?: string; color?: TeamColor } {
  const nameMatch = raw.match(/name:\s*"([^"]*)"/);
  const colorMatch = raw.match(/color:\s*"([^"]*)"/);
  return {
    name: nameMatch?.[1],
    color: colorMatch?.[1] as TeamColor | undefined,
  };
}

function parseFlashStorage(raw: string): { item?: string; count?: number; name?: string } {
  const itemMatch = raw.match(/item:\s*"([^"]*)"/);
  const countMatch = raw.match(/count:\s*(\d+)/);
  const nameMatch = raw.match(/name:\s*"([^"]*)"/);
  return {
    item: itemMatch?.[1],
    count: countMatch ? Number.parseInt(countMatch[1]!, 10) : undefined,
    name: nameMatch?.[1],
  };
}

export const DEFAULT_GRACE_PERIOD_HOURS = 48;

export function getGracePeriodHours(env = process.env): number {
  const parsed = Number.parseFloat(env.GRACE_PERIOD_HOURS ?? '');
  if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  return DEFAULT_GRACE_PERIOD_HOURS;
}

/**
 * Evaluates the 48-hour real-time Grace Period after a season starts.
 * During the first 48 hours: Raid Day stays OFF so players can prepare.
 * After 48 hours: Raid / PvP Bounty Drop opens automatically 24/7.
 */
export function evaluateGracePeriod(
  seasonStartedAtIso: string | null,
  nowMs = Date.now(),
  graceHours = getGracePeriodHours(),
): {
  inGracePeriod: boolean;
  endsAtIso: string | null;
  remainingSeconds: number;
} {
  if (!seasonStartedAtIso) {
    return { inGracePeriod: false, endsAtIso: null, remainingSeconds: 0 };
  }
  const startMs = new Date(seasonStartedAtIso).getTime();
  if (!Number.isFinite(startMs)) {
    return { inGracePeriod: false, endsAtIso: null, remainingSeconds: 0 };
  }
  const endsMs = startMs + graceHours * 3600 * 1000;
  const remainingMs = endsMs - nowMs;
  return {
    inGracePeriod: remainingMs > 0,
    endsAtIso: new Date(endsMs).toISOString(),
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
  };
}

export interface GameStateManagerOptions {
  mode?: AppMode;
  rconClient?: RconClient;
  pollIntervalMs?: number;
}

export class GameStateManager {
  public readonly mode: AppMode;
  private readonly rcon: RconClient;
  private readonly pollIntervalMs: number;
  private state: ServerState;
  private subscribers = new Set<(state: ServerState) => void>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private inflightPoll: Promise<void> | null = null;
  private uuidCache = new Map<string, string>();
  private lastSnapshotAt = 0;
  private autoRaidOpenedForSeason = false;

  constructor(options: GameStateManagerOptions = {}) {
    this.mode = options.mode ?? resolveAppMode();
    this.rcon =
      options.rconClient ??
      new RconClient(
        process.env.RCON_HOST ?? '127.0.0.1',
        Number.parseInt(process.env.RCON_PORT ?? '25575', 10),
        process.env.RCON_PASSWORD ?? '',
      );
    this.pollIntervalMs = Math.max(
      1500,
      options.pollIntervalMs ?? Number.parseInt(process.env.RCON_POLL_MS ?? '3000', 10),
    );

    const initialTeams = createInitialTeams();
    const demoData =
      this.mode === 'demo'
        ? createDemoPlayersAndEvents()
        : { players: [], events: [], teamHistory: [] };
    if (this.mode === 'demo') {
      const now = Date.now();
      const ratios = [
        { minsAgo: 240, r: 0.45 },
        { minsAgo: 180, r: 0.6 },
        { minsAgo: 120, r: 0.74 },
        { minsAgo: 60, r: 0.88 },
        { minsAgo: 0, r: 1.0 },
      ];
      const demoSnaps = ratios.flatMap((step) => {
        const ts = new Date(now - step.minsAgo * 60_000).toISOString();
        return initialTeams
          .filter((t) => t.active)
          .map((t) => ({
            teamId: t.id,
            score: Math.round(t.score * step.r),
            diamonds: Math.round(t.diamonds * step.r),
            recordedAt: ts,
          }));
      });
      seedDemoPlayersStore(demoData.players, demoData.events, demoData.teamHistory, demoSnaps);
    }

    const onlineDemo = demoData.players.filter((p) => p.online);
    const demoStartedAt =
      this.mode === 'demo' ? new Date(Date.now() - 6 * 3600 * 1000).toISOString() : null;
    const demoGrace = evaluateGracePeriod(demoStartedAt);

    this.state = {
      mode: this.mode,
      dbConnected: false,
      worldId: this.mode === 'demo' ? 100001 : 0,
      gameState: 0,
      raidDay: false,
      seasonStartedAt: demoStartedAt,
      gracePeriodEndsAt: demoGrace.endsAtIso,
      onlinePlayers: onlineDemo.length,
      playerNames: onlineDemo.map((p) => p.name),
      players: onlineDemo,
      teams: initialTeams,
      flashQuest:
        this.mode === 'demo'
          ? {
              active: true,
              item: 'minecraft:blaze_rod',
              count: 12,
              name: 'Blaze Rod x12',
              remainingSeconds: 1140,
              maxSeconds: 1500,
              source: 'POOL',
              reason: 'Demo Mode: เควสด่วนตัวอย่างระหว่างรอเชื่อมเซิร์ฟเวอร์ Minecraft จริง',
            }
          : {
              active: false,
              item: '',
              count: 0,
              name: 'รอเชื่อมต่อ Minecraft RCON',
              remainingSeconds: 0,
              maxSeconds: 1500,
            },
      updatedAt: new Date().toISOString(),
    };
  }

  public getRconClient(): RconClient {
    return this.rcon;
  }

  public getState(): ServerState {
    return {
      ...this.state,
      mode: this.mode,
      dbConnected: isDbConnected(),
    };
  }

  public subscribe(listener: (state: ServerState) => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  private emit(): void {
    const snapshot = this.getState();
    for (const listener of this.subscribers) {
      listener(snapshot);
    }
  }

  public startPoller(): void {
    this.pollOnce().catch(() => undefined);
    this.pollTimer = setInterval(() => {
      this.pollOnce().catch(() => undefined);
    }, this.pollIntervalMs);
  }

  public stopPoller(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.rcon.disconnect();
  }

  private async safeCmd(cmd: string): Promise<string | null> {
    try {
      return await this.rcon.command(cmd);
    } catch {
      return null;
    }
  }

  public pollOnce(): Promise<void> {
    if (this.inflightPoll) {
      return this.inflightPoll;
    }
    this.inflightPoll = this.executePoll().finally(() => {
      this.inflightPoll = null;
    });
    return this.inflightPoll;
  }

  private async resolveUuid(name: string): Promise<string> {
    const cached = this.uuidCache.get(name);
    if (cached) return cached;
    const raw = await this.safeCmd(`data get entity ${name} UUID`);
    const parsed = raw ? parseMcUuid(raw) : null;
    const uuid = parsed ?? fallbackPlayerUuid(name);
    if (parsed) {
      this.uuidCache.set(name, parsed);
    }
    return uuid;
  }

  private async executePoll(): Promise<void> {
    if (this.mode === 'demo') {
      if (this.state.flashQuest.active && this.state.flashQuest.remainingSeconds > 0) {
        this.state.flashQuest.remainingSeconds = Math.max(0, this.state.flashQuest.remainingSeconds - 3);
      }
      this.state.updatedAt = new Date().toISOString();
      await this.maybeRecordSnapshot();
      this.emit();
      return;
    }

    const connected = await this.rcon.connect();
    if (!connected) {
      return;
    }

    const coreCmds = [
      this.safeCmd('list'),
      this.safeCmd('scoreboard players get #game_state game_state'),
      this.safeCmd('scoreboard players get #raid_day game_state'),
      this.safeCmd('scoreboard players get #world_id game_state'),
      this.safeCmd('scoreboard players get #flash_timer rnd_temp'),
      this.safeCmd('bossbar get nbs:flash_quest max'),
      this.safeCmd('data get storage nbs:citadel flash'),
      this.safeCmd('data get storage nbs:citadel quests'),
    ];
    const activeFlagsCmds = Array.from({ length: 8 }, (_, idx) =>
      this.safeCmd(`scoreboard players get #t${idx + 1}_active game_state`),
    );

    const [
      listRaw,
      gameRaw,
      raidRaw,
      worldIdRaw,
      flashTimerRaw,
      flashMaxRaw,
      flashDataRaw,
      citadelQuestsRaw,
      ...activeRaws
    ] = await Promise.all([...coreCmds, ...activeFlagsCmds]);

    const questCountsMap =
      citadelQuestsRaw !== null ? parseTeamQuestCounts(citadelQuestsRaw) : null;

    if (listRaw === null && gameRaw === null && raidRaw === null) {
      this.rcon.disconnect();
      return;
    }

    const nextWorldId = worldIdRaw !== null ? Math.max(0, parseScoreResult(worldIdRaw) ?? 0) : this.state.worldId;
    if (this.state.worldId > 0 && nextWorldId > 0 && nextWorldId !== this.state.worldId) {
      console.log(`[World] Detected new Minecraft world_id (${this.state.worldId} -> ${nextWorldId}). Starting clean season!`);
      await this.resetForNewSeason(nextWorldId, `World ${nextWorldId}`);
    }

    let onlinePlayers = this.state.onlinePlayers;
    let playerNames = this.state.playerNames;
    if (listRaw !== null) {
      const listMatch = listRaw.match(/There are (\d+) of a max of \d+ players online:\s*(.*)/i);
      onlinePlayers = listMatch ? Number.parseInt(listMatch[1]!, 10) : 0;
      playerNames =
        listMatch && listMatch[2]?.trim()
          ? listMatch[2]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
    }

    const WEAPON_OBJS: Array<{ obj: string; item: string }> = [
      { obj: 'wpn_neth_sword', item: 'minecraft:netherite_sword' },
      { obj: 'wpn_dia_sword', item: 'minecraft:diamond_sword' },
      { obj: 'wpn_iron_sword', item: 'minecraft:iron_sword' },
      { obj: 'wpn_neth_axe', item: 'minecraft:netherite_axe' },
      { obj: 'wpn_dia_axe', item: 'minecraft:diamond_axe' },
      { obj: 'wpn_mace', item: 'minecraft:mace' },
      { obj: 'wpn_trident', item: 'minecraft:trident' },
      { obj: 'wpn_bow', item: 'minecraft:bow' },
      { obj: 'wpn_crossbow', item: 'minecraft:crossbow' },
    ];

    const nowIso = new Date().toISOString();
    const players: PlayerStatus[] = await Promise.all(
      playerNames.slice(0, 32).map(async (name) => {
        const [
          uuid,
          teamIdRaw,
          careerIdRaw,
          pvpKillsRaw,
          killsRaw,
          deathsRaw,
          streakRaw,
          bestStreakRaw,
          playtimeRaw,
          questsRaw,
          bossScoreRaw,
          mobKillsRaw,
          dmgDealtRaw,
          dmgTakenRaw,
          walkCmRaw,
          sprintCmRaw,
          swimCmRaw,
          aviateCmRaw,
          survivedTicksRaw,
          animalsBredRaw,
          fishCaughtRaw,
          tradedRaw,
          dia1Raw,
          dia2Raw,
          debrisRaw,
          bDragonRaw,
          bWitherRaw,
          bWardenRaw,
          bElderRaw,
          bRaidRaw,
          ...weaponRaws
        ] = await Promise.all([
          this.resolveUuid(name),
          this.safeCmd(`scoreboard players get ${name} team_id`),
          this.safeCmd(`scoreboard players get ${name} career_id`),
          this.safeCmd(`scoreboard players get ${name} total_pvp_kills`),
          this.safeCmd(`scoreboard players get ${name} lifetime_kills`),
          this.safeCmd(`scoreboard players get ${name} lifetime_deaths`),
          this.safeCmd(`scoreboard players get ${name} kill_streak`),
          this.safeCmd(`scoreboard players get ${name} best_streak`),
          this.safeCmd(`scoreboard players get ${name} play_time_ticks`),
          this.safeCmd(`scoreboard players get ${name} player_quests_done`),
          this.safeCmd(`scoreboard players get ${name} player_score`),
          this.safeCmd(`scoreboard players get ${name} stat_mob_kills`),
          this.safeCmd(`scoreboard players get ${name} stat_dmg_dealt`),
          this.safeCmd(`scoreboard players get ${name} stat_dmg_taken`),
          this.safeCmd(`scoreboard players get ${name} stat_walk_cm`),
          this.safeCmd(`scoreboard players get ${name} stat_sprint_cm`),
          this.safeCmd(`scoreboard players get ${name} stat_swim_cm`),
          this.safeCmd(`scoreboard players get ${name} stat_aviate_cm`),
          this.safeCmd(`scoreboard players get ${name} time_since_death`),
          this.safeCmd(`scoreboard players get ${name} stat_animals_bred`),
          this.safeCmd(`scoreboard players get ${name} stat_fish_caught`),
          this.safeCmd(`scoreboard players get ${name} stat_traded`),
          this.safeCmd(`scoreboard players get ${name} stat_mine_dia1`),
          this.safeCmd(`scoreboard players get ${name} stat_mine_dia2`),
          this.safeCmd(`scoreboard players get ${name} stat_mine_debris`),
          this.safeCmd(`scoreboard players get ${name} raw_kill_dragon`),
          this.safeCmd(`scoreboard players get ${name} raw_kill_wither`),
          this.safeCmd(`scoreboard players get ${name} raw_kill_warden`),
          this.safeCmd(`scoreboard players get ${name} raw_kill_elder`),
          this.safeCmd(`scoreboard players get ${name} raw_win_raid`),
          ...WEAPON_OBJS.map((w) => this.safeCmd(`scoreboard players get ${name} ${w.obj}`)),
        ]);
        const prev = this.state.players.find((p) => p.name === name);
        const kills = killsRaw !== null ? Math.max(0, parseScoreResult(killsRaw) ?? 0) : (prev?.kills ?? 0);
        const deaths = deathsRaw !== null ? Math.max(0, parseScoreResult(deathsRaw) ?? 0) : (prev?.deaths ?? 0);
        const playtimeTicks =
          playtimeRaw !== null ? Math.max(0, parseScoreResult(playtimeRaw) ?? 0) : (prev ? prev.playtimeSeconds * 20 : 0);

        const num = (raw: string | null, fallback = 0) =>
          raw !== null ? Math.max(0, parseScoreResult(raw) ?? 0) : fallback;

        const totalCm =
          num(walkCmRaw) + num(sprintCmRaw) + num(swimCmRaw) + num(aviateCmRaw);

        let favoriteWeapon: string | null = prev?.inGameStats?.favoriteWeapon ?? null;
        let favoriteWeaponUses = prev?.inGameStats?.favoriteWeaponUses ?? 0;
        let maxUse = 0;
        WEAPON_OBJS.forEach((w, idx) => {
          const uses = num(weaponRaws[idx] ?? null);
          if (uses > maxUse) {
            maxUse = uses;
            favoriteWeapon = w.item;
            favoriteWeaponUses = uses;
          }
        });

        return {
          uuid,
          name,
          online: true,
          teamId: teamIdRaw !== null ? Math.max(0, parseScoreResult(teamIdRaw) ?? 0) : (prev?.teamId ?? 0),
          careerId:
            careerIdRaw !== null ? Math.max(0, parseScoreResult(careerIdRaw) ?? 0) : (prev?.careerId ?? 0),
          pvpKills:
            pvpKillsRaw !== null ? Math.max(0, parseScoreResult(pvpKillsRaw) ?? 0) : (prev?.pvpKills ?? 0),
          kills,
          deaths,
          kd: computeKd(kills, deaths),
          killStreak:
            streakRaw !== null ? Math.max(0, parseScoreResult(streakRaw) ?? 0) : (prev?.killStreak ?? 0),
          bestStreak:
            bestStreakRaw !== null ? Math.max(0, parseScoreResult(bestStreakRaw) ?? 0) : (prev?.bestStreak ?? 0),
          playtimeSeconds: Math.floor(playtimeTicks / 20),
          questsCompleted:
            questsRaw !== null ? Math.max(0, parseScoreResult(questsRaw) ?? 0) : (prev?.questsCompleted ?? 0),
          bossScore:
            bossScoreRaw !== null ? Math.max(0, parseScoreResult(bossScoreRaw) ?? 0) : (prev?.bossScore ?? 0),
          inGameStats: {
            mobKills: num(mobKillsRaw, prev?.inGameStats?.mobKills ?? 0),
            damageDealt: Math.round(num(dmgDealtRaw, (prev?.inGameStats?.damageDealt ?? 0) * 10) / 10),
            damageTaken: Math.round(num(dmgTakenRaw, (prev?.inGameStats?.damageTaken ?? 0) * 10) / 10),
            distanceKm:
              totalCm > 0
                ? Number((totalCm / 100_000).toFixed(1))
                : (prev?.inGameStats?.distanceKm ?? 0),
            survivedMinutes: Math.floor(num(survivedTicksRaw) / 1200),
            animalsBred: num(animalsBredRaw, prev?.inGameStats?.animalsBred ?? 0),
            fishCaught: num(fishCaughtRaw, prev?.inGameStats?.fishCaught ?? 0),
            diamondsMined:
              num(dia1Raw) + num(dia2Raw) || (prev?.inGameStats?.diamondsMined ?? 0),
            ancientDebrisMined: num(debrisRaw, prev?.inGameStats?.ancientDebrisMined ?? 0),
            villagerTrades: num(tradedRaw, prev?.inGameStats?.villagerTrades ?? 0),
            bossKills: {
              dragon: num(bDragonRaw, prev?.inGameStats?.bossKills.dragon ?? 0),
              wither: num(bWitherRaw, prev?.inGameStats?.bossKills.wither ?? 0),
              warden: num(bWardenRaw, prev?.inGameStats?.bossKills.warden ?? 0),
              elder: num(bElderRaw, prev?.inGameStats?.bossKills.elder ?? 0),
              raidWins: num(bRaidRaw, prev?.inGameStats?.bossKills.raidWins ?? 0),
            },
            favoriteWeapon,
            favoriteWeaponUses,
          },
          firstSeenAt: prev?.firstSeenAt ?? nowIso,
          lastSeenAt: nowIso,
        };
      }),
    );

    const teamNameMap = new Map(this.state.teams.map((t) => [t.id, t.name]));
    await syncOnlinePlayers(players, teamNameMap);

    const updatedTeams: TeamInfo[] = await Promise.all(
      this.state.teams.map(async (prevTeam, idx) => {
        const i = idx + 1;
        const activeRaw = activeRaws[idx];
        const isActive = activeRaw !== null ? parseScoreResult(activeRaw) === 1 : prevTeam.active;
        if (!isActive) {
          return { ...prevTeam, active: false };
        }

        const [
          scoreRaw,
          diaRaw,
          teamDataRaw,
          flagsRaw,
          questRaw,
          careerRaw,
          advRaw,
          starRaw,
          wardenRaw,
          elderRaw,
          raidCntRaw,
          trialRaw,
        ] = await Promise.all([
          this.safeCmd(`scoreboard players get ทีมที่_${i} team_score`),
          this.safeCmd(`scoreboard players get #team_${i} team_diamonds`),
          this.safeCmd(`data get storage nbs:team t${i}`),
          this.safeCmd(`execute if entity @e[type=minecraft:marker,tag=flag_anchor,scores={team_id=${i}}]`),
          this.safeCmd(`scoreboard players get #team_${i} team_quest_pts`),
          this.safeCmd(`scoreboard players get #team_${i} team_career_pts`),
          this.safeCmd(`scoreboard players get #team_${i} team_adv_pts`),
          this.safeCmd(`scoreboard players get #t${i}_star team_boss_cnt`),
          this.safeCmd(`scoreboard players get #t${i}_warden team_boss_cnt`),
          this.safeCmd(`scoreboard players get #t${i}_elder team_boss_cnt`),
          this.safeCmd(`scoreboard players get #t${i}_raid team_boss_cnt`),
          this.safeCmd(`scoreboard players get #t${i}_trial team_boss_cnt`),
        ]);

        const totalScore = scoreRaw !== null ? (parseScoreResult(scoreRaw) ?? 0) : prevTeam.score;
        const questPts = questRaw !== null ? (parseScoreResult(questRaw) ?? 0) : prevTeam.breakdown.quest;
        const careerPts = careerRaw !== null ? (parseScoreResult(careerRaw) ?? 0) : prevTeam.breakdown.career;
        const advPts = advRaw !== null ? (parseScoreResult(advRaw) ?? 0) : prevTeam.breakdown.adv;

        const bossPts =
          starRaw !== null && wardenRaw !== null && elderRaw !== null && raidCntRaw !== null && trialRaw !== null
            ? Math.min(5, Math.max(0, parseScoreResult(starRaw) ?? 0)) * 30 +
              Math.max(0, parseScoreResult(wardenRaw) ?? 0) * 45 +
              Math.max(0, parseScoreResult(elderRaw) ?? 0) * 20 +
              Math.max(0, parseScoreResult(raidCntRaw) ?? 0) * 15 +
              Math.max(0, parseScoreResult(trialRaw) ?? 0) * 30
            : prevTeam.breakdown.boss;

        const meta = teamDataRaw !== null ? parseTeamStorage(teamDataRaw) : {};
        return {
          id: i,
          name: meta.name ?? prevTeam.name,
          color: meta.color ?? prevTeam.color,
          active: true,
          score: totalScore,
          diamonds: diaRaw !== null ? (parseScoreResult(diaRaw) ?? 0) : prevTeam.diamonds,
          flags: flagsRaw !== null ? parseEntityCount(flagsRaw) : prevTeam.flags,
          questsDone: questCountsMap ? (questCountsMap.get(i) ?? 0) : prevTeam.questsDone,
          breakdown: {
            chestAndBonus: Math.max(0, totalScore - (questPts + careerPts + advPts + bossPts)),
            quest: questPts,
            career: careerPts,
            adv: advPts,
            boss: bossPts,
          },
        };
      }),
    );

    const flashTimer =
      flashTimerRaw !== null ? (parseScoreResult(flashTimerRaw) ?? 0) : this.state.flashQuest.remainingSeconds;
    const flashMax =
      flashMaxRaw !== null ? Math.max(1, parseBossbarMax(flashMaxRaw) ?? 1500) : this.state.flashQuest.maxSeconds;
    const parsedFlash = flashDataRaw !== null ? parseFlashStorage(flashDataRaw) : this.state.flashQuest;

    const resolvedGameState =
      gameRaw !== null ? (parseScoreResult(gameRaw) === 1 ? 1 : 0) : this.state.gameState;
    let resolvedRaidDay =
      raidRaw !== null ? parseScoreResult(raidRaw) === 1 : this.state.raidDay;

    // 48-hour real-time Grace Period scheduler:
    // - First 48h after gameState becomes 1: Raid stays OFF so everyone can prepare
    // - After 48h: automatically runs nbs:game/raid_on once so PvP bounty drop runs 24/7
    let seasonStartedAt = this.state.seasonStartedAt;
    if (resolvedGameState === 1) {
      if (!seasonStartedAt) {
        seasonStartedAt = (await getActiveSeasonStart()) ?? (await markSeasonStarted(`World ${nextWorldId}`));
      }
      const grace = evaluateGracePeriod(seasonStartedAt);
      if (process.env.AUTO_RAID_SCHEDULE !== 'false' && !grace.inGracePeriod && !this.autoRaidOpenedForSeason) {
        this.autoRaidOpenedForSeason = true;
        if (!resolvedRaidDay) {
          const res = await this.safeCmd('function nbs:game/raid_on');
          if (res !== null) {
            resolvedRaidDay = true;
            await recordAuditLog('auto_grace_ended:raid_on', { seasonStartedAt }, 'OK');
          }
        }
      }
    } else if (this.state.gameState === 1 && resolvedGameState === 0) {
      seasonStartedAt = null;
      this.autoRaidOpenedForSeason = false;
      await clearActiveSeasonStart();
    }

    const graceEval = evaluateGracePeriod(seasonStartedAt);

    this.state = {
      mode: 'rcon',
      dbConnected: isDbConnected(),
      worldId: nextWorldId,
      gameState: resolvedGameState,
      raidDay: resolvedRaidDay,
      seasonStartedAt,
      gracePeriodEndsAt: graceEval.endsAtIso,
      onlinePlayers,
      playerNames,
      players,
      teams: updatedTeams,
      flashQuest: {
        active: flashTimer > 0 && Boolean(parsedFlash.item),
        item: parsedFlash.item ?? '',
        count: parsedFlash.count ?? 0,
        name: parsedFlash.name ?? 'ยังไม่มีเควสด่วน',
        remainingSeconds: Math.max(0, flashTimer),
        maxSeconds: flashMax,
        source: this.state.flashQuest.source ?? 'INGAME',
        reason: this.state.flashQuest.reason,
      },
      updatedAt: nowIso,
    };

    await this.maybeRecordSnapshot();
    this.emit();
  }

  private async maybeRecordSnapshot(): Promise<void> {
    const now = Date.now();
    if (now - this.lastSnapshotAt >= 60_000) {
      this.lastSnapshotAt = now;
      await Promise.all([
        recordTeamSnapshots(this.state.teams),
        recordPlayerStatsHistory(this.state.players),
      ]);
    }
  }

  public async resetForNewSeason(newWorldId = this.state.worldId, label = 'New Season'): Promise<void> {
    const activeTeams = [...this.state.teams]
      .filter((t) => t.active)
      .sort((a, b) => b.score - a.score);
    const allPlayers = await getAllPlayers({ status: 'all' });
    const topKiller = [...allPlayers].sort((a, b) => b.kills - a.kills || b.kd - a.kd)[0];
    const mvp = [...allPlayers].sort(
      (a, b) =>
        b.kills * 15 + b.bossScore + b.questsCompleted * 20 - (a.kills * 15 + a.bossScore + a.questsCompleted * 20),
    )[0];

    if (activeTeams[0] && (activeTeams[0].score > 0 || allPlayers.length > 0)) {
      await archiveSeasonToHallOfFame({
        seasonLabel: label,
        worldId: this.state.worldId,
        championTeamName: activeTeams[0].name,
        championTeamColor: activeTeams[0].color,
        championTeamScore: activeTeams[0].score,
        topKillerName: topKiller?.name ?? '-',
        topKillerUuid: topKiller?.uuid ?? '',
        topKillerKills: topKiller?.kills ?? 0,
        mvpName: mvp?.name ?? '-',
        mvpUuid: mvp?.uuid ?? '',
        mvpKd: mvp?.kd ?? 0,
      });
    }

    this.uuidCache.clear();
    this.lastSnapshotAt = 0;
    this.autoRaidOpenedForSeason = false;
    await resetSeasonData(label);
    this.state = {
      ...this.state,
      worldId: newWorldId,
      raidDay: false,
      seasonStartedAt: null,
      gracePeriodEndsAt: null,
      players: [],
      playerNames: [],
      onlinePlayers: 0,
      teams: createInitialTeams().map((t) => ({
        ...t,
        score: 0,
        diamonds: 0,
        flags: 0,
        questsDone: 0,
        breakdown: { chestAndBonus: 0, quest: 0, career: 0, adv: 0, boss: 0 },
      })),
      flashQuest: {
        active: false,
        item: '',
        count: 0,
        name: 'ยังไม่มีเควสด่วนในขณะนี้',
        remainingSeconds: 0,
        maxSeconds: 1500,
      },
      updatedAt: new Date().toISOString(),
    };
    this.emit();
  }

  public mutateState(mutator: (draft: ServerState) => void): void {
    mutator(this.state);
    this.state.updatedAt = new Date().toISOString();
    this.emit();
  }
}
