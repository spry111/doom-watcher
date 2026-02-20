import { X } from "lucide-react";
import { colors } from "@/lib/design-tokens";

interface MethodologyPanelProps {
  onClose: () => void;
}

export default function MethodologyPanel({ onClose }: MethodologyPanelProps) {
  return (
    <div
      className="animate-fadeUp"
      style={{
        margin: "16px 0",
        padding: "20px 24px",
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        lineHeight: 1.7,
        fontSize: 14,
        color: colors.textSecondary,
      }}
    >
      <div
        className="flex justify-between items-start"
        style={{ marginBottom: 12 }}
      >
        <span style={{ fontWeight: 600, color: colors.text, fontSize: 15 }}>
          How the Doom Score works
        </span>
        <button
          onClick={onClose}
          aria-label="Close methodology panel"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.textMuted,
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ marginBottom: 10 }}>
        The Doom Score combines 12 proven economic indicators — from the yield
        curve to insider selling to job postings — into a single number between
        0 and 100.
      </p>
      <p style={{ marginBottom: 10 }}>
        Each indicator is weighted by historical reliability. The score is a
        weighted average: when many independent signals flash warning
        simultaneously, the score rises. When they&apos;re calm, it stays low.
      </p>
      <p style={{ color: colors.textMuted, fontSize: 13 }}>
        This is an informational tool, not financial advice. Always consult a
        qualified financial advisor before making investment decisions.
      </p>

      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: colors.surfaceAlt,
          borderRadius: 10,
          fontSize: 13,
        }}
      >
        <span style={{ fontWeight: 500, color: colors.text }}>
          Demo mode:{" "}
        </span>
        <span style={{ color: colors.textSecondary }}>
          Use the buttons below the score to see how different economic
          conditions look.
        </span>
      </div>
    </div>
  );
}
