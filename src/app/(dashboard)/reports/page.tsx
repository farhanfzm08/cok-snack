"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  TrendingUp,
  PackageCheck,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  FileSpreadsheet,
  Printer,
  X,
  Building2,
  FileText,
  CheckCircle2,
  Receipt,
  Trash2
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface SaleRecord {
  id: string;
  invoice_number: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  total_cogs: number;
  payment_method: string;
  sale_items?: {
    quantity: number;
    unit_price: number;
    subtotal: number;
    products?: { name: string; sku: string };
  }[];
}

interface RepackRecord {
  id: string;
  order_number: string;
  production_date: string;
  raw_material_used_kg: number;
  actual_output_packs: number;
  waste_shrinkage_grams: number;
  total_production_cost: number;
  calculated_cogs_per_pack: number;
  raw_product?: { name: string };
  finished_product?: { name: string };
}

interface StockMovementRecord {
  id: string;
  created_at: string;
  movement_type: string;
  quantity_change: number;
  stock_after: number;
  reason: string | null;
  products?: { name: string; unit: string; type: string };
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"sales" | "repack" | "stock">("sales");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [repacks, setRepacks] = useState<RepackRecord[]>([]);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Official PDF Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "COK SNACK (CEMILAN ORANG KAYA)",
    phone: "0812-3456-7890",
    address: "Jl. Industri Keripik No. 8, Indonesia",
  });

  useEffect(() => {
    // Load store settings if saved
    const saved = localStorage.getItem("cok_snack_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStoreSettings({
          storeName: parsed.storeName || "COK Snack",
          phone: parsed.phone || "0812-3456-7890",
          address: parsed.address || "Jl. Industri Keripik No. 8, Indonesia",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Sales
      const { data: salesData } = await supabase
        .from("sales")
        .select("*, sale_items(*, products(name, sku))")
        .order("sale_date", { ascending: false });

      if (salesData) setSales(salesData as any);

      // 2. Fetch Repacking Orders
      const { data: repackData } = await supabase
        .from("repacking_orders")
        .select("*, raw_product:products!raw_material_product_id(name), finished_product:products!finished_product_id(name)")
        .order("production_date", { ascending: false });

      if (repackData) setRepacks(repackData as any);

      // 3. Fetch Stock Movements
      const { data: movData } = await supabase
        .from("stock_movements")
        .select("*, products(name, unit, type)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (movData) setMovements(movData as any);
    } catch (err) {
      console.error("Gagal memuat data laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (s: any) => {
    if (!confirm(`Hapus transaksi penjualan "${s.invoice_number}" (${formatRupiah(Number(s.total_amount || 0))})?\n\nRiwayat penjualan di laporan dan catatan kas masuk terkait akan ikut terhapus.`)) return;

    try {
      // 1. Hapus kas terkait jika ada
      await supabase.from("cash_movements").delete().eq("reference_id", s.id);
      await supabase.from("cash_movements").delete().eq("reference_id", s.invoice_number);
      // 2. Hapus sale (cascade delete sale_items)
      const { error } = await supabase.from("sales").delete().eq("id", s.id);
      if (error) throw error;

      fetchReportsData();
    } catch (err: any) {
      alert("Gagal menghapus transaksi: " + err.message);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Filter Helper
  const filterByDate = (dateStr: string) => {
    if (dateFilter === "all") return true;
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter === "today") {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }

    if (dateFilter === "month") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  };

  const filteredSales = sales.filter((s) => filterByDate(s.sale_date));
  const filteredRepacks = repacks.filter((r) => filterByDate(r.production_date));
  const filteredMovements = movements.filter((m) => filterByDate(m.created_at));

  // Calculations for Sales Report
  const totalOmzet = filteredSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalCogs = filteredSales.reduce((sum, s) => sum + Number(s.total_cogs || 0), 0);
  const grossProfit = totalOmzet - totalCogs;
  const profitMargin = totalOmzet > 0 ? (grossProfit / totalOmzet) * 100 : 0;

  // Print Handler
  const handlePrintPdf = () => {
    window.print();
  };

  // CSV Export Handler
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `laporan-cok-snack-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;

    if (activeTab === "sales") {
      headers = ["No. Invoice", "Tanggal", "Metode Bayar", "Subtotal", "Diskon", "Total Omzet", "Total HPP", "Laba Kotor"];
      rows = filteredSales.map((s) => [
        s.invoice_number,
        new Date(s.sale_date).toLocaleString("id-ID"),
        s.payment_method,
        s.subtotal,
        s.discount,
        s.total_amount,
        s.total_cogs,
        s.total_amount - s.total_cogs,
      ]);
    } else if (activeTab === "repack") {
      headers = ["No. Order", "Tanggal", "Bahan Baku", "Bahan Digunakan (kg)", "Produk Jadi", "Hasil (Bungkus)", "Susut (Gram)", "Total Biaya", "HPP per Bungkus"];
      rows = filteredRepacks.map((r) => [
        r.order_number,
        r.production_date,
        r.raw_product?.name || "-",
        r.raw_material_used_kg,
        r.finished_product?.name || "-",
        r.actual_output_packs,
        r.waste_shrinkage_grams,
        r.total_production_cost,
        r.calculated_cogs_per_pack,
      ]);
    } else {
      headers = ["Waktu", "Nama Produk", "Tipe Mutasi", "Perubahan Kuantitas", "Stok Akhir", "Keterangan"];
      rows = filteredMovements.map((m) => [
        new Date(m.created_at).toLocaleString("id-ID"),
        m.products?.name || "-",
        m.movement_type,
        m.quantity_change,
        m.stock_after,
        m.reason || "-",
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPeriodeLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Hari Ini (" + new Date().toLocaleDateString("id-ID", { dateStyle: "long" }) + ")";
      case "week":
        return "7 Hari Terakhir";
      case "month":
        return "Bulan Ini (" + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + ")";
      default:
        return "Semua Periode Transaksi";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>Laporan & Rekapitulasi Usaha</span>
          </h1>
          <p className="text-sm text-muted">
            Evaluasi omzet kasir, laba kotor UMKM, efisiensi repacking, dan dokumen resmi cetak PDF.
          </p>
        </div>

        {/* Action Buttons & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Buttons */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-line text-xs font-semibold">
            {(["all", "today", "week", "month"] as const).map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateFilter === df ? "bg-primary text-white shadow-2xs" : "text-muted hover:text-foreground"
                }`}
              >
                {df === "all" ? "Semua" : df === "today" ? "Hari Ini" : df === "week" ? "7 Hari" : "Bulan Ini"}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="text-xs h-8 border-line hover:border-primary gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPdfModalOpen(true)}
            className="text-xs h-8 bg-primary hover:bg-primary-dark text-white gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Resmi (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-line pb-1">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "sales"
              ? "bg-mint text-success font-bold shadow-2xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Laporan Penjualan & Laba Kotor ({filteredSales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("repack")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "repack"
              ? "bg-lavender text-primary-dark font-bold shadow-2xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Produksi Repacking ({filteredRepacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "stock"
              ? "bg-sky text-[#1D5B99] font-bold shadow-2xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Audit Mutasi Stok ({filteredMovements.length})</span>
        </button>
      </div>

      {/* Content Tab 1: Sales Report */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-primary flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium">Total Omzet Penjualan</p>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{formatRupiah(totalOmzet)}</h3>
                <p className="text-[11px] text-muted">{filteredSales.length} transaksi kasir</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-peach flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium">Total Beban Pokok (HPP)</p>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{formatRupiah(totalCogs)}</h3>
                <p className="text-[11px] text-muted">Modal pokok barang terjual</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-peach text-accent-dark flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-mint flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium">Laba Kotor (Gross Profit)</p>
                <h3 className="text-lg font-bold text-success mt-0.5">{formatRupiah(grossProfit)}</h3>
                <p className="text-[11px] text-success font-semibold">Omzet - HPP Modal</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-mint text-success flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-yellow flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium">Margin Keuntungan</p>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{profitMargin.toFixed(1)}%</h3>
                <p className="text-[11px] text-muted">Persentase laba kotor</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow text-warning flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Sales Table */}
          <Card className="p-5">
            <CardHeader
              title="Daftar Rincian Transaksi Penjualan"
              subtitle="Data transaksi penjualan kasir beserta snapshot HPP dan perolehan laba kotor."
            />
            {filteredSales.length === 0 ? (
              <div className="py-12 text-center text-muted text-sm">
                Tidak ada data penjualan pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                      <th className="py-3 px-3">No. Faktur</th>
                      <th className="py-3 px-3">Waktu Transaksi</th>
                      <th className="py-3 px-3">Metode Bayar</th>
                      <th className="py-3 px-3 text-right">Omzet</th>
                      <th className="py-3 px-3 text-right">HPP</th>
                      <th className="py-3 px-3 text-right">Laba Kotor</th>
                      <th className="py-3 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredSales.map((s) => {
                      const profit = Number(s.total_amount || 0) - Number(s.total_cogs || 0);
                      return (
                        <tr key={s.id} className="hover:bg-background/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-foreground text-xs">{s.invoice_number}</td>
                          <td className="py-3 px-3 text-xs text-muted">
                            {new Date(s.sale_date).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="lavender" size="sm" className="uppercase font-mono">
                              {s.payment_method}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-foreground">
                            {formatRupiah(Number(s.total_amount || 0))}
                          </td>
                          <td className="py-3 px-3 text-right text-xs text-muted">
                            {formatRupiah(Number(s.total_cogs || 0))}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-success">
                            {formatRupiah(profit)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDeleteSale(s)}
                              className="p-1 rounded-lg text-muted hover:text-danger hover:bg-rose-50 transition-colors"
                              title="Hapus Transaksi Penjualan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Content Tab 2: Repacking Report */}
      {activeTab === "repack" && (
        <Card className="p-5">
          <CardHeader
            title="Rekapitulasi Produksi Repacking"
            subtitle="Laporan pemakaian bahan baku curah (kg), output kemasan (bungkus), dan susut produksi."
          />
          {filteredRepacks.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">
              Belum ada riwayat repacking pada periode ini.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                    <th className="py-3 px-3">No. Order</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Bahan Baku (Curah)</th>
                    <th className="py-3 px-3">Hasil Jadi (Kemasan)</th>
                    <th className="py-3 px-3 text-right">Susut</th>
                    <th className="py-3 px-3 text-right">Total Biaya</th>
                    <th className="py-3 px-3 text-right">HPP / Bungkus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredRepacks.map((r) => (
                    <tr key={r.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground text-xs">{r.order_number}</td>
                      <td className="py-3 px-3 text-xs text-muted">{r.production_date}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground text-xs">{r.raw_product?.name || "-"}</p>
                        <p className="text-[11px] text-muted">{r.raw_material_used_kg} kg dipakai</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground text-xs">{r.finished_product?.name || "-"}</p>
                        <p className="text-[11px] text-success font-semibold">{r.actual_output_packs} bungkus layak</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-danger">
                        {r.waste_shrinkage_grams} gram
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        {formatRupiah(Number(r.total_production_cost || 0))}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-primary-dark">
                        {formatRupiah(Number(r.calculated_cogs_per_pack || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Content Tab 3: Stock Movements Report */}
      {activeTab === "stock" && (
        <Card className="p-5">
          <CardHeader
            title="Riwayat Audit Pergerakan Stok (Audit Trail)"
            subtitle="Seluruh perubahan kuantitas stok barang masuk dan keluar secara atomik."
          />
          {filteredMovements.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">
              Belum ada mutasi stok tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Produk</th>
                    <th className="py-3 px-3">Tipe Mutasi</th>
                    <th className="py-3 px-3">Perubahan Stok</th>
                    <th className="py-3 px-3">Stok Akhir</th>
                    <th className="py-3 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredMovements.map((m) => {
                    const isPositive = m.quantity_change > 0;
                    return (
                      <tr key={m.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-3 px-3 text-xs font-mono text-muted">
                          {new Date(m.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground text-xs">{m.products?.name || "Produk"}</p>
                          <Badge variant={m.products?.type === "raw_material" ? "lavender" : "mint"} size="sm">
                            {m.products?.type === "raw_material" ? "Bahan Curah" : "Produk Jadi"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="uppercase text-xs font-mono font-semibold text-muted">
                            {m.movement_type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold text-xs ${isPositive ? "text-success" : "text-danger"}`}>
                            {isPositive ? "+" : ""}
                            {m.quantity_change} {m.products?.unit || ""}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-xs text-foreground">
                          {m.stock_after} {m.products?.unit || ""}
                        </td>
                        <td className="py-3 px-3 text-xs text-muted">{m.reason || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Modal / Printable Official PDF Report Document */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-black border border-gray-300 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
            {/* Top Toolbar (Hidden when printed) */}
            <div className="px-6 py-3.5 bg-gray-100 border-b border-gray-300 flex items-center justify-between flex-shrink-0 no-print">
              <div className="flex items-center gap-2 text-gray-800">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">Pratinjau Dokumen Laporan Resmi (Siap Cetak PDF)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrintPdf}
                  className="bg-primary hover:bg-primary-dark text-white text-xs h-8 px-4 gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF (A4)</span>
                </Button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Sheet Body (Formatted for Standard A4 Official Letterhead) */}
            <div
              id="official-report-document"
              className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-6 bg-white text-gray-900 font-sans"
            >
              {/* Kop Surat Resmi */}
              <div className="text-center pb-4 border-b-2 border-black relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-base">
                    S
                  </div>
                  <h1 className="text-2xl font-black tracking-tight uppercase text-black">
                    {storeSettings.storeName}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
                  Pusat Pengemasan Ulang (Repacking) & Penjualan Aneka Snack Berkualitas
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {storeSettings.address} â€¢ Telp/WhatsApp: {storeSettings.phone}
                </p>
                <div className="border-b border-black mt-2"></div>
              </div>

              {/* Judul Dokumen & Metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
                <div>
                  <h2 className="text-base font-extrabold text-black uppercase tracking-wider">
                    {activeTab === "sales"
                      ? "LAPORAN RESMI REKAPITULASI PENJUALAN & LABA KOTOR"
                      : activeTab === "repack"
                      ? "LAPORAN RESMI PRODUKSI REPACKING SNACK"
                      : "LAPORAN RESMI AUDIT MUTASI PERSEDIAAN"}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Periode Laporan: <strong>{getPeriodeLabel()}</strong>
                  </p>
                </div>
                <div className="text-right text-xs text-gray-600 font-mono">
                  <p>
                    No. Dokumen: <strong>DOC-REP-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}</strong>
                  </p>
                  <p>
                    Dicetak Pada: <strong>{new Date().toLocaleString("id-ID")}</strong>
                  </p>
                </div>
              </div>

              {/* Ringkasan Eksekutif (Jika Tab Penjualan) */}
              {activeTab === "sales" && (
                <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Total Transaksi</span>
                    <span className="font-bold text-sm text-black block mt-0.5">
                      {filteredSales.length} Transaksi
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Total Omzet Penjualan</span>
                    <span className="font-bold text-sm text-black block mt-0.5">
                      {formatRupiah(totalOmzet)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Beban Pokok (HPP)</span>
                    <span className="font-bold text-sm text-gray-700 block mt-0.5">
                      {formatRupiah(totalCogs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Laba Kotor (Gross Margin)</span>
                    <span className="font-bold text-sm text-black block mt-0.5">
                      {formatRupiah(grossProfit)} ({profitMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Tabel Rincian Data Resmi */}
              <div className="pt-2">
                <table className="w-full text-left border-collapse text-xs border border-gray-400">
                  <thead className="bg-gray-100 text-gray-900 border-b border-gray-400 font-bold uppercase tracking-wider">
                    {activeTab === "sales" ? (
                      <tr>
                        <th className="py-2.5 px-3 border-r border-gray-400">No.</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">No. Faktur</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Waktu</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Metode</th>
                        <th className="py-2.5 px-3 text-right border-r border-gray-400">Omzet (Rp)</th>
                        <th className="py-2.5 px-3 text-right border-r border-gray-400">HPP (Rp)</th>
                        <th className="py-2.5 px-3 text-right">Laba (Rp)</th>
                      </tr>
                    ) : activeTab === "repack" ? (
                      <tr>
                        <th className="py-2.5 px-3 border-r border-gray-400">No.</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">No. Order</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Tanggal</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Bahan Mentah</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Hasil Kemasan</th>
                        <th className="py-2.5 px-3 text-right border-r border-gray-400">Susut</th>
                        <th className="py-2.5 px-3 text-right">HPP/Pack</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-2.5 px-3 border-r border-gray-400">No.</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Waktu</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Nama Produk</th>
                        <th className="py-2.5 px-3 border-r border-gray-400">Tipe Mutasi</th>
                        <th className="py-2.5 px-3 text-right border-r border-gray-400">Perubahan</th>
                        <th className="py-2.5 px-3 text-right border-r border-gray-400">Stok Akhir</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {activeTab === "sales" ? (
                      filteredSales.map((s, idx) => (
                        <tr key={s.id} className="border-b border-gray-300">
                          <td className="py-2 px-3 border-r border-gray-300 text-center">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-gray-300 font-mono font-semibold">
                            {s.invoice_number}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300">
                            {new Date(s.sale_date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300 uppercase">{s.payment_method}</td>
                          <td className="py-2 px-3 border-r border-gray-300 text-right font-semibold">
                            {Number(s.total_amount || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300 text-right">
                            {Number(s.total_cogs || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            {(Number(s.total_amount || 0) - Number(s.total_cogs || 0)).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : activeTab === "repack" ? (
                      filteredRepacks.map((r, idx) => (
                        <tr key={r.id} className="border-b border-gray-300">
                          <td className="py-2 px-3 border-r border-gray-300 text-center">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-gray-300 font-mono">{r.order_number}</td>
                          <td className="py-2 px-3 border-r border-gray-300">{r.production_date}</td>
                          <td className="py-2 px-3 border-r border-gray-300">
                            {r.raw_product?.name} ({r.raw_material_used_kg} kg)
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300">
                            {r.finished_product?.name} ({r.actual_output_packs} bks)
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300 text-right text-red-600 font-mono">
                            {r.waste_shrinkage_grams} g
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            Rp {Number(r.calculated_cogs_per_pack || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      filteredMovements.map((m, idx) => (
                        <tr key={m.id} className="border-b border-gray-300">
                          <td className="py-2 px-3 border-r border-gray-300 text-center">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-gray-300">
                            {new Date(m.created_at).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300 font-semibold">{m.products?.name}</td>
                          <td className="py-2 px-3 border-r border-gray-300 uppercase">{m.movement_type}</td>
                          <td className="py-2 px-3 border-r border-gray-300 text-right font-bold">
                            {m.quantity_change > 0 ? "+" : ""}
                            {m.quantity_change}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-300 text-right">{m.stock_after}</td>
                          <td className="py-2 px-3">{m.reason || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {activeTab === "sales" && (
                    <tfoot className="bg-gray-100 font-bold border-t-2 border-black">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 border-r border-gray-400 text-right">
                          TOTAL KESELURUHAN:
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-400 text-right">
                          {totalOmzet.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 border-r border-gray-400 text-right">
                          {totalCogs.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right">{grossProfit.toLocaleString("id-ID")}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Lembar Tanda Tangan & Validasi Formal */}
              <div className="pt-8 border-t border-gray-300 grid grid-cols-2 text-center text-xs text-gray-800 break-inside-avoid">
                <div className="space-y-16">
                  <p>
                    Dibuat Oleh,<br />
                    <strong>Bagian Operasional / Kasir</strong>
                  </p>
                  <p className="border-t border-gray-400 w-44 mx-auto pt-1 font-semibold">
                    ( ............................................ )
                  </p>
                </div>

                <div className="space-y-16">
                  <p>
                    Mengetahui & Menyetujui,<br />
                    <strong>Pemilik Usaha (Owner)</strong>
                  </p>
                  <p className="border-t border-gray-400 w-44 mx-auto pt-1 font-semibold">
                    ( ............................................ )
                  </p>
                </div>
              </div>

              {/* Disclaimer Footer */}
              <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-500 font-mono">
                *** Dokumen laporan ini dibuat secara terkomputerisasi melalui COK Snack Management System dan sah sebagai arsip laporan internal. ***
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Style Injector */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-report-document,
          #official-report-document * {
            visibility: visible;
          }
          #official-report-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
