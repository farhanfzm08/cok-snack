"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export function Header({ onOpenMobileMenu, title = "Dashboard" }: HeaderProps) {
  const router = useRouter();
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("kasir");
  const [userEmail, setUserEmail] = useState<string>("");

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

    // Fetch user info
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserRole((user.user_metadata?.role as string) || "kasir");
        setUserEmail(user.email || "");
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const roleLabel: Record<string, string> = {
    owner: "👑 Owner",
    admin: "⚙️ Admin",
    kasir: "🧾 Kasir",
  };

  const roleBadgeVariant: Record<string, "lavender" | "mint" | "sky"> = {
    owner: "lavender",
    admin: "mint",
    kasir: "sky",
  };

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
        {/* User Role Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-lavender text-primary flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-none">
              {roleLabel[userRole] || userRole}
            </p>
            <Badge variant={roleBadgeVariant[userRole] || "lavender"} size="sm" className="mt-0.5">
              {userEmail ? userEmail.split("@")[0] : "Aktif"}
            </Badge>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-muted hover:bg-background hover:text-foreground transition-colors"
          aria-label="Keluar"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
