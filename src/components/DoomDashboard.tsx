"use client";

import { useState, useMemo, useEffect } from "react";
import { buildIndicators, buildHistory } from "@/data/mock";
import { calcDoomScore, getAlertLevel, generateSummary } from "@/engine/engine";
import { colors } from "@/lib/design-tokens";
import HeroSection from "./HeroSection";
import QuickStats from "./QuickStats";
import HistoryChart from "./HistoryChart";
import DriverCards from "./DriverCards";
import IndicatorList from "./IndicatorList";
import MethodologyPanel from "./MethodologyPanel";
import Footer from "./Footer";

export default function DoomDashboard() {
  const [scenarioIndex, setScenarioIndex] = useState(1);
  const [expandedIndicatorId, setExpandedIndicatorId] = useState<string | null>(
    null
  );
  const [showMethodology, setShowMethodology] = useState(false);

  const indicators = useMemo(
    () => buildIndicators(scenarioIndex),
    [scenarioIndex]
  );
  const score = useMemo(() => calcDoomScore(indicators), [indicators]);
  const level = useMemo(() => getAlertLevel(score), [score]);
  const history = useMemo(
    () => buildHistory(scenarioIndex),
    [scenarioIndex]
  );
  const summary = useMemo(
    () => generateSummary(indicators, score),
    [indicators, score]
  );

  // D key shortcut to cycle scenarios
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "d" || e.key === "D") {
        setScenarioIndex((prev) => (prev + 1) % 4);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Reset expanded row when switching scenarios
  useEffect(() => {
    setExpandedIndicatorId(null);
  }, [scenarioIndex]);

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
        </nav>

        {showMethodology && (
          <MethodologyPanel onClose={() => setShowMethodology(false)} />
        )}

        <HeroSection
          score={score}
          level={level}
          summary={summary}
          scenarioIndex={scenarioIndex}
          onScenarioChange={setScenarioIndex}
        />
        <QuickStats indicators={indicators} history={history} />
        <HistoryChart history={history} level={level} />
        <DriverCards indicators={indicators} />
        <IndicatorList
          indicators={indicators}
          expandedId={expandedIndicatorId}
          onToggle={(id) =>
            setExpandedIndicatorId((prev) => (prev === id ? null : id))
          }
        />
        <Footer />
      </div>
    </div>
  );
}
