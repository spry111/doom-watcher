import type { IndicatorState, HistoryPoint } from "@/engine/types";
import { INDICATORS } from "@/engine/indicators";
import { SCENARIOS } from "@/engine/scenarios";
import { calcActivation, calcDoomScore } from "@/engine/engine";
import { clamp } from "@/lib/utils";

function generateSparkData(activation: number, scenarioKey: string): number[] {
  return Array.from({ length: 14 }, (_, i) => {
    const progress = i / 13;
    const noise = (Math.random() - 0.5) * 0.1;

    let base: number;
    if (scenarioKey === "calm") {
      base = activation * (0.85 + progress * 0.15);
    } else {
      base = activation * (0.25 + progress * 0.75);
    }

    return clamp(base + noise, 0, 1);
  });
}

function deriveTrend(
  activation: number,
  scenarioKey: string
): "improving" | "stable" | "worsening" {
  if (scenarioKey === "calm") return "stable";
  if (activation < 0.15) return "stable";
  if (scenarioKey === "crisis") return "worsening";
  return activation > 0.5 ? "worsening" : "stable";
}

export function buildIndicators(scenarioIndex: number): IndicatorState[] {
  const scenario = SCENARIOS[scenarioIndex];
  return INDICATORS.map((def) => {
    const value = scenario.values[def.id];
    const activation = calcActivation(def, value);
    return {
      ...def,
      value,
      activation,
      sparkData: generateSparkData(activation, scenario.key),
      trend: deriveTrend(activation, scenario.key),
    };
  });
}

export function buildHistory(scenarioIndex: number): HistoryPoint[] {
  const indicators = buildIndicators(scenarioIndex);
  const targetScore = calcDoomScore(indicators);

  return Array.from({ length: 90 }, (_, i) => {
    const progress = i / 89;
    let base: number;

    switch (scenarioIndex) {
      case 0:
        base = 8 + Math.random() * 10;
        break;
      case 1:
        base = 10 + progress * (targetScore - 12) + (Math.random() - 0.5) * 5;
        break;
      case 2:
        base =
          12 +
          progress * progress * (targetScore - 15) +
          (Math.random() - 0.5) * 7;
        break;
      case 3:
        base =
          15 +
          Math.pow(progress, 1.4) * (targetScore - 18) +
          (Math.random() - 0.5) * 9;
        break;
      default:
        base = 8 + Math.random() * 10;
    }

    const date = new Date(2026, 1, 18);
    date.setDate(date.getDate() - (89 - i));

    return {
      day: i,
      score: clamp(Math.round(base), 0, 100),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });
}
