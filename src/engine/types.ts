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
