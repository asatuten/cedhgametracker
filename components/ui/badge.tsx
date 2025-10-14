import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground",
      className
    )}
    {...props}
  />
);
