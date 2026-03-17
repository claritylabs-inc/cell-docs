import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://cell.claritylabs.inc"),
  title: {
    template: "%s",
    default: "Cell from Clarity Labs",
  },
  description:
    "Cell from Clarity Labs is an SDK for AI agents working with insurance.",
  icons: "/favicon.svg",
  openGraph: {
    title: "Cell from Clarity Labs",
    description:
      "Cell from Clarity Labs is an SDK for AI agents working with insurance.",
    type: "website",
    siteName: "Cell from Clarity Labs",
    url: "https://cell.claritylabs.inc",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cell from Clarity Labs",
    description:
      "Cell from Clarity Labs is an SDK for AI agents working with insurance.",
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
