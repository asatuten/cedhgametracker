"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { differenceInSeconds, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { archetypeEnum } from "@/lib/schemas";
import { PlayerPicker } from "@/components/quick-record/player-picker";
import { DeckPicker } from "@/components/quick-record/deck-picker";
import { SeatOrder } from "@/components/quick-record/seat-order";
import { MulliganStepper } from "@/components/quick-record/mulligan-stepper";
import { WinTagsSelector } from "@/components/quick-record/win-tags-selector";
import type { QuickRecordData, QuickRecordPlayerState, QuickRecordResources } from "@/components/quick-record/types";
import { createGame } from "@/app/games/new/actions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const archetypes = archetypeEnum.options;
const STORAGE_KEY = "cedh-quick-record-draft";

const createDefaultPlayer = (seat: number): QuickRecordPlayerState => ({
  seat,
  playerName: "",
  deckName: "",
  archetype: "Turbo",
  colorIdentity: "",
  commanders: ["Unknown"],
  commandersText: "Unknown",
  companion: null,
  mulligans: 0,
  result: "Lose",
  moxfieldUrl: undefined,
  deckId: undefined,
  playerId: undefined,
  eliminatedBySeat: undefined,
  turnEliminated: undefined
});

const toCommandersArray = (value: string) =>
  value
    .split(/[|,]/)
    .map((cmdr) => cmdr.trim())
    .filter(Boolean);

