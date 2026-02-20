import type { AlertLevel } from "@/engine/types";

export const colors = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F4F0",
  border: "#E8E6E1",
  borderLight: "#F0EEEA",
  text: "#1A1A1A",
  textSecondary: "#5C5C5C",
  textMuted: "#9A9A9A",
  textFaint: "#C4C4C4",
} as const;

export const alertColors = {
  green: { primary: "#1B9E6F", bg: "#ECFDF5", border: "#BBF7D0" },
  amber: { primary: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  orange: { primary: "#C2410C", bg: "#FFF7ED", border: "#FDBA74" },
  red: { primary: "#BE123C", bg: "#FFF1F2", border: "#FECDD3" },
} as const;

export const alertLevels: AlertLevel[] = [
  {
    name: "All Clear",
    min: 0,
    max: 29,
    color: alertColors.green.primary,
    bgColor: alertColors.green.bg,
    borderColor: alertColors.green.border,
  },
  {
    name: "Caution",
    min: 30,
    max: 54,
    color: alertColors.amber.primary,
    bgColor: alertColors.amber.bg,
    borderColor: alertColors.amber.border,
  },
  {
    name: "Danger",
    min: 55,
    max: 79,
    color: alertColors.orange.primary,
    bgColor: alertColors.orange.bg,
    borderColor: alertColors.orange.border,
  },
  {
    name: "Crisis",
    min: 80,
    max: 100,
    color: alertColors.red.primary,
    bgColor: alertColors.red.bg,
    borderColor: alertColors.red.border,
  },
];

export const signalLabels = [
  { min: 0.0, max: 0.14, label: "Normal" },
  { min: 0.15, max: 0.39, label: "Elevated" },
  { min: 0.4, max: 0.69, label: "Stressed" },
  { min: 0.7, max: 1.0, label: "Critical" },
] as const;

export const TOTAL_WEIGHT = 75;
