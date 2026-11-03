import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COK Snack - Cemilan Orang Kaya",
  description: "Sistem manajemen stok, repacking, dan kasir POS COK Snack (Cemilan Orang Kaya).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
