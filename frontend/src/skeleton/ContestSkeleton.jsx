export default function ContestSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[#1a1b2e] h-20 rounded-md" />
      ))}
    </div>
  );
}