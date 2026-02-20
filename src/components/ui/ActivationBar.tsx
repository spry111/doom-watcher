import { colors } from "@/lib/design-tokens";

interface ActivationBarProps {
  activation: number;
  color: string;
  height?: number;
}

export default function ActivationBar({
  activation,
  color,
  height = 4,
}: ActivationBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex-1 overflow-hidden"
        style={{
          height,
          background: colors.borderLight,
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${activation * 100}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color,
          minWidth: 36,
          textAlign: "right",
        }}
      >
        {Math.round(activation * 100)}%
      </span>
    </div>
  );
}
