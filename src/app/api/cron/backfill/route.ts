import { NextRequest, NextResponse } from "next/server";
import { INDICATORS } from "@/engine/indicators";
import { calcActivation, calcDoomScoreDynamic, getAlertLevel } from "@/engine/engine";
import { supabaseAdmin } from "@/utils/supabase/admin";
import type { IndicatorState } from "@/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Backfill can take a while — raise the timeout ceiling
export const maxDuration = 60;

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

// ---------------------------------------------------------------------------
// FRED series config for backfill
// ---------------------------------------------------------------------------
const DIRECT_SERIES: Record<string, string> = {
  YC: "T10Y2Y",
  IC: "IC4WSA",
  SR: "SAHMREALTIME",
  HY: "BAMLH0A0HYM2",
};

const YOY_SERIES: Record<string, string> = {
  HP: "PERMIT",
  TE: "TEMPHELPS",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function subtractDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

async function fetchRaw(
  seriesId: string,
  startDate: string
): Promise<{ date: string; value: number }[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: process.env.FRED_API_KEY!,
    file_type: "json",
    sort_order: "asc",
    observation_start: startDate,
  });
  const res = await fetch(`${FRED_BASE}?${params}`);
  if (!res.ok) throw new Error(`FRED ${seriesId}: ${res.status}`);
  const data = await res.json();
  return (data.observations as { date: string; value: string }[])
    .filter((o) => o.value !== "." && o.value !== "")
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}

// For a map of date→value, return the most recent value on or before targetDate
function lookupValue(
  map: Map<string, number>,
  targetDate: string
): number | null {
  // Walk backwards up to 45 days to find a value (handles monthly gaps)
  const d = new Date(targetDate);
  for (let i = 0; i <= 45; i++) {
    const key = dateStr(new Date(d.getTime() - i * 86400000));
    if (map.has(key)) return map.get(key)!;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build per-indicator date→value maps
// ---------------------------------------------------------------------------

async function buildDirectMap(
  indicatorId: string,
  seriesId: string,
  startDate: string
): Promise<Map<string, number>> {
  const obs = await fetchRaw(seriesId, startDate);
  const map = new Map<string, number>();
  for (const o of obs) map.set(o.date, o.value);
  return map;
}

async function buildYoYMap(
  indicatorId: string,
  seriesId: string,
  startDate: string
): Promise<Map<string, number>> {
  // Fetch 15 months of raw data so we can compute YoY for the target window
  const extendedStart = dateStr(subtractDays(new Date(startDate), 400));
  const obs = await fetchRaw(seriesId, extendedStart);
  const map = new Map<string, number>();

  for (let i = 0; i < obs.length; i++) {
    const current = obs[i];
    const targetDate = new Date(current.date);
    targetDate.setFullYear(targetDate.getFullYear() - 1);

    // Find closest observation ~12 months ago
    let best: { date: string; value: number } | null = null;
    let bestDiff = Infinity;
    for (let j = 0; j < i; j++) {
      const d = new Date(obs[j].date);
      const diff = Math.abs(d.getTime() - targetDate.getTime());
      if (diff < bestDiff) { bestDiff = diff; best = obs[j]; }
    }

    if (best && bestDiff < 60 * 86400000 && best.value !== 0) {
      const yoy = ((current.value - best.value) / Math.abs(best.value)) * 100;
      map.set(current.date, Math.round(yoy * 100) / 100);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Auth
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const bearer = request.headers.get("authorization")?.slice(7) ?? null;
    const query = request.nextUrl.searchParams.get("secret");
    if (bearer !== cronSecret && query !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = dateStr(subtractDays(today, 95)); // fetch a bit extra

  // Fetch all FRED series in parallel
  const [directMaps, yoyMaps] = await Promise.all([
    Promise.all(
      Object.entries(DIRECT_SERIES).map(async ([id, series]) => ({
        id,
        map: await buildDirectMap(id, series, startDate).catch(() => new Map<string, number>()),
      }))
    ),
    Promise.all(
      Object.entries(YOY_SERIES).map(async ([id, series]) => ({
        id,
        map: await buildYoYMap(id, series, startDate).catch(() => new Map<string, number>()),
      }))
    ),
  ]);

  // Combine into a single indicator→map lookup
  const indicatorMaps = new Map<string, Map<string, number>>();
  for (const { id, map } of [...directMaps, ...yoyMaps]) {
    indicatorMaps.set(id, map);
  }

  // Build 90 rows: today going back 89 days
  const rows: {
    date: string;
    score: number;
    level: string;
    top_drivers: string[];
    active_count: number;
    total_count: number;
  }[] = [];

  for (let i = 89; i >= 0; i--) {
    const date = dateStr(subtractDays(today, i));

    // Build partial IndicatorState[] for this date
    const indicators: IndicatorState[] = INDICATORS.map((def) => {
      const valueMap = indicatorMaps.get(def.id);
      const value = valueMap ? lookupValue(valueMap, date) : null;

      if (value === null) {
        return {
          ...def,
          value: def.safeThreshold,
          activation: 0,
          sparkData: [],
          trend: "stable" as const,
          status: "unavailable" as const,
        };
      }

      return {
        ...def,
        value,
        activation: calcActivation(def, value),
        sparkData: [],
        trend: "stable" as const,
        status: "live" as const,
      };
    });

    const score = calcDoomScoreDynamic(indicators);
    const level = getAlertLevel(score);
    const activeCount = indicators.filter((i) => i.status !== "unavailable").length;
    const topDrivers = indicators
      .filter((i) => i.status !== "unavailable" && i.activation > 0.1)
      .sort((a, b) => b.activation * b.weight - a.activation * a.weight)
      .slice(0, 5)
      .map((i) => i.id);

    rows.push({
      date,
      score,
      level: level.name,
      top_drivers: topDrivers,
      active_count: activeCount,
      total_count: 12,
    });
  }

  // Upsert all rows — skip dates that already have data unless overwrite=true
  const overwrite = request.nextUrl.searchParams.get("overwrite") === "true";

  let upserted = 0;
  let skipped = 0;

  if (overwrite) {
    const { error } = await supabaseAdmin
      .from("score_history")
      .upsert(rows, { onConflict: "date" });
    if (error) throw new Error(`score_history upsert failed: ${error.message}`);
    upserted = rows.length;
  } else {
    // Only insert dates that don't exist yet
    const { data: existing } = await supabaseAdmin
      .from("score_history")
      .select("date");
    const existingDates = new Set((existing ?? []).map((r) => r.date));

    const toInsert = rows.filter((r) => !existingDates.has(r.date));
    skipped = rows.length - toInsert.length;

    if (toInsert.length > 0) {
      const { error } = await supabaseAdmin
        .from("score_history")
        .insert(toInsert);
      if (error) throw new Error(`score_history insert failed: ${error.message}`);
    }
    upserted = toInsert.length;
  }

  return NextResponse.json({
    success: true,
    rows: rows.length,
    upserted,
    skipped,
    dateRange: { from: rows[0]?.date, to: rows[rows.length - 1]?.date },
    indicatorCoverage: Object.fromEntries(
      Array.from(indicatorMaps.entries()).map(([id, map]) => [id, map.size])
    ),
  });
}
