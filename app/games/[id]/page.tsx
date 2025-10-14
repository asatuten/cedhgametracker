import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatTurns } from "@/lib/utils";

interface GamePageProps {
  params: { id: string };
}

const GamePage = async ({ params }: GamePageProps) => {
  const userId = await getActiveUserId();
  const game = await prisma.game.findFirst({
    where: { id: params.id, userId },
    include: {
      pod: { include: { event: true } },
      gamePlayers: {
        include: {
          player: true,
          deck: true
        },
        orderBy: { seat: "asc" }
      }
    }
  });

  if (!game) {
    notFound();
  }

  const winners = game.gamePlayers.filter((player) => player.result === "Win");
  const eliminationOrder = game.gamePlayers
    .filter((player) => player.turnEliminated != null)
    .sort((a, b) => (a.turnEliminated ?? 0) - (b.turnEliminated ?? 0));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Game summary</h1>
          <p className="text-sm text-muted-foreground">
            {format(game.startedAt, "MMMM d, yyyy p")} • Pod #{game.podId.slice(-4)}
          </p>
        </div>
        {game.winConditionTags.length ? (
          <div className="flex flex-wrap gap-2">
            {game.winConditionTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pod breakdown</CardTitle>
            {game.notes ? <CardDescription>{game.notes}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {game.gamePlayers.map((player) => (
              <div key={player.id} className="flex flex-col gap-1 rounded-xl border border-border/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Seat {player.seat}</div>
                  <Badge className={player.result === "Win" ? "bg-emerald-500/20 text-emerald-200" : "bg-muted/50 text-muted-foreground"}>
                    {player.result}
                  </Badge>
                </div>
                <div className="text-lg font-semibold">{player.player.displayName}</div>
                <div className="text-sm text-muted-foreground">{player.deck.name}</div>
                <div className="text-xs text-muted-foreground">{player.deck.commanders.join(", ")}</div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Mulligans: {player.mulligans}</span>
                  <span>Archetype: {player.deck.archetype}</span>
                  <span>Colors: {player.deck.colorIdentity}</span>
                  {player.turnEliminated ? <span>Eliminated on turn {player.turnEliminated}</span> : null}
                </div>
                {player.deck.moxfieldUrl ? (
                  <a
                    href={player.deck.moxfieldUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View on Moxfield
                  </a>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>Winner: {winners.map((player) => player.player.displayName).join(", ") || "Draw"}</div>
              <div>Turns to win: {formatTurns(game.turnsToWin ?? null)}</div>
              <div>Duration: {formatDuration(game.startedAt, game.endedAt)}</div>
              <div>Event: {game.pod.event?.name ?? "Open play"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elimination order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {eliminationOrder.length === 0 ? (
                <p>No elimination data recorded.</p>
              ) : (
                eliminationOrder.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2">
                    <span>
                      {index + 1}. Seat {player.seat} — {player.player.displayName}
                    </span>
                    {player.eliminatedByPlayerId ? (
                      <span className="text-xs uppercase">by {findPlayerName(game, player.eliminatedByPlayerId)}</span>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const formatDuration = (startedAt: Date, endedAt: Date | null) => {
  if (!endedAt) return "-";
  const minutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const findPlayerName = (game: Awaited<ReturnType<typeof prisma.game.findFirst>>, id: string) => {
  const player = game?.gamePlayers.find((gp) => gp.playerId === id);
  return player?.player.displayName ?? "Unknown";
};

export default GamePage;
