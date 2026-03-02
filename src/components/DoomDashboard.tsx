"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { buildIndicators, buildHistory } from "@/data/mock";
import {
  calcDoomScore,
  getAlertLevel,
  generateSummary,
} from "@/engine/engine";
import type { IndicatorState, HistoryPoint, DataMode } from "@/engine/types";
import { colors, alertColors } from "@/lib/design-tokens";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import HeroSection from "./HeroSection";
import QuickStats from "./QuickStats";
import HistoryChart from "./HistoryChart";
import DriverCards from "./DriverCards";
import IndicatorList from "./IndicatorList";
import MethodologyPanel from "./MethodologyPanel";
import Footer from "./Footer";
import DisclaimerModal from "./DisclaimerModal";
import IndicatorDetailModal from "./IndicatorDetailModal";

interface UserProfile {
  id: string;
  disclaimer_accepted_at: string | null;
  email_alerts_enabled: boolean;
  tier: string;
  created_at: string;
}

const DEMO_SCENARIO_MAP: Record<string, number> = {
  "demo-calm": 0,
  "demo-caution": 1,
  "demo-danger": 2,
  "demo-crisis": 3,
};

const DEMO_MODES: DataMode[] = [
  "demo-calm",
  "demo-caution",
  "demo-danger",
  "demo-crisis",
];

interface LiveData {
  indicators: IndicatorState[];
  score: number;
  level: ReturnType<typeof getAlertLevel>;
  summary: string;
  history: HistoryPoint[];
  lastUpdated: string | null;
  meta: { live: number; total: number };
  previousScore: number | null;
  previousIndicators: Record<string, number> | null;
}

interface DoomDashboardProps {
  user?: User | null;
  profile?: UserProfile | null;
}

