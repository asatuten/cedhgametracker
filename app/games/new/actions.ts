"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { quickRecordSchema } from "@/lib/schemas";
import { getActiveUserId } from "@/server/user";

export const createGame = async (raw: unknown) => {
  const input = quickRecordSchema.parse(raw);
  const userId = await getActiveUserId();

  const podId =
    input.podId ??
    (
      await prisma.pod.create({
        data: {
          userId,
          eventId: input.eventId
        }
      })
    ).id;

  const startedAt = new Date(input.startedAt);
  const endedAt = input.endedAt ? new Date(input.endedAt) : null;

  const players = await Promise.all(
    input.players.map(async (player) => {
      const playerRecord = player.playerId
        ? await prisma.player.findUnique({ where: { id: player.playerId } })
        : await prisma.player.upsert({
            where: {
              userId_displayName: {
                userId,
                displayName: player.playerName
              }
            },
            update: {},
            create: {
              userId,
              displayName: player.playerName
            }
          });

      if (!playerRecord) throw new Error("Unable to resolve player");

      const deckRecord = player.deckId
        ? await prisma.deck.findUnique({ where: { id: player.deckId } })
        : await prisma.deck.upsert({
            where: {
              playerId_name: {
                playerId: playerRecord.id,
                name: player.deckName
              }
            },
            update: {
              archetype: player.archetype,
              colorIdentity: player.colorIdentity,
              commanders: player.commanders,
              companion: player.companion,
              moxfieldUrl: player.moxfieldUrl || null,
              isActive: true
            },
            create: {
              userId,
              playerId: playerRecord.id,
              name: player.deckName,
              archetype: player.archetype,
              colorIdentity: player.colorIdentity,
              commanders: player.commanders,
              companion: player.companion,
              moxfieldUrl: player.moxfieldUrl || null
            }
          });

      if (!deckRecord) throw new Error("Unable to resolve deck");

      return {
        player: playerRecord,
        deck: deckRecord,
        seat: player.seat,
        mulligans: player.mulligans,
        result: player.result ?? "Lose",
        eliminatedBySeat: player.eliminatedBySeat,
        turnEliminated: player.turnEliminated ?? null
      };
    })
  );

  const game = await prisma.game.create({
    data: {
      userId,
      podId,
      startedAt,
      endedAt,
      turnsToWin: input.turnsToWin ?? null,
      winConditionTags: input.winConditionTags,
      notes: input.notes ?? null,
      gamePlayers: {
        create: players.map((p) => ({
          userId,
          playerId: p.player.id,
          deckId: p.deck.id,
          seat: p.seat,
          mulligans: p.mulligans,
          result: p.result,
          eliminatedByPlayerId:
            p.eliminatedBySeat != null
              ? players.find((gp) => gp.seat === p.eliminatedBySeat)?.player.id ?? null
              : null,
          turnEliminated: p.turnEliminated
        }))
      }
    }
  });

  await Promise.all(
    input.winConditionTags.map((name) =>
      prisma.tag.upsert({
        where: {
          userId_name: {
            userId,
            name
          }
        },
        update: {
          name
        },
        create: {
          userId,
          name
        }
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/analytics");
  revalidatePath("/players");
  revalidatePath("/decks");

  return { id: game.id };
};
