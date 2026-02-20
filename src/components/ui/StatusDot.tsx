interface StatusDotProps {
  color: string;
}

export default function StatusDot({ color }: StatusDotProps) {
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: 8,
        height: 8,
        background: color,
        transition: "background 0.4s",
      }}
    />
  );
}
