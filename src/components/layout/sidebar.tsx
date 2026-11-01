"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  ShoppingBasket,
  Truck,
  PackageCheck,
  Wallet,
  BarChart3,
  Settings,
  Store,
  BookOpen,
  X,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  pastelBg?: string;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kasir (POS)", href: "/pos", icon: ShoppingCart, pastelBg: "bg-peach" },
  { name: "Produk", href: "/products", icon: Package },
  { name: "Persediaan", href: "/inventory", icon: Boxes },
  { name: "Pembelian", href: "/purchases", icon: ShoppingBasket },
  { name: "Supplier", href: "/suppliers", icon: Truck },
  { name: "Repacking", href: "/repacking", icon: PackageCheck, pastelBg: "bg-mint" },
  { name: "Keuangan", href: "/finance", icon: Wallet },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
  { name: "Panduan & Tutorial", href: "/tutorial", icon: BookOpen, pastelBg: "bg-sky" },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <aside className="w-64 h-full bg-surface border-r border-line flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-line">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-foreground">
                COK Snack
              </h1>
              <p className="text-[11px] text-muted -mt-0.5 font-medium">
                Cemilan Orang Kaya
              </p>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:bg-background"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted/80 uppercase">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-lavender/70 text-primary-dark font-semibold shadow-2xs"
                    : "text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-background text-muted group-hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-peach text-[#A04128]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-line bg-background/50">
        <div className="text-xs text-muted">
          <p className="font-semibold text-foreground">COK Snack System</p>
          <p className="text-[11px] text-muted">Cemilan Orang Kaya • v1.0</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 animate-masuk">{content}</div>
        </div>
      )}
    </>
  );
}
