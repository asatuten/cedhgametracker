import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Prisma } from "@prisma/client";

export const RecentGamesList = ({ games }: { games: Array<Prisma.GameGetPayload<{ include: { gamePlayers: { include: { player: true; deck: true } }; pod: true } }> > }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent games</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games recorded yet. Use Quick Record to log your first pod!</p>
        ) : (
          games.map((game) => {
            const winners = game.gamePlayers.filter((gp) => gp.result === "Win");
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="flex flex-col gap-1 rounded-xl border border-border/60 p-4 transition hover:border-border"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    {format(game.startedAt, "MMM d, yyyy")} • Pod #{game.podId.slice(-4)}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-primary">
                    {winners.map((gp) => gp.player.displayName).join(", ") || "No winner"}
                  </div>
                </div>
                <div className="text-lg font-semibold">{winners[0]?.deck.name ?? "Game summary"}</div>
                <div className="text-sm text-muted-foreground">
                  {game.gamePlayers
                    .sort((a, b) => a.seat - b.seat)
                    .map((gp) => `${gp.seat}. ${gp.player.displayName}`)
                    .join(" · ")}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
