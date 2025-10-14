"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CsvExportButton = ({
  label,
  filename,
  onExport
}: {
  label: string;
  filename: string;
  onExport: () => Promise<string>;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const csv = await onExport();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Export ready");
      } catch (error) {
        console.error(error);
        toast.error("Export failed");
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} variant="secondary">
      {isPending ? "Preparing..." : label}
    </Button>
  );
};
