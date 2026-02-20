import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { AlertLevel, HistoryPoint } from "@/engine/types";
import { colors, alertColors } from "@/lib/design-tokens";

interface HistoryChartProps {
  history: HistoryPoint[];
  level: AlertLevel;
}

export default function HistoryChart({ history, level }: HistoryChartProps) {
  return (
    <section
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: "20px 18px 12px",
        marginBottom: 28,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 14,
        }}
      >
        90-Day Trend
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={history}
          margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={level.color}
                stopOpacity={0.12}
              />
              <stop
                offset="100%"
                stopColor={level.color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: colors.textMuted }}
            tickLine={false}
            axisLine={false}
            interval={17}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: colors.textFaint }}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <ReferenceLine
            y={30}
            stroke={alertColors.amber.primary}
            strokeDasharray="3 6"
            strokeOpacity={0.35}
          />
          <ReferenceLine
            y={55}
            stroke={alertColors.orange.primary}
            strokeDasharray="3 6"
            strokeOpacity={0.35}
          />
          <ReferenceLine
            y={80}
            stroke={alertColors.red.primary}
            strokeDasharray="3 6"
            strokeOpacity={0.35}
          />
          <Tooltip
            contentStyle={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              fontSize: 13,
              color: colors.text,
              padding: "8px 14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            formatter={(v: number | undefined) => [v ?? 0, "Score"]}
            labelFormatter={(l) => l}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={level.color}
            strokeWidth={2}
            fill="url(#histFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
