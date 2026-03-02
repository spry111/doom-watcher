import Link from "next/link";
import { colors, alertColors } from "@/lib/design-tokens";
import { signup, signUpWithGoogle } from "./actions";

const inputStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: colors.text,
  background: colors.bg,
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelTextStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: colors.textSecondary,
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

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
          padding: "32px 28px",
          width: "100%",
          maxWidth: 400,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 6,
            letterSpacing: "-0.02em",
          }}
        >
          Create account
        </h1>
        <p
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 24,
          }}
        >
          Free forever during beta. No credit card required.
        </p>

        {error && (
          <div
            style={{
              background: alertColors.red.bg,
              border: `1px solid ${alertColors.red.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: alertColors.red.primary,
            }}
          >
            {error}
          </div>
        )}

        <form
          action={signup}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <label style={labelStyle}>
            <span style={labelTextStyle}>Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Password</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              At least 8 characters
            </span>
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            style={{
              background: colors.text,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 4,
              fontFamily: "inherit",
            }}
          >
            Sign Up
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: 12, color: colors.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <form action={signUpWithGoogle}>
          <button
            type="submit"
            style={{
              width: "100%",
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: "12px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Continue with Google
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          By signing up, you agree this is for informational purposes only and
          not financial advice.
        </p>

        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: colors.text,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
