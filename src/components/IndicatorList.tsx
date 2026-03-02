import type { IndicatorState } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import IndicatorRow from "./IndicatorRow";

interface IndicatorListProps {
  indicators: IndicatorState[];
  onOpenDetail: (id: string) => void;
}

export default function IndicatorList({
  indicators,
  onOpenDetail,
}: IndicatorListProps) {
  const sorted = [...indicators].sort(
    (a, b) => b.activation * b.weight - a.activation * a.weight
  );
  const elevatedCount = indicators.filter((i) => i.activation >= 0.15).length;

  return (
    <section style={{ marginBottom: 48 }}>
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: 14 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
          All Indicators
        </span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          {elevatedCount} elevated
        </span>
      </div>

      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {sorted.map((ind, idx) => (
          <div
            key={ind.id}
            className="animate-fadeUp"
            style={{
              animationDelay: `${idx * 40}ms`,
              animationFillMode: "both",
            }}
          >
            <IndicatorRow
              indicator={ind}
              isLast={idx === sorted.length - 1}
              onOpenDetail={() => onOpenDetail(ind.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
