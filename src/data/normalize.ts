// Normalizes raw fetched values into IndicatorState[] for the engine
// Bridges the gap between data sources and the existing UI/engine layer

import type { IndicatorState } from "@/engine/types";
import type { FetchResult } from "./fred";
import { INDICATORS } from "@/engine/indicators";
import { calcActivation } from "@/engine/engine";

export function normalizeIndicators(
  fetchResults: Record<string, FetchResult>,
  previousIndicators?: IndicatorState[] | null
): IndicatorState[] {
  const previousMap = new Map(
    (previousIndicators ?? []).map((ind) => [ind.id, ind])
  );

  return INDICATORS.map((def) => {
    const result = fetchResults[def.id];
    const prev = previousMap.get(def.id);

    // Indicator not in fetch results at all → not being fetched, always unavailable
    if (!(def.id in fetchResults)) {
      return {
        ...def,
        value: def.safeThreshold,
        activation: 0,
        sparkData: new Array(14).fill(0),
        trend: "stable" as const,
        status: "unavailable" as const,
      };
    }

    // Fetch was attempted but failed
    if (!result || result.status === "error" || result.value === undefined) {
      // Use cached data if available
      if (prev && prev.status !== "unavailable") {
        return { ...prev, status: "cached" as const };
      }
      // No cached data — mark unavailable
      return {
        ...def,
        value: def.safeThreshold,
        activation: 0,
        sparkData: new Array(14).fill(0),
        trend: "stable" as const,
        status: "unavailable" as const,
      };
    }

    // Successful fetch
    const value = result.value;
    const activation = calcActivation(def, value);

    // Build spark data from historical observations if available
    let sparkData: number[];
    if (result.history && result.history.length > 1) {
      sparkData = result.history.map((h) => calcActivation(def, h.value));
    } else {
      // Fallback: shift previous spark data left, append new activation
      const prevSpark = prev?.sparkData ?? new Array(14).fill(activation);
      sparkData = [...prevSpark.slice(1), activation];
    }

    // Derive trend from spark data
    const trend = deriveTrend(sparkData);

    return {
      ...def,
      value,
      activation,
      sparkData,
      trend,
      status: "live" as const,
      lastFetched: new Date().toISOString(),
    };
  });
}

function deriveTrend(
  sparkData: number[]
): "improving" | "stable" | "worsening" {
  if (sparkData.length < 4) return "stable";

  // Compare average of last 3 to average of first 3
  const recent = sparkData.slice(-3).reduce((s, v) => s + v, 0) / 3;
  const earlier = sparkData.slice(0, 3).reduce((s, v) => s + v, 0) / 3;
  const diff = recent - earlier;

  // Activation is 0-1, so a diff of 0.05 is meaningful
  if (diff > 0.05) return "worsening";
  if (diff < -0.05) return "improving";
  return "stable";
}

// Build a combined fetch results map from all data sources
export function mergeFetchResults(
  fredResults: Record<string, FetchResult>,
  extras: Record<string, FetchResult>
): Record<string, FetchResult> {
  return {
    ...fredResults,
    ...extras,
  };
}
