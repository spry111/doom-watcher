import { useMemo, useState } from "react";
import type { IndicatorState } from "@/engine/types";
import { calcDoomScore } from "@/engine/engine";
import { colors, TOTAL_WEIGHT } from "@/lib/design-tokens";

interface ExplainabilityPanelProps {
  indicators: IndicatorState[];
  previousScenarioIndicators: IndicatorState[];
  previousScenarioLabel: string;
}

export default function ExplainabilityPanel({
  indicators,
  previousScenarioIndicators,
  previousScenarioLabel,
}: ExplainabilityPanelProps) {
  const [selectedId, setSelectedId] = useState(indicators[0]?.id ?? "");
  const [shockPct, setShockPct] = useState(-0.1);

  const contributionRows = useMemo(() => {
    return [...indicators]
      .map((ind) => {
        const weightedActivation = ind.activation * ind.weight;
        const scoreContribution = (weightedActivation / TOTAL_WEIGHT) * 100;
        return {
          ...ind,
          weightedActivation,
          scoreContribution,
        };
      })
      .sort((a, b) => b.scoreContribution - a.scoreContribution);
  }, [indicators]);

  const scenarioDiffRows = useMemo(() => {
    const prevById = new Map(previousScenarioIndicators.map((i) => [i.id, i]));

    return indicators
      .map((ind) => {
        const prev = prevById.get(ind.id);
        const prevContribution = prev
          ? ((prev.activation * prev.weight) / TOTAL_WEIGHT) * 100
          : 0;
        const nowContribution = ((ind.activation * ind.weight) / TOTAL_WEIGHT) * 100;

        return {
          id: ind.id,
          name: ind.name,
          contributionDelta: nowContribution - prevContribution,
          priorPeriodDelta: (ind.sparkData[ind.sparkData.length - 1] - ind.sparkData[0]) * 100,
        };
      })
      .sort((a, b) => Math.abs(b.contributionDelta) - Math.abs(a.contributionDelta))
      .slice(0, 5);
  }, [indicators, previousScenarioIndicators]);

  const sensitivity = useMemo(() => {
    const target = indicators.find((i) => i.id === selectedId) ?? indicators[0];
    if (!target) {
      return { baseScore: 0, shockedScore: 0, delta: 0, targetName: "" };
    }

    const baseScore = calcDoomScore(indicators);
    const shockedIndicators = indicators.map((ind) => {
      if (ind.id !== target.id) return ind;
      const shockedActivation = Math.min(Math.max(ind.activation * (1 + shockPct), 0), 1);
      return { ...ind, activation: shockedActivation };
    });

    const shockedScore = calcDoomScore(shockedIndicators);
    return {
      baseScore,
      shockedScore,
      delta: shockedScore - baseScore,
      targetName: target.name,
    };
  }, [indicators, selectedId, shockPct]);

  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 10 }}>
        Explainability
      </h3>

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Score contribution table (weight × normalized value)</div>
        <div className="grid grid-cols-12" style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
          <span className="col-span-4">Indicator</span>
          <span className="col-span-2 text-right">Weight</span>
          <span className="col-span-3 text-right">Activation</span>
          <span className="col-span-3 text-right">Score pts</span>
        </div>
        {contributionRows.map((row) => (
          <div key={row.id} className="grid grid-cols-12" style={{ fontSize: 12, padding: "6px 0", borderTop: `1px solid ${colors.borderLight}` }}>
            <span className="col-span-4" style={{ color: colors.text }}>{row.name}</span>
            <span className="col-span-2 text-right" style={{ color: colors.textSecondary }}>{row.weight.toFixed(1)}</span>
            <span className="col-span-3 text-right" style={{ color: colors.textSecondary }}>{row.activation.toFixed(2)}</span>
            <span className="col-span-3 text-right" style={{ color: colors.text, fontWeight: 600 }}>{row.scoreContribution.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
          What changed (vs {previousScenarioLabel} scenario and prior period)
        </div>
        {scenarioDiffRows.map((row) => (
          <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 8, fontSize: 12, padding: "6px 0", borderTop: `1px solid ${colors.borderLight}` }}>
            <span style={{ color: colors.text }}>{row.name}</span>
            <span style={{ color: row.contributionDelta >= 0 ? "#B45309" : "#1B9E6F", textAlign: "right" }}>
              {row.contributionDelta >= 0 ? "+" : ""}{row.contributionDelta.toFixed(1)} pts
            </span>
            <span style={{ color: row.priorPeriodDelta >= 0 ? "#B45309" : "#1B9E6F", textAlign: "right" }}>
              {row.priorPeriodDelta >= 0 ? "+" : ""}{row.priorPeriodDelta.toFixed(1)} pp
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Sensitivity toggle (shock one indicator by ±10%)</div>
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 10 }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 8px", fontSize: 12, color: colors.text }}
          >
            {indicators.map((ind) => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
          <button onClick={() => setShockPct(-0.1)} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 12 }}>-10%</button>
          <button onClick={() => setShockPct(0)} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 12 }}>Base</button>
          <button onClick={() => setShockPct(0.1)} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 12 }}>+10%</button>
        </div>
        <div style={{ fontSize: 12, color: colors.textSecondary }}>
          {sensitivity.targetName}: score {sensitivity.baseScore} → {sensitivity.shockedScore} ({sensitivity.delta >= 0 ? "+" : ""}{sensitivity.delta})
        </div>
      </div>
    </section>
  );
}
