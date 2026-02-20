import type { AlertLevel } from "@/engine/types";
import { SCENARIOS } from "@/engine/scenarios";
import { colors } from "@/lib/design-tokens";

const RING_SIZE = 180;
const RING_RADIUS = 82;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface HeroSectionProps {
  score: number;
  level: AlertLevel;
  summary: string;
  scenarioIndex: number;
  onScenarioChange: (index: number) => void;
}

export default function HeroSection({
  score,
  level,
  summary,
  scenarioIndex,
  onScenarioChange,
}: HeroSectionProps) {
  const arcLength = (score / 100) * RING_CIRCUMFERENCE;
  const shouldPulse = score >= 55;

  return (
    <section className="flex flex-col items-center" style={{ padding: "32px 0 36px" }}>
      {/* padding reduced from 48px for mobile; hero stays above fold */}
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

      {/* Summary */}
      <p
        className="text-center"
        style={{
          marginTop: 16,
          maxWidth: 480,
          fontSize: 15,
          lineHeight: 1.65,
          color: colors.textSecondary,
        }}
      >
        {summary}
      </p>

      {/* Scenario Switcher */}
      <div
        className="flex flex-wrap justify-center gap-1.5"
        style={{
          marginTop: 24,
          padding: 4,
          background: colors.surfaceAlt,
          borderRadius: 12,
        }}
      >
        {SCENARIOS.map((sc, i) => {
          const isActive = i === scenarioIndex;
          return (
            <button
              key={sc.key}
              onClick={() => onScenarioChange(i)}
              style={{
                padding: "7px 16px",
                borderRadius: 9,
                border: "none",
                background: isActive ? colors.surface : "transparent",
                boxShadow: isActive
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? level.color : colors.textMuted,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p
        style={{
          fontSize: 11,
          color: colors.textFaint,
          marginTop: 8,
        }}
      >
        Demo scenarios — switch to see different conditions
      </p>
    </section>
  );
}
