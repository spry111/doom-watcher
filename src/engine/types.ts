export interface IndicatorDef {
  id: string;
  name: string;
  technicalName: string;
  weight: number;
  safeThreshold: number;
  criticalThreshold: number;
  description: string;
  source: string;
  frequency: string;
  inverted: boolean;
}

export interface IndicatorState extends IndicatorDef {
  value: number;
  activation: number;
  sparkData: number[];
  trend: "improving" | "stable" | "worsening";
  status?: "live" | "cached" | "unavailable";
  lastFetched?: string;
}

export interface AlertLevel {
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface Scenario {
  key: string;
  label: string;
  values: Record<string, number>;
}

export interface HistoryPoint {
  day: number;
  score: number;
  date: string;
}

export interface HistoryEntry {
  score: number;
  level: string;
  date: string;
  topDrivers: string[];
}

export interface CronLog {
  success: boolean;
  duration: number;
  indicators: Record<
    string,
    { status: "ok" | "error" | "unavailable"; value?: number; error?: string }
  >;
}

export type DataMode =
  | "loading"
  | "current"
  | "demo-calm"
  | "demo-caution"
  | "demo-danger"
  | "demo-crisis";
