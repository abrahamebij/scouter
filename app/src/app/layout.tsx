import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Space_Grotesk, Geist } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { SolanaProvider } from "@/providers/SolanaProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scouter | PreStocks Discovery & Research Terminal",
  description:
    "Discover, research, and compare tokenised pre-IPO assets available through PreStocks on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        plusJakarta.variable,
        inter.variable,
        spaceGrotesk.variable,
        "font-sans",
        geist.variable
      )}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router layout */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased flex flex-col">
        <SolanaProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </ToastProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
