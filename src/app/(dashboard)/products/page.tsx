"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Tag,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  type: "raw_material" | "finished_good";
  unit: string;
  package_weight_grams: number;
  selling_price: number;
  cost_price?: number;
  min_stock_alert: number;
  current_stock: number;
  is_active?: boolean;
  categories?: { name: string } | null;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "raw_material" | "finished_good">("all");

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [stockAddAmount, setStockAddAmount] = useState("10");
  const [stockAddReason, setStockAddReason] = useState("Stok masuk awal dari supplier");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Product state
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodType, setProdType] = useState<"raw_material" | "finished_good">("finished_good");
  const [prodCategory, setProdCategory] = useState("");
  const [prodUnit, setProdUnit] = useState("pack");
  const [prodWeight, setProdWeight] = useState("100");
  const [prodPrice, setProdPrice] = useState("5000");
  const [prodCostPrice, setProdCostPrice] = useState("35000");
  const [prodMinStock, setProdMinStock] = useState("5");

  // Form Category state
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"? Semua riwayat stok dan repacking terkait akan ikut terhapus.`)) return;

    setIsSubmitting(true);
    // Hapus juga riwayat mutasi stok terkait jika ada
    await supabase.from("stock_movements").delete().eq("product_id", id);
    // Hapus produk langsung
    const { error } = await supabase.from("products").delete().eq("id", id);
    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal menghapus produk: " + error.message);
    } else {
      showToast("success", `Produk "${name}" dan riwayat terkait berhasil dihapus.`);
      fetchData();
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal menghapus kategori: " + error.message);
    } else {
      showToast("success", `Kategori "${name}" berhasil dihapus.`);
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, description")
        .order("name");

      if (catData) setCategories(catData);

      // 2. Fetch products
      const { data: prodData, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (prodData) {
        setProducts(prodData as Product[]);
      }
      if (error && error.code !== "PGRST116") {
        console.warn("Notice fetch products:", error.message);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Adjust / Add Stock
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    const qty = Number(stockAddAmount);
    if (!qty || qty <= 0) {
      showToast("error", "Jumlah penambahan stok harus lebih dari 0!");
      return;
    }

    setIsSubmitting(true);
    // Call RPC adjust_product_stock
    const { data, error } = await supabase.rpc("adjust_product_stock", {
      p_product_id: selectedProductForStock.id,
      p_quantity_change: qty,
      p_reason: stockAddReason.trim() || "Penyesuaian stok manual",
      p_cost_per_unit: 0,
    });

    setIsSubmitting(false);
    if (error) {
      // Fallback direct update if RPC is pending
      const { error: directErr } = await supabase
        .from("products")
        .update({
          current_stock: Number(selectedProductForStock.current_stock || 0) + qty,
        })
        .eq("id", selectedProductForStock.id);

      if (directErr) {
        showToast("error", "Gagal memperbarui stok: " + directErr.message);
        return;
      }
    }

    showToast("success", `Stok ${selectedProductForStock.name} berhasil ditambah +${qty} ${selectedProductForStock.unit}!`);
    setIsStockModalOpen(false);
    setSelectedProductForStock(null);
    fetchData();
  };
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast("error", "Nama kategori wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("categories").insert([
      { name: catName.trim(), description: catDesc.trim() || null },
    ]);

    setIsSubmitting(false);
    if (error) {
      showToast("error", "Gagal menyimpan: " + error.message);
    } else {
      showToast("success", `Kategori "${catName}" berhasil ditambahkan!`);
      setCatName("");
      setCatDesc("");
      setIsCategoryModalOpen(false);
      fetchData();
    }
  };

  // Handle Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodSku.trim()) {
      showToast("error", "Nama produk dan SKU wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: prodName.trim(),
      sku: prodSku.trim().toUpperCase(),
      type: prodType,
      category_id: prodCategory || null,
      unit: prodType === "raw_material" ? "kg" : prodUnit,
      package_weight_grams: prodType === "raw_material" ? 0 : Number(prodWeight) || 0,
      selling_price: prodType === "raw_material" ? 0 : Number(prodPrice) || 0,
      cost_price: prodType === "raw_material" ? Number(prodCostPrice) || 0 : 0,
      min_stock_alert: Number(prodMinStock) || 5,
      current_stock: 0,
    };

    const { error } = await supabase.from("products").insert([payload]);

    setIsSubmitting(false);
    if (error) {
      showToast("error", "Gagal menyimpan produk: " + error.message);
    } else {
      showToast("success", `Produk "${prodName}" berhasil ditambahkan!`);
      setProdName("");
      setProdSku("");
      setProdPrice("5000");
      setIsProductModalOpen(false);
      fetchData();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "all" || p.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 animate-masuk ${
            notification.type === "success"
              ? "bg-surface border-success/40 text-success"
              : "bg-surface border-danger/40 text-danger"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Master Data Produk & Kategori
          </h1>
          <p className="text-sm text-muted">
            Kelola snack bahan baku curah (kg) dan produk jadi kemasan repack (gram).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "products" ? (
            <Button
              variant="primary"
              onClick={() => {
                // Auto suggest SKU prefix
                setProdSku(prodType === "raw_material" ? "BAHAN-" : "SNK-");
                setIsProductModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsCategoryModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-line pb-1">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-lavender text-primary-dark shadow-2xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Daftar Produk ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-lavender text-primary-dark shadow-2xs"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Kategori Snack ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR PRODUK */}
      {activeTab === "products" && (
        <Card>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-line">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama snack atau SKU..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                  filterType === "all"
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-muted border-line hover:bg-background"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType("raw_material")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                  filterType === "raw_material"
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-muted border-line hover:bg-background"
                }`}
              >
                Bahan Baku Curah (kg)
              </button>
              <button
                onClick={() => setFilterType("finished_good")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border ${
                  filterType === "finished_good"
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-muted border-line hover:bg-background"
                }`}
              >
                Produk Jadi (Pack)
              </button>
            </div>
          </div>

          {/* Table or Empty State */}
          {loading ? (
            <div className="py-16 text-center text-muted text-sm">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuat data produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Tidak Ada Produk yang Ditemukan
              </h3>
              <p className="text-xs text-muted max-w-sm mt-1">
                {products.length === 0
                  ? "Mulai dengan menambahkan bahan curah (misal: Makaroni Cikruh Curah kg) atau produk jadi kemasan (Makaroni 100gr)."
                  : "Tidak ada produk yang cocok dengan pencarian / filter Anda."}
              </p>
              {products.length === 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsProductModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Pertama</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                    <th className="py-3 px-3">SKU & Nama Produk</th>
                    <th className="py-3 px-3">Tipe / Kategori</th>
                    <th className="py-3 px-3">Ukuran Satuan</th>
                    <th className="py-3 px-3">Harga Jual</th>
                    <th className="py-3 px-3">Stok Saat Ini</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.current_stock <= p.min_stock_alert;
                    return (
                      <tr key={p.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted font-mono">{p.sku}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            {p.type === "raw_material" ? (
                              <Badge variant="lavender" size="sm">
                                Bahan Baku Curah
                              </Badge>
                            ) : (
                              <Badge variant="mint" size="sm">
                                Produk Jadi Repack
                              </Badge>
                            )}
                            {p.categories?.name && (
                              <span className="text-[11px] text-muted">
                                {p.categories.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          {p.type === "raw_material" ? (
                            <span className="font-medium text-foreground">Kilogram (kg)</span>
                          ) : (
                            <span className="font-medium text-foreground">
                              {p.package_weight_grams} gram / {p.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {p.type === "raw_material" ? (
                            <div>
                              <span className="text-xs font-semibold text-primary">
                                {formatRupiah(p.cost_price || 0)}
                              </span>
                              <p className="text-[10px] text-muted">Modal / kg</p>
                            </div>
                          ) : (
                            <span className="font-bold text-foreground">
                              {formatRupiah(p.selling_price)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {p.current_stock} {p.unit}
                            </span>
                            {isLowStock && (
                              <Badge variant="yellow" size="sm">
                                Menipis
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProductForStock(p);
                                setStockAddAmount(p.type === "raw_material" ? "5" : "50");
                                setIsStockModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface border border-line hover:bg-background text-foreground transition-colors"
                              title="Tambah Stok"
                            >
                              <Plus className="w-3 h-3 text-primary" />
                              <span>Stok</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: DAFTAR KATEGORI */}
      {activeTab === "categories" && (
        <Card>
          <CardHeader
            title="Daftar Kategori Snack"
            subtitle="Kategori membantu mengelompokkan bahan baku dan produk repack (misal: Basreng, Seblak, Makaroni)"
            action={
              <Button variant="primary" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </Button>
            }
          />

          {categories.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-yellow text-warning flex items-center justify-center mb-3">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold">Belum Ada Kategori</h4>
              <p className="text-xs text-muted max-w-sm mt-1">
                Tambahkan kategori seperti "Makaroni", "Basreng", atau "Seblak" untuk mengorganisasi produk Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-line bg-background flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground">{c.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="lavender" size="sm">
                          Kategori
                        </Badge>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-1.5">
                      {c.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODAL TAMBAH PRODUK */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Produk Baru</h3>
                <p className="text-xs text-muted">Daftarkan bahan baku atau snack siap jual</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              {/* Type Switch */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Tipe Produk
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProdType("finished_good");
                      setProdUnit("pack");
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      prodType === "finished_good"
                        ? "bg-mint border-success text-success shadow-2xs font-bold"
                        : "bg-background border-line text-muted"
                    }`}
                  >
                    Produk Jadi Repack (Kemasan)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProdType("raw_material");
                      setProdUnit("kg");
                      setProdWeight("0");
                      setProdPrice("0");
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      prodType === "raw_material"
                        ? "bg-lavender border-primary text-primary-dark shadow-2xs font-bold"
                        : "bg-background border-line text-muted"
                    }`}
                  >
                    Bahan Baku Curah (Kiloan)
                  </button>
                </div>
              </div>

              {/* SKU & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    SKU / Kode Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="Contoh: MKR-100G"
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl uppercase font-mono text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Kategori
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder={
                    prodType === "raw_material"
                      ? "Contoh: Makaroni Cikruh Curah Super"
                      : "Contoh: Makaroni Cikruh Pedas Daun Jeruk"
                  }
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Specific fields for Raw Material */}
              {prodType === "raw_material" && (
                <div className="p-3 bg-lavender/40 rounded-2xl border border-primary/20">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Harga Beli / Modal Bahan per Kg (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(e.target.value)}
                    placeholder="35000"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-primary"
                  />
                  <p className="text-[10px] text-muted mt-1">
                    Nilai ini akan otomatis digunakan untuk menghitung modal & HPP saat repacking snack curah ini.
                  </p>
                </div>
              )}

              {/* Specific fields for Finished Good */}
              {prodType === "finished_good" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-mint/30 rounded-2xl border border-success/20">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Ukuran Kemasan (Gram) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={prodWeight}
                      onChange={(e) => setProdWeight(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-semibold"
                    />
                    <p className="text-[10px] text-muted mt-0.5">Misal: 50, 100, 150, 250</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Harga Jual (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-primary"
                    />
                    <p className="text-[10px] text-muted mt-0.5">Format angka bersih</p>
                  </div>
                </div>
              )}

              {/* Minimum Stock Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Satuan Persediaan
                  </label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    disabled={prodType === "raw_material"}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Batas Minimum Stok Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Simpan Produk
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KATEGORI */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Kategori Baru</h3>
                <p className="text-xs text-muted">Contoh: Makaroni, Seblak, Basreng, Keripik</p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Misal: Makaroni Cikruh"
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={3}
                  placeholder="Keterangan singkat..."
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Simpan Kategori
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL TAMBAH STOK */}
      {isStockModalOpen && selectedProductForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Stok Persediaan</h3>
                <p className="text-xs text-muted">{selectedProductForStock.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsStockModalOpen(false);
                  setSelectedProductForStock(null);
                }}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-sm">
              <div className="p-3 rounded-2xl bg-background border border-line flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted">Stok Saat Ini:</span>
                  <p className="text-base font-bold text-foreground">
                    {selectedProductForStock.current_stock} {selectedProductForStock.unit}
                  </p>
                </div>
                <Badge variant={selectedProductForStock.type === "raw_material" ? "lavender" : "mint"}>
                  {selectedProductForStock.type === "raw_material" ? "Bahan Curah" : "Produk Jadi"}
                </Badge>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Jumlah Tambahan ({selectedProductForStock.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="0.001"
                  step="any"
                  value={stockAddAmount}
                  onChange={(e) => setStockAddAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-base font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Alasan / Keterangan Masuk
                </label>
                <input
                  type="text"
                  value={stockAddReason}
                  onChange={(e) => setStockAddReason(e.target.value)}
                  placeholder="Contoh: Beli dari supplier, stok awal..."
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsStockModalOpen(false);
                    setSelectedProductForStock(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Simpan Tambah Stok
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
