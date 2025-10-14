import { cn } from "@/lib/utils";

export const Separator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("my-4 h-px w-full bg-border", className)} {...props} />
);
