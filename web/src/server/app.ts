import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { existsSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { AdminRateLimiter } from './middleware/auth';
import type { GameStateManager } from './rcon/poller';
import { createAdminRoutes } from './routes/admin';
import { createPublicRoutes } from './routes/public';
import { RconCommandService } from './services/rcon-commands';

export interface CreateAppOptions {
  adminSecret: string;
  game: GameStateManager;
  commandService?: RconCommandService;
  rateLimiter?: AdminRateLimiter;
  distDir?: string;
}

export function createApp({
  adminSecret,
  game,
  commandService = new RconCommandService(game),
  rateLimiter = new AdminRateLimiter(),
  distDir,
}: CreateAppOptions) {
  const app = new Elysia()
    .use(cors())
    .use(createPublicRoutes(game))
    .use(
      createAdminRoutes({
        adminSecret,
        rateLimiter,
        game,
        commandService,
      }),
    );

  if (distDir && existsSync(distDir)) {
    const resolvedDist = resolve(distDir);
    const indexFile = join(resolvedDist, 'index.html');
    app.get('*', ({ path }) => {
      const rel = path === '/' ? 'index.html' : path.replace(/^\/+/, '');
      const target = resolve(resolvedDist, rel);
      const isInsideDist =
        target === indexFile || target.startsWith(`${resolvedDist}${sep}`);
      try {
        if (isInsideDist && existsSync(target) && statSync(target).isFile()) {
          return Bun.file(target);
        }
      } catch {
        // fallback to SPA index.html
      }
      return Bun.file(indexFile);
    });
  }

  return app;
}

export type App = ReturnType<typeof createApp>;
