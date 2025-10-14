"use server";

import { prisma } from "@/lib/prisma";
import { getActiveUserId } from "@/server/user";
import { createGame } from "@/app/games/new/actions";
import { archetypeEnum } from "@/lib/schemas";

const parseCsv = (csv: string) => {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (rows.length < 2) return [];
  const headers = rows[0].split(",").map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const values = row.split(",").map((value) => value.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
};

export const importPlayers = async (csv: string) => {
  const userId = await getActiveUserId();
  const records = parseCsv(csv);
  let created = 0;
  let skipped = 0;
  for (const record of records) {
    const displayName = record.displayName?.trim();
    if (!displayName) {
      skipped += 1;
      continue;
    }
    try {
      await prisma.player.upsert({
        where: {
          userId_displayName: {
            userId,
            displayName
          }
        },
        update: {},
        create: {
          userId,
          displayName
        }
      });
      created += 1;
    } catch (error) {
      console.error(error);
      skipped += 1;
    }
  }
  return { created, skipped };
};

export const importDecks = async (csv: string) => {
  const userId = await getActiveUserId();
  const records = parseCsv(csv);
  let created = 0;
  let skipped = 0;
  for (const record of records) {
    const playerName = record.playerName?.trim();
    const deckName = record.deckName?.trim();
    if (!playerName || !deckName) {
      skipped += 1;
      continue;
    }
    const player = await prisma.player.upsert({
      where: {
        userId_displayName: {
          userId,
          displayName: playerName
        }
      },
      update: {},
      create: {
        userId,
        displayName: playerName
      }
    });

    try {
      await prisma.deck.upsert({
        where: {
          playerId_name: {
            playerId: player.id,
            name: deckName
          }
        },
        update: {
          moxfieldUrl: record.moxfieldUrl || null,
          archetype: (archetypeEnum.options.includes(record.archetype as any)
            ? record.archetype
            : "Other") as (typeof archetypeEnum)["_output"],
          colorIdentity: record.colorIdentity || "C",
          commanders: record.commanders ? record.commanders.split("|") : ["Unknown"],
          companion: record.companion || null,
          isActive: true
        },
        create: {
          userId,
          playerId: player.id,
          name: deckName,
          moxfieldUrl: record.moxfieldUrl || null,
          archetype: (archetypeEnum.options.includes(record.archetype as any)
            ? record.archetype
            : "Other") as (typeof archetypeEnum)["_output"],
          colorIdentity: record.colorIdentity || "C",
          commanders: record.commanders ? record.commanders.split("|") : ["Unknown"],
          companion: record.companion || null
        }
      });
      created += 1;
    } catch (error) {
      console.error(error);
      skipped += 1;
    }
  }
  return { created, skipped };
};

export const importGames = async (csv: string) => {
  const records = parseCsv(csv);
  let created = 0;
  let skipped = 0;
  for (const record of records) {
    try {
      const podSize = Number(record.podSize || "4");
      const playerNames = record.players?.split("|") ?? [];
      const deckNames = record.decks?.split("|") ?? [];
      const seats = record.seats?.split("|") ?? [];
      const mulligans = record.mulligans?.split("|") ?? [];
      const eliminationOrder = record.eliminationOrder?.split("|").map((seat) => Number(seat)) ?? [];
      const turnEliminated = record.turnEliminated?.split("|").map((turn) => Number(turn || "0")) ?? [];
      const winnerSeat = Number(record.winnerSeat ?? "1");
      const turnsToWin = record.turnsToWin ? Number(record.turnsToWin) : undefined;
      const winTags = record.winTags?.split("|").filter(Boolean) ?? [];
      const startedAt = record.date ? new Date(record.date).toISOString() : new Date().toISOString();

      const players = Array.from({ length: podSize }).map((_, index) => {
        const seat = Number(seats[index] ?? index + 1);
        const mulliganValue = Number(mulligans[index] ?? 0);
        const playerName = playerNames[index] ?? `Player ${seat}`;
        const deckName = deckNames[index] ?? `Deck ${seat}`;
        return {
          seat,
          playerName,
          deckName,
          archetype: "Other" as const,
          colorIdentity: "C",
          commanders: ["Unknown"],
          commandersText: "Unknown",
          mulligans: Number.isNaN(mulliganValue) ? 0 : mulliganValue,
          result: seat === winnerSeat ? "Win" : "Lose",
          eliminatedBySeat: eliminationOrder[index] ?? undefined,
          turnEliminated: turnEliminated[index] || undefined
        };
      });

      await createGame({
        podId: undefined,
        eventId: undefined,
        startedAt,
        endedAt: startedAt,
        turnsToWin,
        notes: record.notes,
        winConditionTags: winTags,
        players,
        eliminationOrder
      });
      created += 1;
    } catch (error) {
      console.error(error);
      skipped += 1;
    }
  }
  return { created, skipped };
};

export const exportPlayers = async () => {
  const userId = await getActiveUserId();
  const players = await prisma.player.findMany({ where: { userId }, orderBy: { displayName: "asc" } });
  const rows = ["displayName", ...players.map((player) => player.displayName)].join("\n");
  return rows;
};

export const exportDecks = async () => {
  const userId = await getActiveUserId();
  const decks = await prisma.deck.findMany({
    where: { userId },
    include: { player: true },
    orderBy: { name: "asc" }
  });
  const header = "playerName,deckName,moxfieldUrl,archetype,colorIdentity,commanders,companion";
  const rows = decks
    .map((deck) =>
      [
        deck.player.displayName,
        deck.name,
        deck.moxfieldUrl ?? "",
        deck.archetype,
        deck.colorIdentity,
        deck.commanders.join("|"),
        deck.companion ?? ""
      ].join(",")
    )
    .join("\n");
  return `${header}\n${rows}`;
};

export const exportGames = async () => {
  const userId = await getActiveUserId();
  const games = await prisma.game.findMany({
    where: { userId },
    include: {
      pod: true,
      gamePlayers: {
        include: {
          player: true,
          deck: true
        },
        orderBy: { seat: "asc" }
      }
    },
    orderBy: { startedAt: "desc" }
  });

  const header = [
    "date",
    "podSize",
    "players",
    "seats",
    "decks",
    "mulligans",
    "winnerSeat",
    "turnsToWin",
    "winTags",
    "eliminationOrder",
    "turnEliminated",
    "notes"
  ].join(",");

  const rows = games
    .map((game) => {
      const players = game.gamePlayers.map((gp) => gp.player.displayName).join("|");
      const seats = game.gamePlayers.map((gp) => gp.seat).join("|");
      const decks = game.gamePlayers.map((gp) => gp.deck.name).join("|");
      const mulligans = game.gamePlayers.map((gp) => gp.mulligans).join("|");
      const winner = game.gamePlayers.find((gp) => gp.result === "Win")?.seat ?? "";
      const eliminationOrder = game.gamePlayers
        .filter((gp) => gp.turnEliminated != null)
        .sort((a, b) => (a.turnEliminated ?? 0) - (b.turnEliminated ?? 0))
        .map((gp) => gp.seat)
        .join("|");
      const turnEliminated = game.gamePlayers
        .filter((gp) => gp.turnEliminated != null)
        .sort((a, b) => (a.turnEliminated ?? 0) - (b.turnEliminated ?? 0))
        .map((gp) => gp.turnEliminated)
        .join("|");
      return [
        game.startedAt.toISOString(),
        game.gamePlayers.length,
        players,
        seats,
        decks,
        mulligans,
        winner,
        game.turnsToWin ?? "",
        game.winConditionTags.join("|"),
        eliminationOrder,
        turnEliminated,
        (game.notes ?? "").replace(/\n/g, " ")
      ].join(",");
    })
    .join("\n");

  return `${header}\n${rows}`;
};
