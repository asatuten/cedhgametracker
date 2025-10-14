import type { QuickRecordPlayerInput } from "@/lib/schemas";

export interface QuickRecordPlayerState extends QuickRecordPlayerInput {
  playerName: string;
  deckName: string;
  commandersText: string;
}

export interface QuickRecordData {
  players: QuickRecordPlayerState[];
  startedAt?: string;
  endedAt?: string;
  turnsToWin?: number;
  notes?: string;
  winConditionTags: string[];
  podId?: string;
  eventId?: string;
}

export interface QuickRecordResources {
  players: Array<{ id: string; displayName: string }>;
  decks: Array<{
    id: string;
    name: string;
    playerId: string;
    archetype: string;
    colorIdentity: string;
    commanders: string[];
    companion: string | null;
    moxfieldUrl: string | null;
  }>;
  tags: Array<{ id: string; name: string }>;
  pods: Array<{ id: string; createdAt: Date; eventName?: string | null }>;
}
