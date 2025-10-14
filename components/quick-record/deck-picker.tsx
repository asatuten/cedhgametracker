"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Plus } from "lucide-react";

interface DeckOption {
  id: string;
  name: string;
  playerId: string;
  archetype: string;
  colorIdentity: string;
  commanders: string[];
  companion: string | null;
  moxfieldUrl: string | null;
}

export const DeckPicker = ({
  decks,
  playerId,
  value,
  onChange
}: {
  decks: DeckOption[];
  playerId?: string;
  value: { deckId?: string; deckName?: string };
  onChange: (value: DeckOption | { deckName: string }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesPlayer = playerId ? deck.playerId === playerId : true;
      return matchesPlayer && deck.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [decks, playerId, search]);

  const handleSelectDeck = (deck: DeckOption) => {
    onChange(deck);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>{value.deckName || "Select deck"}</span>
          <Plus className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search decks..." />
          <CommandList>
            <CommandEmpty>No decks found.</CommandEmpty>
            <CommandGroup heading="Decks">
              {filteredDecks.map((deck) => (
                <CommandItem
                  key={deck.id}
                  value={deck.name}
                  onSelect={() => handleSelectDeck(deck)}
                >
                  <span>{deck.name}</span>
                  {value.deckId === deck.id ? <Check className="ml-auto h-4 w-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {search ? (
              <CommandGroup heading="Quick add">
                <CommandItem
                  value={`create-${search}`}
                  onSelect={() => {
                    onChange({ deckName: search.trim() });
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create "{search}"
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
