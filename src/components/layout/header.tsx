"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, PackageCheck, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export function Header({ onOpenMobileMenu, title = "Dashboard" }: HeaderProps) {
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-line px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-muted hover:bg-background focus:outline-none"
          aria-label="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {title}
          </h2>
          <p className="text-xs text-muted hidden sm:block">
            {currentDateStr || "Memuat tanggal..."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick shortcut to Kasir POS */}
        <Link
          href="/pos"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-peach text-[#A04128] text-xs font-semibold hover:bg-peach/80 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Buka Kasir</span>
        </Link>

        {/* Quick shortcut to Repacking */}
        <Link
          href="/repacking"
          className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-mint text-success text-xs font-semibold hover:bg-mint/80 transition-colors"
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Repacking</span>
        </Link>

        {/* User Role Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-line">
          <div className="w-8 h-8 rounded-full bg-lavender text-primary flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-none">
              Owner
            </p>
            <Badge variant="mint" size="sm" className="mt-0.5">
              Aktif
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
