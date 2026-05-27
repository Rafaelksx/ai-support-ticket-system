interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/50 ${className}`}
    />
  );
}

export function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <Skeleton className={`${width} ${height}`} />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <SkeletonLine height="h-6" width="w-2/3" />
      <SkeletonLine height="h-4" />
      <SkeletonLine height="h-4" width="w-5/6" />
    </div>
  );
}
