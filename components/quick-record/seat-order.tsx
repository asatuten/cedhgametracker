"use client";

import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { Badge } from "@/components/ui/badge";

export const SeatOrder = ({
  seats,
  onReorder
}: {
  seats: Array<{ seat: number; label: string }>;
  onReorder: (next: number[]) => void;
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const sortable = Sortable.create(listRef.current, {
      animation: 150,
      onEnd: () => {
        if (!listRef.current) return;
        const next = Array.from(listRef.current.children).map((item) => Number((item as HTMLElement).dataset.seat));
        onReorder(next);
      }
    });
    return () => sortable.destroy();
  }, [onReorder]);

  return (
    <ul ref={listRef} className="flex flex-wrap gap-3">
      {seats.map((seat) => (
        <li
          key={seat.seat}
          data-seat={seat.seat}
          className="flex cursor-move items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm"
        >
          <Badge className="bg-primary/20 text-primary">Seat {seat.seat}</Badge>
          <span className="font-medium">{seat.label}</span>
        </li>
      ))}
    </ul>
  );
};
