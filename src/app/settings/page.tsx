import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { colors, alertColors } from "@/lib/design-tokens";
import { signOut, resetDisclaimer } from "@/lib/actions";
import DeleteAccountButton from "./DeleteAccountButton";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 16,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${colors.borderLight}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
          {value}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const disclaimerDate = profile?.disclaimer_accepted_at
    ? new Date(profile.disclaimer_accepted_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

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
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
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
                letterSpacing: "-0.01em",
                color: colors.text,
              }}
            >
              Doom Watcher
            </span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                color: colors.textSecondary,
                cursor: "pointer",
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            >
              Sign Out
            </button>
          </form>
        </nav>

        {/* Header */}
        <div style={{ padding: "32px 0 24px" }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.text,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary }}>
            Manage your account preferences
          </p>
        </div>

        {/* Account */}
        <Section title="Account">
          <div style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
            <Row label="Email" value={user.email ?? "—"} />
          </div>
          <div style={{ paddingTop: 4 }}>
            <Row label="Member since" value={memberSince} />
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                Free plan
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                All features included during beta
              </div>
            </div>
            <div
              style={{
                background: alertColors.green.bg,
                border: `1px solid ${alertColors.green.border}`,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: alertColors.green.primary,
              }}
            >
              Active
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                Email alerts
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Get notified when the Doom Score crosses a threshold
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                color: colors.textMuted,
                background: colors.surfaceAlt,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                padding: "4px 10px",
              }}
            >
              Coming soon
            </span>
          </div>
        </Section>

        {/* Legal */}
        <Section title="Legal">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
                Disclaimer
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {disclaimerDate
                  ? `Accepted on ${disclaimerDate}`
                  : "Not yet accepted"}
              </div>
            </div>
            <form action={resetDisclaimer}>
              <button
                type="submit"
                style={{
                  background: "none",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  color: colors.textSecondary,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Re-read
              </button>
            </form>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                Delete account
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Permanently removes your account and all data
              </div>
            </div>
            <DeleteAccountButton />
          </div>
        </Section>

        {/* Back link */}
        <div style={{ paddingBottom: 48, textAlign: "center" }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              textDecoration: "none",
            }}
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
