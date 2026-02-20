import { getSignalLabel } from "@/lib/utils";

interface SignalLabelProps {
  activation: number;
}

export default function SignalLabel({ activation }: SignalLabelProps) {
  const { text, color } = getSignalLabel(activation);
  const isActive = activation >= 0.15;

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        color,
        padding: "3px 10px",
        borderRadius: 6,
        background: isActive ? `${color}10` : "transparent",
      }}
    >
      {text}
    </span>
  );
}
