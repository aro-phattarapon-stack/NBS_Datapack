import type { ServerState } from '../../shared/types';
import type { GameStateManager } from '../rcon/poller';

export interface CommandResult {
  ok: boolean;
  status: number;
  result?: string;
  error?: string;
}

/**
 * Separates admin command execution from state polling and strictly isolates Demo vs RCON modes.
 */
export class RconCommandService {
  constructor(private readonly game: GameStateManager) {}

  public async execute(
    cmd: string,
    demoMutator?: (draft: ServerState) => void,
    rconMutator?: (draft: ServerState) => void,
  ): Promise<CommandResult> {
    if (this.game.mode === 'demo') {
      if (demoMutator) {
        this.game.mutateState(demoMutator);
      }
      return {
        ok: true,
        status: 200,
        result: `[DEMO] Executed: ${cmd}`,
      };
    }

    const rcon = this.game.getRconClient();
    const connected = await rcon.connect();
    if (!connected) {
      return {
        ok: false,
        status: 503,
        error: 'Minecraft RCON offline — ไม่สามารถส่งคำสั่งเข้าเซิร์ฟเวอร์ได้',
      };
    }

    try {
      const output = await rcon.command(cmd);
      if (rconMutator) {
        this.game.mutateState(rconMutator);
      }
      await this.game.pollOnce();
      return {
        ok: true,
        status: 200,
        result: output || 'OK',
      };
    } catch (err) {
      return {
        ok: false,
        status: 503,
        error: `RCON command failed: ${(err as Error).message}`,
      };
    }
  }
}
