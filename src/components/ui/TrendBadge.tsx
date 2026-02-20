import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { alertColors, colors } from "@/lib/design-tokens";

interface TrendBadgeProps {
  trend: "improving" | "stable" | "worsening";
}

export default function TrendBadge({ trend }: TrendBadgeProps) {
  if (trend === "worsening") {
    return (
      <span
        className="inline-flex items-center gap-1"
        style={{ fontSize: 11, color: alertColors.orange.primary, fontWeight: 500 }}
      >
        <ArrowUpRight size={12} />
        Worsening
      </span>
    );
  }

  if (trend === "improving") {
    return (
      <span
        className="inline-flex items-center gap-1"
        style={{ fontSize: 11, color: alertColors.green.primary, fontWeight: 500 }}
      >
        <ArrowDownRight size={12} />
        Improving
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1"
      style={{ fontSize: 11, color: colors.textMuted }}
    >
      &mdash; Stable
    </span>
  );
}
