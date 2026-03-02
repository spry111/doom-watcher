// Fetches indicator values from external microservice endpoints
// Each microservice returns: { value, sparkline, updatedAt, source, status, error? }

import type { FetchResult } from "./fred";

interface MicroserviceResponse {
  value: number;
  sparkline: number[];
  updatedAt: string;
  source: string;
  status: "ok" | "error";
  error?: string;
}

// Maps indicator ID to config
const MICROSERVICE_INDICATORS: Record<
  string,
  { envVar: string; sparklineIsMetric: boolean }
> = {
  // JP sparkline contains weekly YoY % changes — same unit as value
  JP: { envVar: "MICROSERVICE_JP_URL", sparklineIsMetric: true },
  // IN sparkline is currently empty
  IN: { envVar: "MICROSERVICE_IN_URL", sparklineIsMetric: false },
  // GT sparkline contains raw interest scores, NOT the ratio value —
  // can't be passed through calcActivation
  GT: { envVar: "MICROSERVICE_GT_URL", sparklineIsMetric: false },
};

async function fetchMicroservice(
  indicatorId: string,
  url: string,
  sparklineIsMetric: boolean
): Promise<FetchResult> {
  try {
    const res = await fetch(`${url}/api/value`, {
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `Microservice ${indicatorId} returned ${res.status}`,
      };
    }

    const data: MicroserviceResponse = await res.json();

    if (data.status !== "ok" || data.value === undefined) {
      return {
        status: "error",
        error: data.error ?? `Microservice ${indicatorId} returned non-ok status`,
      };
    }

    // Only pass sparkline as history if values are in the same unit as
    // the indicator metric (so calcActivation can map them correctly)
    const history =
      sparklineIsMetric && data.sparkline.length > 1
        ? data.sparkline.map((v, i) => ({ value: v, date: `spark-${i}` }))
        : undefined;

    return {
      status: "ok",
      value: data.value,
      date: data.updatedAt,
      history,
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : `Microservice ${indicatorId} fetch failed`,
    };
  }
}

export async function fetchAllMicroservices(): Promise<Record<string, FetchResult>> {
  const results: Record<string, FetchResult> = {};

  const entries = Object.entries(MICROSERVICE_INDICATORS)
    .map(([id, config]) => {
      const url = process.env[config.envVar];
      return url ? { id, url, sparklineIsMetric: config.sparklineIsMetric } : null;
    })
    .filter(
      (e): e is { id: string; url: string; sparklineIsMetric: boolean } =>
        e !== null
    );

  if (entries.length === 0) return results;

  const settled = await Promise.allSettled(
    entries.map(async ({ id, url, sparklineIsMetric }) => {
      const result = await fetchMicroservice(id, url, sparklineIsMetric);
      return { id, result };
    })
  );

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      results[outcome.value.id] = outcome.value.result;
    } else {
      // Should not happen since fetchMicroservice catches errors internally
      const idx = settled.indexOf(outcome);
      const id = entries[idx].id;
      results[id] = {
        status: "error",
        error: outcome.reason?.message ?? "Unknown error",
      };
    }
  }

  return results;
}
