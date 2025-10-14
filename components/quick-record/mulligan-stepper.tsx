"use client";

import { Button } from "@/components/ui/button";

export const MulliganStepper = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const increment = () => onChange(Math.min(6, value + 1));
  const decrement = () => onChange(Math.max(0, value - 1));
  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="secondary" size="icon" onClick={decrement} aria-label="Reduce mulligans">
        -
      </Button>
      <span className="text-lg font-semibold">{value}</span>
      <Button type="button" variant="secondary" size="icon" onClick={increment} aria-label="Increase mulligans">
        +
      </Button>
    </div>
  );
};
