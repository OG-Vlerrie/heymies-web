import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "HeyMies",
<<<<<<< HEAD
  description: "Smart. Simple. Sorted.",
=======
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en" className="bg-slate-50">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4">
          {children}
        </main>
=======
    <html lang="en">
      <body>
        <Header />
        {children}
>>>>>>> de317c9451e18b44415fb345ed03f23a18805a36
      </body>
    </html>
  );
}
