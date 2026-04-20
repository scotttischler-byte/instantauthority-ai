import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://instantauthority.com"),
  title: {
    default: "InstantAuthority.ai",
    template: "%s | InstantAuthority.ai",
  },
  description:
    "AI-powered authority platform for agencies to generate GEO-optimized press releases, analyze websites, and prove ROI with client-ready reporting.",
  openGraph: {
    title: "InstantAuthority.ai",
    description:
      "Build instant authority and get cited by AI with an integrated Authority Engine, GEO Optimizer, White Label Reports, and Client Portals.",
    url: "https://instantauthority.com",
    siteName: "InstantAuthority.ai",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "InstantAuthority.ai",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantAuthority.ai",
    description:
      "Premium GEO + SEO authority platform for agencies and B2B teams.",
    images: ["/globe.svg"],
  },
  icons: {
    icon: "/globe.svg",
    shortcut: "/globe.svg",
    apple: "/globe.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecret = process.env.CLERK_SECRET_KEY || "";
  const hasUsableClerk =
    /^pk_(test|live)_/.test(clerkKey) &&
    /^sk_(test|live)_/.test(clerkSecret) &&
    !clerkKey.includes("your_clerk") &&
    !clerkSecret.includes("your_clerk");
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {hasUsableClerk ? <ClerkProvider>{children}</ClerkProvider> : <>{children}</>}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
