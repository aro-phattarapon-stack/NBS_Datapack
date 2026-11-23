import { createHash, timingSafeEqual } from 'node:crypto';

const FORBIDDEN_WEAK_TOKENS = new Set([
  'nbs-admin',
  'admin',
  'changeme',
  'change_this_admin_password',
  'secret',
  'password',
  '123456',
  '123456789012',
]);

/**
 * Validates ADMIN_TOKEN at startup and throws if missing, too short, or a known default.
 */
export function validateAdminSecret(raw: string | undefined): string {
  const token = raw?.trim() ?? '';
  if (!token) {
    throw new Error('ADMIN_TOKEN is required and cannot be empty.');
  }
  if (token.length < 12) {
    throw new Error('ADMIN_TOKEN must be at least 12 characters long.');
  }
  if (FORBIDDEN_WEAK_TOKENS.has(token.toLowerCase())) {
    throw new Error('ADMIN_TOKEN uses a forbidden default or weak placeholder value.');
  }
  return token;
}

/**
 * Constant-time token comparison using fixed-length SHA-256 digests.
 */
export function timingSafeTokenMatch(provided: string | undefined, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

interface FailureBucket {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window IP rate limiter for failed admin authentication attempts.
 */
export class AdminRateLimiter {
  private buckets = new Map<string, FailureBucket>();

  constructor(
    private readonly maxAttempts = 10,
    private readonly windowMs = 5 * 60 * 1000,
  ) {}

  public check(key: string, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
    const entry = this.buckets.get(key);
    if (!entry) return { allowed: true, retryAfterSec: 0 };
    if (now >= entry.resetAt) {
      this.buckets.delete(key);
      return { allowed: true, retryAfterSec: 0 };
    }
    if (entry.count >= this.maxAttempts) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      };
    }
    return { allowed: true, retryAfterSec: 0 };
  }

  public recordFailure(key: string, now = Date.now()): void {
    const existing = this.buckets.get(key);
    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    existing.count += 1;
  }

  public reset(key: string): void {
    this.buckets.delete(key);
  }
}

export function extractClientKey(request: Request, serverIp?: string | null): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  return cfIp || forwarded || serverIp || 'local';
}
