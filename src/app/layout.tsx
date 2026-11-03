import type { Metadata } from "next";
import "./globals.css";
import { DynamicTitle } from "@/components/common/dynamic-title";

export const metadata: Metadata = {
  title: "Snack - Management",
  description: "Sistem Manajemen Bisnis Snack POS Kasir & Stok",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <DynamicTitle />
        {children}
      </body>
    </html>
  );
}
