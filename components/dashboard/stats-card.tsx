import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent, formatTurns } from "@/lib/utils";
import { ReactNode } from "react";

export const StatsCard = ({
  title,
  description,
  value,
  icon
}: {
  title: string;
  description?: string;
  value: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold">{value}</div>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardContent>
    </Card>
  );
};

export const WinRateCard = ({ title, winRate, description }: { title: string; winRate: number; description?: string }) => (
  <StatsCard title={title} value={formatPercent(winRate)} description={description} />
);

export const TurnsCard = ({ title, turns, description }: { title: string; turns: number | null; description?: string }) => (
  <StatsCard title={title} value={formatTurns(turns)} description={description} />
);
