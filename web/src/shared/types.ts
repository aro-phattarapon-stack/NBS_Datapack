export type TeamColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'light_purple'
  | 'aqua'
  | 'gold'
  | 'white'
  | 'dark_red'
  | 'dark_aqua';

export const TEAM_COLOR_META: Record<
  TeamColor,
  { label: string; hex: string }
> = {
  red: { label: 'แดง', hex: '#ef4444' },
  blue: { label: 'น้ำเงิน', hex: '#3b82f6' },
  green: { label: 'เขียว', hex: '#22c55e' },
  yellow: { label: 'เหลือง', hex: '#eab308' },
  light_purple: { label: 'ชมพู', hex: '#e879f9' },
  aqua: { label: 'ฟ้า', hex: '#22d3ee' },
  gold: { label: 'ส้ม/ทอง', hex: '#f59e0b' },
  white: { label: 'ขาว', hex: '#f1f5f9' },
  dark_red: { label: 'แดงเข้ม', hex: '#dc2626' },
  dark_aqua: { label: 'ฟ้าคราม', hex: '#0891b2' },
};

export const CAREER_META: Record<number, { label: string }> = {
  0: { label: 'ยังไม่เลือกอาชีพ' },
  1: { label: 'Farmer' },
  2: { label: 'Blacksmith' },
  3: { label: 'Hunter' },
  4: { label: 'Adventurer' },
};

export interface TeamScoreBreakdown {
  chestAndBonus: number;
  quest: number;
  career: number;
  adv: number;
  boss: number;
}

export interface TeamInfo {
  id: number;
  name: string;
  color: TeamColor;
  active: boolean;
  score: number;
  diamonds: number;
  flags: number;
  questsDone: number;
  breakdown: TeamScoreBreakdown;
}

export interface InGameStats {
  mobKills: number;
  damageDealt: number;
  damageTaken: number;
  distanceKm: number;
  survivedMinutes: number;
  animalsBred: number;
  fishCaught: number;
  diamondsMined: number;
  ancientDebrisMined: number;
  villagerTrades: number;
  bossKills: {
    dragon: number;
    wither: number;
    warden: number;
    elder: number;
    raidWins: number;
  };
  favoriteWeapon: string | null;
  favoriteWeaponUses: number;
}

