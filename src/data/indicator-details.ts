export interface IndicatorDetail {
  extendedDescription: string;
  zones: { name: string; range: string; description: string }[];
  links: { label: string; url: string }[];
}

export const INDICATOR_DETAILS: Record<string, IndicatorDetail> = {
  YC: {
    extendedDescription:
      "The yield curve compares what the government pays to borrow money for 10 years versus 2 years. Normally, longer loans cost more (positive spread). When short-term rates exceed long-term rates, the curve \u201Cinverts\u201D \u2014 investors are signaling they expect economic trouble ahead. An inverted yield curve has preceded every U.S. recession since 1955, typically by 12\u201318 months.",
    zones: [
      {
        name: "Normal",
        range: "Above +0.50%",
        description:
          "The curve is healthy and positive. Long-term rates exceed short-term rates, as expected in a growing economy.",
      },
      {
        name: "Elevated",
        range: "+0.50% to +0.10%",
        description:
          "The curve is flattening. The gap between long and short rates is narrowing, which sometimes precedes inversion.",
      },
      {
        name: "Stressed",
        range: "+0.10% to \u22120.15%",
        description:
          "The curve is flat or slightly inverted. This has historically been an early warning of recession within 12\u201318 months.",
      },
      {
        name: "Critical",
        range: "Below \u22120.15%",
        description:
          "Deep inversion. Every instance of sustained deep inversion since 1955 has been followed by a recession.",
      },
    ],
    links: [
      { label: "FRED", url: "https://fred.stlouisfed.org/series/T10Y2Y" },
      {
        label: "Treasury",
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
      },
    ],
  },

  IC: {
    extendedDescription:
      "Every week, the Department of Labor counts how many Americans filed for unemployment benefits for the first time. The 4-week average smooths out weekly noise. Rising claims mean more people are being laid off. Sustained increases above 300,000 per week have historically preceded recessions.",
    zones: [
      {
        name: "Normal",
        range: "Below 220,000",
        description:
          "The job market is strong. Very few people are being laid off relative to the workforce.",
      },
      {
        name: "Elevated",
        range: "220,000 \u2013 267,500",
        description:
          "Layoffs are picking up slightly. Could be seasonal or sector-specific \u2014 worth monitoring.",
      },
      {
        name: "Stressed",
        range: "267,500 \u2013 315,000",
        description:
          "Layoffs are accelerating across sectors. Companies are pulling back on hiring and beginning to cut.",
      },
      {
        name: "Critical",
        range: "Above 315,000",
        description:
          "Widespread job losses. At this level, the labor market is deteriorating rapidly.",
      },
    ],
    links: [
      { label: "FRED", url: "https://fred.stlouisfed.org/series/IC4WSA" },
      { label: "DOL", url: "https://www.dol.gov/ui/data.pdf" },
    ],
  },

  SR: {
    extendedDescription:
      "Economist Claudia Sahm created this indicator to detect recessions in real time. It measures how fast the unemployment rate is rising \u2014 specifically, whether the 3-month average unemployment rate has risen 0.50 percentage points above its 12-month low. When it crosses 0.50, a recession has already begun in every instance since 1970 \u2014 with zero false positives.",
    zones: [
      {
        name: "Normal",
        range: "Below 0.10",
        description:
          "Unemployment is stable or falling. No sign of labor market deterioration.",
      },
      {
        name: "Elevated",
        range: "0.10 \u2013 0.25",
        description:
          "Unemployment is ticking up. The pace of increase is worth watching but not yet alarming.",
      },
      {
        name: "Stressed",
        range: "0.25 \u2013 0.40",
        description:
          "Unemployment is rising at a concerning pace. Historically, values in this range have preceded the 0.50 trigger.",
      },
      {
        name: "Critical",
        range: "Above 0.40",
        description:
          "The Sahm Rule is near or at its trigger point. At 0.50, every historical instance has meant recession.",
      },
    ],
    links: [
      {
        label: "FRED",
        url: "https://fred.stlouisfed.org/series/SAHMREALTIME",
      },
      {
        label: "Sahm\u2019s explanation",
        url: "https://www.hamiltonproject.org/publication/paper/direct-stimulus-payments-to-individuals/",
      },
    ],
  },

  HY: {
    extendedDescription:
      "When companies with lower credit ratings need to borrow money by issuing bonds, they pay a premium over safe government bonds. This \u201Cspread\u201D reflects how much extra risk investors demand. When spreads widen, it means the bond market \u2014 which is often smarter than the stock market \u2014 is pricing in higher default risk. Spikes above 6% have accompanied every recession since 1996.",
    zones: [
      {
        name: "Normal",
        range: "Below 3.50%",
        description:
          "Credit markets are calm. Investors are comfortable lending to risky companies at modest premiums.",
      },
      {
        name: "Elevated",
        range: "3.50% \u2013 5.25%",
        description:
          "Spreads are widening. Investors are becoming more cautious about corporate debt.",
      },
      {
        name: "Stressed",
        range: "5.25% \u2013 6.50%",
        description:
          "Significant credit stress. Companies are finding it materially harder and more expensive to borrow.",
      },
      {
        name: "Critical",
        range: "Above 6.50%",
        description:
          "Credit markets are seizing up. This level was reached in the 2008 financial crisis and briefly in March 2020.",
      },
    ],
    links: [
      {
        label: "FRED",
        url: "https://fred.stlouisfed.org/series/BAMLH0A0HYM2",
      },
    ],
  },

  BR: {
    extendedDescription:
      "The S&P 500 index can go up even when most of its stocks are going down \u2014 if a handful of mega-cap stocks (like Apple, Microsoft, Nvidia) carry the index. Market breadth measures what percentage of stocks are actually in a healthy uptrend. When breadth is low, it means the rally is fragile and concentrated. Historically, broad market declines start with narrowing breadth.",
    zones: [
      {
        name: "Normal",
        range: "Above 60%",
        description:
          "Majority of stocks are healthy. The market rally has broad participation \u2014 a sign of strength.",
      },
      {
        name: "Elevated",
        range: "60% \u2013 42.5%",
        description:
          "Breadth is narrowing. Fewer stocks are carrying the index. The market may look fine on the surface but is weakening underneath.",
      },
      {
        name: "Stressed",
        range: "42.5% \u2013 30%",
        description:
          "Most stocks are in downtrends. Any further selling could accelerate quickly.",
      },
      {
        name: "Critical",
        range: "Below 25%",
        description:
          "Almost no stocks are healthy. The market is in broad decline, even if the index hasn\u2019t fully reflected it yet.",
      },
    ],
    links: [
      {
        label: "Barchart",
        url: "https://www.barchart.com/stocks/market-breadth",
      },
    ],
  },

  HP: {
    extendedDescription:
      "Before a house is built, a permit must be filed. The number of new building permits filed is one of the earliest economic indicators because housing activity leads the broader economy by 12\u201318 months. When permits drop, it signals that builders expect weaker demand \u2014 and the ripple effects (fewer construction jobs, less furniture bought, fewer mortgages) eventually spread across the economy.",
    zones: [
      {
        name: "Normal",
        range: "Above +5% YoY",
        description:
          "Housing is growing. More homes being planned means confidence in future demand.",
      },
      {
        name: "Elevated",
        range: "+5% to \u22125% YoY",
        description:
          "Housing is flat or slightly declining. Could be seasonal, or could be the start of a slowdown.",
      },
      {
        name: "Stressed",
        range: "\u22125% to \u221217.5% YoY",
        description:
          "Housing is contracting meaningfully. Builders are pulling back, signaling weakening economic expectations.",
      },
      {
        name: "Critical",
        range: "Below \u221220% YoY",
        description:
          "Housing is in freefall. Declines this severe have preceded every major recession.",
      },
    ],
    links: [
      { label: "FRED", url: "https://fred.stlouisfed.org/series/PERMIT" },
      {
        label: "Census",
        url: "https://www.census.gov/construction/nrc/",
      },
    ],
  },

  SV: {
    extendedDescription:
      "The services sector makes up 77% of the U.S. economy \u2014 everything from healthcare to restaurants to software. The ISM Services PMI surveys purchasing managers about business conditions. Above 50 means the sector is expanding; below 50 means it\u2019s contracting. Because services are so dominant, a sustained reading below 50 is a strong recession signal.",
    zones: [
      {
        name: "Normal",
        range: "Above 53.0",
        description:
          "Services sector is comfortably expanding. Business conditions are solid.",
      },
      {
        name: "Elevated",
        range: "53.0 \u2013 49.5",
        description:
          "Growth is slowing or the sector is near stall speed. The 50.0 line between expansion and contraction is close.",
      },
      {
        name: "Stressed",
        range: "49.5 \u2013 47.5",
        description:
          "The services sector is contracting. With 77% of GDP in services, this is a significant warning.",
      },
      {
        name: "Critical",
        range: "Below 46.0",
        description:
          "Deep services contraction. This level has only been seen during recessions.",
      },
    ],
    links: [
      {
        label: "ISM",
        url: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/services/pmi/",
      },
    ],
  },

  IN: {
    extendedDescription:
      "Corporate executives, board members, and major shareholders must report when they buy or sell their own company\u2019s stock. While insiders sell for many routine reasons (taxes, diversification), the ratio of selling to buying across all companies provides a sentiment signal. When the ratio spikes, it means the people with the best information about their companies are collectively getting nervous.",
    zones: [
      {
        name: "Normal",
        range: "Below 3.0\u00D7",
        description:
          "Insiders are buying at healthy levels relative to selling. Routine activity.",
      },
      {
        name: "Elevated",
        range: "3.0\u00D7 \u2013 5.5\u00D7",
        description:
          "Selling is slightly elevated. Could be tax-related or seasonal \u2014 not yet alarming.",
      },
      {
        name: "Stressed",
        range: "5.5\u00D7 \u2013 8.0\u00D7",
        description:
          "Heavy insider selling across many companies. Executives are reducing their exposure.",
      },
      {
        name: "Critical",
        range: "Above 8.0\u00D7",
        description:
          "Extreme insider selling. The people who know their companies best are heading for the exits.",
      },
    ],
    links: [
      { label: "OpenInsider", url: "https://openinsider.com/" },
    ],
  },

  JP: {
    extendedDescription:
      "Before companies announce layoffs, they quietly stop hiring. Job posting velocity measures how fast companies are pulling listings compared to a year ago. A declining trend captures \u201Cquiet freezes\u201D \u2014 the period when companies stop adding headcount but haven\u2019t yet started cutting. This leading indicator typically turns negative 6\u201312 months before unemployment rises.",
    zones: [
      {
        name: "Normal",
        range: "Above 0% YoY",
        description:
          "Companies are posting more jobs than last year. Hiring demand is healthy or growing.",
      },
      {
        name: "Elevated",
        range: "0% to \u22127.5% YoY",
        description:
          "Job postings are declining. Companies are beginning to pull back on hiring plans.",
      },
      {
        name: "Stressed",
        range: "\u22127.5% to \u221215% YoY",
        description:
          "Significant hiring slowdown. Quiet freezes are spreading across industries.",
      },
      {
        name: "Critical",
        range: "Below \u221215% YoY",
        description:
          "Job postings have collapsed. The labor market is freezing up.",
      },
    ],
    links: [
      {
        label: "Indeed Hiring Lab",
        url: "https://www.hiringlab.org/data/",
      },
    ],
  },

  GT: {
    extendedDescription:
      "When people are worried about the economy, they Google it. This indicator tracks search volume for terms like \u201Crecession,\u201D \u201Clayoffs,\u201D and \u201Cunemployment benefits\u201D relative to a recent baseline. A spike in searches means public anxiety is rising. While this is partly a sentiment indicator (people can worry without a recession happening), extreme spikes have coincided with every recent downturn.",
    zones: [
      {
        name: "Normal",
        range: "Below 1.0\u00D7",
        description:
          "Search interest is at or below the recent average. No unusual public concern.",
      },
      {
        name: "Elevated",
        range: "1.0\u00D7 \u2013 1.5\u00D7",
        description:
          "Searches are slightly above normal. Some public anxiety is building.",
      },
      {
        name: "Stressed",
        range: "1.5\u00D7 \u2013 2.1\u00D7",
        description:
          "Recession searches are significantly elevated. Media coverage and public worry are accelerating.",
      },
      {
        name: "Critical",
        range: "Above 2.1\u00D7",
        description:
          "Peak anxiety. Search volumes at this level have only occurred during active recessions or severe market panics.",
      },
    ],
    links: [
      {
        label: "Google Trends",
        url: "https://trends.google.com/trends/explore?q=recession&geo=US",
      },
    ],
  },

  TE: {
    extendedDescription:
      "Companies cut temporary and contract workers before making permanent layoffs \u2014 it\u2019s cheaper and faster. This makes temp employment one of the earliest labor market warning signals. A decline in temp workers has preceded every U.S. recession since 1990, typically by 6\u201312 months. Think of temps as the economy\u2019s \u201Ccanary in the coal mine.\u201D",
    zones: [
      {
        name: "Normal",
        range: "Above +2.0% YoY",
        description:
          "Temp employment is growing. Companies are adding flexible labor \u2014 a sign of confidence.",
      },
      {
        name: "Elevated",
        range: "+2.0% to \u22120.5% YoY",
        description:
          "Temp hiring is flat or slightly declining. The early stages of labor market cooling.",
      },
      {
        name: "Stressed",
        range: "\u22120.5% to \u22123.5% YoY",
        description:
          "Temp workers are being shed. Companies are cutting their most flexible labor first.",
      },
      {
        name: "Critical",
        range: "Below \u22123.5% YoY",
        description:
          "Severe temp employment decline. This level has preceded every recession since 1990.",
      },
    ],
    links: [
      { label: "FRED", url: "https://fred.stlouisfed.org/series/TEMPHELPS" },
      {
        label: "BLS",
        url: "https://www.bls.gov/news.release/empsit.nr0.htm",
      },
    ],
  },

  CF: {
    extendedDescription:
      "The crypto market, while volatile, has become increasingly correlated with traditional risk assets. The Fear & Greed Index (0\u2013100) measures crypto market sentiment based on volatility, volume, social media, and market dominance. When crypto shows extreme fear while falling alongside stocks, it signals a \u201Crisk-off\u201D environment where investors are selling everything \u2014 not just crypto. This cross-asset panic is a modern recession indicator.",
    zones: [
      {
        name: "Normal",
        range: "Above 40",
        description:
          "Crypto sentiment is neutral to greedy. Risk appetite is healthy across markets.",
      },
      {
        name: "Elevated",
        range: "40 \u2013 30",
        description:
          "Fear is building in crypto markets. Investors are becoming risk-averse.",
      },
      {
        name: "Stressed",
        range: "30 \u2013 20",
        description:
          "Significant fear. When combined with stock market weakness, this signals broad risk aversion.",
      },
      {
        name: "Critical",
        range: "Below 15",
        description:
          "Extreme fear. All risky assets are being sold. This panic-level sentiment has accompanied major market crises.",
      },
    ],
    links: [
      {
        label: "Alternative.me",
        url: "https://alternative.me/crypto/fear-and-greed-index/",
      },
    ],
  },
};
