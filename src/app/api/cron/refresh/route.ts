import { NextRequest, NextResponse } from "next/server";
import { fetchAllFred } from "@/data/fred";
import { fetchAllMicroservices } from "@/data/microservices";
import { normalizeIndicators, mergeFetchResults } from "@/data/normalize";
import { calcDoomScoreDynamic, getAlertLevel } from "@/engine/engine";
import { supabaseAdmin } from "@/utils/supabase/admin";
import type { IndicatorState } from "@/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorCategory = "network" | "timeout" | "parse" | "upstream" | "unknown";

function categorizeError(message?: string): ErrorCategory {
  const text = (message ?? "").toLowerCase();
  if (text.includes("timeout") || text.includes("aborted")) return "timeout";
  if (
    text.includes("fetch failed") ||
    text.includes("econn") ||
    text.includes("enotfound") ||
    text.includes("socket")
  ) {
    return "network";
  }
  if (
    text.includes("parse") ||
    text.includes("json") ||
    text.includes("could not")
  ) {
    return "parse";
  }
  if (text.includes("returned") || text.includes("status")) return "upstream";
  return "unknown";
}

async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries = 1,
  delayMs = 500
): Promise<{ data: T; attempts: number }> {
  let attempts = 0;
  let lastError: unknown;

  while (attempts <= retries) {
    try {
      attempts += 1;
      const data = await fetcher();
      return { data, attempts };
    } catch (err) {
      lastError = err;
      if (attempts > retries) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempts));
    }
  }

  throw lastError;
}

