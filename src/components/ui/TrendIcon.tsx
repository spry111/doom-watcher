import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { alertColors, colors } from "@/lib/design-tokens";

interface TrendIconProps {
  trend: "improving" | "stable" | "worsening";
}

export default function TrendIcon({ trend }: TrendIconProps) {
  if (trend === "worsening")
    return <ArrowUpRight size={14} color={alertColors.orange.primary} />;
  if (trend === "improving")
    return <ArrowDownRight size={14} color={alertColors.green.primary} />;
  return <Minus size={14} color={colors.textMuted} />;
}
