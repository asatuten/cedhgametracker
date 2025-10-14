import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

const PlayersPage = async () => {
  const userId = await getActiveUserId();
  const [players, grouped] = await Promise.all([
    prisma.player.findMany({ where: { userId }, orderBy: { displayName: "asc" } }),
    prisma.gamePlayer.groupBy({
      by: ["playerId", "result"],
      where: { userId },
      _count: true
    })
  ]);

  const stats = new Map<string, { games: number; wins: number }>();
  for (const row of grouped) {
    const entry = stats.get(row.playerId) ?? { games: 0, wins: 0 };
    entry.games += row._count;
    if (row.result === "Win") entry.wins += row._count;
    stats.set(row.playerId, entry);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Players</h1>
        <p className="text-sm text-muted-foreground">Track performance, decks, and trends for your playgroup.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player roster</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-1/4 py-3">Player</th>
                <th className="w-1/4 py-3">Games</th>
                <th className="w-1/4 py-3">Win rate</th>
                <th className="w-1/4 py-3">Profile</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const summary = stats.get(player.id) ?? { games: 0, wins: 0 };
                const winRate = summary.games ? summary.wins / summary.games : 0;
                return (
                  <tr key={player.id} className="border-t border-border/60">
                    <td className="py-3 font-medium">{player.displayName}</td>
                    <td className="py-3">{summary.games}</td>
                    <td className="py-3">{formatPercent(winRate)}</td>
                    <td className="py-3">
                      <Link href={`/players/${player.id}`} className="text-primary hover:underline">
                        View breakdown
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayersPage;
