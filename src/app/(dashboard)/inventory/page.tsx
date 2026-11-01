"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  History, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  X,
  Package,
  Layers,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  sku: string;
  name: string;
  type: "raw_material" | "finished_good";
  unit: string;
  package_weight_grams: number;
  current_stock: number;
  min_stock_alert: number;
  cost_price: number;
  selling_price: number;
  is_active: boolean;
}

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity_change: number;
  stock_after: number;
  cost_per_unit: number;
  reference_id: string | null;
  reason: string | null;
  created_at: string;
  product?: {
    name: string;
    unit: string;
    type: string;
  };
}

export default function InventoryPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "movements">("overview");
  const [typeFilter, setTypeFilter] = useState<"all" | "raw_material" | "finished_good" | "low_stock">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<"loss" | "found">("loss");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (prodErr) throw prodErr;
      setProducts(prodData || []);

      // 2. Fetch stock movements
      const { data: movData, error: movErr } = await supabase
        .from("stock_movements")
        .select(`
          *,
          product:products(name, unit, type)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (movErr) throw movErr;
      setMovements(movData || []);
    } catch (err: any) {
      console.error("Gagal memuat persediaan:", err.message);
      setErrorMsg("Gagal memuat data persediaan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAdjust = (p: Product) => {
    setSelectedProduct(p);
    setAdjustType("loss");
    setAdjustQty(0);
    setAdjustReason("");
    setErrorMsg(null);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (adjustQty <= 0) {
      setErrorMsg("Jumlah penyesuaian harus lebih dari 0");
      return;
    }
    if (adjustType === "loss" && adjustQty > selectedProduct.current_stock) {
      setErrorMsg(`Jumlah susut melebihi stok yang ada (${selectedProduct.current_stock} ${selectedProduct.unit})`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const change = adjustType === "loss" ? -adjustQty : adjustQty;
    const nextStock = Math.max(0, Number(selectedProduct.current_stock) + change);
    const movType = adjustType === "loss" ? "adjustment_loss" : "adjustment_found";

    try {
      // 1. Update product current_stock
      const { error: updErr } = await supabase
        .from("products")
        .update({
          current_stock: nextStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedProduct.id);
      if (updErr) throw updErr;

      // 2. Insert into stock_movements
      const { error: movErr } = await supabase
        .from("stock_movements")
        .insert([
          {
            product_id: selectedProduct.id,
            movement_type: movType,
            quantity_change: change,
            stock_after: nextStock,
            reason: adjustReason.trim() || (adjustType === "loss" ? "Penyesuaian susut/rusak" : "Penyesuaian stok lebih"),
          },
        ]);
      if (movErr) throw movErr;

      setSuccessMsg(`Stok ${selectedProduct.name} berhasil disesuaikan menjadi ${nextStock} ${selectedProduct.unit}.`);
      setIsAdjustModalOpen(false);
      loadInventory();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan penyesuaian stok.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const rawMaterials = products.filter((p) => p.type === "raw_material");
  const finishedGoods = products.filter((p) => p.type === "finished_good");
  const lowStockItems = products.filter((p) => Number(p.current_stock) <= Number(p.min_stock_alert));

  const totalRawWeightKg = rawMaterials.reduce((acc, p) => acc + Number(p.current_stock || 0), 0);
  const totalFinishedPacks = finishedGoods.reduce((acc, p) => acc + Number(p.current_stock || 0), 0);
  const totalAssetValue = rawMaterials.reduce(
    (acc, p) => acc + Number(p.current_stock || 0) * Number(p.cost_price || 0),
    0
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (typeFilter === "raw_material") return p.type === "raw_material";
    if (typeFilter === "finished_good") return p.type === "finished_good";
    if (typeFilter === "low_stock") return Number(p.current_stock) <= Number(p.min_stock_alert);
    return true;
  });

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return <Badge variant="mint">Beli Bahan</Badge>;
      case "repack_in":
        return <Badge variant="lavender">Repack Jadi</Badge>;
      case "repack_out":
        return <Badge variant="yellow">Repack Bahan</Badge>;
      case "sale":
        return <Badge variant="peach">Penjualan</Badge>;
      case "adjustment_loss":
        return <Badge variant="danger">Susut/Rusak</Badge>;
      case "adjustment_found":
        return <Badge variant="mint">Koreksi Tambah</Badge>;
      default:
        return <Badge variant="lavender">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Boxes className="w-6 h-6 text-primary" />
            Persediaan & Mutasi Stok
          </h1>
          <p className="text-sm text-muted">
            Monitoring stok bahan curah kg, produk jadi kemasan, dan audit trail pergerakan barang.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "overview" ? "primary" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-primary text-white" : ""}
          >
            <Layers className="w-4 h-4 mr-1.5" />
            Daftar Stok
          </Button>
          <Button
            variant={activeTab === "movements" ? "primary" : "outline"}
            onClick={() => setActiveTab("movements")}
            className={activeTab === "movements" ? "bg-primary text-white" : ""}
          >
            <History className="w-4 h-4 mr-1.5" />
            Riwayat Mutasi
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-mint/50 border border-success/30 text-success text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-danger text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Bahan Baku Curah</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {totalRawWeightKg.toLocaleString("id-ID")} Kg
            </h3>
            <p className="text-[11px] text-muted">{rawMaterials.length} jenis bahan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-mint flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Produk Jadi Siap Jual</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {totalFinishedPacks.toLocaleString("id-ID")} Bungkus
            </h3>
            <p className="text-[11px] text-muted">{finishedGoods.length} varian kemasan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-mint text-success flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-peach flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Estimasi Modal Bahan</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              Rp {totalAssetValue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[11px] text-muted">Berdasarkan HPP beli</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-peach text-accent-dark flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-400 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Peringatan Stok Tipis</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {lowStockItems.length} Produk
            </h3>
            <p className="text-[11px] text-rose-500 font-medium">
              {lowStockItems.length > 0 ? "Perlu restock!" : "Semua stok aman"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-danger flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-surface border border-line rounded-xl px-3 py-2 w-full max-w-md focus-within:border-primary">
              <Search className="w-4 h-4 text-muted flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kode produk..."
                className="w-full bg-transparent text-sm focus:outline-hidden"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs text-muted hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "Semua" },
                { id: "raw_material", label: "Bahan Mentah (Kg)" },
                { id: "finished_good", label: "Produk Jadi (Packs)" },
                { id: "low_stock", label: `Stok Tipis (${lowStockItems.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    typeFilter === f.id
                      ? "bg-lavender text-primary-dark shadow-2xs"
                      : "bg-surface border border-line text-muted hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lavender/30 text-xs font-semibold text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Nama Produk</th>
                    <th className="px-5 py-3">Tipe & Satuan</th>
                    <th className="px-5 py-3 text-right">Stok Saat Ini</th>
                    <th className="px-5 py-3 text-right">Nilai / Harga</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-muted">
                        Memuat data stok...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-muted">
                        Tidak ada produk yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = Number(p.current_stock) <= Number(p.min_stock_alert);
                      return (
                        <tr key={p.id} className="hover:bg-background/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <div className="text-[11px] text-muted font-mono">{p.sku}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={p.type === "raw_material" ? "lavender" : "mint"}>
                                {p.type === "raw_material" ? "Curah" : "Produk Jadi"}
                              </Badge>
                              <span className="text-xs text-muted font-medium">({p.unit})</span>
                            </div>
                            {p.package_weight_grams > 0 && (
                              <span className="text-[11px] text-muted block mt-0.5">
                                {p.package_weight_grams} gram/pack
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={`font-bold text-base ${
                                isLow ? "text-danger" : "text-foreground"
                              }`}
                            >
                              {Number(p.current_stock).toLocaleString("id-ID")}
                            </span>{" "}
                            <span className="text-xs text-muted font-medium">{p.unit}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {p.type === "raw_material" ? (
                              <div>
                                <span className="font-semibold text-foreground">
                                  Rp {Number(p.cost_price || 0).toLocaleString("id-ID")}
                                </span>
                                <span className="text-[11px] text-muted block">HPP Beli / kg</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-semibold text-success">
                                  Rp {Number(p.selling_price || 0).toLocaleString("id-ID")}
                                </span>
                                <span className="text-[11px] text-muted block">Harga Jual / pack</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {isLow ? (
                              <Badge variant="peach" className="gap-1 inline-flex items-center">
                                <AlertTriangle className="w-3 h-3 text-danger" />
                                Stok Tipis
                              </Badge>
                            ) : (
                              <Badge variant="mint">Aman</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <Button
                              variant="outline"
                              onClick={() => handleOpenAdjust(p)}
                              className="text-xs h-7 px-2.5 gap-1 border-line hover:border-primary text-muted hover:text-foreground"
                            >
                              <Sliders className="w-3.5 h-3.5 text-primary" />
                              Sesuaikan
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Movements Log */}
      {activeTab === "movements" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-foreground">Audit Trail Mutasi Stok</h2>
              <p className="text-xs text-muted">Log 50 pergerakan stok barang terbaru secara atomik.</p>
            </div>
            <Button
              variant="outline"
              onClick={loadInventory}
              className="text-xs h-8 px-2.5 gap-1 text-muted hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Segarkan
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lavender/30 text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Jenis Mutasi</th>
                  <th className="px-5 py-3 text-right">Perubahan</th>
                  <th className="px-5 py-3 text-right">Sisa Stok</th>
                  <th className="px-5 py-3">Keterangan / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted">
                      Belum ada catatan mutasi stok.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = Number(m.quantity_change) > 0;
                    return (
                      <tr key={m.id} className="hover:bg-background/60 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                          {new Date(m.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-foreground">
                            {m.product?.name || "Produk"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">{getMovementBadge(m.movement_type)}</td>
                        <td className="px-5 py-3.5 text-right font-bold whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? "+" : ""}
                            {Number(m.quantity_change).toLocaleString("id-ID")}{" "}
                            {m.product?.unit || ""}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                          {Number(m.stock_after).toLocaleString("id-ID")} {m.product?.unit || ""}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted max-w-xs truncate">
                          {m.reason || m.reference_id || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Penyesuaian Stok (Stock Opname) */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20">
              <h3 className="font-bold text-foreground">Penyesuaian Stok: {selectedProduct.name}</h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4">
              <div className="p-3 bg-background rounded-xl border border-line flex justify-between items-center text-xs">
                <span className="text-muted">Stok Tercatat Sekarang:</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedProduct.current_stock} {selectedProduct.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Jenis Penyesuaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("loss")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      adjustType === "loss"
                        ? "bg-rose-50 border-danger text-danger shadow-2xs"
                        : "border-line text-muted hover:bg-background"
                    }`}
                  >
                    Selisih Kurang / Rusak (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("found")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      adjustType === "found"
                        ? "bg-mint border-success text-success shadow-2xs"
                        : "border-line text-muted hover:bg-background"
                    }`}
                  >
                    Selisih Lebih / Ditemukan (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Jumlah Penyesuaian ({selectedProduct.unit}) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  required
                  placeholder="Contoh: 0.5 atau 2"
                  value={adjustQty || ""}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                />
                <p className="text-[11px] text-muted mt-1">
                  Stok akhir akan menjadi:{" "}
                  <strong>
                    {Math.max(
                      0,
                      Number(selectedProduct.current_stock) +
                        (adjustType === "loss" ? -adjustQty : adjustQty)
                    )}{" "}
                    {selectedProduct.unit}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Alasan Penyesuaian <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Kemasan bocor saat penyimpanan / selisih stock opname"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary resize-none"
                />
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  {submitting ? "Menyimpan..." : "Konfirmasi Koreksi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
