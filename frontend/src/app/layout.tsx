import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://vocatio.app"),
  title: {
    default: "Vocatio",
    template: "%s | Vocatio",
  },
  description:
    "Vocatio helps students discover, track, and engage with verified community service opportunities.",
  keywords: [
    "community service",
    "volunteer hours",
    "high school",
    "scholarships",
    "education",
  ],
  authors: [{ name: "Vocatio" }],
  openGraph: {
    title: "Vocatio",
    description:
      "Vocatio helps students discover, track, and engage with verified community service opportunities.",
    url: "https://vocatio.app",
    siteName: "Vocatio",
    images: [
      {
        url: "/dashboard-mockup.png",
        width: 1200,
        height: 630,
        alt: "Preview of the Vocatio dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocatio",
    description:
      "Discover verified community service opportunities and track hours with Vocatio.",
    images: ["/dashboard-mockup.png"],
  },
  icons: {
    icon: "/globe.svg",
  },
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
