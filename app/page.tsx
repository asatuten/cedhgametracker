import { WinRateCard, TurnsCard, StatsCard } from "@/components/dashboard/stats-card";
import { RecentGamesList } from "@/components/dashboard/recent-games";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { dashboardKpis, recentGames, seatAdvantage, turnsToWinHistogram, winRateByArchetype } from "@/server/analytics";
import { getActiveUserId } from "@/server/user";
import { formatPercent } from "@/lib/utils";
import Link from "next/link";

const DashboardPage = async () => {
  const userId = await getActiveUserId();
  const [kpis, games, seatData, turnData, archetypeData] = await Promise.all([
    dashboardKpis(userId),
    recentGames(userId),
    seatAdvantage(userId),
    turnsToWinHistogram(userId),
    winRateByArchetype(userId)
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track performance at a glance and dive into your latest pods.</p>
        </div>
        <Link href="/games/new" className="hidden rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/80 md:inline-flex">
          Start Quick Record
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WinRateCard title="Overall win rate" winRate={kpis.overallWinRate} description="Across all recorded games" />
        <TurnsCard title="Median turns to win" turns={kpis.medianTtw} description="Pace of your victories" />
        <StatsCard title="Top archetype" value={kpis.topArchetype ?? "-"} description="Most winning deck archetype" />
        <StatsCard
          title="Seat 1 advantage"
          value={kpis.seat1Delta >= 0 ? `+${formatPercent(Math.abs(kpis.seat1Delta))}` : formatPercent(kpis.seat1Delta)}
          description="Delta vs. other seats"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <RecentGamesList games={games} />
        <div className="grid gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Win rate by seat</h2>
              <span className="text-xs uppercase text-muted-foreground">Sample size {seatData.reduce((sum, item) => sum + item.games, 0)}</span>
            </div>
            <BarChart
              data={seatData.map((item) => ({ seat: `Seat ${item.seat}`, winRate: Number((item.winRate * 100).toFixed(1)) }))}
              xKey="seat"
              yKey="winRate"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Turns to win</h2>
              <span className="text-xs uppercase text-muted-foreground">Distribution of finishes</span>
            </div>
            <LineChart data={turnData.map((item) => ({ turn: `T${item.turn}`, count: item.count }))} xKey="turn" yKey="count" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Archetype performance</h2>
          <span className="text-xs uppercase text-muted-foreground">Win rate across all decks</span>
        </div>
        <BarChart
          data={archetypeData.map((item) => ({ archetype: item.archetype, winRate: Number((item.winRate * 100).toFixed(1)) }))}
          xKey="archetype"
          yKey="winRate"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
