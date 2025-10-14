"use client";

import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const LineChart = <T extends Record<string, number | string>>({
  data,
  xKey,
  yKey,
  color = "hsl(var(--primary))"
}: {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  color?: string;
}) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey={xKey as string} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <Tooltip cursor={{ stroke: "hsl(var(--primary))" }} contentStyle={{ borderRadius: 12 }} />
        <Line type="monotone" dataKey={yKey as string} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
