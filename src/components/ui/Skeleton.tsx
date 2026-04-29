interface SkeletonProps {
  className?: string;
  variant?: "glass" | "default";
}

export function Skeleton({ className = "", variant = "default" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(255,255,255,0.02),0_4px_16px_rgba(0,0,0,0.4)] ${
        variant === "glass" ? "backdrop-blur-md" : ""
      } ${className}`}
    >
      <div className="absolute inset-0 shimmer opacity-100" />
    </div>
  );
}
