"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Package,
  Plus,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Search,
  CheckCircle2,
  Boxes,
  X,
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

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  package_weight_grams: number;
  unit: string;
  selling_price: number;
  cost_price?: number;
  current_stock: number;
  min_stock_alert: number;
  categories?: { name: string } | null;
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [todayOmzet, setTodayOmzet] = useState(0);
  const [todayTxCount, setTodayTxCount] = useState(0);
  const [todayGrossProfit, setTodayGrossProfit] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  // Search & Filter Produk di Dashboard
  const [searchProduct, setSearchProduct] = useState("");

  // Modal Tambah Stok Cepat
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [stockAddAmount, setStockAddAmount] = useState("20");
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Fetch Products
      const { data: prodData } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (prodData) {
        setProducts(prodData as ProductItem[]);
        const lowStock = prodData.filter(
          (p: any) => Number(p.current_stock) <= Number(p.min_stock_alert)
        );
        setLowStockCount(lowStock.length);
      }

      // 2. Fetch Sales
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
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const addNum = Number(stockAddAmount) || 0;
    if (addNum <= 0) return;

    setIsSavingStock(true);
    try {
      const newStock = Number(selectedProduct.current_stock || 0) + addNum;

      // 1. Update stock di products
      const { error } = await supabase
        .from("products")
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      // 2. Catat mutasi stok
      await supabase.from("stock_movements").insert([
        {
          product_id: selectedProduct.id,
          movement_type: "adjustment_found",
          quantity_change: addNum,
          stock_after: newStock,
          reason: "Tambah stok masuk dari dashboard",
        },
      ]);

      setToastMsg(`Stok "${selectedProduct.name}" berhasil ditambah +${addNum} bungkus!`);
      setIsStockModalOpen(false);
      setSelectedProduct(null);
      fetchDashboardData();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal menambah stok: " + err.message);
    } finally {
      setIsSavingStock(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const summaryCards = [
    {
      title: "Total Produk Aktif",
      value: `${products.length} Produk`,
      subtitle: "Snack kemasan siap jual",
      icon: Package,
      accent: "lavender" as const,
      iconColor: "text-primary",
      iconBg: "bg-lavender",
    },
    {
      title: "Omzet Hari Ini",
      value: formatRupiah(todayOmzet),
      subtitle: `${todayTxCount} transaksi kasir selesai`,
      icon: TrendingUp,
      accent: "peach" as const,
      iconColor: "text-[#A04128]",
      iconBg: "bg-peach",
    },
    {
      title: "Estimasi Laba Hari Ini",
      value: formatRupiah(todayGrossProfit),
      subtitle: "Omzet dikurangi modal HPP",
      icon: Sparkles,
      accent: "mint" as const,
      iconColor: "text-success",
      iconBg: "bg-mint",
    },
    {
      title: "Peringatan Stok Menipis",
      value: `${lowStockCount} Produk`,
      subtitle: lowStockCount > 0 ? "Perlu tambah stok bungkus!" : "Semua stok aman",
      icon: AlertTriangle,
      accent: "yellow" as const,
      iconColor: "text-warning",
      iconBg: "bg-yellow",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-lg border border-success/40 bg-surface text-success text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner / Welcome Action */}
      <div className="bg-surface border border-line rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <Badge variant="lavender">COK Snack System Aktif</Badge>
            <Badge variant="mint">Database Terhubung</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Halo, Selamat Datang di COK Snack!
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Sistem kasir penjualan snack kemasan dan monitoring persediaan stok produk secara terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pos">
            <Button variant="primary" size="md">
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Kasir</span>
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="md">
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
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

      {/* SECTION UTAMA: FOKUS MENAMPILKAN PRODUK */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-lavender/10">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span>Katalog & Persediaan Stok Produk</span>
            </h2>
            <p className="text-xs text-muted">
              Monitoring seluruh snack kemasan, harga jual, estimasi HPP, dan kuantiti stok saat ini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau kode produk..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-line rounded-xl text-xs focus:outline-hidden focus:border-primary"
              />
            </div>
            <Link href="/products">
              <Button variant="outline" size="sm" className="whitespace-nowrap text-xs">
                <span>Kelola Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Memuat data produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">Belum ada produk yang ditemukan</p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Silakan tambahkan produk snack baru untuk mulai berjualan di kasir.
            </p>
            <Link href="/products" className="inline-block mt-2">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tambah Produk Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold bg-surface/50">
                  <th className="py-3 px-4">Nama Produk & SKU</th>
                  <th className="py-3 px-4">Ukuran Kemasan</th>
                  <th className="py-3 px-4 text-right">Modal HPP</th>
                  <th className="py-3 px-4 text-right">Harga Jual Kasir</th>
                  <th className="py-3 px-4 text-center">Stok Tersedia</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredProducts.map((p) => {
                  const isLow = Number(p.current_stock) <= Number(p.min_stock_alert);
                  return (
                    <tr key={p.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                        <div className="text-muted font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <span>{p.sku}</span>
                          {p.categories?.name && (
                            <span className="text-primary font-sans bg-lavender/60 px-1.5 py-0.2 rounded-md">
                              {p.categories.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {p.package_weight_grams ? `${p.package_weight_grams} gram` : p.unit || "pack"}
                      </td>
                      <td className="py-3 px-4 text-right text-muted font-medium">
                        {formatRupiah(Number(p.cost_price || 0))}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground text-sm">
                        {formatRupiah(Number(p.selling_price || 0))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold text-sm ${
                            isLow ? "text-danger" : "text-foreground"
                          }`}
                        >
                          {Number(p.current_stock || 0)}
                        </span>{" "}
                        <span className="text-muted text-[11px]">{p.unit || "bks"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <Badge variant="peach" size="sm" className="inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-danger" />
                            Stok Tipis
                          </Badge>
                        ) : (
                          <Badge variant="mint" size="sm">
                            Aman
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(p);
                            setStockAddAmount("20");
                            setIsStockModalOpen(true);
                          }}
                          className="text-xs h-7 px-2.5 gap-1 border-line hover:border-primary text-muted hover:text-foreground"
                          title="Tambah Stok Masuk"
                        >
                          <Plus className="w-3 h-3 text-primary" />
                          <span>+ Stok</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grid Bawah: Transaksi Kasir Terkini & Navigasi Ringkas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: 2 Cols Transaksi Kasir Terkini */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <CardHeader
              title="Aktivitas Penjualan Kasir Terkini"
              subtitle="Riwayat struk kasir yang baru saja diselesaikan"
              action={
                <Link href="/reports">
                  <Button variant="ghost" size="sm">
                    <span>Lihat Laporan</span>
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
                  Belum Ada Transaksi Kasir Hari Ini
                </h4>
                <p className="text-xs text-muted max-w-sm mt-1">
                  Transaksi kasir akan otomatis tercatat di sini dan memotong stok produk secara atomik. Gunakan tombol "Buka Kasir" di atas untuk melayani pelanggan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">No. Invoice</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Metode Bayar</th>
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

        {/* Kolom Kanan: 1 Col Pintasan Cepat */}
        <div className="space-y-6">
          <Card pastelAccent="lavender">
            <CardHeader title="Navigasi Menu Utama" />
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
                      Katalog & Stok Produk
                    </p>
                    <p className="text-[11px] text-muted">
                      Kelola SKU, HPP, & harga jual
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/pos"
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-peach/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface text-[#A04128] flex items-center justify-center border border-line">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Kasir Toko (POS)
                    </p>
                    <p className="text-[11px] text-muted">
                      Transaksi & cetak struk kasir
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-[#A04128] transition-colors" />
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
                      Laporan Penjualan & Laba
                    </p>
                    <p className="text-[11px] text-muted">
                      Omzet, HPP, & cetak PDF resmi
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-[#1D5B99] transition-colors" />
              </Link>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              Alur Kerja Praktis COK Snack
            </h3>
            <ol className="text-xs text-muted space-y-2 list-decimal list-inside">
              <li>
                <strong className="text-foreground">Tambah Produk</strong> baru beserta modal HPP dan harga jual.
              </li>
              <li>
                <strong className="text-foreground">Tambah Stok</strong> bungkus jika ada produksi snack baru siap jual.
              </li>
              <li>
                <strong className="text-foreground">Kasir (POS)</strong> melayani pembeli dan mencetak struk.
              </li>
              <li>
                <strong className="text-foreground">Laporan</strong> memantau omzet & laba bersih otomatis!
              </li>
            </ol>
          </Card>
        </div>
      </div>

      {/* MODAL TAMBAH STOK CEPAT DI DASHBOARD */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-sm w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Stok Snack</h3>
                <p className="text-xs text-muted">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsStockModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddStock} className="space-y-4 text-sm">
              <div className="p-3 bg-background rounded-xl border border-line flex justify-between items-center text-xs">
                <span className="text-muted">Stok Saat Ini:</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedProduct.current_stock} {selectedProduct.unit || "bks"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Jumlah Stok Masuk ({selectedProduct.unit || "bungkus"}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockAddAmount}
                  onChange={(e) => setStockAddAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-line rounded-xl text-base font-bold text-primary focus:outline-hidden focus:border-primary"
                />
                <p className="text-[11px] text-muted mt-1">
                  Stok akhir akan menjadi:{" "}
                  <strong>
                    {Number(selectedProduct.current_stock || 0) +
                      (Number(stockAddAmount) || 0)}{" "}
                    {selectedProduct.unit || "bungkus"}
                  </strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsStockModalOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingStock}
                >
                  {isSavingStock ? "Menyimpan..." : "Simpan Tambah Stok"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
