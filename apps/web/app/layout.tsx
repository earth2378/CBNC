import type { Metadata } from "next";
import type { ReactNode } from "react";

import SiteHeader from "../src/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBNC",
  description: "Employee name card prototype"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
