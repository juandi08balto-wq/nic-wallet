import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3 bg-primary-700 px-4 py-3">
        <Skeleton className="h-11 w-11 rounded-full bg-primary-800" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-12 bg-primary-800" />
          <Skeleton className="h-4 w-24 bg-primary-800" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full bg-primary-800" />
      </header>
      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[108px] rounded-[var(--radius-card)]" />
          <Skeleton className="h-[108px] rounded-[var(--radius-card)]" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[84px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-44 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
