import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Header from "@/components/Header";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "HeyMies",
  description: "Smart. Simple. Sorted.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <MetaPixel />
        </Suspense>
        <Header />
        {children}
      </body>
    </html>
  );
}
