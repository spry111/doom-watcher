import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  data,
  color,
  width = 64,
  height = 24,
}: SparklineProps) {
  const gradientId = `spark-${color.replace("#", "")}`;
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 1, bottom: 2, left: 1 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
