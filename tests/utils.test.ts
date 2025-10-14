import { describe, expect, it } from "vitest";
import { formatPercent, formatTurns } from "@/lib/utils";

describe("formatPercent", () => {
  it("formats decimals as percentages", () => {
    expect(formatPercent(0.5234)).toBe("52.3%");
  });
});

describe("formatTurns", () => {
  it("returns dash for missing values", () => {
    expect(formatTurns(null)).toBe("-");
  });
  it("pluralizes correctly", () => {
    expect(formatTurns(1)).toBe("1 turn");
    expect(formatTurns(4)).toBe("4 turns");
  });
});
