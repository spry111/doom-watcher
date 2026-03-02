// Alternative.me Crypto Fear & Greed Index client
// API docs: https://alternative.me/crypto/fear-and-greed-index/#api

import type { FetchResult } from "./fred";

interface FearGreedResponse {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
}

export async function fetchCryptoFear(): Promise<FetchResult> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=90");
    if (!res.ok) {
      return { status: "error", error: `Alternative.me API error: ${res.status}` };
    }

    const data: FearGreedResponse = await res.json();
    if (!data.data || data.data.length === 0) {
      return { status: "error", error: "No data returned from Alternative.me" };
    }

    // Build history: API returns newest-first, reverse to chronological order
    const history: { value: number; date: string }[] = [];
    for (let i = data.data.length - 1; i >= 0; i--) {
      const entry = data.data[i];
      const v = parseInt(entry.value, 10);
      if (!isNaN(v)) {
        const date = new Date(parseInt(entry.timestamp, 10) * 1000)
          .toISOString()
          .slice(0, 10);
        history.push({ value: v, date });
      }
    }

    if (history.length === 0) {
      return { status: "error", error: "No valid data from Alternative.me" };
    }

    // Latest value is the last in chronological order
    const latest = history[history.length - 1];

    // The API returns 0–100 where 0 = extreme fear, 100 = extreme greed.
    // Our indicator (CF) is inverted: safe=40, critical=15.
    // The activation formula already handles inversion, so we pass the raw value.
    return { status: "ok", value: latest.value, date: latest.date, history };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error fetching crypto fear index",
    };
  }
}
