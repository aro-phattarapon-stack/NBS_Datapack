import net from 'node:net';

const PACKET_AUTH = 3;
const PACKET_EXEC = 2;
const PACKET_AUTH_RESPONSE = 2;

interface PendingRequest {
  id: number;
  resolve: (value: string) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Native Source RCON TCP Client for Minecraft Dedicated Server.
 * Serializes commands through a single socket with automatic reconnect.
 */
export class RconClient {
  private socket: net.Socket | null = null;
  private connected = false;
  private authenticated = false;
  private connecting: Promise<boolean> | null = null;
  private nextId = 1;
  private buffer = Buffer.alloc(0);
  private pending = new Map<number, PendingRequest>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly password: string,
    private readonly timeoutMs = 3000,
  ) {}

  public isReady(): boolean {
    return this.connected && this.authenticated;
  }

  public async connect(): Promise<boolean> {
    if (this.isReady()) return true;
    if (this.connecting) return this.connecting;
    if (!this.password || this.password === 'change_this_rcon_password') {
      return false;
    }

    this.connecting = new Promise<boolean>((resolve) => {
      const sock = net.createConnection({ host: this.host, port: this.port });
      this.socket = sock;
      this.buffer = Buffer.alloc(0);

      const timeout = setTimeout(() => {
        sock.destroy();
        this.cleanup();
        resolve(false);
      }, 2500);

      sock.once('connect', async () => {
        clearTimeout(timeout);
        this.connected = true;
        try {
          await this.sendRaw(PACKET_AUTH, this.password);
          this.authenticated = true;
          resolve(true);
        } catch {
          this.disconnect();
          resolve(false);
        }
      });

      sock.on('data', (chunk: Buffer) => {
        this.handleData(chunk);
      });

      sock.on('error', () => {
        clearTimeout(timeout);
        this.cleanup();
        resolve(false);
      });

      sock.on('close', () => {
        clearTimeout(timeout);
        this.cleanup();
      });
    }).finally(() => {
      this.connecting = null;
    });

    return this.connecting;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
    }
    this.cleanup();
  }

  public command(cmd: string): Promise<string> {
    const task = this.queue.then(async () => {
      const ok = await this.connect();
      if (!ok) {
        throw new Error('RCON unavailable');
      }
      return this.sendRaw(PACKET_EXEC, cmd);
    });
    this.queue = task.catch(() => undefined);
    return task;
  }

  private sendRaw(type: number, payload: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        return reject(new Error('RCON socket not connected'));
      }
      const id = this.nextId++;
      if (this.nextId > 0x7fffffff) this.nextId = 1;

      const payloadBuf = Buffer.from(payload, 'utf8');
      const packetLen = 4 + 4 + payloadBuf.length + 2;
      const buf = Buffer.allocUnsafe(4 + packetLen);
      buf.writeInt32LE(packetLen, 0);
      buf.writeInt32LE(id, 4);
      buf.writeInt32LE(type, 8);
      payloadBuf.copy(buf, 12);
      buf.writeInt16LE(0, 12 + payloadBuf.length);

      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RCON timeout for request ${id}`));
      }, this.timeoutMs);

      this.pending.set(id, { id, resolve, reject, timer });
      this.socket.write(buf);
    });
  }

  private handleData(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 4) {
      const packetLen = this.buffer.readInt32LE(0);
      if (packetLen < 10 || packetLen > 65536) {
        this.disconnect();
        return;
      }
      if (this.buffer.length < 4 + packetLen) {
        return;
      }

      const id = this.buffer.readInt32LE(4);
      const type = this.buffer.readInt32LE(8);
      const body = this.buffer.subarray(12, 4 + packetLen - 2).toString('utf8');
      this.buffer = this.buffer.subarray(4 + packetLen);

      // Auth failure returns id = -1
      if (type === PACKET_AUTH_RESPONSE && id === -1) {
        for (const req of this.pending.values()) {
          clearTimeout(req.timer);
          req.reject(new Error('RCON authentication failed'));
        }
        this.pending.clear();
        this.disconnect();
        return;
      }

      const req = this.pending.get(id);
      if (req) {
        clearTimeout(req.timer);
        this.pending.delete(id);
        req.resolve(body);
      }
    }
  }

  private cleanup(): void {
    this.connected = false;
    this.authenticated = false;
    this.socket = null;
    for (const req of this.pending.values()) {
      clearTimeout(req.timer);
      req.reject(new Error('RCON disconnected'));
    }
    this.pending.clear();
  }
}
