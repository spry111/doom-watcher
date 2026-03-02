// Indeed Hiring Lab scraper — fetches job posting velocity data
// Source: Indeed Hiring Lab publishes a public CSV with weekly job posting trends
// We compute YoY % change from the data

import type { FetchResult } from "../fred";

// Indeed Hiring Lab publishes aggregate data at this URL
// The CSV has columns: date, <country columns with % change from baseline>
const INDEED_CSV_URL =
  "https://raw.githubusercontent.com/hiring-lab/indeed-job-posting-data/main/US/aggregate_job_postings_US.csv";

export async function fetchJobPostings(): Promise<FetchResult> {
  try {
    const res = await fetch(INDEED_CSV_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoomWatcher/1.0; economic-indicator-dashboard)",
      },
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `Indeed CSV returned ${res.status}`,
      };
    }

    const text = await res.text();
    const lines = text.trim().split("\n");

    if (lines.length < 3) {
      return {
        status: "error",
        error: "Indeed CSV has insufficient data",
      };
    }

    // Parse header to find the US column
    const header = lines[0].split(",").map((h) => h.trim());
    // Look for a column that contains the US percentage change
    // Format varies but typically: date, US, or date, United States
    let valueIndex = -1;
    for (let i = 1; i < header.length; i++) {
      const col = header[i].toLowerCase();
      if (col === "us" || col === "united states" || col.includes("us_")) {
        valueIndex = i;
        break;
      }
    }

    // If only 2 columns, the second is the value
    if (valueIndex === -1 && header.length === 2) {
      valueIndex = 1;
    }

    if (valueIndex === -1) {
      return {
        status: "error",
        error: `Could not find US column in Indeed CSV. Headers: ${header.join(", ")}`,
      };
    }

    // Get the most recent data point
    // Indeed's data is already a % change from a Feb 2020 baseline
    // We need YoY change, so compare latest to ~52 weeks ago
    const dataLines = lines.slice(1).filter((l) => l.trim().length > 0);

    if (dataLines.length < 52) {
      // Not enough history for YoY — use the raw value as an approximation
      // (it's already a % change from baseline)
      const lastLine = dataLines[dataLines.length - 1];
      const cols = lastLine.split(",");
      const value = parseFloat(cols[valueIndex]);
      if (isNaN(value)) {
        return { status: "error", error: "Could not parse latest Indeed value" };
      }
      return {
        status: "ok",
        value: Math.round(value * 100) / 100,
        date: cols[0].trim(),
      };
    }

    // Compute YoY: latest vs ~52 weeks ago
    const latestLine = dataLines[dataLines.length - 1];
    const yearAgoLine = dataLines[dataLines.length - 53]; // ~52 weeks back

    const latestCols = latestLine.split(",");
    const yearAgoCols = yearAgoLine.split(",");

    const latestVal = parseFloat(latestCols[valueIndex]);
    const yearAgoVal = parseFloat(yearAgoCols[valueIndex]);

    if (isNaN(latestVal) || isNaN(yearAgoVal)) {
      return {
        status: "error",
        error: "Could not parse Indeed values for YoY calculation",
      };
    }

    // YoY change in percentage points
    // e.g., if latest is -5% from baseline and year ago was +10%, the change is -15pp
    const yoyChange = latestVal - yearAgoVal;

    return {
      status: "ok",
      value: Math.round(yoyChange * 100) / 100,
      date: latestCols[0].trim(),
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Indeed data fetch failed",
    };
  }
}
