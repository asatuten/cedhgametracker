"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";

export const WinTagsSelector = ({
  tags,
  value,
  onChange
}: {
  tags: Array<{ id: string; name: string }>;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()));
  }, [tags, search]);

  const toggleTag = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((tag) => tag !== name));
    } else {
      onChange([...value, name]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.length ? value.map((tag) => <Badge key={tag}>{tag}</Badge>) : <span className="text-sm text-muted-foreground">No tags selected.</span>}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit">
            Manage win tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput value={search} onValueChange={setSearch} placeholder="Search win tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Suggested tags">
                {filtered.map((tag) => (
                  <CommandItem key={tag.id} value={tag.name} onSelect={() => toggleTag(tag.name)}>
                    <span>{tag.name}</span>
                    {value.includes(tag.name) ? <Check className="ml-auto h-4 w-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              {search ? (
                <CommandGroup heading="Quick add">
                  <CommandItem
                    value={`create-${search}`}
                    onSelect={() => {
                      toggleTag(search.trim());
                      setSearch("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add "{search}"
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
