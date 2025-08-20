import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Vocatio",
    description:
      "Vocatio helps students discover, track, and engage with verified community service opportunities.",
    url: "https://vocatio.app",
    siteName: "Vocatio",
    images: [
      {
        url: "/browsing_mockup.png",
        width: 3024,
        height: 1964,
        alt: "Preview of browsing community service opportunities on Vocatio",
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
    images: ["/browsing_mockup.png"],
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
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
