import type { Metadata } from "next";
import { Providers } from "@/components/Provider";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: "Bubbly",
  description: "Mapping the worlds water fountains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}