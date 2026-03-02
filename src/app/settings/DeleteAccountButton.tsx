"use client";

import { alertColors } from "@/lib/design-tokens";
import { deleteAccount } from "@/lib/actions";

export default function DeleteAccountButton() {
  async function handleClick() {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }
    await deleteAccount();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: "none",
        border: `1px solid ${alertColors.red.border}`,
        borderRadius: 8,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 500,
        color: alertColors.red.primary,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = alertColors.red.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      Delete Account
    </button>
  );
}
