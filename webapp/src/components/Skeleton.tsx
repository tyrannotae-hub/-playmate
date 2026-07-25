export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xs bg-line/60 ${className}`} />;
}
