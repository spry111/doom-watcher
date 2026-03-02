import { colors } from "@/lib/design-tokens";

interface FooterProps {
  meta?: { live: number; total: number } | null;
}

export default function Footer({ meta }: FooterProps) {
  return (
    <footer
      className="text-center"
      style={{
        padding: "24px 0 48px",
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      {meta && (
        <p
          style={{
            fontSize: 11,
            color: colors.textFaint,
            marginBottom: 12,
          }}
        >
          {meta.live} of {meta.total} indicators live
        </p>
      )}
      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.7,
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        Doom Watcher provides economic indicators for informational purposes
        only. It does not constitute financial advice. Always consult a
        qualified financial advisor.
      </p>
      <div
        className="flex justify-center flex-wrap"
        style={{ marginTop: 14, gap: 24 }}
      >
        {["About", "Methodology", "Privacy", "Contact"].map((link) => (
          <span
            key={link}
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLSpanElement).style.color =
                colors.textMuted;
            }}
          >
            {link}
          </span>
        ))}
      </div>
    </footer>
  );
}
