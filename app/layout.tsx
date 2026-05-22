import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
        <Header />
        {children}
      </body>
    </html>
  );
}
