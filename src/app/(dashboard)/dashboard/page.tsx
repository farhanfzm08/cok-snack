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
  Trophy,
  Users,
  CreditCard,
  Banknote,
  QrCode,
  X,
  User
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getLocalSettings, syncStoreSettings } from "@/lib/settings";

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

interface TopProduct {
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopBuyer {
  name: string;
  totalSpent: number;
  totalItems: number;
  txCount: number;
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("COK Snack");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [todayOmzet, setTodayOmzet] = useState(0);
  const [todayTxCount, setTodayTxCount] = useState(0);
  const [todayGrossProfit, setTodayGrossProfit] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  // Advanced Analytics
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [paymentStats, setPaymentStats] = useState({
    cash: 0,
    qris: 0,
    transfer: 0,
    total: 0,
  });

  // Search & Filter Produk di Dashboard
  const [searchProduct, setSearchProduct] = useState("");

  // Modal Tambah Stok Cepat
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [stockAddAmount, setStockAddAmount] = useState("20");
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = getLocalSettings();
    setStoreName(s.storeName);

    syncStoreSettings().then((cloud) => {
      if (cloud) setStoreName(cloud.storeName);
    });
  }, []);

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

      // 2. Fetch Sales with items
      const { data: salesData } = await supabase
        .from("sales")
        .select("*, sale_items(*, products(name, categories(name)))")
        .order("sale_date", { ascending: false });

      if (salesData) {
        // Sales Hari Ini
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

        // Hitung Top 3 Produk Terlaris
        const productMap: Record<string, TopProduct> = {};
        salesData.forEach((s: any) => {
          if (Array.isArray(s.sale_items)) {
            s.sale_items.forEach((item: any) => {
              const pName = item.products?.name || "Produk";
              const pCat = item.products?.categories?.name || "Snack";
              if (!productMap[pName]) {
                productMap[pName] = {
                  name: pName,
                  category: pCat,
                  totalSold: 0,
                  totalRevenue: 0,
                };
              }
              productMap[pName].totalSold += Number(item.quantity || 0);
              productMap[pName].totalRevenue += Number(item.subtotal || 0);
            });
          }
        });
        const sortedProducts = Object.values(productMap)
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 3);
        setTopProducts(sortedProducts);

        // Hitung Top 3 Buyer (Case-insensitive & Akurat menghitung total produk)
        const buyerMap: Record<string, TopBuyer> = {};
        salesData.forEach((s: any) => {
          // Prioritas: customer_name > notes (strip prefix) > "Umum"
          let bName = (s.customer_name || "").trim();
          if (!bName || bName.toLowerCase() === "umum") {
            // Fallback ke notes jika customer_name kosong/default
            const notesVal = (s.notes || "").trim();
            if (notesVal && notesVal !== "Penjualan Kasir POS" && notesVal.toLowerCase() !== "umum") {
              bName = notesVal.replace(/^Pembeli:\s*/i, "").trim();
            }
          }
          if (!bName || bName === "Penjualan Kasir POS") {
            bName = "Umum";
          }

          // Case-insensitive key agar "Mami" dan "mami" digabung menjadi 1 pembeli yang sama
          const key = bName.toLowerCase();

          // Hitung total produk / bungkus yang dibeli pada transaksi ini
          const itemsCount = Array.isArray(s.sale_items)
            ? s.sale_items.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0)
            : 0;

          if (!buyerMap[key]) {
            // Format nama tampilan rapi (Title Case)
            const words = bName
              .split(/\s+/)
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
            const formattedName = words.join(" ");

            buyerMap[key] = {
              name: formattedName,
              totalSpent: 0,
              totalItems: 0,
              txCount: 0,
            };
          }

          buyerMap[key].totalSpent += Number(s.total_amount || 0);
          buyerMap[key].totalItems += itemsCount;
          buyerMap[key].txCount += 1;
        });

        // Urutkan buyer: yang punya nama (bukan "Umum") diprioritaskan,
        // lalu sort berdasarkan total belanja tertinggi, lalu total produk terbanyak
        const allBuyers = Object.values(buyerMap).sort((a, b) => {
          if (a.name.toLowerCase() === "umum" && b.name.toLowerCase() !== "umum") return 1;
          if (a.name.toLowerCase() !== "umum" && b.name.toLowerCase() === "umum") return -1;
          return b.totalSpent - a.totalSpent || b.totalItems - a.totalItems;
        });

        // Top 3 excluding "Umum", fallback to include "Umum" if not enough
        const namedBuyers = allBuyers.filter((b) => b.name.toLowerCase() !== "umum").slice(0, 3);
        const sortedBuyers =
          namedBuyers.length >= 3
            ? namedBuyers
            : [...namedBuyers, ...allBuyers.filter((b) => b.name.toLowerCase() === "umum")].slice(0, 3);
        setTopBuyers(sortedBuyers);

        // Hitung Metode Pembayaran
        let cash = 0;
        let qris = 0;
        let transfer = 0;
        salesData.forEach((s: any) => {
          const amt = Number(s.total_amount || 0);
          if (s.payment_method === "cash") cash += amt;
          else if (s.payment_method === "qris") qris += amt;
          else if (s.payment_method === "transfer") transfer += amt;
        });
        setPaymentStats({
          cash,
          qris,
          transfer,
          total: cash + qris + transfer,
        });
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
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border border-success/40 bg-surface text-success text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner / Welcome Action */}
      <div className="bg-surface border border-line rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <Badge variant="lavender">{storeName} Aktif</Badge>
            <Badge variant="mint">Database Terhubung</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Halo, Selamat Datang di {storeName}!
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Sistem kasir penjualan snack kemasan, pemantauan stok produk, dan rekapitulasi laba harian terintegrasi.
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

      {/* SECTION LAPORAN PENTING: TOP 3 PRODUK & TOP 3 BUYER & PAYMENT STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TOP 3 PRODUK TERLARIS */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow text-warning flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Top 3 Produk Terlaris</h3>
                  <p className="text-[11px] text-muted">Snack paling banyak dibeli</p>
                </div>
              </div>
              <Badge variant="yellow" size="sm">Best Seller</Badge>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                Belum ada data penjualan tercatat.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const rankIcons = ["🥇", "🥈", "🥉"];
                  const rankColors = ["bg-yellow/30 text-warning border-yellow/50", "bg-sky/30 text-[#1D5B99] border-sky/50", "bg-peach/30 text-accent-dark border-peach/50"];
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-background border border-line flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[i]}`}>
                          {rankIcons[i]}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs text-foreground">{p.totalSold} bungkus</p>
                        <p className="text-[11px] text-success font-semibold">{formatRupiah(p.totalRevenue)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* TOP 3 BUYER / PEMBELI TERBANYAK */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-mint text-success flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Top 3 Pembeli (Buyer)</h3>
                  <p className="text-[11px] text-muted">Pelanggan transaksi tertinggi</p>
                </div>
              </div>
              <Badge variant="mint" size="sm">Top Spender</Badge>
            </div>

            {topBuyers.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                Belum ada transaksi dengan nama pembeli.
              </div>
            ) : (
              <div className="space-y-3">
                {topBuyers.map((b, i) => {
                  const rankIcons = ["🥇", "🥈", "🥉"];
                  const rankColors = ["bg-mint/30 text-success border-mint/50", "bg-lavender/40 text-primary border-primary/30", "bg-peach/30 text-accent-dark border-peach/50"];
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-background border border-line flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[i]}`}>
                          {rankIcons[i]}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate uppercase">{b.name}</p>
                          <p className="text-[11px] text-muted">
                            <span className="font-semibold text-foreground">{b.totalItems} produk</span> ({b.txCount} transaksi)
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs text-primary">{formatRupiah(b.totalSpent)}</p>
                        <p className="text-[10px] text-muted">Total Belanja</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* METODE PEMBAYARAN & RATIO */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky text-[#1D5B99] flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Metode Pembayaran</h3>
                  <p className="text-[11px] text-muted">Distribusi transaksi kasir</p>
                </div>
              </div>
              <Badge variant="sky" size="sm">Omzet</Badge>
            </div>

            <div className="space-y-2.5">
              {/* Tunai */}
              <div className="p-2.5 rounded-xl bg-background border border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-success" />
                  <span className="text-xs font-semibold text-foreground">Tunai (Cash)</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{formatRupiah(paymentStats.cash)}</span>
                  <span className="text-[10px] text-muted ml-1.5">
                    ({paymentStats.total > 0 ? Math.round((paymentStats.cash / paymentStats.total) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* QRIS */}
              <div className="p-2.5 rounded-xl bg-background border border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">QRIS</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{formatRupiah(paymentStats.qris)}</span>
                  <span className="text-[10px] text-muted ml-1.5">
                    ({paymentStats.total > 0 ? Math.round((paymentStats.qris / paymentStats.total) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Transfer */}
              <div className="p-2.5 rounded-xl bg-background border border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1D5B99]" />
                  <span className="text-xs font-semibold text-foreground">Transfer Bank</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">{formatRupiah(paymentStats.transfer)}</span>
                  <span className="text-[10px] text-muted ml-1.5">
                    ({paymentStats.total > 0 ? Math.round((paymentStats.transfer / paymentStats.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs">
            <span className="text-muted font-medium">Total Terkumpul:</span>
            <span className="font-bold text-sm text-foreground">{formatRupiah(paymentStats.total)}</span>
          </div>
        </Card>
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
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setStockAddAmount("20");
                            setIsStockModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-line bg-surface hover:bg-lavender/30 hover:border-primary text-foreground transition-colors"
                          title="Tambah Stok Bungkus"
                        >
                          <Plus className="w-3.5 h-3.5 text-primary" />
                          <span>Tambah Stok</span>
                        </button>
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
              subtitle="Riwayat transaksi kasir beserta nama pembeli"
              action={
                <Link href="/reports">
                  <Button variant="ghost" size="sm">
                    <span>Lihat Laporan Lengkap</span>
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
                      <th className="py-2.5 px-3">Nama Pembeli</th>
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Metode Bayar</th>
                      <th className="py-2.5 px-3 text-right">Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {recentSales.map((s) => {
                      let buyer = (s.customer_name || "").trim();
                      if (!buyer && s.notes) {
                        buyer = s.notes.replace(/^Pembeli:\s*/i, "").trim();
                      }
                      if (!buyer || buyer === "Penjualan Kasir POS") buyer = "Umum";

                      return (
                        <tr key={s.id} className="hover:bg-background/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                            {s.invoice_number}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="lavender" size="sm" className="font-semibold uppercase text-[10px]">
                              {buyer}
                            </Badge>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Kolom Kanan: 1 Col Pintasan Navigasi */}
        <div className="space-y-6">
          <Card pastelAccent="lavender">
            <CardHeader title="Navigasi Menu Utama" />
            <div className="space-y-2">
              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-lavender/50 transition-colors group border border-line"
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
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-peach/50 transition-colors group border border-line"
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
                className="flex items-center justify-between p-3 rounded-xl bg-background hover:bg-sky/50 transition-colors group border border-line"
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
        </div>
      </div>

      {/* MODAL TAMBAH STOK CEPAT */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20">
              <div>
                <h3 className="text-sm font-bold text-foreground">Tambah Stok Snack Masuk</h3>
                <p className="text-xs text-muted truncate max-w-[220px]">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsStockModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddStock} className="p-5 space-y-4">
              <div className="p-3 bg-background rounded-xl border border-line flex justify-between items-center text-xs">
                <span className="text-muted">Stok Sekarang:</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedProduct.current_stock || 0} {selectedProduct.unit || "bks"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Jumlah Tambahan Stok Masuk (Bungkus)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAddAmount}
                  onChange={(e) => setStockAddAmount(e.target.value)}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-base font-bold text-foreground text-center focus:outline-hidden focus:border-primary"
                />
                <p className="text-[11px] text-muted mt-1.5 text-center">
                  Stok akhir akan menjadi:{" "}
                  <strong className="text-success font-bold">
                    {(Number(selectedProduct.current_stock) || 0) + (Number(stockAddAmount) || 0)}{" "}
                    {selectedProduct.unit || "bks"}
                  </strong>
                </p>
              </div>

              <div className="flex gap-2">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStockAddAmount(val.toString())}
                    className="flex-1 py-1 bg-background border border-line rounded-lg text-xs font-semibold text-muted hover:text-foreground hover:border-primary transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
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
                <Button type="submit" variant="primary" size="sm" disabled={isSavingStock}>
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
