"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Plus } from "lucide-react";

interface PlayerOption {
  id: string;
  displayName: string;
}

export const PlayerPicker = ({
  players,
  value,
  onChange
}: {
  players: PlayerOption[];
  value: { playerId?: string; playerName?: string };
  onChange: (value: { playerId?: string; playerName: string }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const options = useMemo(() => {
    return players.filter((player) => player.displayName.toLowerCase().includes(search.toLowerCase()));
  }, [players, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>{value.playerName || "Select player"}</span>
          <Plus className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search players..." />
          <CommandList>
            <CommandEmpty>No players found.</CommandEmpty>
            <CommandGroup heading="Players">
              {options.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.displayName}
                  onSelect={() => {
                    onChange({ playerId: player.id, playerName: player.displayName });
                    setSearch("");
                    setOpen(false);
                  }}
                >
                  <span>{player.displayName}</span>
                  {value.playerId === player.id ? <Check className="ml-auto h-4 w-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {search ? (
              <CommandGroup heading="Quick add">
                <CommandItem
                  value={`create-${search}`}
                  onSelect={() => {
                    onChange({ playerName: search.trim() });
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
