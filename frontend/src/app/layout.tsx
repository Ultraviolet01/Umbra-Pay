import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import { ChatWidget } from "@/components/landing/ChatWidget";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Umbra Pay — Private Payroll, Onchain",
  description:
    "Confidential on-chain payroll powered by Flare Confidential Compute (FCC) TEEs. Nobody sees what you earn.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bricolage.variable} ${jakarta.variable} antialiased`}
      >
        <Web3Provider>
          {children}
          <ChatWidget />
        </Web3Provider>
      </body>
    </html>
  );
}
