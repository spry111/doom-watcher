import { ChevronRight } from "lucide-react";
import type { IndicatorState } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import { getDotColor } from "@/lib/utils";
import StatusDot from "./ui/StatusDot";
import SignalLabel from "./ui/SignalLabel";
import TrendBadge from "./ui/TrendBadge";
import ActivationBar from "./ui/ActivationBar";
import Sparkline from "./Sparkline";

interface IndicatorRowProps {
  indicator: IndicatorState;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}

export default function IndicatorRow({
  indicator,
  isExpanded,
  isLast,
  onToggle,
}: IndicatorRowProps) {
  const isActive = indicator.activation >= 0.15;
  const dotCol = getDotColor(indicator.activation);

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : `1px solid ${colors.borderLight}`,
      }}
    >
      {/* Compact row — uses .indicator-grid from globals.css for responsive */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="indicator-grid"
        style={{
          background: isExpanded ? colors.surfaceAlt : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isExpanded)
            (e.currentTarget as HTMLDivElement).style.background = `${colors.surfaceAlt}80`;
        }}
        onMouseLeave={(e) => {
          if (!isExpanded)
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        {/* Col 1: dot + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot color={isActive ? dotCol : colors.textFaint} />
          <span
            className="truncate"
            style={{
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? colors.text : colors.textMuted,
            }}
          >
            {indicator.name}
          </span>
        </div>

        {/* Col 2: sparkline — hidden on mobile */}
        <div className="hidden sm:flex justify-end">
          <Sparkline
            data={indicator.sparkData}
            color={isActive ? dotCol : colors.textFaint}
          />
        </div>

        {/* Col 3: signal label */}
        <div className="text-right">
          <SignalLabel activation={indicator.activation} />
        </div>

        {/* Col 4: chevron */}
        <div className="flex justify-end">
          <ChevronRight
            size={14}
            color={colors.textFaint}
            style={{
              transition: "transform 0.2s",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div
          className="animate-fadeUp"
          style={{
            padding: "0 18px 16px 36px",
            background: colors.surfaceAlt,
          }}
        >
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.65,
              color: colors.textSecondary,
              marginBottom: 12,
            }}
          >
            {indicator.description}
          </p>

          <div
            className="flex items-center gap-4"
            style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}
          >
            <TrendBadge trend={indicator.trend} />
            <span>Weight: {indicator.weight}/9</span>
          </div>

          <ActivationBar activation={indicator.activation} color={dotCol} />
        </div>
      )}
    </div>
  );
}