export const QuickRecordWizard = ({ resources }: { resources: QuickRecordResources }) => {
  const router = useRouter();
  const [phase, setPhase] = useState<"setup" | "inProgress" | "summary">("setup");
  const [data, setData] = useState<QuickRecordData>({
    players: [1, 2, 3, 4].map((seat) => createDefaultPlayer(seat)),
    winConditionTags: []
  });
  const [podSize, setPodSize] = useState(4);
  const [isPending, startTransition] = useTransition();
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed: QuickRecordData = JSON.parse(stored);
        if (parsed.players?.length) {
          setData({ ...parsed, players: parsed.players.map((p, index) => ({ ...createDefaultPlayer(index + 1), ...p })) });
          setPodSize(parsed.players.length);
        }
      } catch (error) {
        console.error("Failed to load draft", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, autoSaveEnabled]);

  useEffect(() => {
    if (phase !== "inProgress" || !timerStart) return;
    const interval = window.setInterval(() => {
      setDuration(differenceInSeconds(new Date(), timerStart));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase, timerStart]);

  const handlePodSizeChange = (size: number) => {
    setPodSize(size);
    setData((prev) => {
      const players = [...prev.players];
      if (players.length < size) {
        for (let seat = players.length + 1; seat <= size; seat += 1) {
          players.push(createDefaultPlayer(seat));
        }
      } else if (players.length > size) {
        players.length = size;
      }
      return { ...prev, players };
    });
  };

  const handlePlayerChange = (seat: number, changes: Partial<QuickRecordPlayerState>) => {
    setData((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.seat === seat
          ? {
              ...player,
              ...changes
            }
          : player
      )
    }));
  };

  const handleReorder = (next: number[]) => {
    setData((prev) => {
      const reordered = next.map((seat, index) => {
        const existing = prev.players.find((player) => player.seat === seat);
        return existing ? { ...existing, seat: index + 1 } : createDefaultPlayer(index + 1);
      });
      return { ...prev, players: reordered };
    });
  };

  const startGame = () => {
    const start = new Date();
    setTimerStart(start);
    setDuration(0);
    setData((prev) => ({ ...prev, startedAt: start.toISOString(), endedAt: undefined }));
    setPhase("inProgress");
  };

  const endGame = () => {
    const end = new Date();
    const suggestion = Math.max(1, Math.round((duration || differenceInSeconds(end, timerStart ?? end)) / 120));
    setData((prev) => ({ ...prev, endedAt: end.toISOString(), turnsToWin: prev.turnsToWin ?? suggestion }));
    setPhase("summary");
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const eliminationOrder = data.players
          .filter((player) => player.turnEliminated != null)
          .sort((a, b) => (a.turnEliminated ?? 0) - (b.turnEliminated ?? 0))
          .map((player) => player.seat);
        const payload = {
          ...data,
          players: data.players.map((player, index) => ({
            ...player,
            seat: index + 1,
            commanders: player.commanders.length ? player.commanders : ["Unknown"],
            result: player.result ?? (index === 0 ? "Win" : "Lose")
          })),
          eliminationOrder
        };
        const result = await createGame(payload);
        window.localStorage.removeItem(STORAGE_KEY);
        toast.success("Game saved");
        router.push(`/games/${result.id}`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to save game");
      }
    });
  };

  const activePlayers = useMemo(() => data.players.slice(0, podSize), [data.players, podSize]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quick Game Entry</h1>
          <p className="text-sm text-muted-foreground">
            Tap players, assign decks, track the timer, then capture win details in seconds.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Auto-save</span>
          <Switch checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pod setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-muted-foreground">Pod size</Label>
            <div className="flex items-center gap-2">
              {[3, 4, 5].map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={podSize === size ? "default" : "secondary"}
                  onClick={() => handlePodSizeChange(size)}
                >
                  {size} players
                </Button>
              ))}
            </div>
          </div>

          <SeatOrder
            seats={activePlayers.map((player) => ({
              seat: player.seat,
              label: player.playerName || `Seat ${player.seat}`
            }))}
            onReorder={handleReorder}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {activePlayers.map((player) => (
              <Card key={player.seat} className="border-dashed border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    Seat {player.seat}
                    {player.result === "Win" ? <Badge className="bg-emerald-500/20 text-emerald-200">Winner</Badge> : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Player</Label>
                    <PlayerPicker
                      players={resources.players}
                      value={{ playerId: player.playerId, playerName: player.playerName }}
                      onChange={({ playerId, playerName }) => {
                        handlePlayerChange(player.seat, {
                          playerId,
                          playerName,
                          deckId: undefined,
                          deckName: "",
                          colorIdentity: "",
                          commanders: ["Unknown"],
                          commandersText: "Unknown",
                          companion: null,
                          moxfieldUrl: undefined
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deck</Label>
                    <DeckPicker
                      decks={resources.decks}
                      playerId={player.playerId}
                      value={{ deckId: player.deckId, deckName: player.deckName }}
                      onChange={(deck) => {
                        if ("id" in deck) {
                          handlePlayerChange(player.seat, {
                            deckId: deck.id,
                            deckName: deck.name,
                            archetype: deck.archetype as QuickRecordPlayerState["archetype"],
                            colorIdentity: deck.colorIdentity,
                            commanders: deck.commanders.length ? deck.commanders : ["Unknown"],
                            commandersText: deck.commanders.join(", "),
                            companion: deck.companion,
                            moxfieldUrl: deck.moxfieldUrl ?? undefined
                          });
                        } else {
                          handlePlayerChange(player.seat, {
                            deckId: undefined,
                            deckName: deck.deckName,
                            commanders: ["Unknown"],
                            commandersText: "Unknown",
                            companion: null,
                            moxfieldUrl: undefined
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Archetype</Label>
                      <Select
                        value={player.archetype}
                        onValueChange={(value) =>
                          handlePlayerChange(player.seat, { archetype: value as QuickRecordPlayerState["archetype"] })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select archetype" />
                        </SelectTrigger>
                        <SelectContent>
                          {archetypes.map((archetype) => (
                            <SelectItem key={archetype} value={archetype}>
                              {archetype}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color identity</Label>
                      <Input
                        value={player.colorIdentity}
                        onChange={(event) =>
                          handlePlayerChange(player.seat, { colorIdentity: event.target.value.toUpperCase() })
                        }
                        placeholder="e.g. WUBRG"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>Commanders</Label>
                      <p className="text-xs text-muted-foreground">Separate multiple commanders with commas or |</p>
                    </div>
                    <Input
                      value={player.commandersText}
                      onChange={(event) =>
                        handlePlayerChange(player.seat, {
                          commandersText: event.target.value,
                          commanders: toCommandersArray(event.target.value)
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Companion</Label>
                    <Input
                      value={player.companion ?? ""}
                      onChange={(event) =>
                        handlePlayerChange(player.seat, {
                          companion: event.target.value ? event.target.value : null
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Moxfield URL</Label>
                    <Input
                      value={player.moxfieldUrl ?? ""}
                      onChange={(event) =>
                        handlePlayerChange(player.seat, { moxfieldUrl: event.target.value || undefined })
                      }
                      placeholder="https://www.moxfield.com/decks/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mulligans</Label>
                    <MulliganStepper
                      value={player.mulligans}
                      onChange={(mulligans) => handlePlayerChange(player.seat, { mulligans })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {phase === "setup" ? (
            <Button type="button" size="lg" onClick={startGame} className="w-full md:w-auto">
              Start timer
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {phase === "inProgress" ? (
        <Card>
          <CardHeader>
            <CardTitle>Game in progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Elapsed</div>
              <div className="text-4xl font-semibold tabular-nums">
                {new Date(duration * 1000).toISOString().substring(11, 19)}
              </div>
              {timerStart ? (
                <p className="text-sm text-muted-foreground">Started {format(timerStart, "p")}</p>
              ) : null}
            </div>
            <Button type="button" size="lg" onClick={endGame} className="w-full md:w-auto" variant="destructive">
              End game
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {phase === "summary" ? (
        <Card>
          <CardHeader>
            <CardTitle>Finalize game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {activePlayers.map((player) => (
                <div key={player.seat} className="space-y-3 rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Seat {player.seat}</div>
                      <div className="text-lg font-semibold">{player.playerName || `Seat ${player.seat}`}</div>
                    </div>
                    <Switch
                      checked={player.result === "Win"}
                      onCheckedChange={(checked) =>
                        handlePlayerChange(player.seat, { result: checked ? "Win" : "Lose" })
                      }
                      aria-label="Toggle winner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Eliminated by seat</Label>
                      <Input
                        type="number"
                        min={1}
                        max={podSize}
                        value={player.eliminatedBySeat ?? ""}
                        onChange={(event) =>
                          handlePlayerChange(player.seat, {
                            eliminatedBySeat: event.target.value ? Number(event.target.value) : undefined
                          })
                        }
                        placeholder="Seat #"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Turn eliminated</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={player.turnEliminated ?? ""}
                        onChange={(event) =>
                          handlePlayerChange(player.seat, {
                            turnEliminated: event.target.value ? Number(event.target.value) : undefined
                          })
                        }
                        placeholder="Turn"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Turns to win</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={data.turnsToWin ?? ""}
                  onChange={(event) =>
                    setData((prev) => ({ ...prev, turnsToWin: event.target.value ? Number(event.target.value) : undefined }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={data.notes ?? ""}
                  onChange={(event) => setData((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Highlights, key plays, or reminders"
                />
              </div>
            </div>

            <div>
              <Label>Win condition tags</Label>
              <WinTagsSelector
                tags={resources.tags}
                value={data.winConditionTags}
                onChange={(winConditionTags) => setData((prev) => ({ ...prev, winConditionTags }))}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setPhase("setup")}>
                Back to edit
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : "Save game"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
