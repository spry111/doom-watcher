// OpenInsider scraper — fetches aggregate insider sell/buy ratio
// Source: http://openinsider.com/screener (summary statistics)
// Rate limit: 1 request/day is fine

import * as cheerio from "cheerio";
import type { FetchResult } from "../fred";

const OPENINSIDER_URL =
  "http://openinsider.com/screener?s=&o=&pl=&ph=&st=0&fd=7&fdr=&td=0&tdr=&feession=&cession=&sidTicker=&rptTicker=&xp=&vession=&sc=0&so=0&tc=1";

export async function fetchInsiderSelling(): Promise<FetchResult> {
  try {
    const res = await fetch(OPENINSIDER_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoomWatcher/1.0; economic-indicator-dashboard)",
      },
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `OpenInsider returned ${res.status}`,
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Count sale and purchase transactions from the results table
    let sales = 0;
    let purchases = 0;

    $("table.tinytable tbody tr").each((_, row) => {
      const transType = $(row).find("td:nth-child(6)").text().trim().toLowerCase();
      if (transType.includes("sale")) sales++;
      if (transType.includes("purchase")) purchases++;
    });

    if (purchases === 0 && sales === 0) {
      return {
        status: "error",
        error: "Could not parse transaction data from OpenInsider",
      };
    }

    // Sell/buy ratio: safe threshold = 3.0, critical = 10.0
    const ratio = purchases > 0 ? sales / purchases : sales > 0 ? 15.0 : 3.0;
    const value = Math.round(ratio * 100) / 100;

    return {
      status: "ok",
      value,
      date: new Date().toISOString().slice(0, 10),
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "OpenInsider scrape failed",
    };
  }
}
