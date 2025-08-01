import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VolunTier",
  description: "Voluntier is a full-stack web application that helps students discover, track, and engage with community service opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
