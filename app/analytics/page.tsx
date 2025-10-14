import { Heatmap } from "@/components/charts/heatmap";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getActiveUserId } from "@/server/user";
import {
  matchupMatrix,
  mulliganImpact,
  seatAdvantage,
  turnsToWinHistogram,
  winRateByArchetype
} from "@/server/analytics";

const AnalyticsPage = async () => {
  const userId = await getActiveUserId();
  const [seatData, mulligans, turns, archetypes, matrix] = await Promise.all([
    seatAdvantage(userId),
    mulliganImpact(userId),
    turnsToWinHistogram(userId),
    winRateByArchetype(userId),
    matchupMatrix(userId)
  ]);

  const heatmapRows = matrix.map((row) => row.archetype);
  const heatmapColumns = Array.from(
    new Set(matrix.flatMap((row) => row.opponents.map((opponent) => opponent.opponentArchetype)))
  );
  const heatmapValues = matrix.flatMap((row) =>
    row.opponents.map((opponent) => ({
      row: row.archetype,
      column: opponent.opponentArchetype,
      value: opponent.winRate
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Compare performance across seats, archetypes, mulligans, and matchups.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seat advantage</CardTitle>
            <CardDescription>Win rate by seat position</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={seatData.map((item) => ({ seat: `Seat ${item.seat}`, winRate: Number((item.winRate * 100).toFixed(1)) }))}
              xKey="seat"
              yKey="winRate"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mulligans vs win rate</CardTitle>
            <CardDescription>Each point shows average win rate for a mulligan count</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={mulligans.points.map((point) => ({
                mulligans: point.mulligans,
                winRate: Number((point.winRate * 100).toFixed(1))
              }))}
              xKey="mulligans"
              yKey="winRate"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Correlation slope: {mulligans.slope >= 0 ? "+" : ""}{(mulligans.slope * 100).toFixed(2)}% per mulligan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turns to win distribution</CardTitle>
            <CardDescription>How often games close at each turn</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={turns.map((item) => ({ turn: `T${item.turn}`, count: item.count }))} xKey="turn" yKey="count" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win rate by archetype</CardTitle>
            <CardDescription>Overall performance by deck archetype</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={archetypes.map((item) => ({ archetype: item.archetype, winRate: Number((item.winRate * 100).toFixed(1)) }))}
              xKey="archetype"
              yKey="winRate"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archetype matchup matrix</CardTitle>
          <CardDescription>Win percentage when piloting archetype vs opponent archetype</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap rows={heatmapRows} columns={heatmapColumns} values={heatmapValues} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
