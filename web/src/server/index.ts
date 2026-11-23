import { join } from 'node:path';
import { createApp } from './app';
import { initDatabase } from './db';
import { validateAdminSecret } from './middleware/auth';
import { GameStateManager } from './rcon/poller';

let adminSecret: string;
try {
  adminSecret = validateAdminSecret(process.env.ADMIN_TOKEN);
} catch (err) {
  console.error(`[FATAL] ${(err as Error).message}`);
  console.error('Set a strong ADMIN_TOKEN (>= 12 chars) in web/.env or environment before starting.');
  process.exit(1);
}

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);

await initDatabase();
const game = new GameStateManager();
game.startPoller();

const distDir = join(import.meta.dir, '../../dist');
const app = createApp({
  adminSecret,
  game,
  distDir,
});

app.listen(PORT);
console.log(
  `[NBs SMP Web] Listening on http://127.0.0.1:${PORT} (mode=${game.getState().mode}, db=${game.getState().dbConnected})`,
);

export type { App } from './app';
