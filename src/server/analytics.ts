import { cache } from "react";
import { prisma } from "@/lib/prisma";
type DateLike = Date | string | undefined;

const sinceFilter = (since?: DateLike) => {
  if (!since) return undefined;
  const date = since instanceof Date ? since : new Date(since);
  return { gte: date };
};

export const winRateByArchetype = cache(async (userId: string, since?: DateLike) => {
  const rows = await prisma.gamePlayer.groupBy({
    by: ["result", "deckId"],
    where: {
      userId,
      game: since ? { startedAt: sinceFilter(since) } : undefined
    },
    _count: true
  });

  const deckMeta = await prisma.deck.findMany({ where: { userId }, select: { id: true, archetype: true } });
  const archetypeTotals = new Map<string, { wins: number; games: number }>();
  for (const { id, archetype } of deckMeta) {
    archetypeTotals.set(archetype, { wins: 0, games: 0 });
  }

  for (const row of rows) {
    const deck = deckMeta.find((d) => d.id === row.deckId);
    if (!deck) continue;
    const entry = archetypeTotals.get(deck.archetype) ?? { wins: 0, games: 0 };
    entry.games += row._count;
    if (row.result === "Win") entry.wins += row._count;
    archetypeTotals.set(deck.archetype, entry);
  }

  return Array.from(archetypeTotals.entries()).map(([archetype, value]) => ({
    archetype,
    winRate: value.games ? value.wins / value.games : 0,
    games: value.games
  }));
});

export const turnsToWinHistogram = cache(async (userId: string, bucket = 1, since?: DateLike) => {
  const games = await prisma.game.findMany({
    where: {
      userId,
      turnsToWin: { not: null },
      ...(since ? { startedAt: sinceFilter(since) } : {})
    },
    select: { turnsToWin: true }
  });

  const histogram = new Map<number, number>();
  for (const game of games) {
    if (!game.turnsToWin) continue;
    const bin = Math.floor((game.turnsToWin - 1) / bucket) * bucket + 1;
    histogram.set(bin, (histogram.get(bin) ?? 0) + 1);
  }
  return Array.from(histogram.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([turn, count]) => ({ turn, count }));
});

export const seatAdvantage = cache(async (userId: string, since?: DateLike) => {
  const rows = await prisma.gamePlayer.groupBy({
    by: ["seat", "result"],
    where: { userId, game: since ? { startedAt: sinceFilter(since) } : undefined },
    _count: true
  });

  const seatTotals: Record<number, { wins: number; games: number }> = {};
  for (const row of rows) {
    const seat = row.seat;
    seatTotals[seat] ??= { wins: 0, games: 0 };
    seatTotals[seat].games += row._count;
    if (row.result === "Win") seatTotals[seat].wins += row._count;
  }

  return Object.entries(seatTotals)
    .map(([seat, value]) => ({ seat: Number(seat), winRate: value.games ? value.wins / value.games : 0, games: value.games }))
    .sort((a, b) => a.seat - b.seat);
});

export const mulliganImpact = cache(async (userId: string, since?: DateLike) => {
  const rows = await prisma.gamePlayer.groupBy({
    by: ["mulligans", "result"],
    where: { userId, game: since ? { startedAt: sinceFilter(since) } : undefined },
    _count: true
  });

  const mulliganTotals = new Map<number, { wins: number; games: number }>();
  for (const row of rows) {
    const entry = mulliganTotals.get(row.mulligans) ?? { wins: 0, games: 0 };
    entry.games += row._count;
    if (row.result === "Win") entry.wins += row._count;
    mulliganTotals.set(row.mulligans, entry);
  }

  const data = Array.from(mulliganTotals.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([mulligans, value]) => ({ mulligans, winRate: value.games ? value.wins / value.games : 0, games: value.games }));

  const meanMulligans = data.reduce((sum, item) => sum + item.mulligans * item.games, 0) /
    (data.reduce((sum, item) => sum + item.games, 0) || 1);
  const meanWinRate = data.reduce((sum, item) => sum + item.winRate * item.games, 0) /
    (data.reduce((sum, item) => sum + item.games, 0) || 1);
  let numerator = 0;
  let denominator = 0;
  for (const item of data) {
    numerator += (item.mulligans - meanMulligans) * (item.winRate - meanWinRate) * item.games;
    denominator += Math.pow(item.mulligans - meanMulligans, 2) * item.games;
  }
  const slope = denominator ? numerator / denominator : 0;

  return { points: data, slope };
});