export default function DoomDashboard({ user, profile }: DoomDashboardProps = {}) {
  const [dataMode, setDataMode] = useState<DataMode>("loading");
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [detailIndicatorId, setDetailIndicatorId] = useState<string | null>(
    null
  );
  const [showMethodology, setShowMethodology] = useState(false);

  // ---------------------------------------------------------------------------
  // Derive scenario index from dataMode (for demo modes + fallback)
  // ---------------------------------------------------------------------------
  const scenarioIndex = useMemo(() => {
    if (dataMode in DEMO_SCENARIO_MAP) return DEMO_SCENARIO_MAP[dataMode];
    return 1; // "current" with no live data → caution fallback
  }, [dataMode]);

  // ---------------------------------------------------------------------------
  // Demo data (used for demo modes + current fallback)
  // ---------------------------------------------------------------------------
  const demoIndicators = useMemo(
    () => buildIndicators(scenarioIndex),
    [scenarioIndex]
  );
  const demoScore = useMemo(
    () => calcDoomScore(demoIndicators),
    [demoIndicators]
  );
  const demoLevel = useMemo(() => getAlertLevel(demoScore), [demoScore]);
  const demoHistory = useMemo(
    () => buildHistory(scenarioIndex),
    [scenarioIndex]
  );
  const demoSummary = useMemo(
    () => generateSummary(demoIndicators, demoScore),
    [demoIndicators, demoScore]
  );

  // ---------------------------------------------------------------------------
  // Live data fetch
  // ---------------------------------------------------------------------------
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/indicators");
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();

      const score = data.score as number;
      const level = getAlertLevel(score);

      setLiveData({
        indicators: data.indicators,
        score,
        level,
        summary: data.summary,
        history: data.history,
        lastUpdated: data.lastUpdated,
        meta: data.meta,
        previousScore: data.previousScore ?? null,
        previousIndicators: data.previousIndicators ?? null,
      });
      setDataMode("current");
    } catch {
      // API unavailable — show current mode (will use caution demo as fallback)
      setDataMode("current");
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // ---------------------------------------------------------------------------
  // Resolved data — live or demo
  // ---------------------------------------------------------------------------
  const isLive = dataMode === "current" && liveData !== null;

  const indicators = isLive ? liveData.indicators : demoIndicators;
  const score = isLive ? liveData.score : demoScore;
  const level = isLive ? liveData.level : demoLevel;
  const history = isLive ? liveData.history : demoHistory;
  const summary = isLive ? liveData.summary : demoSummary;
  const lastUpdated = isLive ? liveData.lastUpdated : null;
  const meta = isLive ? liveData.meta : null;

  // ---------------------------------------------------------------------------
  // Score delta + biggest mover (live mode only)
  // ---------------------------------------------------------------------------
  const scoreDelta = useMemo(() => {
    if (!isLive || liveData.previousScore === null) return null;
    return score - liveData.previousScore;
  }, [isLive, liveData, score]);

  const biggestMove = useMemo(() => {
    if (!isLive || !liveData.previousIndicators) return null;

    let maxChange = 0;
    let result: {
      name: string;
      change: number;
      oldPct: number;
      newPct: number;
    } | null = null;

    for (const ind of indicators) {
      const prevActivation = liveData.previousIndicators[ind.id];
      if (prevActivation === undefined) continue;

      const newPct = Math.round(ind.activation * 100);
      const oldPct = Math.round(prevActivation * 100);
      const absChange = Math.abs(newPct - oldPct);

      if (absChange > maxChange) {
        maxChange = absChange;
        result = {
          name: ind.name,
          change: newPct - oldPct,
          oldPct,
          newPct,
        };
      }
    }

    return maxChange > 5 ? result : null;
  }, [isLive, liveData, indicators]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts + expanded row reset
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "c" || e.key === "C") {
        setDataMode("current");
      }
      if (e.key === "d" || e.key === "D") {
        setDataMode((prev) => {
          const idx = DEMO_MODES.indexOf(prev as DataMode);
          return DEMO_MODES[(idx + 1) % DEMO_MODES.length];
        });
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    setDetailIndicatorId(null);
  }, [dataMode]);

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------
  if (dataMode === "loading") {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-[720px] mx-auto px-5">
          <nav
            className="flex justify-between items-center"
            style={{
              padding: "20px 0",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: colors.borderLight,
                }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                }}
              >
                Doom Watcher
              </span>
            </div>
          </nav>
          <div className="flex flex-col items-center" style={{ padding: "48px 0" }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: colors.borderLight,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 120,
                height: 32,
                borderRadius: 24,
                background: colors.borderLight,
                marginTop: 20,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 320,
                height: 48,
                borderRadius: 8,
                background: colors.borderLight,
                marginTop: 16,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const isDemo = dataMode.startsWith("demo-");
  const showFallbackBanner = dataMode === "current" && !liveData;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-5">
        {/* Navigation Bar */}
        <nav
          className="flex justify-between items-center"
          style={{
            padding: "20px 0",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: level.color,
                transition: "background 0.5s ease",
              }}
            >
              <span
                style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}
              >
                D
              </span>
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: "-0.01em",
              }}
            >
              Doom Watcher
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowMethodology((prev) => !prev)}
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                color: colors.textSecondary,
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = colors.surfaceAlt;
                el.style.borderColor = colors.textFaint;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "none";
                el.style.borderColor = colors.border;
              }}
            >
              How it works
            </button>
            {user && (
              <>
                <Link
                  href="/settings"
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: colors.textSecondary,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  Settings
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    style={{
                      background: "none",
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 13,
                      color: colors.textSecondary,
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = colors.surfaceAlt;
                      el.style.borderColor = colors.textFaint;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "none";
                      el.style.borderColor = colors.border;
                    }}
                  >
                    Sign Out
                  </button>
                </form>
              </>
            )}
          </div>
        </nav>

        {showMethodology && (
          <MethodologyPanel onClose={() => setShowMethodology(false)} />
        )}

        <HeroSection
          score={score}
          level={level}
          summary={summary}
          dataMode={dataMode}
          onDataModeChange={setDataMode}
          lastUpdated={lastUpdated}
          hasLiveData={liveData !== null}
          scoreDelta={scoreDelta}
        />

        {/* Demo mode banner */}
        {isDemo && (
          <div
            style={{
              background: alertColors.amber.bg,
              border: `1px solid ${alertColors.amber.border}`,
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: alertColors.amber.primary }}>
              Viewing demo scenario — not live data
            </span>
            <button
              onClick={() => setDataMode("current")}
              style={{
                background: "none",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                color: alertColors.amber.primary,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Return to Current
            </button>
          </div>
        )}

        {/* Fallback banner when current mode but no live data */}
        {showFallbackBanner && (
          <div
            style={{
              background: colors.surfaceAlt,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: "10px 16px",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              Live data will appear after the first daily update
            </span>
          </div>
        )}

        {/* What changed — biggest mover */}
        {biggestMove && (
          <div
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              padding: "8px 0 4px",
            }}
          >
            Biggest move:{" "}
            <strong style={{ color: colors.text }}>{biggestMove.name}</strong>{" "}
            <span
              style={{
                color:
                  biggestMove.change > 0
                    ? alertColors.red.primary
                    : alertColors.green.primary,
              }}
            >
              {biggestMove.change > 0 ? "\u2191" : "\u2193"}
              {Math.abs(biggestMove.change)}%
            </span>{" "}
            <span style={{ color: colors.textMuted }}>
              (from {biggestMove.oldPct}% to {biggestMove.newPct}%)
            </span>
          </div>
        )}

        <QuickStats indicators={indicators} history={history} />
        <HistoryChart history={history} level={level} />
        <DriverCards indicators={indicators} />
        <IndicatorList
          indicators={indicators}
          onOpenDetail={(id) => setDetailIndicatorId(id)}
        />
        <Footer meta={meta} />
      </div>

      <DisclaimerModal profile={profile} />

      {/* Indicator Detail Modal */}
      {detailIndicatorId &&
        (() => {
          const ind = indicators.find((i) => i.id === detailIndicatorId);
          return ind ? (
            <IndicatorDetailModal
              indicator={ind}
              onClose={() => setDetailIndicatorId(null)}
            />
          ) : null;
        })()}
    </div>
  );
}
