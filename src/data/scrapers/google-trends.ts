// Google Trends scraper — fetches recession anxiety index
// Uses the unofficial google-trends-api package
// This is fragile — Google may block the endpoint at any time

import type { FetchResult } from "../fred";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require("google-trends-api");

const SEARCH_TERMS = ["recession", "layoffs", "unemployment benefits"];

export async function fetchGoogleTrends(): Promise<FetchResult> {
  try {
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const fourteenMonthsAgo = new Date(oneYearAgo);
    fourteenMonthsAgo.setMonth(fourteenMonthsAgo.getMonth() - 2);

    // Fetch recent 3 months for each term
    const recentResults = await Promise.allSettled(
      SEARCH_TERMS.map((term) =>
        googleTrends.interestOverTime({
          keyword: term,
          startTime: threeMonthsAgo,
          endTime: now,
          geo: "US",
        })
      )
    );

    // Fetch baseline period (12-14 months ago) for normalization
    const baselineResults = await Promise.allSettled(
      SEARCH_TERMS.map((term) =>
        googleTrends.interestOverTime({
          keyword: term,
          startTime: fourteenMonthsAgo,
          endTime: oneYearAgo,
          geo: "US",
        })
      )
    );

    let recentAvg = 0;
    let baselineAvg = 0;
    let validTerms = 0;

    for (let i = 0; i < SEARCH_TERMS.length; i++) {
      const recentOutcome = recentResults[i];
      const baselineOutcome = baselineResults[i];

      if (
        recentOutcome.status !== "fulfilled" ||
        baselineOutcome.status !== "fulfilled"
      ) {
        continue;
      }

      try {
        const recentData = JSON.parse(recentOutcome.value);
        const baselineData = JSON.parse(baselineOutcome.value);

        const recentTimeline = recentData.default?.timelineData ?? [];
        const baselineTimeline = baselineData.default?.timelineData ?? [];

        if (recentTimeline.length === 0 || baselineTimeline.length === 0) {
          continue;
        }

        // Average interest value over each period
        const recentMean =
          recentTimeline.reduce(
            (sum: number, pt: { value: number[] }) => sum + (pt.value?.[0] ?? 0),
            0
          ) / recentTimeline.length;

        const baselineMean =
          baselineTimeline.reduce(
            (sum: number, pt: { value: number[] }) => sum + (pt.value?.[0] ?? 0),
            0
          ) / baselineTimeline.length;

        recentAvg += recentMean;
        baselineAvg += baselineMean;
        validTerms++;
      } catch {
        continue;
      }
    }

    if (validTerms === 0) {
      return {
        status: "error",
        error: "Could not parse any Google Trends data",
      };
    }

    recentAvg /= validTerms;
    baselineAvg /= validTerms;

    // Normalized ratio: 1.0 = same as baseline, >1 = elevated, >2.5 = critical
    // Avoid division by zero
    const ratio = baselineAvg > 0 ? recentAvg / baselineAvg : recentAvg > 50 ? 2.5 : 1.0;
    const value = Math.round(ratio * 100) / 100;

    return {
      status: "ok",
      value,
      date: now.toISOString().slice(0, 10),
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Google Trends fetch failed",
    };
  }
}
