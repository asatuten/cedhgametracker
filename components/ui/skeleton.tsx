import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-xl bg-muted", className)} {...props} />
);
