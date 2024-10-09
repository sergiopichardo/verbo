import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

import { ConfigureAmplifyClient } from "@/components";

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
        <ConfigureAmplifyClient />
        <div className="flex flex-row gap-4 px-2 py-2 bg-orange-400">
          <Link href="/">Home</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}