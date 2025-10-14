import { cn, formatPercent } from "@/lib/utils";

export interface HeatmapCell {
  row: string;
  column: string;
  value: number;
}

export const Heatmap = ({ rows, columns, values }: { rows: string[]; columns: string[]; values: HeatmapCell[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-32 p-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Archetype</th>
            {columns.map((column) => (
              <th key={column} className="p-2 text-xs uppercase tracking-wide text-muted-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="p-2 text-sm font-medium">{row}</td>
              {columns.map((column) => {
                const cell = values.find((value) => value.row === row && value.column === column);
                const intensity = cell ? Math.round(cell.value * 100) : 0;
                return (
                  <td
                    key={column}
                    className={cn(
                      "p-2 text-center text-sm",
                      cell ? "font-semibold" : "text-muted-foreground"
                    )}
                    style={{
                      background: cell ? `hsl(var(--primary) / ${0.15 + intensity / 200})` : undefined,
                      color: cell ? "hsl(var(--primary-foreground))" : undefined,
                      borderRadius: 12
                    }}
                  >
                    {cell ? formatPercent(cell.value, 0) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
