"use client";

import { useState, useEffect } from "react";
import { colors, alertColors } from "@/lib/design-tokens";
import { acceptDisclaimer } from "@/lib/actions";

const STORAGE_KEY = "doom-disclaimer-seen";

interface DisclaimerModalProps {
  profile?: { disclaimer_accepted_at: string | null } | null;
}

export default function DisclaimerModal({ profile }: DisclaimerModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If the user has a profile, use the database field
    if (profile !== undefined) {
      setVisible(profile?.disclaimer_accepted_at == null);
      return;
    }
    // Fallback for unauthenticated users: sessionStorage
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== "true") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, [profile]);

  if (!visible) return null;

  async function handleDismiss() {
    if (profile !== undefined) {
      // Logged-in user — persist to database
      await acceptDisclaimer();
    } else {
      // Anonymous — persist to sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore storage errors
      }
    }
    setVisible(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        background: "rgba(0, 0, 0, 0.3)",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        style={{
          background: colors.surface,
          borderRadius: 16,
          maxWidth: 440,
          width: "100%",
          padding: "32px 28px 28px",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)",
          animation: "modalUp 0.25s ease",
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: alertColors.amber.bg,
              border: `1px solid ${alertColors.amber.border}`,
              fontSize: 24,
              lineHeight: 1,
            }}
          >
            <span role="img" aria-label="Warning">&#x26A0;&#xFE0F;</span>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Important Notice
        </h2>

        {/* Body */}
        <div
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.7,
          }}
        >
          <p style={{ marginBottom: 12 }}>
            Doom Watcher provides economic indicators for informational and
            educational purposes only.
          </p>
          <p style={{ marginBottom: 12 }}>
            This is <strong style={{ color: colors.text }}>not</strong> financial
            advice. Do not make investment decisions based solely on the
            information presented here. Always consult a qualified financial
            advisor before making changes to your portfolio.
          </p>
          <p>
            Economic indicators are backward-looking and cannot predict the
            future with certainty. Past recession signals do not guarantee future
            outcomes.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleDismiss}
          style={{
            display: "block",
            width: "100%",
            marginTop: 24,
            padding: "13px 24px",
            borderRadius: 10,
            border: "none",
            background: alertColors.amber.primary,
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
