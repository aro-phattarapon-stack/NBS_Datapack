import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
  startedAt: timestamp('started_at').defaultNow().notNull(),
});

export const teamSnapshots = pgTable('team_snapshots', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull(),
  teamName: text('team_name').notNull(),
  score: integer('score').notNull().default(0),
  diamonds: integer('diamonds').notNull().default(0),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

export const flashQuests = pgTable('flash_quests', {
  id: serial('id').primaryKey(),
  item: text('item').notNull(),
  count: integer('count').notNull(),
  displayName: text('display_name').notNull(),
  source: text('source').notNull(), // 'AI' | 'POOL' | 'MANUAL'
  aiReason: text('ai_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  payload: text('payload').notNull().default('{}'),
  result: text('result').notNull().default('OK'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const players = pgTable('players', {
  uuid: text('uuid').primaryKey(),
  username: text('username').notNull(),
  online: boolean('online').notNull().default(false),
  firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
});

export const playerStats = pgTable('player_stats', {
  uuid: text('uuid').primaryKey(),
  teamId: integer('team_id').notNull().default(0),
  careerId: integer('career_id').notNull().default(0),
  pvpKills: integer('pvp_kills').notNull().default(0),
  kills: integer('kills').notNull().default(0),
  deaths: integer('deaths').notNull().default(0),
  killStreak: integer('kill_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  playtimeSeconds: integer('playtime_seconds').notNull().default(0),
  questsCompleted: integer('quests_completed').notNull().default(0),
  bossScore: integer('boss_score').notNull().default(0),
  inGameStatsJson: text('in_game_stats_json').notNull().default('{}'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playerEvents = pgTable('player_events', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull(),
  username: text('username').notNull(),
  type: text('type').notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playerStatsHistory = pgTable('player_stats_history', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull(),
  kills: integer('kills').notNull().default(0),
  deaths: integer('deaths').notNull().default(0),
  playtimeSeconds: integer('playtime_seconds').notNull().default(0),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull(),
  username: text('username').notNull(),
  teamId: integer('team_id').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const hallOfFame = pgTable('hall_of_fame', {
  id: serial('id').primaryKey(),
  seasonLabel: text('season_label').notNull(),
  worldId: integer('world_id').notNull().default(0),
  championTeamName: text('champion_team_name').notNull(),
  championTeamColor: text('champion_team_color').notNull().default('red'),
  championTeamScore: integer('champion_team_score').notNull().default(0),
  topKillerName: text('top_killer_name').notNull(),
  topKillerUuid: text('top_killer_uuid').notNull().default(''),
  topKillerKills: integer('top_killer_kills').notNull().default(0),
  mvpName: text('mvp_name').notNull(),
  mvpUuid: text('mvp_uuid').notNull().default(''),
  mvpKd: text('mvp_kd').notNull().default('0.00'),
  endedAt: timestamp('ended_at').defaultNow().notNull(),
});
