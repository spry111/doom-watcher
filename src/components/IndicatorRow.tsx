"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import type { IndicatorState } from "@/engine/types";
import { colors } from "@/lib/design-tokens";
import { getDotColor } from "@/lib/utils";
import { formatIndicatorValue } from "@/lib/format";
import StatusDot from "./ui/StatusDot";
import SignalLabel from "./ui/SignalLabel";
import Sparkline from "./Sparkline";
import IndicatorTooltip from "./IndicatorTooltip";

interface IndicatorRowProps {
  indicator: IndicatorState;
  isLast: boolean;
  onOpenDetail: () => void;
}

function getFreshnessLabel(indicator: IndicatorState): string | null {
  if (!indicator.status) return null; // demo mode
  if (indicator.status === "unavailable") return "Coming soon";
  if (!indicator.lastFetched) {
    // Cached but no timestamp — show frequency for monthly
    if (indicator.status === "cached" && indicator.frequency === "Monthly")
      return "Monthly";
    return indicator.status === "cached" ? "Cached" : null;
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(indicator.lastFetched).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSince === 0) return null;
  if (indicator.frequency === "Monthly" && daysSince <= 35) return "Monthly";
  if (daysSince <= 7) return `${daysSince}d ago`;
  return `${daysSince}d ago`;
}

export default function IndicatorRow({
  indicator,
  isLast,
  onOpenDetail,
}: IndicatorRowProps) {
  const isUnavailable = indicator.status === "unavailable";
  const isActive = !isUnavailable;
  const dotCol = getDotColor(indicator.activation);
  const freshnessLabel = getFreshnessLabel(indicator);

  // Hover + tooltip state
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, below: false });
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const rowRef = useRef<HTMLDivElement>(null);

  // Hide tooltip on scroll
  useEffect(() => {
    if (!showTooltip) return;
    const hide = () => setShowTooltip(false);
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [showTooltip]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);

    // Desktop-only tooltip with 300ms delay
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      hoverTimer.current = setTimeout(() => {
        if (rowRef.current) {
          const rect = rowRef.current.getBoundingClientRect();
          const below = rect.top < 280;
          setTooltipPos({
            x: Math.max(
              160,
              Math.min(rect.left + rect.width / 2, window.innerWidth - 160)
            ),
            y: below ? rect.bottom : rect.top,
            below,
          });
        }
        setShowTooltip(true);
      }, 300);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    clearTimeout(hoverTimer.current);
    setShowTooltip(false);
  }, []);

  const handleClick = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setShowTooltip(false);
    onOpenDetail();
  }, [onOpenDetail]);

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : `1px solid ${colors.borderLight}`,
        position: "relative",
      }}
    >
      {/* Compact row */}
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="indicator-grid"
        style={{
          background: isHovering ? `${colors.surfaceAlt}80` : "transparent",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Col 1: dot + name + freshness */}
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
          {freshnessLabel && (
            <span
              style={{
                fontSize: 10,
                color: colors.textFaint,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {freshnessLabel}
            </span>
          )}
        </div>

        {/* Col 2: sparkline — hidden on mobile */}
        <div className="hidden sm:flex justify-end">
          <Sparkline
            data={indicator.sparkData}
            color={isActive ? dotCol : colors.textFaint}
          />
        </div>

        {/* Col 3: signal label + formatted value */}
        <div className="text-right">
          <SignalLabel activation={indicator.activation} />
          <div
            style={{
              fontSize: 11,
              color: colors.textMuted,
              marginTop: 2,
            }}
          >
            {isUnavailable
              ? "\u2014"
              : formatIndicatorValue(indicator.id, indicator.value)}
          </div>
        </div>

        {/* Col 4: chevron */}
        <div className="flex justify-end">
          <ChevronRight size={14} color={colors.textFaint} />
        </div>
      </div>

      {/* Desktop tooltip (portal to body) */}
      {showTooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.below
                ? tooltipPos.y + 8
                : tooltipPos.y - 8,
              transform: tooltipPos.below
                ? "translateX(-50%)"
                : "translateX(-50%) translateY(-100%)",
              zIndex: 9000,
              pointerEvents: "none",
              animation: "fadeIn 0.15s ease",
            }}
          >
            <IndicatorTooltip
              indicator={indicator}
              below={tooltipPos.below}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
