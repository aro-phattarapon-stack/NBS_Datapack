import { useEffect, useState } from 'react';

const MOJANG_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[34][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMojangUuid(uuid?: string): boolean {
  return Boolean(uuid && MOJANG_UUID_RE.test(uuid));
}

export function formatPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface PlayerAvatarProps {
  name: string;
  uuid?: string;
  size?: 24 | 32 | 56 | 72;
  className?: string;
}

export function PlayerAvatar({ name, uuid, size = 24, className = '' }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const identifier = isMojangUuid(uuid) ? uuid! : name;

  useEffect(() => {
    setFailed(false);
  }, [identifier]);
  const dimClass =
    size === 72
      ? 'w-[72px] h-[72px] text-xl'
      : size === 56
        ? 'w-14 h-14 text-lg'
        : size === 32
          ? 'w-8 h-8 text-xs'
          : 'w-6 h-6 text-[11px]';

  if (failed) {
    return (
      <span
        className={`${dimClass} rounded-md bg-elevated border border-hairline font-semibold text-ink-secondary inline-flex items-center justify-center shrink-0 uppercase ${className}`}
        aria-hidden="true"
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(identifier)}/${size}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${dimClass} rounded-md border border-hairline bg-elevated shrink-0 ${className}`}
    />
  );
}

interface PlayerBodyRenderProps {
  name: string;
  uuid?: string;
  variant?: 'compact' | 'portrait';
  className?: string;
}

export function PlayerBodyRender({
  name,
  uuid,
  variant = 'compact',
  className = '',
}: PlayerBodyRenderProps) {
  const [failed, setFailed] = useState(false);
  const identifier = isMojangUuid(uuid) ? uuid! : name;

  useEffect(() => {
    setFailed(false);
  }, [identifier]);

  if (failed) {
    return <PlayerAvatar name={name} uuid={uuid} size={72} className={className} />;
  }

  if (variant === 'portrait') {
    return (
      <div
        className={`w-32 h-36 sm:w-36 sm:h-40 rounded-lg border border-border-strong bg-canvas/85 flex items-end justify-center pt-3 px-2 overflow-hidden shrink-0 ${className}`}
      >
        <img
          src={`https://mc-heads.net/body/${encodeURIComponent(identifier)}/128`}
          alt={`สกินของ ${name}`}
          width={96}
          height={160}
          onError={() => setFailed(true)}
          className="h-32 sm:h-36 w-auto object-contain object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-20 h-32 rounded-lg border border-hairline bg-elevated/60 flex items-center justify-center p-2 shrink-0 ${className}`}
    >
      <img
        src={`https://mc-heads.net/body/${encodeURIComponent(identifier)}/96`}
        alt={`สกินของ ${name}`}
        width={64}
        height={112}
        onError={() => setFailed(true)}
        className="max-h-28 w-auto object-contain"
      />
    </div>
  );
}
