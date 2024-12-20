import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { Toaster } from "react-hot-toast";

import { Providers } from "@/providers";
import { DesktopNavigation } from "@/components/desktop-navigation";
import { Banner } from "@/components/banner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Verbo",
  description: "Translate text to any language in the world",
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
        <Providers>
          <div className="fixed top-0 left-0 w-full z-50">
            <Banner />
            <DesktopNavigation />
          </div>

          {children}
          <Toaster />

        </Providers>
      </body>
    </html>
  );
}