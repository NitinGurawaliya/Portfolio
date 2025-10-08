import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "DevFolio - Create Your Developer Portfolio in Minutes",
    description: "DevFolio helps developers create stunning portfolios by importing projects from GitHub. Showcase your work, customize your profile, and share your developer journey with the world.",
    siteName: "DevFolio",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
    icon: "/devfolio-high-resolution-logo.png",
    shortcut: "/devfolio-high-resolution-logo.png",
    apple: "/devfolio-high-resolution-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/devfolio-high-resolution-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/devfolio-high-resolution-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/devfolio-high-resolution-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
