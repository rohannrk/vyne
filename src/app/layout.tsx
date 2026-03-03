import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DialRoot } from "dialkit";
import { TRPCProvider } from "@/components/shared/trpc-provider";
import "./globals.css";
import "dialkit/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vyne",
  description: "Visual component design tool for shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
        <DialRoot />
      </body>
    </html>
  );
}
