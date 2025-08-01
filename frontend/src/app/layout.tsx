import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"

export const metadata: Metadata = {
  title: "VolunTier",
  description: "Voluntier is a full-stack web application that helps students discover, track, and engage with community service opportunities.",
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {children}
      </body>
    </html>
  );
}
