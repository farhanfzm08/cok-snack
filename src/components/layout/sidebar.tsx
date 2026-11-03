"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Store,
  BookOpen,
  X,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  { name: "Produk & Stok", href: "/products", icon: Package },
  { name: "Laporan Penjualan", href: "/reports", icon: BarChart3 },
  { name: "Panduan Sistem", href: "/tutorial", icon: BookOpen, pastelBg: "bg-sky" },
  { name: "Pengaturan Toko", href: "/settings", icon: Settings },
  { name: "Profil Saya", href: "/profile", icon: User },
];

// Role-based menu visibility
const ROLE_MENU: Record<string, string[]> = {
  kasir: ["/pos", "/dashboard", "/profile"],
  admin: ["/pos", "/dashboard", "/products", "/reports", "/tutorial", "/profile"],
  owner: ["*"],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("kasir");
  const [userEmail, setUserEmail] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("COK Snack");
  const [tagline, setTagline] = useState<string>("Cemilan Orang Kaya");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserRole((user.user_metadata?.role as string) || "kasir");
        setUserEmail(user.email || "");
      }
    });

    const loadStoreInfo = () => {
      const saved = localStorage.getItem("cok_snack_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.storeName) setStoreName(parsed.storeName);
          if (parsed.tagline) setTagline(parsed.tagline);
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadStoreInfo();
    window.addEventListener("cok_snack_settings_updated", loadStoreInfo);
    window.addEventListener("storage", loadStoreInfo);
    return () => {
      window.removeEventListener("cok_snack_settings_updated", loadStoreInfo);
      window.removeEventListener("storage", loadStoreInfo);
    };
  }, []);

  const roleBg: Record<string, string> = {
    owner: "bg-[#E8E0F8] text-[#7C5CBF]",
    admin: "bg-[#DDF3E4] text-green-700",
    kasir: "bg-[#DCEBFA] text-blue-700",
  };

  const roleLabel: Record<string, string> = {
    owner: "👑 Owner",
    admin: "⚙️ Admin",
    kasir: "🧾 Kasir",
  };

  const content = (
    <aside className="w-64 h-full bg-surface border-r border-line flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-line">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center font-bold shrink-0 border border-line">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base tracking-tight text-foreground truncate" title={storeName}>
                {storeName}
              </h1>
              <p className="text-[11px] text-muted -mt-0.5 font-medium truncate" title={tagline}>
                {tagline}
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
          {navItems
            .filter((item) => {
              const allowed = ROLE_MENU[userRole] || ROLE_MENU["kasir"];
              if (allowed[0] === "*") return true;
              return allowed.some((r) => item.href.startsWith(r));
            })
            .map((item) => {
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
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-lavender/40 transition-colors group"
          title="Buka Profil Saya"
        >
          <div className="w-9 h-9 rounded-xl bg-lavender text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {userEmail || "COK Snack System"}
            </p>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${roleBg[userRole] || roleBg["kasir"]}`}>
              {roleLabel[userRole] || userRole}
            </span>
          </div>
        </Link>
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
