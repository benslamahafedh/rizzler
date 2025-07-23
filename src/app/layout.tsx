import type { Metadata } from "next";
import "./globals.css";
import "./mobile-optimizations.css";
import "@/lib/polyfills";
import ErrorBoundary from "@/components/ErrorBoundary";

// Server initialization moved to runtime to prevent build issues

// Auto-transfer initialization moved to runtime only
// No build-time initialization to prevent deployment issues

export const metadata: Metadata = {
  title: "Rizzler - Dating Coach",
  description: "Level up your dating game with AI-powered pickup lines, bio optimization, and flirting tips.",
  keywords: ["dating coach", "pickup lines", "tinder bio", "flirting tips", "dating advice", "rizz"],
  authors: [{ name: "Rizzler" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#dc2626",
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Rizzler"
  },
  openGraph: {
    title: "Rizzler - Dating Coach",
    description: "Level up your dating game with AI-powered pickup lines, bio optimization, and flirting tips",
    type: "website",
    url: "https://rizzler-dating-coach.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rizzler Dating Coach"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizzler - Dating Coach",
    description: "Level up your dating game with AI-powered pickup lines, bio optimization, and flirting tips",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
