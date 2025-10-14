import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, LayoutDashboard, Play, UsersRound, Layers, Settings, Database } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/games/new", label: "Quick Record", icon: Play },
  { href: "/players", label: "Players", icon: UsersRound },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/import-export", label: "Import / Export", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-background/50 p-6 lg:flex">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            cEDH Tracker
          </Link>
          <ThemeToggle />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-xs text-muted-foreground">Build 0.1.0</div>
      </aside>
      <main className="flex-1 bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              cEDH Tracker
            </Link>
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/games/new">Quick Record</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-12">{children}</div>
      </main>
    </div>
  );
};

const NavLink = ({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: ReactNode }) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};
