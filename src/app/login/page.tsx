import Link from "next/link";
import { colors, alertColors } from "@/lib/design-tokens";
import { login, signInWithGoogle } from "./actions";

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

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const error = searchParams.error;
  const message = searchParams.message;

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
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          Sign in
        </h1>

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

        {message && (
          <div
            style={{
              background: alertColors.green.bg,
              border: `1px solid ${alertColors.green.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: alertColors.green.primary,
            }}
          >
            {message}
          </div>
        )}

        <form
          action={login}
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
              autoComplete="current-password"
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
            Sign In
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

        <form action={signInWithGoogle}>
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
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: colors.text,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
