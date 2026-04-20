import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans, Space_Grotesk } from "next/font/google";
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
  title: "InstantAuthority.ai",
  description: "Build instant authority and get cited by AI.",
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
      </body>
    </html>
  );
}
