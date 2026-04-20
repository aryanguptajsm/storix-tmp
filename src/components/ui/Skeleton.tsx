interface SkeletonProps {
  className?: string;
  variant?: "glass" | "default";
}

export function Skeleton({ className = "", variant = "default" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] ${
        variant === "glass" ? "backdrop-blur-md" : ""
      } ${className}`}
    >
      <div className="absolute inset-0 shimmer opacity-100" />
    </div>
  );
}
