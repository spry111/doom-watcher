"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from "recharts";
import type { IndicatorState } from "@/engine/types";
import { colors, alertColors } from "@/lib/design-tokens";
import { getDotColor } from "@/lib/utils";
import { formatIndicatorValue, getZoneName } from "@/lib/format";
import { INDICATOR_DETAILS } from "@/data/indicator-details";

interface Props {
  indicator: IndicatorState;
  onClose: () => void;
}

const ZONE_COLORS = [
  alertColors.green.primary,
  alertColors.amber.primary,
  alertColors.orange.primary,
  alertColors.red.primary,
];

const ZONE_BG_COLORS = [
  alertColors.green.bg,
  alertColors.amber.bg,
  alertColors.orange.bg,
  alertColors.red.bg,
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        color: colors.textMuted,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function ChartTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <div
      style={{
        background: "rgba(15,15,15,0.82)",
        color: "#fff",
        borderRadius: 6,
        padding: "4px 9px",
        fontSize: 12,
        fontWeight: 600,
        pointerEvents: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      {Math.round(v * 100)}%
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: colors.borderLight,
        margin: "20px 0",
      }}
    />
  );
}

export default function IndicatorDetailModal({ indicator, onClose }: Props) {
  const detail = INDICATOR_DETAILS[indicator.id];
  const pct = Math.round(indicator.activation * 100);
  const dotColor = getDotColor(indicator.activation);
  const zoneName = getZoneName(indicator.activation);
  const unavailable = indicator.status === "unavailable";

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Find which zone index is active
  const activeZoneIdx =
    pct < 15 ? 0 : pct < 40 ? 1 : pct < 70 ? 2 : 3;

  // Sparkline data for larger chart
  const chartData = indicator.sparkData.map((v, i) => ({ i, v }));

  return (
    <div
      className="detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="detail-modal"
        role="dialog"
        aria-label={`${indicator.name} details`}
      >
        {/* Mobile drag handle */}
        <div className="detail-handle" />

        <div style={{ padding: "24px 24px 28px" }}>
          {/* Header */}
          <div
            className="flex items-start justify-between"
            style={{ marginBottom: 20 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {indicator.name}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                {indicator.technicalName}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: colors.surfaceAlt,
                border: "none",
                borderRadius: 8,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              <X size={16} color={colors.textMuted} />
            </button>
          </div>

          {/* Value + Activation */}
          <div
            style={{
              background: colors.surfaceAlt,
              borderRadius: 12,
              padding: "16px 18px",
              marginBottom: 4,
            }}
          >
            {!unavailable ? (
              <>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: 12,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatIndicatorValue(indicator.id, indicator.value)}
                </div>
                <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: colors.borderLight,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: dotColor,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: dotColor,
                      minWidth: 36,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: ZONE_BG_COLORS[activeZoneIdx],
                    fontSize: 12,
                    fontWeight: 600,
                    color: ZONE_COLORS[activeZoneIdx],
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ZONE_COLORS[activeZoneIdx],
                    }}
                  />
                  {zoneName} zone
                </div>
              </>
            ) : (
              <div style={{ padding: "8px 0" }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: colors.textMuted,
                    marginBottom: 6,
                  }}
                >
                  Data not yet available
                </div>
                <p style={{ fontSize: 13, color: colors.textFaint }}>
                  This indicator will be added in a future update
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* What this measures */}
          {detail && (
            <>
              <SectionTitle>What this measures</SectionTitle>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: colors.textSecondary,
                }}
              >
                {detail.extendedDescription}
              </p>

              <Divider />

              {/* Threshold zones */}
              <SectionTitle>Threshold zones</SectionTitle>

              {/* Visual zone bar */}
              <div style={{ marginBottom: 16 }}>
                {/* Marker */}
                {!unavailable && (
                  <div
                    style={{
                      position: "relative",
                      height: 14,
                      marginBottom: 2,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${Math.max(2, Math.min(pct, 98))}%`,
                        transform: "translateX(-50%)",
                        bottom: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: colors.surface,
                          border: `2.5px solid ${colors.text}`,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Zone bar segments */}
                <div
                  style={{
                    display: "flex",
                    height: 8,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ width: "15%", background: alertColors.green.primary, opacity: 0.7 }}
                  />
                  <div
                    style={{ width: "25%", background: alertColors.amber.primary, opacity: 0.7 }}
                  />
                  <div
                    style={{ width: "30%", background: alertColors.orange.primary, opacity: 0.7 }}
                  />
                  <div
                    style={{ width: "30%", background: alertColors.red.primary, opacity: 0.7 }}
                  />
                </div>

                {/* Zone labels under bar */}
                <div
                  style={{
                    display: "flex",
                    marginTop: 4,
                    fontSize: 10,
                    color: colors.textFaint,
                  }}
                >
                  <span style={{ width: "15%" }}>Normal</span>
                  <span style={{ width: "25%" }}>Elevated</span>
                  <span style={{ width: "30%" }}>Stressed</span>
                  <span style={{ width: "30%", textAlign: "right" }}>
                    Critical
                  </span>
                </div>
              </div>

              {/* Zone descriptions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detail.zones.map((zone, idx) => {
                  const isActive = idx === activeZoneIdx && !unavailable;
                  return (
                    <div
                      key={zone.name}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: isActive
                          ? ZONE_BG_COLORS[idx]
                          : "transparent",
                        border: isActive
                          ? `1px solid ${ZONE_COLORS[idx]}20`
                          : `1px solid ${colors.borderLight}`,
                      }}
                    >
                      <div
                        className="flex items-center gap-2"
                        style={{ marginBottom: 3 }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: ZONE_COLORS[idx],
                            opacity: isActive ? 1 : 0.5,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isActive
                              ? ZONE_COLORS[idx]
                              : colors.textMuted,
                          }}
                        >
                          {zone.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: colors.textFaint,
                            marginLeft: "auto",
                          }}
                        >
                          {zone.range}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: isActive
                            ? colors.textSecondary
                            : colors.textMuted,
                          paddingLeft: 14,
                        }}
                      >
                        {zone.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Divider />
            </>
          )}

          {/* Historical sparkline (larger) */}
          {!unavailable && (
            <>
              <SectionTitle>Recent trend</SectionTitle>
              <div
                style={{
                  height: 200,
                  background: colors.surfaceAlt,
                  borderRadius: 10,
                  padding: "12px 8px 8px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                  >
                    <defs>
                      <linearGradient
                        id="detailGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={dotColor}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor={dotColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis domain={[0, 1]} hide />
                    <Tooltip
                      content={<ChartTooltipContent />}
                      cursor={{
                        stroke: colors.textMuted,
                        strokeWidth: 1,
                        strokeDasharray: "4 2",
                      }}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={dotColor}
                      strokeWidth={2}
                      fill="url(#detailGradient)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <Divider />
            </>
          )}

          {/* Source */}
          <SectionTitle>Source</SectionTitle>
          <div
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            {indicator.source} &middot; {indicator.frequency}
          </div>
          {detail && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {detail.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textMuted;
                  }}
                >
                  <ExternalLink size={12} />
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <Divider />

          {/* Weight */}
          <SectionTitle>Weight in Doom Score</SectionTitle>
          <p style={{ fontSize: 14, color: colors.textSecondary }}>
            {indicator.weight} of 75 (
            {((indicator.weight / 75) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
}
