// FRED API client — fetches economic indicator series
// Docs: https://fred.stlouisfed.org/docs/api/fred/series_observations.html

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

interface FredObservation {
  date: string;
  value: string; // FRED returns "." for missing values
}

interface FredResponse {
  observations: FredObservation[];
}

function getFredApiKey(): string {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY environment variable is not set");
  return key;
}

// ---------------------------------------------------------------------------
// Core fetch — returns observations for a FRED series
// ---------------------------------------------------------------------------

async function fetchSeries(
  seriesId: string,
  opts: { limit?: number; sortOrder?: "asc" | "desc"; offsetYears?: number } = {}
): Promise<FredObservation[]> {
  const { limit = 30, sortOrder = "desc", offsetYears } = opts;

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: getFredApiKey(),
    file_type: "json",
    sort_order: sortOrder,
    limit: String(limit),
  });

  if (offsetYears) {
    const start = new Date();
    start.setFullYear(start.getFullYear() - offsetYears);
    params.set("observation_start", start.toISOString().slice(0, 10));
  }

  const res = await fetch(`${FRED_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${res.status} ${res.statusText}`);
  }

  const data: FredResponse = await res.json();
  return data.observations;
}

// Parse a FRED observation value, returning null for missing data (".")
function parseValue(obs: FredObservation): number | null {
  if (obs.value === "." || obs.value === "") return null;
  const n = parseFloat(obs.value);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Series-specific fetchers
// ---------------------------------------------------------------------------

export interface FredResult {
  value: number;
  date: string;
  history: { value: number; date: string }[];
}

// Direct-value series: return latest + all historical observations
async function fetchDirect(seriesId: string, limit: number): Promise<FredResult> {
  const obs = await fetchSeries(seriesId, { limit, sortOrder: "desc" });

  const history: { value: number; date: string }[] = [];
  let latest: { value: number; date: string } | null = null;

  for (const o of obs) {
    const v = parseValue(o);
    if (v !== null) {
      history.unshift({ value: v, date: o.date }); // prepend → chronological order
      if (!latest) latest = { value: v, date: o.date };
    }
  }

  if (!latest) throw new Error(`No valid observations found for ${seriesId}`);
  return { ...latest, history };
}

// YoY % change: compute YoY for each observation in the recent window
async function fetchYoY(seriesId: string, historyLimit: number): Promise<FredResult> {
  // Fetch 3 years of data so we can compute YoY for the last ~historyLimit months
  const obs = await fetchSeries(seriesId, {
    limit: 100,
    sortOrder: "asc",
    offsetYears: 3,
  });

  // Filter to valid observations, sorted chronologically (asc from API)
  const valid = obs
    .map((o) => ({ date: o.date, value: parseValue(o) }))
    .filter((o): o is { date: string; value: number } => o.value !== null);

  if (valid.length < 2) {
    throw new Error(`Not enough data points for YoY calculation on ${seriesId}`);
  }

  // Compute YoY for each observation in the recent window
  const history: { value: number; date: string }[] = [];

  // Determine cutoff: only compute YoY for the most recent `historyLimit` observations
  // that have a ~12-month-ago pair
  const recentStart = Math.max(0, valid.length - historyLimit);

  for (let i = recentStart; i < valid.length; i++) {
    const current = valid[i];
    const currentDate = new Date(current.date);
    const targetDate = new Date(currentDate);
    targetDate.setFullYear(targetDate.getFullYear() - 1);

    // Find the observation closest to 12 months prior
    let bestMatch: { date: string; value: number } | null = null;
    let bestDiff = Infinity;
    for (let j = 0; j < i; j++) {
      const d = new Date(valid[j].date);
      const diff = Math.abs(d.getTime() - targetDate.getTime());
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = valid[j];
      }
    }

    // Only use match if it's within 60 days of the target and non-zero
    if (bestMatch && bestDiff < 60 * 24 * 60 * 60 * 1000 && bestMatch.value !== 0) {
      const yoy = ((current.value - bestMatch.value) / Math.abs(bestMatch.value)) * 100;
      history.push({ value: Math.round(yoy * 100) / 100, date: current.date });
    }
  }

  if (history.length === 0) {
    throw new Error(`Could not compute any YoY values for ${seriesId}`);
  }

  const latest = history[history.length - 1];
  return { value: latest.value, date: latest.date, history };
}

// ---------------------------------------------------------------------------
// Public API: fetch all FRED indicators
// ---------------------------------------------------------------------------

// Maps indicator ID to FRED series ID, transform type, and history depth
const FRED_SERIES: Record<string, { seriesId: string; transform: "direct" | "yoy"; historyLimit: number }> = {
  YC: { seriesId: "T10Y2Y", transform: "direct", historyLimit: 90 },
  IC: { seriesId: "IC4WSA", transform: "direct", historyLimit: 90 },
  SR: { seriesId: "SAHMREALTIME", transform: "direct", historyLimit: 14 },
  HY: { seriesId: "BAMLH0A0HYM2", transform: "direct", historyLimit: 90 },
  BR: { seriesId: "MMTW", transform: "direct", historyLimit: 90 },
  HP: { seriesId: "PERMIT", transform: "yoy", historyLimit: 14 },
  SV: { seriesId: "NMFBACTIVITYPMI", transform: "direct", historyLimit: 14 },
  TE: { seriesId: "TEMPHELPS", transform: "yoy", historyLimit: 14 },
};

export type FredIndicatorId = keyof typeof FRED_SERIES;

export interface FetchResult {
  status: "ok" | "error";
  value?: number;
  date?: string;
  error?: string;
  history?: { value: number; date: string }[];
}

export async function fetchAllFred(): Promise<Record<string, FetchResult>> {
  const results: Record<string, FetchResult> = {};

  const entries = Object.entries(FRED_SERIES);

  // Fetch all series in parallel
  const settled = await Promise.allSettled(
    entries.map(async ([id, { seriesId, transform, historyLimit }]) => {
      const result = transform === "yoy"
        ? await fetchYoY(seriesId, historyLimit)
        : await fetchDirect(seriesId, historyLimit);
      return { id, result };
    })
  );

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      const { id, result } = outcome.value;
      results[id] = {
        status: "ok",
        value: result.value,
        date: result.date,
        history: result.history,
      };
    } else {
      // Extract indicator ID from the error context
      const idx = settled.indexOf(outcome);
      const id = entries[idx][0];
      results[id] = { status: "error", error: outcome.reason?.message ?? "Unknown error" };
    }
  }

  return results;
}

// Fetch a single FRED indicator by ID (useful for testing)
export async function fetchFredIndicator(indicatorId: string): Promise<FetchResult> {
  const config = FRED_SERIES[indicatorId];
  if (!config) {
    return { status: "error", error: `Unknown FRED indicator: ${indicatorId}` };
  }

  try {
    const result = config.transform === "yoy"
      ? await fetchYoY(config.seriesId, config.historyLimit)
      : await fetchDirect(config.seriesId, config.historyLimit);
    return { status: "ok", value: result.value, date: result.date, history: result.history };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Unknown error" };
  }
}
