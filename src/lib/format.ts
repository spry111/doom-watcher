import type { IndicatorState } from "@/engine/types";

const VALUE_FORMATTERS: Record<string, (value: number) => string> = {
  YC: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`,
  IC: (v) => Math.round(v).toLocaleString("en-US"),
  SR: (v) => v.toFixed(2),
  HY: (v) => `${v.toFixed(2)}%`,
  BR: (v) => `${Math.round(v)}%`,
  HP: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}% YoY`,
  SV: (v) => v.toFixed(1),
  IN: (v) => `${v.toFixed(1)}\u00D7`,
  JP: (v) => `${v > 0 ? "+" : ""}${Math.round(v)}% YoY`,
  GT: (v) => `${v.toFixed(2)}\u00D7 baseline`,
  TE: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}% YoY`,
  CF: (v) => `${Math.round(v)}/100`,
};

export function formatIndicatorValue(id: string, value: number): string {
  const formatter = VALUE_FORMATTERS[id];
  return formatter ? formatter(value) : String(value);
}

export function getActivationDescription(activationPct: number): string {
  if (activationPct < 15) return "Well within normal range";
  if (activationPct < 40) return "Slightly above normal \u2014 worth watching";
  if (activationPct < 70) return "Significantly elevated \u2014 a warning sign";
  return "Near critical levels \u2014 historically associated with recessions";
}

export function getZoneName(activation: number): string {
  if (activation < 0.15) return "Normal";
  if (activation < 0.40) return "Elevated";
  if (activation < 0.70) return "Stressed";
  return "Critical";
}

export function getNormalRange(indicator: IndicatorState): string {
  const formatted = formatIndicatorValue(indicator.id, indicator.safeThreshold);
  return indicator.inverted ? `Above ${formatted}` : `Below ${formatted}`;
}

export function getCriticalLevel(indicator: IndicatorState): string {
  const formatted = formatIndicatorValue(
    indicator.id,
    indicator.criticalThreshold
  );
  return indicator.inverted ? `Below ${formatted}` : `Above ${formatted}`;
}
