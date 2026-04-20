interface SkeletonProps {
  className?: string;
  variant?: "glass" | "default";
}

export function Skeleton({ className = "", variant = "default" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/[0.05] border border-white/[0.05] ${
        variant === "glass" ? "backdrop-blur-sm" : ""
      } ${className}`}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
          style={{ animationDuration: '2s', animationTimingFunction: 'ease-in-out' }}
        />
      </div>
    </div>
  );
}
