import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { INDICATORS } from "@/engine/indicators";
import {
  calcDoomScoreDynamic,
  getAlertLevel,
  generateSummary,
} from "@/engine/engine";
import type { IndicatorState } from "@/engine/types";

type IndicatorTrend = "improving" | "stable" | "worsening";
type IndicatorStatus = "live" | "cached" | "unavailable";

interface DbIndicatorRow {
  id: string;
  value: number | null;
  activation: number | null;
  sparkline: number[] | null;
  trend: IndicatorTrend | null;
  status: IndicatorStatus | null;
  last_updated: string | null;
}

interface ScoreHistoryRow {
  date: string;
  score: number;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: rows }, { data: historyRows }] = await Promise.all([
      supabase.from("indicators").select("*"),
      supabase
        .from("score_history")
        .select("date, score")
        .order("date", { ascending: true })
        .limit(90),
    ]);

    const indicatorRows = (rows ?? []) as DbIndicatorRow[];
    const scoreHistoryRows = (historyRows ?? []) as ScoreHistoryRow[];

    if (indicatorRows.length === 0) {
      return NextResponse.json(
        {
          error: "no_data",
          message: "No indicator data available yet. Run the cron job first.",
        },
        { status: 404 }
      );
    }

    // Merge Supabase rows with indicator definitions to build IndicatorState[]
    const rowMap = new Map(indicatorRows.map((row) => [row.id, row]));

    const indicators: IndicatorState[] = INDICATORS.map((def) => {
      const row = rowMap.get(def.id);
      if (!row || row.status === "unavailable") {
        return {
          ...def,
          value: def.safeThreshold,
          activation: 0,
          sparkData: [],
          trend: "stable" as const,
          status: "unavailable" as const,
          lastFetched: undefined,
        };
      }
      return {
        ...def,
        value: row.value ?? def.safeThreshold,
        activation: row.activation ?? 0,
        sparkData: row.sparkline ?? [],
        trend: row.trend ?? "stable",
        status: row.status === "cached" ? "cached" : "live",
        lastFetched: row.last_updated ?? undefined,
      };
    });

    const score = calcDoomScoreDynamic(indicators);
    const level = getAlertLevel(score);
    const summary = generateSummary(indicators, score);

    const liveCount = indicators.filter((ind) => ind.status === "live").length;
    const lastUpdated: string | null = indicatorRows.reduce(
      (latest: string | null, row) => {
        if (!row.last_updated) return latest;
        return !latest || row.last_updated > latest ? row.last_updated : latest;
      },
      null
    );

    const history = scoreHistoryRows.map((entry, index) => ({
      day: index,
      score: entry.score,
      date: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    const previousScore =
      history.length >= 2 ? history[history.length - 2].score : null;

    const previousIndicators = indicators.reduce<Record<string, number>>(
      (acc, indicator) => {
        if (indicator.status === "unavailable") return acc;
        if (indicator.sparkData.length >= 2) {
          acc[indicator.id] = indicator.sparkData[indicator.sparkData.length - 2];
          return acc;
        }

        acc[indicator.id] = indicator.activation;
        return acc;
      },
      {}
    );

    const response = NextResponse.json({
      indicators,
      score,
      level: level.name,
      summary,
      history,
      lastUpdated,
      meta: {
        live: liveCount,
        total: indicators.length,
      },
      previousScore,
      previousIndicators:
        Object.keys(previousIndicators).length > 0 ? previousIndicators : null,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200"
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error: "supabase_error",
        message:
          err instanceof Error ? err.message : "Failed to read from database",
      },
      { status: 500 }
    );
  }
}
