import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPercent, formatTurns } from "@/lib/utils";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { format } from "date-fns";

interface PlayerProfileProps {
  params: { id: string };
}

const PlayerProfilePage = async ({ params }: PlayerProfileProps) => {
  const userId = await getActiveUserId();
  const player = await prisma.player.findFirst({ where: { id: params.id, userId } });
  if (!player) {
    notFound();
  }

  const gamePlayers = await prisma.gamePlayer.findMany({
    where: { playerId: player.id, userId },
    include: {
      deck: true,
      game: true
    },
    orderBy: { game: { startedAt: "desc" } }
  });

  const totalGames = gamePlayers.length;
  const wins = gamePlayers.filter((gp) => gp.result === "Win").length;
  const winRate = totalGames ? wins / totalGames : 0;

  const seatMap = new Map<number, { games: number; wins: number }>();
  const deckMap = new Map<string, { name: string; archetype: string; games: number; wins: number }>();
  const timeline = new Map<string, { wins: number; games: number }>();

  for (const gp of gamePlayers) {
    const seatEntry = seatMap.get(gp.seat) ?? { games: 0, wins: 0 };
    seatEntry.games += 1;
    if (gp.result === "Win") seatEntry.wins += 1;
    seatMap.set(gp.seat, seatEntry);

    const deckEntry = deckMap.get(gp.deckId) ?? {
      name: gp.deck.name,
      archetype: gp.deck.archetype,
      games: 0,
      wins: 0
    };
    deckEntry.games += 1;
    if (gp.result === "Win") deckEntry.wins += 1;
    deckMap.set(gp.deckId, deckEntry);

    const dateKey = format(gp.game.startedAt, "yyyy-MM-dd");
    const timelineEntry = timeline.get(dateKey) ?? { games: 0, wins: 0 };
    timelineEntry.games += 1;
    if (gp.result === "Win") timelineEntry.wins += 1;
    timeline.set(dateKey, timelineEntry);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{player.displayName}</h1>
        {player.notes ? <p className="text-sm text-muted-foreground">{player.notes}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance overview</CardTitle>
            <CardDescription>{totalGames} games recorded</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="text-xs uppercase text-muted-foreground">Win rate</div>
              <div className="text-4xl font-semibold">{formatPercent(winRate)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="text-xs uppercase text-muted-foreground">Median turns to win</div>
              <div className="text-4xl font-semibold">
                {formatTurns(medianTurns(gamePlayers.map((gp) => gp.game.turnsToWin).filter((turn): turn is number => !!turn)))}
              </div>
            </div>
            <div className="md:col-span-2">
              <BarChart
                data={Array.from(seatMap.entries()).map(([seat, value]) => ({
                  seat: `Seat ${seat}`,
                  winRate: Number(((value.games ? value.wins / value.games : 0) * 100).toFixed(1))
                }))}
                xKey="seat"
                yKey="winRate"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top decks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {Array.from(deckMap.values())
              .sort((a, b) => b.games - a.games)
              .slice(0, 5)
              .map((deck) => (
                <div key={deck.name} className="rounded-xl border border-border/50 px-3 py-2">
                  <div className="font-semibold text-foreground">{deck.name}</div>
                  <div className="text-xs uppercase tracking-wide">{deck.archetype}</div>
                  <div className="text-xs">{deck.games} games • {formatPercent(deck.games ? deck.wins / deck.games : 0)}</div>
                </div>
              ))}
            {deckMap.size === 0 ? <p>No deck data yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Win trend</CardTitle>
          <CardDescription>Rolling performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={Array.from(timeline.entries()).map(([date, value]) => ({
              date,
              winRate: Number(((value.games ? value.wins / value.games : 0) * 100).toFixed(1))
            }))}
            xKey="date"
            yKey="winRate"
          />
        </CardContent>
      </Card>
    </div>
  );
};

const medianTurns = (turns: number[]) => {
  const values = [...turns].sort((a, b) => a - b);
  if (values.length === 0) return null;
  return values[Math.floor(values.length / 2)];
};

export default PlayerProfilePage;