export const matchupMatrix = cache(async (userId: string, since?: DateLike) => {
  const games = await prisma.game.findMany({
    where: { userId, ...(since ? { startedAt: sinceFilter(since) } : {}) },
    include: {
      gamePlayers: {
        include: {
          deck: { select: { archetype: true } }
        }
      }
    }
  });

  const matrix = new Map<string, Map<string, { games: number; wins: number }>>();

  for (const game of games) {
    for (const player of game.gamePlayers) {
      const archetype = player.deck.archetype;
      const row = matrix.get(archetype) ?? new Map();
      for (const opponent of game.gamePlayers) {
        if (opponent.id === player.id) continue;
        const oppArchetype = opponent.deck.archetype;
        const cell = row.get(oppArchetype) ?? { games: 0, wins: 0 };
        cell.games += 1;
        if (player.result === "Win") cell.wins += 1;
        row.set(oppArchetype, cell);
      }
      matrix.set(archetype, row);
    }
  }

  return Array.from(matrix.entries()).map(([archetype, opponents]) => ({
    archetype,
    opponents: Array.from(opponents.entries()).map(([opponentArchetype, value]) => ({
      opponentArchetype,
      games: value.games,
      winRate: value.games ? value.wins / value.games : 0
    }))
  }));
});

export const deckPerformance = cache(async (deckId: string) => {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      games: {
        include: {
          game: {
            select: { turnsToWin: true, id: true }
          },
          deck: { select: { archetype: true } },
          player: { select: { id: true } }
        }
      }
    }
  });

  if (!deck) return null;

  let wins = 0;
  const turns: number[] = [];
  const vsArchetype = new Map<string, { games: number; wins: number }>();

  for (const gp of deck.games) {
    if (gp.result === "Win") wins += 1;
    if (gp.game.turnsToWin != null) turns.push(gp.game.turnsToWin);
    const cell = vsArchetype.get(gp.deck.archetype) ?? { games: 0, wins: 0 };
    cell.games += 1;
    if (gp.result === "Win") cell.wins += 1;
    vsArchetype.set(gp.deck.archetype, cell);
  }

  const medianTurns = turns.length
    ? turns.sort((a, b) => a - b)[Math.floor(turns.length / 2)]
    : null;

  return {
    deck,
    winRate: deck.games.length ? wins / deck.games.length : 0,
    medianTurns,
    vsArchetype: Array.from(vsArchetype.entries()).map(([archetype, value]) => ({
      archetype,
      games: value.games,
      winRate: value.games ? value.wins / value.games : 0
    }))
  };
});

export const recentGames = cache(async (userId: string, take = 10) => {
  return prisma.game.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take,
    include: {
      pod: true,
      gamePlayers: {
        include: {
          player: true,
          deck: true
        }
      }
    }
  });
});

export const dashboardKpis = cache(async (userId: string) => {
  const [winRows, turnsRows, seatRows] = await Promise.all([
    prisma.gamePlayer.groupBy({ by: ["result"], where: { userId }, _count: true }),
    prisma.game.findMany({ where: { userId, turnsToWin: { not: null } }, select: { turnsToWin: true } }),
    prisma.gamePlayer.groupBy({ by: ["seat", "result"], where: { userId }, _count: true })
  ]);

  const totalGames = winRows.reduce((sum, row) => sum + row._count, 0);
  const wins = winRows.find((row) => row.result === "Win")?._count ?? 0;
  const overallWinRate = totalGames ? wins / totalGames : 0;

  const sortedTurns = turnsRows.map((g) => g.turnsToWin ?? 0).filter(Boolean).sort((a, b) => a - b);
  const medianTtw = sortedTurns.length
    ? sortedTurns[Math.floor(sortedTurns.length / 2)]
    : null;

  const seat1 = seatRows.filter((row) => row.seat === 1);
  const seat1Games = seat1.reduce((sum, row) => sum + row._count, 0);
  const seat1Wins = seat1.find((row) => row.result === "Win")?._count ?? 0;
  const seat1Rate = seat1Games ? seat1Wins / seat1Games : 0;
  const otherGames = totalGames - seat1Games;
  const otherWins = wins - seat1Wins;
  const otherRate = otherGames ? otherWins / otherGames : 0;

  const topArchetypeRow = await prisma.gamePlayer.groupBy({
    by: ["deckId"],
    where: { userId, result: "Win" },
    _count: { _all: true },
    orderBy: { _count: { _all: "desc" } },
    take: 1
  });

  let topArchetype: string | null = null;
  if (topArchetypeRow[0]) {
    const deck = await prisma.deck.findUnique({ where: { id: topArchetypeRow[0].deckId } });
    topArchetype = deck?.archetype ?? null;
  }

  return {
    overallWinRate,
    medianTtw,
    topArchetype,
    seat1Delta: seat1Rate - otherRate
  };
});
