import Link from "next/link";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { colors, alertColors } from "@/lib/design-tokens";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "inherit",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: colors.textSecondary,
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
            color: colors.text,
            letterSpacing: "-0.01em",
          }}
        >
          Doom Watcher
        </span>
      </Link>

      <div
        style={{
          background: colors.surface,
          borderRadius: 16,
          padding: "40px 28px 32px",
          width: "100%",
          maxWidth: 400,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string };
}) {
  const { token_hash, type } = searchParams;

  if (!token_hash || !type) {
    return (
      <Card>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: alertColors.red.bg,
            border: `1px solid ${alertColors.red.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 24,
          }}
        >
          ✕
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 10,
            letterSpacing: "-0.02em",
          }}
        >
          Invalid confirmation link
        </h1>
        <p
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          This link is missing required parameters. Please use the link from
          your confirmation email.
        </p>
        <Link
          href="/signup"
          style={{
            display: "inline-block",
            background: colors.text,
            color: "#fff",
            borderRadius: 8,
            padding: "11px 28px",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Try again
        </Link>
      </Card>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as EmailOtpType,
  });

  if (error) {
    return (
      <Card>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: alertColors.red.bg,
            border: `1px solid ${alertColors.red.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 24,
          }}
        >
          ✕
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 10,
            letterSpacing: "-0.02em",
          }}
        >
          Confirmation failed
        </h1>
        <p
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          This link may have expired or already been used. Sign up again to
          receive a new confirmation email.
        </p>
        <Link
          href="/signup"
          style={{
            display: "inline-block",
            background: colors.text,
            color: "#fff",
            borderRadius: 8,
            padding: "11px 28px",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Try again
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: alertColors.green.bg,
          border: `1px solid ${alertColors.green.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 26,
        }}
      >
        ✓
      </div>
      <h1
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 10,
          letterSpacing: "-0.02em",
        }}
      >
        Email confirmed
      </h1>
      <p
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Your account is ready. Sign in to start using Doom Watcher.
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-block",
          background: colors.text,
          color: "#fff",
          borderRadius: 8,
          padding: "11px 28px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Sign in to your account
      </Link>
    </Card>
  );
}
