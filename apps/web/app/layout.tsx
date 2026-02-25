import type { Metadata } from "next";
import type { ReactNode } from "react";

import SiteHeader from "../src/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOT Name Card",
  description: "Digital employee name cards — multilingual, shareable, exportable"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="site-shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
