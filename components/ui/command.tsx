import * as CommandPrimitive from "@radix-ui/react-command";
import { cn } from "@/lib/utils";

export const Command = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Root>) => (
  <CommandPrimitive.Root
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
);

export const CommandInput = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) => (
  <CommandPrimitive.Input
    className={cn("h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none", className)}
    {...props}
  />
);

export const CommandList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List className={cn("max-h-64 overflow-y-auto", className)} {...props} />
);

export const CommandEmpty = CommandPrimitive.Empty;
export const CommandGroup = CommandPrimitive.Group;
export const CommandItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      "flex cursor-pointer select-none items-center gap-2 px-4 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground",
      className
    )}
    {...props}
  />
);

export const CommandSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} {...props} />
);