export interface PlayerStatus {
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
  inGameStats?: InGameStats;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface PlayerEventItem {
  id: number;
  uuid: string;
  username: string;
  type: 'KILL' | 'DEATH' | 'QUEST' | 'RAID' | 'TEAM' | 'JOIN';
  summary: string;
  createdAt: string;
}

export interface PlayerStatsHistoryPoint {
  kills: number;
  deaths: number;
  kd: number;
  playtimeSeconds: number;
  recordedAt: string;
}

export interface TeamMemberHistoryItem {
  id: number;
  uuid: string;
  username: string;
  teamId: number;
  joinedAt: string;
}

export interface PlayerProfileResponse {
  player: PlayerStatus;
  events: PlayerEventItem[];
  history: PlayerStatsHistoryPoint[];
  rank: number;
  totalPlayers: number;
}

export interface TeamsOverviewResponse {
  teams: TeamInfo[];
  players: PlayerStatus[];
  teamHistory: TeamMemberHistoryItem[];
  snapshots: SnapshotPoint[];
  recentEvents: PlayerEventItem[];
}

export interface FlashQuestState {
  active: boolean;
  item: string;
  count: number;
  name: string;
  remainingSeconds: number;
  maxSeconds: number;
  source?: 'AI' | 'POOL' | 'MANUAL' | 'INGAME';
  reason?: string;
}

export interface ServerState {
  mode: 'rcon' | 'demo';
  dbConnected: boolean;
  worldId: number;
  gameState: 0 | 1; // 0 = Lobby, 1 = Active
  raidDay: boolean;
  seasonStartedAt: string | null;
  gracePeriodEndsAt: string | null;
  onlinePlayers: number;
  playerNames: string[];
  players: PlayerStatus[];
  teams: TeamInfo[];
  flashQuest: FlashQuestState;
  updatedAt: string;
}

export interface QuestHistoryItem {
  id: number;
  item: string;
  count: number;
  displayName: string;
  source: string;
  aiReason: string | null;
  createdAt: string;
}

export interface SnapshotPoint {
  teamId: number;
  score: number;
  diamonds: number;
  recordedAt: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  payload: string;
  result: string;
  createdAt: string;
}

export interface HallOfFameEntry {
  id: number;
  seasonLabel: string;
  worldId: number;
  championTeamName: string;
  championTeamColor: TeamColor;
  championTeamScore: number;
  topKillerName: string;
  topKillerUuid: string;
  topKillerKills: number;
  mvpName: string;
  mvpUuid: string;
  mvpKd: number;
  endedAt: string;
}

export interface QuestWhitelistEntry {
  item: string;
  thaiName: string;
  minCount: number;
  maxCount: number;
  defaultCount: number;
  difficulty: 'early' | 'mid' | 'late';
}

export const MC_QUEST_WHITELIST: QuestWhitelistEntry[] = [
  { item: 'minecraft:iron_block', thaiName: 'Iron Block', minCount: 4, maxCount: 20, defaultCount: 8, difficulty: 'early' },
  { item: 'minecraft:gold_block', thaiName: 'Gold Block', minCount: 2, maxCount: 12, defaultCount: 4, difficulty: 'early' },
  { item: 'minecraft:redstone_block', thaiName: 'Redstone Block', minCount: 4, maxCount: 24, defaultCount: 12, difficulty: 'early' },
  { item: 'minecraft:lapis_block', thaiName: 'Lapis Block', minCount: 4, maxCount: 16, defaultCount: 8, difficulty: 'early' },
  { item: 'minecraft:honey_bottle', thaiName: 'Honey Bottle', minCount: 4, maxCount: 16, defaultCount: 8, difficulty: 'early' },
  { item: 'minecraft:blaze_rod', thaiName: 'Blaze Rod', minCount: 4, maxCount: 16, defaultCount: 12, difficulty: 'mid' },
  { item: 'minecraft:ender_pearl', thaiName: 'Ender Pearl', minCount: 4, maxCount: 16, defaultCount: 8, difficulty: 'mid' },
  { item: 'minecraft:ghast_tear', thaiName: 'Ghast Tear', minCount: 1, maxCount: 6, defaultCount: 2, difficulty: 'mid' },
  { item: 'minecraft:prismarine_shard', thaiName: 'Prismarine Shard', minCount: 8, maxCount: 32, defaultCount: 16, difficulty: 'mid' },
  { item: 'minecraft:magma_cream', thaiName: 'Magma Cream', minCount: 4, maxCount: 16, defaultCount: 8, difficulty: 'mid' },
  { item: 'minecraft:diamond', thaiName: 'Diamond', minCount: 2, maxCount: 12, defaultCount: 6, difficulty: 'mid' },
  { item: 'minecraft:nether_wart', thaiName: 'Nether Wart', minCount: 8, maxCount: 32, defaultCount: 16, difficulty: 'early' },
  { item: 'minecraft:phantom_membrane', thaiName: 'Phantom Membrane', minCount: 2, maxCount: 8, defaultCount: 4, difficulty: 'mid' },
  { item: 'minecraft:sculk_catalyst', thaiName: 'Sculk Catalyst', minCount: 1, maxCount: 2, defaultCount: 1, difficulty: 'late' },
  { item: 'minecraft:emerald_block', thaiName: 'Emerald Block', minCount: 2, maxCount: 8, defaultCount: 4, difficulty: 'mid' },
  { item: 'minecraft:golden_apple', thaiName: 'Golden Apple', minCount: 1, maxCount: 4, defaultCount: 2, difficulty: 'mid' },
];
