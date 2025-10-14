import { notFound } from "next/navigation";
import { getActiveUserId } from "@/server/user";
import { deckPerformance } from "@/server/analytics";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPercent, formatTurns } from "@/lib/utils";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";

interface DeckPageProps {
  params: { id: string };
}

const DeckPage = async ({ params }: DeckPageProps) => {
  const userId = await getActiveUserId();
  const deck = await prisma.deck.findFirst({
    where: { id: params.id, userId },
    include: {
      player: true,
      games: {
        include: {
          game: true
        }
      }
    }
  });

  if (!deck) {
    notFound();
  }

  const performance = await deckPerformance(deck.id);
  if (!performance) {
    notFound();
  }

  const timeline = deck.games
    .map((gp) => ({
      date: gp.game.startedAt,
      result: gp.result
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let cumulative = 0;
  const trend = timeline.map((item, index) => {
    if (item.result === "Win") cumulative += 1;
    const ratio = cumulative / (index + 1);
    return { date: item.date.toISOString().slice(0, 10), winRate: Number((ratio * 100).toFixed(1)) };
  });

  const turns = deck.games
    .map((gp) => gp.game.turnsToWin ?? null)
    .filter((turn): turn is number => turn != null)
    .map((turn) => ({ turn: `T${turn}`, count: 1 }));
  const turnsAggregated = aggregateCounts(turns);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{deck.name}</h1>
        <p className="text-sm text-muted-foreground">
          {deck.player.displayName} • {deck.archetype} • {deck.colorIdentity}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance summary</CardTitle>
            <CardDescription>{deck.games.length} games logged</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="text-xs uppercase text-muted-foreground">Win rate</div>
              <div className="text-4xl font-semibold">{formatPercent(performance.winRate)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 p-5">
              <div className="text-xs uppercase text-muted-foreground">Median turns to win</div>
              <div className="text-4xl font-semibold">{formatTurns(performance.medianTurns)}</div>
            </div>
            <div className="md:col-span-2">
              <BarChart
                data={performance.vsArchetype.map((item) => ({
                  archetype: item.archetype,
                  winRate: Number(((item.winRate ?? 0) * 100).toFixed(1))
                }))}
                xKey="archetype"
                yKey="winRate"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deck details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Commanders: {deck.commanders.join(", ")}</div>
            <div>Companion: {deck.companion ?? "None"}</div>
            {deck.moxfieldUrl ? (
              <a href={deck.moxfieldUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                View on Moxfield
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Win trend</CardTitle>
          <CardDescription>Rolling cumulative win percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart data={trend} xKey="date" yKey="winRate" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turns to win distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={turnsAggregated} xKey="turn" yKey="count" />
        </CardContent>
      </Card>
    </div>
  );
};

const aggregateCounts = (data: Array<{ turn: string; count: number }>) => {
  const counts = new Map<string, number>();
  for (const item of data) {
    counts.set(item.turn, (counts.get(item.turn) ?? 0) + item.count);
  }
  return Array.from(counts.entries()).map(([turn, count]) => ({ turn, count }));
};

export default DeckPage;
