import { alertColors, colors } from "./design-tokens";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getDotColor(activation: number): string {
  if (activation < 0.15) return alertColors.green.primary;
  if (activation < 0.4) return alertColors.amber.primary;
  if (activation < 0.7) return alertColors.orange.primary;
  return alertColors.red.primary;
}

export function getSignalLabel(activation: number): {
  text: string;
  color: string;
} {
  if (activation < 0.15) return { text: "Normal", color: colors.textMuted };
  if (activation < 0.4)
    return { text: "Elevated", color: alertColors.amber.primary };
  if (activation < 0.7)
    return { text: "Stressed", color: alertColors.orange.primary };
  return { text: "Critical", color: alertColors.red.primary };
}
