import { NextRequest, NextResponse } from "next/server";
import { fetchAllFred } from "@/data/fred";
import { fetchAllMicroservices } from "@/data/microservices";
import { normalizeIndicators, mergeFetchResults } from "@/data/normalize";
import { calcDoomScoreDynamic, getAlertLevel } from "@/engine/engine";
import { supabaseAdmin } from "@/utils/supabase/admin";
import type { IndicatorState } from "@/engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // -----------------------------------------------------------------------
  // 1. Authenticate — Vercel Cron sends this header automatically;
  //    manual triggers must pass ?secret= or the Authorization header.
  // -----------------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
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
    const [fredResults, microserviceResults] = await Promise.all([
      fetchAllFred(),
      fetchAllMicroservices(),
    ]);

    // Merge: FRED (8 indicators) + microservices (JP, IN, GT)
    // CF remains unavailable until its microservice is built
    const allResults = mergeFetchResults(fredResults, microserviceResults);

    // ---------------------------------------------------------------------
    // 3. Get previous indicators from Supabase for fallback
    // ---------------------------------------------------------------------
    const { data: prevRows } = await supabaseAdmin
      .from("indicators")
      .select("*");

    // Convert previous Supabase rows into IndicatorState[] for normalize
    let previousIndicators: IndicatorState[] | null = null;
    if (prevRows && prevRows.length > 0) {
      // We need the indicator definitions to reconstruct IndicatorState
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
          status: row.status === "live" ? "live" : row.status === "cached" ? "cached" : "unavailable",
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

    // Top drivers: indicators with highest weighted contribution, excluding unavailable
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

    // 6a. UPSERT each indicator into indicators
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

    // 6b. UPSERT today's score into score_history
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

    // 6c. Build indicator results log and INSERT cron log
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
        indicator_statuses: indicatorResults,
      });

    if (cronLogError) {
      // Non-fatal: log failure shouldn't break the cron
      console.error("Cron log insert failed:", cronLogError.message);
    }

    // ---------------------------------------------------------------------
    // 7. Return summary response
    // ---------------------------------------------------------------------
    const okCount = Object.values(allResults).filter(
      (r) => r.status === "ok"
    ).length;
    const errorCount = Object.values(allResults).filter(
      (r) => r.status === "error"
    ).length;

    return NextResponse.json({
      success: true,
      score,
      level: level.name,
      indicators: {
        fetched: okCount,
        failed: errorCount,
        unavailable: indicators.filter((i) => i.status === "unavailable").length,
      },
      topDrivers,
      duration,
      timestamp,
    });
  } catch (err) {
    // Log the failure to Supabase
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
