import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

const DecksPage = async () => {
  const userId = await getActiveUserId();
  const decks = await prisma.deck.findMany({
    where: { userId, isActive: true },
    include: {
      games: true,
      player: true
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Decks</h1>
        <p className="text-sm text-muted-foreground">Analyze win rates, matchups, and turn-to-win patterns for each list.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active decks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-1/4 py-3">Deck</th>
                <th className="w-1/4 py-3">Pilot</th>
                <th className="w-1/4 py-3">Games</th>
                <th className="w-1/4 py-3">Win rate</th>
                <th className="w-24 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck) => {
                const wins = deck.games.filter((gp) => gp.result === "Win").length;
                const winRate = deck.games.length ? wins / deck.games.length : 0;
                return (
                  <tr key={deck.id} className="border-t border-border/60">
                    <td className="py-3 font-medium">{deck.name}</td>
                    <td className="py-3">{deck.player.displayName}</td>
                    <td className="py-3">{deck.games.length}</td>
                    <td className="py-3">{formatPercent(winRate)}</td>
                    <td className="py-3">
                      <Link href={`/decks/${deck.id}`} className="text-primary hover:underline">
                        View detail
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

export default DecksPage;
