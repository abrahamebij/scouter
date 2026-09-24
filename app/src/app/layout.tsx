import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { TradingProvider } from "@/lib/hooks/useTrading";
import Web3Provider from "@/providers/Web3Provider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

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
  title: "xPrime | Prime Brokerage for Onchain Equities",
  description:
    "Unlock yield, leverage, and liquidity from your stock portfolio.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router layout, not Pages Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased">
        <Web3Provider cookies={cookies}>
          <TradingProvider>
            <ToastProvider>{children}</ToastProvider>
          </TradingProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
