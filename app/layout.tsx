import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://cell.claritylabs.inc"),
  title: {
    template: "%s | Cell",
    default: "Cell — Insurance Intelligence Layer",
  },
  description:
    "The shared intelligence layer for AI working with insurance. Pure TypeScript, provider-agnostic.",
  icons: "/favicon.svg",
  openGraph: {
    title: "Cell — Insurance Intelligence Layer",
    description:
      "The shared intelligence layer for AI working with insurance. Pure TypeScript, provider-agnostic.",
    type: "website",
    siteName: "Cell by Clarity Labs",
    url: "https://cell.claritylabs.inc",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cell — Insurance Intelligence Layer",
    description:
      "The shared intelligence layer for AI working with insurance. Pure TypeScript, provider-agnostic.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
