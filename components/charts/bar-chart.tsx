"use client";

import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const BarChart = <T extends Record<string, number | string>>({
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
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis dataKey={xKey as string} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "hsl(var(--muted)/0.15)" }} contentStyle={{ borderRadius: 12 }} />
        <Bar dataKey={yKey as string} fill={color} radius={12} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
