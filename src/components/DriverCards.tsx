import { Shield } from "lucide-react";
import type { IndicatorState } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import { getDotColor } from "@/lib/utils";
import Sparkline from "./Sparkline";
import TrendIcon from "./ui/TrendIcon";

interface DriverCardsProps {
  indicators: IndicatorState[];
}

function shortDescription(desc: string): string {
  const dash = desc.indexOf("\u2014");
  if (dash > 0) return desc.slice(0, dash).trim();
  const period = desc.indexOf(".");
  if (period > 0) return desc.slice(0, period + 1);
  return desc;
}

export default function DriverCards({ indicators }: DriverCardsProps) {
  const drivers = [...indicators]
    .filter((i) => i.activation > 0.1)
    .sort((a, b) => b.activation * b.weight - a.activation * a.weight)
    .slice(0, 5);

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 14,
        }}
      >
        What&apos;s driving the score
      </div>

      {drivers.length < 2 ? (
        <div
          className="flex flex-col items-center justify-center gap-3"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: "40px 16px",
          }}
        >
          <Shield size={24} color={colors.textFaint} />
          <span
            style={{ fontSize: 14, color: colors.textMuted, fontWeight: 500 }}
          >
            No significant stress signals
          </span>
        </div>
      ) : (
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {drivers.map((ind, i) => {
            const dotCol = getDotColor(ind.activation);
            return (
              <div
                key={ind.id}
                className="group animate-fadeUp"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  padding: 16,
                  transition: "border-color 0.2s",
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "both",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    `${dotCol}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    colors.border;
                }}
              >
                {/* Row 1: dot + name + trend icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="rounded-full shrink-0"
                      style={{
                        width: 8,
                        height: 8,
                        background: dotCol,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: colors.text,
                      }}
                    >
                      {ind.name}
                    </span>
                  </div>
                  <TrendIcon trend={ind.trend} />
                </div>

                {/* Row 2: description + sparkline */}
                <div className="flex items-end justify-between gap-3 mb-3">
                  <span
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      lineHeight: 1.5,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {shortDescription(ind.description)}
                  </span>
                  <Sparkline
                    data={ind.sparkData}
                    color={dotCol}
                    width={72}
                    height={28}
                  />
                </div>

                {/* Row 3: activation bar */}
                <div
                  style={{
                    width: "100%",
                    height: 3,
                    background: colors.borderLight,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${ind.activation * 100}%`,
                      height: "100%",
                      background: dotCol,
                      borderRadius: 2,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
