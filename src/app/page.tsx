import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getAlertLevel } from "@/engine/engine";
import { colors, alertColors } from "@/lib/design-tokens";

async function getLiveScore(): Promise<{ score: number; level: ReturnType<typeof getAlertLevel> } | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("score_history")
      .select("score")
      .order("date", { ascending: false })
      .limit(1)
      .single();
    if (data) {
      const score = Math.round(data.score);
      return { score, level: getAlertLevel(score) };
    }
  } catch {
    // No data yet — fall through to null
  }
  return null;
}

export default async function LandingPage() {
  const liveData = await getLiveScore();
  const score = liveData?.score ?? 38;
  const level = liveData?.level ?? getAlertLevel(38);
  const hasLiveData = liveData !== null;

  // SVG ring
  const r = 80;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - score / 100);

  const features = [
    {
      icon: "📊",
      label: "12 indicators tracked",
      desc: "Yield curve, unemployment, credit spreads, housing, and more",
    },
    {
      icon: "⚡",
      label: "Updated daily",
      desc: "Data refreshes each morning via FRED and other public sources",
    },
    {
      icon: "🎯",
      label: "One score, 0–100",
      desc: "Weighted average of all indicators. Above 55 = historical recession territory",
    },
    {
      icon: "🔔",
      label: "Plain English alerts",
      desc: "All Clear → Caution → Danger → Crisis. No jargon, no noise",
    },
  ];

  const included = [
    "Daily Doom Score with 90-day trend history",
    "Deep-dive into each of the 12 indicators",
    "Plain-English summaries — what the signals mean for your portfolio",
    "Disclaimer acceptance saved to your account — no pop-up on every visit",
    "Free forever during beta",
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 0",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: level.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                D
              </span>
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: "-0.01em",
                color: colors.text,
              }}
            >
              Doom Watcher
            </span>
          </div>
          <Link
            href="/login"
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              color: colors.textSecondary,
              fontWeight: 500,
              textDecoration: "none",
              background: colors.surface,
            }}
          >
            Sign In
          </Link>
        </nav>

        {/* Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "64px 0 56px",
          }}
        >
          {/* Score ring */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <svg
              width={200}
              height={200}
              style={{ transform: "rotate(-90deg)", display: "block" }}
            >
              {/* Track */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={colors.borderLight}
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={level.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            {/* Score number centered in ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: level.color,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {score}
              </span>
            </div>
          </div>

          {/* Level pill */}
          <div
            style={{
              background: level.bgColor,
              border: `1px solid ${level.borderColor}`,
              borderRadius: 24,
              padding: "6px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: level.color,
              marginBottom: 28,
            }}
          >
            {level.name}
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.text,
              textAlign: "center",
              marginBottom: 10,
              letterSpacing: "-0.02em",
            }}
          >
            12 economic indicators. One score. Updated daily.
          </p>
          <p
            style={{
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 36,
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            Know when the economic weather is turning before it hits your
            portfolio. Built for regular investors, not finance pros.
          </p>

          {/* CTA */}
          <Link
            href="/signup"
            style={{
              display: "inline-block",
              background: level.color,
              color: "#fff",
              borderRadius: 10,
              padding: "14px 36px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Sign Up Free →
          </Link>

          {!hasLiveData && (
            <p
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Score shown is a demo. Live data populates after the first daily
              update.
            </p>
          )}
        </div>

        {/* How it works */}
        <section
          style={{ padding: "48px 0", borderTop: `1px solid ${colors.border}` }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            How it works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "16px",
                  background: colors.surface,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: colors.text,
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section
          style={{ padding: "48px 0", borderTop: `1px solid ${colors.border}` }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            What you get
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {included.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 14,
                  color: colors.textSecondary,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    color: alertColors.green.primary,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Second CTA */}
        <section
          style={{
            padding: "48px 0 64px",
            borderTop: `1px solid ${colors.border}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            Get your free account in 30 seconds.
          </p>
          <p
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 24,
            }}
          >
            No credit card required.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-block",
              background: level.color,
              color: "#fff",
              borderRadius: 10,
              padding: "14px 36px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Sign Up Free →
          </Link>
        </section>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: "20px",
          textAlign: "center",
          fontSize: 12,
          color: colors.textMuted,
        }}
      >
        For informational purposes only. Not financial advice. Past recession
        signals do not guarantee future outcomes.
      </div>
    </div>
  );
}
