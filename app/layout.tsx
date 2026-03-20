import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://cl-sdk.claritylabs.inc"),
  title: {
    template: "%s",
    default: "CL-0 SDK",
  },
  description:
    "CL-0 SDK is an SDK for AI agents working with insurance.",
  icons: "/favicon.svg",
  openGraph: {
    title: "CL-0 SDK",
    description:
      "CL-0 SDK is an SDK for AI agents working with insurance.",
    type: "website",
    siteName: "CL-0 SDK",
    url: "https://cl-sdk.claritylabs.inc",
  },
  twitter: {
    card: "summary_large_image",
    title: "CL-0 SDK",
    description:
      "CL-0 SDK is an SDK for AI agents working with insurance.",
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
