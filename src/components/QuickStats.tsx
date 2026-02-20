import type { IndicatorState, HistoryPoint } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import { getSignalLabel } from "@/lib/utils";

interface QuickStatsProps {
  indicators: IndicatorState[];
  history: HistoryPoint[];
}

export default function QuickStats({ indicators, history }: QuickStatsProps) {
  const activeCount = indicators.filter((i) => i.activation > 0.15).length;

  const activityLabel =
    activeCount <= 2
      ? "Low activity"
      : activeCount <= 6
        ? "Moderate"
        : "Elevated";

  const recent = history[history.length - 1]?.score ?? 0;
  const twoWeeksAgo = history[history.length - 15]?.score ?? recent;
  const trendValue =
    recent > twoWeeksAgo + 2
      ? "Worsening"
      : recent < twoWeeksAgo - 2
        ? "Improving"
        : "Flat";

  const sorted = [...indicators].sort(
    (a, b) => b.activation * b.weight - a.activation * a.weight
  );
  const top = sorted[0];
  const hasTop = top && top.activation > 0.15;
  const topSignal = hasTop ? getSignalLabel(top.activation) : null;

  const cards = [
    {
      label: "Signals Active",
      value: `${activeCount} of 12`,
      sub: activityLabel,
    },
    {
      label: "Trend",
      value: trendValue,
      sub: "vs. 2 weeks ago",
    },
    {
      label: "Highest Signal",
      value: hasTop ? top.name : "None",
      sub: topSignal ? topSignal.text : "All clear",
    },
  ];

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      style={{ marginBottom: 28 }}
    >
      {cards.map((stat, i) => (
        <div
          key={i}
          className="animate-fadeUp"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: "16px 18px",
            animationDelay: `${i * 0.06}s`,
            animationFillMode: "both",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: colors.textMuted,
              fontWeight: 500,
              marginBottom: 6,
              letterSpacing: "0.02em",
            }}
          >
            {stat.label}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: colors.text,
              marginBottom: 2,
            }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.sub}</div>
        </div>
      ))}
    </section>
  );
}
