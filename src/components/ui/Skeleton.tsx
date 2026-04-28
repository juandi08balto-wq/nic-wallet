import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-muted relative overflow-hidden shimmer",
        className,
      )}
      {...props}
    />
  );
}
