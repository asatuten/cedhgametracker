import { forwardRef } from "react";
import { Label as RadixLabel, type LabelProps as RadixLabelProps } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export interface LabelProps extends RadixLabelProps {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <RadixLabel ref={ref} className={cn("text-sm font-medium leading-none", className)} {...props} />
));

Label.displayName = "Label";