export async function GET(request: NextRequest) {
  // -----------------------------------------------------------------------
  // 1. Authenticate — Vercel Cron sends this header automatically;
  //    manual triggers must pass ?secret= or the Authorization header.
  // -----------------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  const isProd = process.env.VERCEL_ENV === "production";

  if (isProd && !cronSecret) {
    return NextResponse.json(
      { error: "Cron secret is not configured in production" },
      { status: 500 }
    );
  }

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (bearerToken !== cronSecret && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  try {
    // ---------------------------------------------------------------------
    // 2. Fetch all data sources in parallel
    // ---------------------------------------------------------------------
    const fredStart = Date.now();
    const microStart = Date.now();

    const [fredFetch, microFetch] = await Promise.all([
      fetchWithRetry(() => fetchAllFred()),
      fetchWithRetry(() => fetchAllMicroservices()),
    ]);

    const fredDurationMs = Date.now() - fredStart;
    const microDurationMs = Date.now() - microStart;

    const fredResults = fredFetch.data;
    const microserviceResults = microFetch.data;

    // Merge: FRED (8 indicators) + microservices (JP, IN, GT)
    // CF remains unavailable until its microservice is built
    const allResults = mergeFetchResults(fredResults, microserviceResults);

    const allEntries = Object.entries(allResults);
    const errorEntries = allEntries.filter(([, result]) => result.status === "error");

    const sourceTelemetry = {
      fred: {
        duration_ms: fredDurationMs,
        attempts: fredFetch.attempts,
        ok: Object.values(fredResults).filter((result) => result.status === "ok").length,
        error: Object.values(fredResults).filter((result) => result.status === "error").length,
      },
      microservices: {
        duration_ms: microDurationMs,
        attempts: microFetch.attempts,
        ok: Object.values(microserviceResults).filter((result) => result.status === "ok")
          .length,
        error: Object.values(microserviceResults).filter(
          (result) => result.status === "error"
        ).length,
      },
      errors_by_category: errorEntries.reduce<Record<ErrorCategory, number>>(
        (acc, [, result]) => {
          const category = categorizeError(result.error);
          acc[category] += 1;
          return acc;
        },
        {
          network: 0,
          timeout: 0,
          parse: 0,
          upstream: 0,
          unknown: 0,
        }
      ),
    };

    // ---------------------------------------------------------------------
    // 3. Get previous indicators from Supabase for fallback
    // ---------------------------------------------------------------------
    const { data: prevRows } = await supabaseAdmin
      .from("indicators")
      .select("*");

    // Convert previous Supabase rows into IndicatorState[] for normalize
    let previousIndicators: IndicatorState[] | null = null;
    if (prevRows && prevRows.length > 0) {
      const { INDICATORS } = await import("@/engine/indicators");
      const defMap = new Map(INDICATORS.map((d) => [d.id, d]));

      const mapped: IndicatorState[] = [];
      for (const row of prevRows) {
        const def = defMap.get(row.id);
        if (!def) continue;
        mapped.push({
          ...def,
          value: row.value ?? def.safeThreshold,
          activation: row.activation ?? 0,
          sparkData: (row.sparkline as number[]) ?? [],
          trend: (row.trend ?? "stable") as "improving" | "stable" | "worsening",
          status:
            row.status === "live"
              ? "live"
              : row.status === "cached"
                ? "cached"
                : "unavailable",
          lastFetched: row.last_updated ?? undefined,
        });
      }
      previousIndicators = mapped;
    }

    // ---------------------------------------------------------------------
    // 4. Normalize into IndicatorState[]
    // ---------------------------------------------------------------------
    const indicators = normalizeIndicators(allResults, previousIndicators);

    // ---------------------------------------------------------------------
    // 5. Compute score + level
    // ---------------------------------------------------------------------
    const score = calcDoomScoreDynamic(indicators);
    const level = getAlertLevel(score);

    const topDrivers = indicators
      .filter((ind) => ind.status !== "unavailable" && ind.activation > 0.1)
      .sort((a, b) => b.activation * b.weight - a.activation * a.weight)
      .slice(0, 5)
      .map((ind) => ind.id);

    const activeCount = indicators.filter(
      (ind) => ind.status !== "unavailable"
    ).length;

    // ---------------------------------------------------------------------
    // 6. Write to Supabase
    // ---------------------------------------------------------------------
    const timestamp = new Date().toISOString();

    const indicatorRows = indicators.map((ind) => ({
      id: ind.id,
      value: ind.value,
      activation: ind.activation,
      status: ind.status ?? "unavailable",
      sparkline: ind.sparkData,
      trend: ind.trend,
      last_updated: ind.lastFetched ?? timestamp,
    }));

    const { error: indicatorError } = await supabaseAdmin
      .from("indicators")
      .upsert(indicatorRows, { onConflict: "id" });

    if (indicatorError) {
      throw new Error(`Supabase indicators upsert failed: ${indicatorError.message}`);
    }

    const { error: historyError } = await supabaseAdmin
      .from("score_history")
      .upsert(
        {
          date: today,
          score,
          level: level.name,
          top_drivers: topDrivers,
          active_count: activeCount,
          total_count: 12,
        },
        { onConflict: "date" }
      );

    if (historyError) {
      throw new Error(`Supabase score_history upsert failed: ${historyError.message}`);
    }

    const indicatorResults: Record<string, string> = {};
    for (const ind of indicators) {
      const result = allResults[ind.id];
      if (ind.status === "unavailable" && !result) {
        indicatorResults[ind.id] = "unavailable";
      } else if (!result || result.status === "error") {
        indicatorResults[ind.id] = "error";
      } else {
        indicatorResults[ind.id] = "ok";
      }
    }

    const duration = Date.now() - startTime;

    const { error: cronLogError } = await supabaseAdmin
      .from("cron_logs")
      .insert({
        date: today,
        success: true,
        duration_ms: duration,
        score,
        active_count: activeCount,
        indicator_statuses: {
          ...indicatorResults,
          _telemetry: sourceTelemetry,
        },
      });

    if (cronLogError) {
      console.error("Cron log insert failed:", cronLogError.message);
    }

    const okCount = allEntries.filter(([, result]) => result.status === "ok").length;
    const errorCount = errorEntries.length;

    return NextResponse.json({
      success: true,
      score,
      level: level.name,
      indicators: {
        fetched: okCount,
        failed: errorCount,
        unavailable: indicators.filter((i) => i.status === "unavailable").length,
      },
      telemetry: sourceTelemetry,
      topDrivers,
      duration,
      timestamp,
    });
  } catch (err) {
    const duration = Date.now() - startTime;

    try {
      await supabaseAdmin.from("cron_logs").insert({
        date: today,
        success: false,
        duration_ms: duration,
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
    } catch {
      // If Supabase is also down, we can't log — just continue to return the error
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        duration,
      },
      { status: 500 }
    );
  }
}
