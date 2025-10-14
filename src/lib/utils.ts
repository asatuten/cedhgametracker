import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPercent = (value: number, fractionDigits = 1) =>
  `${(value * 100).toFixed(fractionDigits)}%`;

export const formatTurns = (value: number | null | undefined) => {
  if (value == null) return "-";
  return `${value} turn${value === 1 ? "" : "s"}`;
};

export const archetypeColors: Record<string, string> = {
  Turbo: "from-fuchsia-500 to-purple-500",
  Stax: "from-amber-500 to-orange-500",
  Midrange: "from-emerald-500 to-teal-500",
  Control: "from-blue-500 to-cyan-500",
  Combo: "from-pink-500 to-rose-500",
  AdNauseam: "from-slate-500 to-slate-700",
  Doomsday: "from-indigo-500 to-indigo-700",
  Other: "from-zinc-500 to-gray-500"
};

export const archetypeLabels = [
  "Turbo",
  "Stax",
  "Midrange",
  "Control",
  "Combo",
  "Ad Nauseam",
  "Doomsday",
  "Other"
];
