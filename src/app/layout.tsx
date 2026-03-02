import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doom Watcher — Recession Early Warning Dashboard",
  description:
    "12 economic indicators synthesized into one score. Is a recession coming?",
  openGraph: {
    title: "Doom Watcher — Recession Early Warning Dashboard",
    description:
      "12 economic indicators synthesized into one score. Is a recession coming?",
    type: "website",
    siteName: "Doom Watcher",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doom Watcher — Recession Early Warning Dashboard",
    description:
      "12 economic indicators synthesized into one score. Is a recession coming?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
