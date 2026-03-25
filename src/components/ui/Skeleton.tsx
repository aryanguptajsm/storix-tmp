interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse-glow rounded-md bg-white/5 border border-white/5 ${className}`}
    />
  );
}
