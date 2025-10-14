import { z } from "zod";

export const archetypeEnum = z.enum([
  "Turbo",
  "Stax",
  "Midrange",
  "Control",
  "Combo",
  "AdNauseam",
  "Doomsday",
  "Other"
]);

export const gamePlayerSchema = z.object({
  seat: z.number().min(1).max(5),
  playerId: z.string().optional(),
  playerName: z.string().min(1),
  deckId: z.string().optional(),
  deckName: z.string().min(1),
  moxfieldUrl: z.string().url().optional().or(z.literal("")).optional(),
  archetype: archetypeEnum,
  colorIdentity: z.string().min(1),
  commanders: z.array(z.string()).min(1),
  companion: z.string().optional().nullable(),
  mulligans: z.number().min(0).max(6),
  result: z.enum(["Win", "Lose", "Draw"]).optional(),
  eliminatedBySeat: z.number().min(1).max(5).optional(),
  turnEliminated: z.number().min(1).max(20).optional()
});

export const quickRecordSchema = z.object({
  podId: z.string().optional(),
  eventId: z.string().optional(),
  startedAt: z.string().datetime({ offset: true }),
  endedAt: z.string().datetime({ offset: true }).optional(),
  turnsToWin: z.number().min(1).max(20).optional(),
  notes: z.string().max(500).optional().nullable(),
  winConditionTags: z.array(z.string()).default([]),
  players: z.array(gamePlayerSchema).min(3).max(5),
  eliminationOrder: z.array(z.number().min(1).max(5)).optional()
});

export type QuickRecordInput = z.infer<typeof quickRecordSchema>;
export type QuickRecordPlayerInput = z.infer<typeof gamePlayerSchema>;
