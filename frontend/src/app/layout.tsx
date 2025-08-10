import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Vocatio",
  description: "Vocatio is a full-stack web application that helps students discover, track, and engage with community service opportunities.",
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
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
