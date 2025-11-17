import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevFolio - Create Your Developer Portfolio in Minutes",
    template: "%s | DevFolio"
  },
  description: "DevFolio helps developers create stunning portfolios by importing projects from GitHub. Showcase your work, customize your profile, and share your developer journey with the world.",
  keywords: ["developer portfolio", "github portfolio", "portfolio builder", "developer showcase", "coding portfolio", "github projects", "web developer portfolio"],
  authors: [{ name: "DevFolio" }],
  creator: "DevFolio",
  publisher: "DevFolio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  other: {
    "referrer": "origin-when-cross-origin"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DevFolio - Create Your Developer Portfolio in Minutes",
    description: "DevFolio helps developers create stunning portfolios by importing projects from GitHub. Showcase your work, customize your profile, and share your developer journey with the world.",
    siteName: "DevFolio",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/og-landing?v=${Math.floor(Date.now() / 3600000)}`,
        width: 1200,
        height: 630,
        alt: "DevFolio - Developer Portfolio Builder"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFolio - Create Your Developer Portfolio in Minutes",
    description: "DevFolio helps developers create stunning portfolios by importing projects from GitHub. Showcase your work and share your developer journey.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/og-landing?v=${Math.floor(Date.now() / 3600000)}`,
        width: 1200,
        height: 630,
        alt: "DevFolio - Developer Portfolio Builder"
      }
    ],
    creator: "@devfolio"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon-d.svg",
    shortcut: "/favicon-d.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="origin-when-cross-origin" />
        <script src="https://www.watchdog.mom/track.js" data-site="851a4075-b123-470a-a7ab-e57f268adaae"></script>
        <link rel="icon" href="/favicon-d.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon-d.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
