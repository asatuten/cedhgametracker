import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuPortal = DropdownPrimitive.Portal;

export const DropdownMenuContent = ({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
);

export const DropdownMenuItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) => (
  <DropdownPrimitive.Item
    className={cn(
      "flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  />
);

export const DropdownMenuLabel = DropdownPrimitive.Label;
export const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>) => (
  <DropdownPrimitive.Separator className={cn("-mx-2 my-2 h-px bg-border", className)} {...props} />
);

export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuCheckboxItem = DropdownPrimitive.CheckboxItem;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;
export const DropdownMenuRadioItem = DropdownPrimitive.RadioItem;
export const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
);
