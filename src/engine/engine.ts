import type { IndicatorDef, IndicatorState, AlertLevel } from "./types";
import { alertLevels, TOTAL_WEIGHT } from "@/lib/design-tokens";
import { clamp } from "@/lib/utils";

export function calcActivation(def: IndicatorDef, value: number): number {
  const { safeThreshold: safe, criticalThreshold: critical } = def;
  if (def.inverted) {
    return clamp((safe - value) / (safe - critical), 0, 1);
  }
  return clamp((value - safe) / (critical - safe), 0, 1);
}

export function calcDoomScore(indicators: IndicatorState[]): number {
  const weightedSum = indicators.reduce(
    (sum, ind) => sum + ind.activation * ind.weight,
    0
  );
  return clamp(Math.round((weightedSum / TOTAL_WEIGHT) * 100), 0, 100);
}

export function getAlertLevel(score: number): AlertLevel {
  return (
    alertLevels.find((l) => score >= l.min && score <= l.max) ?? alertLevels[0]
  );
}

const phraseMap: Record<string, (activation: number) => string> = {
  YC: (a) =>
    a > 0.6 ? "an inverted yield curve" : "a narrowing yield curve",
  IC: () => "rising layoff filings",
  SR: () => "accelerating unemployment",
  HY: () => "higher corporate borrowing costs",
  BR: () => "weakening market breadth",
  HP: () => "falling home construction",
  SV: () => "a slowing services sector",
  IN: () => "increased insider selling",
  JP: () => "a cooling job market",
  GT: () => "rising public worry about recession",
  TE: () => "declining temp employment",
  CF: () => "crypto market stress",
};

export function generateSummary(
  indicators: IndicatorState[],
  score: number
): string {
  const level = getAlertLevel(score);

  const active = indicators
    .filter((ind) => ind.activation > 0.15)
    .sort((a, b) => b.activation * b.weight - a.activation * a.weight)
    .slice(0, 3);

  const phrases = active.map((ind) => phraseMap[ind.id](ind.activation));

  if (phrases.length === 0) {
    return "The economy is stable. No significant stress signals are present.";
  }

  const joined =
    phrases.length === 1
      ? phrases[0]
      : phrases.length === 2
        ? `${phrases[0]} and ${phrases[1]}`
        : `${phrases[0]}, ${phrases[1]}, and ${phrases[2]}`;

  switch (level.name) {
    case "All Clear":
      return `The economy is stable, with minor signals from ${joined}.`;
    case "Caution":
      return `Some warning signs are emerging \u2014 particularly ${joined}. Worth keeping an eye on.`;
    case "Danger":
      return `Multiple recession indicators are active, including ${joined}.`;
    case "Crisis":
      return `Broad economic stress is visible across ${joined}. These conditions resemble the lead-up to past recessions.`;
    default:
      return `Economic conditions show ${joined}.`;
  }
}
