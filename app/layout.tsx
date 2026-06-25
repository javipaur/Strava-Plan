import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StravaForge — AI Running Coach",
    template: "%s | StravaForge",
  },
  description:
    "Convierte tu actividad de Strava en un plan de entrenamiento inteligente. Basado en tus datos reales, no en estimaciones.",

  applicationName: "StravaForge",

  keywords: [
    "strava",
    "running",
    "entrenamiento",
    "plan de entrenamiento",
    "running AI",
    "running coach",
    "maratón",
    "trail running",
  ],

  authors: [{ name: "StravaForge" }],
  creator: "StravaForge",

  metadataBase: new URL("https://stravaforge.com"),

  alternates: {
    canonical: "https://stravaforge.com",
  },

  openGraph: {
    title: "StravaForge — AI Running Coach",
    description:
      "Convierte tu actividad de Strava en un plan de entrenamiento inteligente basado en datos reales.",
    url: "https://stravaforge.com",
    siteName: "StravaForge",
    locale: "es_ES",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "StravaForge — AI Running Coach",
    description:
      "Tu Strava convertido en un plan de entrenamiento inteligente.",
    creator: "@stravaforge",
  },

  themeColor: "#F7F6F2",

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#111] antialiased">
        {children}
      </body>
    </html>
  );
}