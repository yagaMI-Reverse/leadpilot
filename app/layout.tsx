import type { Metadata } from "next";
import { Calistoga, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({ weight: "400", subsets: ["latin"], variable: "--font-calistoga" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "LeadPilot — AI Lead Intake Assistant for Service Businesses",
  description:
    "Never lose another inquiry. LeadPilot's AI assistant qualifies every lead, books the follow-up, and sends it to your team — in chat, 24/7.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${calistoga.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
