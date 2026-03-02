import type { AlertLevel, DataMode } from "@/engine/types";
import { colors, alertColors } from "@/lib/design-tokens";

const RING_SIZE = 180;
const RING_RADIUS = 82;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface HeroSectionProps {
  score: number;
  level: AlertLevel;
  summary: string;
  dataMode: DataMode;
  onDataModeChange: (mode: DataMode) => void;
  lastUpdated: string | null;
  hasLiveData: boolean;
  scoreDelta: number | null;
}

const DEMO_TABS: { mode: DataMode; label: string }[] = [
  { mode: "demo-calm", label: "Calm" },
  { mode: "demo-caution", label: "Caution" },
  { mode: "demo-danger", label: "Danger" },
  { mode: "demo-crisis", label: "Crisis" },
];

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HeroSection({
  score,
  level,
  summary,
  dataMode,
  onDataModeChange,
  lastUpdated,
  hasLiveData,
  scoreDelta,
}: HeroSectionProps) {
  const arcLength = (score / 100) * RING_CIRCUMFERENCE;
  const shouldPulse = score >= 55;
  const isCurrent = dataMode === "current";

  return (
    <section className="flex flex-col items-center" style={{ padding: "32px 0 36px" }}>
      {/* Score Ring */}
      <div
        className={shouldPulse ? "animate-subtlePulse" : ""}
        style={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="absolute top-0 left-0"
          aria-label={`Doom Score: ${score} out of 100. Level: ${level.name}`}
          role="img"
        >
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={RING_RADIUS}
            fill="none"
            stroke={colors.borderLight}
            strokeWidth="4"
          />
          {/* Progress arc */}
          <circle
            cx="90"
            cy="90"
            r={RING_RADIUS}
            fill="none"
            stroke={level.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${RING_CIRCUMFERENCE}`}
            transform="rotate(-90 90 90)"
            style={{
              transition: "stroke-dasharray 1s ease, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="leading-none"
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: colors.text,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: 12,
              color: colors.textMuted,
              marginTop: 4,
            }}
          >
            out of 100
          </span>
        </div>
      </div>

      {/* Level pill */}
      <div
        className="inline-flex items-center gap-1.5"
        style={{
          marginTop: 20,
          padding: "7px 18px",
          borderRadius: 24,
          background: level.bgColor,
          border: `1px solid ${level.borderColor}`,
          transition: "all 0.5s ease",
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: level.color,
            transition: "background 0.5s",
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: level.color,
            transition: "color 0.5s",
          }}
        >
          {level.name}
        </span>
      </div>

      {/* Score delta badge */}
      {isCurrent && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: colors.textMuted,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {scoreDelta !== null ? (
            scoreDelta === 0 ? (
              <span>No change since yesterday</span>
            ) : (
              <>
                <span
                  style={{
                    color:
                      scoreDelta > 0
                        ? alertColors.red.primary
                        : alertColors.green.primary,
                    fontWeight: 500,
                  }}
                >
                  {scoreDelta > 0 ? "\u2191" : "\u2193"}
                  {Math.abs(scoreDelta)}
                </span>
                <span>since yesterday</span>
              </>
            )
          ) : hasLiveData ? (
            <span>New \u2014 history will build daily</span>
          ) : null}
        </div>
      )}

      {/* Summary */}
      <p
        className="text-center"
        style={{
          marginTop: 12,
          maxWidth: 480,
          fontSize: 15,
          lineHeight: 1.65,
          color: colors.textSecondary,
        }}
      >
        {summary}
      </p>

      {/* Last updated timestamp (current mode with live data) */}
      {isCurrent && lastUpdated && (
        <p
          style={{
            fontSize: 11,
            color: colors.textFaint,
            marginTop: 16,
          }}
        >
          Last updated {formatLastUpdated(lastUpdated)}
        </p>
      )}

      {/* Data Mode Tabs */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Primary: Current tab */}
        <button
          onClick={() => onDataModeChange("current")}
          style={{
            padding: "8px 22px",
            borderRadius: 10,
            border: isCurrent
              ? `1.5px solid ${alertColors.green.border}`
              : `1px solid ${colors.border}`,
            background: isCurrent ? alertColors.green.bg : colors.surface,
            fontSize: 14,
            fontWeight: 600,
            color: isCurrent
              ? alertColors.green.primary
              : colors.textSecondary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            transition: "all 0.2s",
          }}
        >
          {hasLiveData && (
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: alertColors.green.primary,
                flexShrink: 0,
              }}
            />
          )}
          Current
        </button>

        {/* Divider label */}
        <span style={{ fontSize: 11, color: colors.textFaint, letterSpacing: "0.03em" }}>
          Demo scenarios
        </span>

        {/* Secondary: Demo tabs row */}
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: 3,
            background: colors.surfaceAlt,
            borderRadius: 9,
          }}
        >
          {DEMO_TABS.map(({ mode, label }) => {
            const isActive = dataMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onDataModeChange(mode)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 7,
                  border: "none",
                  background: isActive ? colors.surface : "transparent",
                  boxShadow: isActive
                    ? "0 1px 3px rgba(0,0,0,0.08)"
                    : "none",
                  fontSize: 12,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? colors.textSecondary : colors.textMuted,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
