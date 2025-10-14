"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const CsvImportDialog = ({
  label,
  template,
  onImport
}: {
  label: string;
  template: string;
  onImport: (csv: string) => Promise<{ created: number; skipped: number }>;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(template);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await onImport(value);
        toast.success(`Imported ${result.created} items (${result.skipped} skipped)`);
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to import data");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Paste CSV data using the required column layout.</DialogDescription>
        </DialogHeader>
        <Textarea value={value} onChange={(event) => setValue(event.target.value)} rows={12} />
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
