import type { IndicatorState } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import { getDotColor } from "@/lib/utils";
import {
  formatIndicatorValue,
  getActivationDescription,
  getZoneName,
  getNormalRange,
  getCriticalLevel,
} from "@/lib/format";

interface Props {
  indicator: IndicatorState;
  below?: boolean;
}

export default function IndicatorTooltip({
  indicator,
  below = false,
}: Props) {
  const pct = Math.round(indicator.activation * 100);
  const dotColor = getDotColor(indicator.activation);
  const unavailable = indicator.status === "unavailable";

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 12,
        padding: "14px 16px",
        width: 300,
        boxShadow:
          "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        border: `1px solid ${colors.borderLight}`,
        position: "relative",
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          width: 10,
          height: 10,
          background: colors.surface,
          borderRight: `1px solid ${colors.borderLight}`,
          borderBottom: `1px solid ${colors.borderLight}`,
          ...(below
            ? {
                top: -6,
                transform: "translateX(-50%) rotate(225deg)",
              }
            : {
                bottom: -6,
                transform: "translateX(-50%) rotate(45deg)",
              }),
        }}
      />

      {/* Name */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {indicator.name}
      </div>

      {/* Current value */}
      <div
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          marginBottom: 6,
        }}
      >
        Current value:{" "}
        <strong style={{ color: colors.text }}>
          {unavailable
            ? "No data"
            : formatIndicatorValue(indicator.id, indicator.value)}
        </strong>
      </div>

      {/* Normal range */}
      <div
        style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}
      >
        Normal range: {getNormalRange(indicator)}
      </div>

      {/* Critical level */}
      <div
        style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}
      >
        Critical level: {getCriticalLevel(indicator)}
      </div>

      {!unavailable && (
        <>
          {/* Activation bar */}
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: colors.borderLight,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 2,
                background: dotColor,
              }}
            />
          </div>

          {/* Plain English description */}
          <div
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
          >
            {pct}% of the way from normal to critical
          </div>

          {/* Zone label */}
          <div
            style={{
              fontSize: 12,
              color: colors.textMuted,
              marginBottom: 10,
            }}
          >
            {getActivationDescription(pct)} — in the{" "}
            <strong style={{ color: dotColor }}>
              {getZoneName(indicator.activation)}
            </strong>{" "}
            zone
          </div>
        </>
      )}

      {unavailable && (
        <div
          style={{
            fontSize: 12,
            color: colors.textMuted,
            marginBottom: 10,
          }}
        >
          Data not yet available
        </div>
      )}

      {/* Click prompt */}
      <div style={{ fontSize: 12, color: colors.textFaint }}>
        Click for full details →
      </div>
    </div>
  );
}
