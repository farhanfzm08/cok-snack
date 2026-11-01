"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PackageCheck,
  ShoppingBasket,
  Clock,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [todayOmzet, setTodayOmzet] = useState(0);
  const [todayTxCount, setTodayTxCount] = useState(0);
  const [todayGrossProfit, setTodayGrossProfit] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentRepacks, setRecentRepacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split("T")[0];

        // 1. Fetch Sales
        const { data: salesData } = await supabase
          .from("sales")
          .select("*")
          .order("sale_date", { ascending: false });

        if (salesData) {
          const todaySales = salesData.filter((s: any) =>
            s.sale_date.startsWith(todayStr)
          );

          const omzet = todaySales.reduce(
            (sum: number, s: any) => sum + Number(s.total_amount || 0),
            0
          );
          const cogs = todaySales.reduce(
            (sum: number, s: any) => sum + Number(s.total_cogs || 0),
            0
          );

          setTodayOmzet(omzet);
          setTodayTxCount(todaySales.length);
          setTodayGrossProfit(omzet - cogs);
          setRecentSales(salesData.slice(0, 5));
        }

        // 2. Fetch Expenses Today
        const { data: expenseData } = await supabase
          .from("cash_movements")
          .select("amount")
          .eq("type", "expense")
          .eq("movement_date", todayStr);

        if (expenseData) {
          const expense = expenseData.reduce(
            (sum: number, e: any) => sum + Number(e.amount || 0),
            0
          );
          setTodayExpense(expense);
        }

        // 3. Fetch Products for Low Stock Alert
        const { data: prodData } = await supabase
          .from("products")
          .select("current_stock, min_stock_alert")
          .eq("is_active", true);

        if (prodData) {
          const lowStock = prodData.filter(
            (p: any) => Number(p.current_stock) <= Number(p.min_stock_alert)
          );
          setLowStockCount(lowStock.length);
        }

        // 4. Fetch Repacking Orders
        const { data: repackData } = await supabase
          .from("repacking_orders")
          .select("*, raw_product:products!raw_material_product_id(name), finished_product:products!finished_product_id(name)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (repackData) {
          setRecentRepacks(repackData);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summaryCards = [
    {
      title: "Omzet Hari Ini",
      value: formatRupiah(todayOmzet),
      subtitle: `${todayTxCount} transaksi selesai`,
      icon: TrendingUp,
      accent: "lavender" as const,
      iconColor: "text-primary",
      iconBg: "bg-lavender",
    },
    {
      title: "Estimasi Laba Kotor",
      value: formatRupiah(todayGrossProfit),
      subtitle: "Omzet dikurangi modal HPP",
      icon: Sparkles,
      accent: "mint" as const,
      iconColor: "text-success",
      iconBg: "bg-mint",
    },
    {
      title: "Pengeluaran Hari Ini",
      value: formatRupiah(todayExpense),
      subtitle: "Biaya operasional & kemasan",
      icon: Wallet,
      accent: "peach" as const,
      iconColor: "text-[#A04128]",
      iconBg: "bg-peach",
    },
    {
      title: "Peringatan Stok Menipis",
      value: `${lowStockCount} Produk`,
      subtitle: "Perlu repacking / belanja",
      icon: AlertTriangle,
      accent: "yellow" as const,
      iconColor: "text-warning",
      iconBg: "bg-yellow",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <Badge variant="lavender">SAE Snack System Aktif</Badge>
            <Badge variant="mint">Database Terhubung</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Halo, Selamat Datang di Dashboard SAE Snack!
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Sistem manajemen stok curah kg, produksi repacking ke gram, dan kasir
            penjualan telah terhubung dengan database Supabase PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pos">
            <Button variant="primary" size="md">
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Kasir</span>
            </Button>
          </Link>
          <Link href="/repacking">
            <Button variant="secondary" size="md">
              <PackageCheck className="w-4 h-4" />
              <span>Input Repack</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} pastelAccent={card.accent}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted tracking-tight">
                  {card.title}
                </p>
                <div
                  className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted mt-1">{card.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grid: Production/Stock Overview & Quick Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Repack & Stock Quick Action */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Aktivitas Produksi Repacking Terkini"
              subtitle="Konversi bahan mentah (kg) menjadi kemasan snack eceran (gram)"
              action={
                <Link href="/repacking">
                  <Button variant="ghost" size="sm">
                    <span>Lihat Semua</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              }
            />

            {recentRepacks.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl bg-background/50 border border-dashed border-line">
                <div className="w-12 h-12 rounded-2xl bg-mint text-success flex items-center justify-center mb-3">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Belum Ada Batch Repacking
                </h4>
                <p className="text-xs text-muted max-w-sm mt-1">
                  Catat proses repacking dari bahan curah kiloan menjadi bungkus kemasan kecil dengan kalkulasi HPP otomatis.
                </p>
                <Link href="/repacking" className="mt-4">
                  <Button variant="secondary" size="sm">
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Mulai Repacking Pertama</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">No. Batch</th>
                      <th className="py-2.5 px-3">Bahan Curah</th>
                      <th className="py-2.5 px-3">Hasil Repack</th>
                      <th className="py-2.5 px-3 text-right">HPP / Bks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {recentRepacks.map((r) => (
                      <tr key={r.id} className="hover:bg-background/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {r.order_number}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.raw_product?.name} ({r.raw_material_used_kg} kg)
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-success">
                          +{r.actual_output_packs} bks ({r.finished_product?.name})
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-primary">
                          {formatRupiah(r.calculated_cogs_per_pack)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Aktivitas Transaksi Penjualan Terkini"
              subtitle="Riwayat struk kasir dan pergerakan kas masuk"
              action={
                <Link href="/pos">
                  <Button variant="ghost" size="sm">
                    <span>Buka Kasir</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              }
            />

            {recentSales.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center rounded-2xl bg-background/50 border border-dashed border-line">
                <div className="w-12 h-12 rounded-2xl bg-peach text-[#A04128] flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Belum Ada Transaksi Kasir
                </h4>
                <p className="text-xs text-muted max-w-sm mt-1">
                  Seluruh transaksi kasir akan tercatat secara atomik di database
                  dengan rincian produk, metode bayar (Tunai/QRIS/Transfer), dan snapshot HPP.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">No. Invoice</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Metode</th>
                      <th className="py-2.5 px-3 text-right">Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {recentSales.map((s) => (
                      <tr key={s.id} className="hover:bg-background/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {s.invoice_number}
                        </td>
                        <td className="py-2.5 px-3 text-muted">
                          {new Date(s.sale_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 uppercase font-mono text-[11px] font-semibold text-muted">
                          {s.payment_method}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-success">
                          {formatRupiah(s.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Quick Links & Master Data Progress */}
        <div className="space-y-6">
          <Card pastelAccent="lavender">
            <CardHeader title="Navigasi Cepat Modul" />
            <div className="space-y-2">
              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-lavender/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface text-primary flex items-center justify-center border border-line">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Katalog Produk
                    </p>
                    <p className="text-[11px] text-muted">
                      Kelola SKU & harga snack
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/finance"
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-mint/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface text-success flex items-center justify-center border border-line">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Keuangan & Arus Kas
                    </p>
                    <p className="text-[11px] text-muted">
                      Buku kas keluar & masuk
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-success transition-colors" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-sky/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface text-[#1D5B99] flex items-center justify-center border border-line">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Laporan & Rekapitulasi
                    </p>
                    <p className="text-[11px] text-muted">
                      Omzet, HPP & ekspor CSV
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-[#1D5B99] transition-colors" />
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Informasi Sistem" />
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-line/60">
                <span className="text-muted">Database Engine</span>
                <span className="font-semibold text-foreground">
                  PostgreSQL 15+ Supabase
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/60">
                <span className="text-muted">Sistem Arus Kas</span>
                <Badge variant="mint" size="sm">
                  Otomatis Terhubung
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/60">
                <span className="text-muted">Metode Kalkulasi</span>
                <span className="font-semibold text-foreground">
                  FIFO / FEFO & Snapshot HPP
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">Status Server</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
