export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-elevated/80 ${className}`}
      aria-hidden="true"
    />
  );
}
