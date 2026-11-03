"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Tag,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  Pencil,
  Sparkles,
  TrendingUp,
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
  type: string;
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

  // Modal Tambah Produk Baru
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodWeight, setProdWeight] = useState("100");
  const [prodCostPrice, setProdCostPrice] = useState("3500");
  const [prodPrice, setProdPrice] = useState("8000");
  const [prodInitialStock, setProdInitialStock] = useState("0");
  const [prodMinStock, setProdMinStock] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Edit Produk
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editWeight, setEditWeight] = useState("100");
  const [editCostPrice, setEditCostPrice] = useState("0");
  const [editPrice, setEditPrice] = useState("0");
  const [editStock, setEditStock] = useState("0");
  const [editMinStock, setEditMinStock] = useState("5");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Modal Tambah Stok Cepat
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [stockAddAmount, setStockAddAmount] = useState("20");

  // Modal Kategori
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, description")
        .order("name");

      if (catData) setCategories(catData);

      // 2. Fetch Products
      const { data: prodData } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (prodData) {
        setProducts(prodData as Product[]);
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

  // Auto suggest SKU saat nama produk berubah
  const handleNameChange = (val: string) => {
    setProdName(val);
    const code = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    setProdSku(`SNK-${code || "ITEM"}-${prodWeight || "100"}G`);
  };

  // Handle Tambah Produk Baru
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      showToast("error", "Nama produk snack wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const weightNum = Number(prodWeight) || 100;
      const skuFinal =
        prodSku.trim().toUpperCase() ||
        `SNK-${Date.now().toString().slice(-6)}`;

      const payload = {
        name: prodName.trim(),
        sku: skuFinal,
        category_id: prodCategory || null,
        type: "finished_good",
        unit: "pack",
        package_weight_grams: weightNum,
        cost_price: Number(prodCostPrice) || 0,
        selling_price: Number(prodPrice) || 0,
        current_stock: Number(prodInitialStock) || 0,
        min_stock_alert: Number(prodMinStock) || 5,
        is_active: true,
      };

      const { error } = await supabase.from("products").insert([payload]);
      if (error) throw error;

      showToast("success", `Produk "${prodName}" berhasil ditambahkan!`);
      setIsAddModalOpen(false);
      setProdName("");
      setProdSku("");
      setProdCostPrice("3500");
      setProdPrice("8000");
      setProdInitialStock("0");
      fetchData();
    } catch (err: any) {
      showToast("error", "Gagal menyimpan produk: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Buka Modal Edit
  const handleOpenEdit = (p: Product) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditCategory(p.category_id || "");
    setEditWeight(p.package_weight_grams?.toString() || "100");
    setEditCostPrice(p.cost_price?.toString() || "0");
    setEditPrice(p.selling_price?.toString() || "0");
    setEditStock(p.current_stock?.toString() || "0");
    setEditMinStock(p.min_stock_alert?.toString() || "5");
    setIsEditModalOpen(true);
  };

  // Handle Simpan Edit Produk
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("error", "Nama produk wajib diisi!");
      return;
    }

    setIsEditSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        sku: editSku.trim().toUpperCase(),
        category_id: editCategory || null,
        package_weight_grams: Number(editWeight) || 0,
        cost_price: Number(editCostPrice) || 0,
        selling_price: Number(editPrice) || 0,
        current_stock: Number(editStock) || 0,
        min_stock_alert: Number(editMinStock) || 5,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) throw error;

      showToast("success", `Produk "${editName}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast("error", "Gagal memperbarui produk: " + err.message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Handle Tambah Stok Cepat
  const handleQuickAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;
    const addNum = Number(stockAddAmount) || 0;
    if (addNum <= 0) return;

    setIsSubmitting(true);
    try {
      const nextStock = Number(selectedProductForStock.current_stock || 0) + addNum;

      // 1. Update stock produk
      const { error } = await supabase
        .from("products")
        .update({ current_stock: nextStock, updated_at: new Date().toISOString() })
        .eq("id", selectedProductForStock.id);
      if (error) throw error;

      // 2. Catat audit mutasi stok
      await supabase.from("stock_movements").insert([
        {
          product_id: selectedProductForStock.id,
          movement_type: "adjustment_found",
          quantity_change: addNum,
          stock_after: nextStock,
          reason: "Tambah stok produk masuk",
        },
      ]);

      showToast(
        "success",
        `Stok "${selectedProductForStock.name}" berhasil ditambah +${addNum} bungkus!`
      );
      setIsStockModalOpen(false);
      setSelectedProductForStock(null);
      fetchData();
    } catch (err: any) {
      showToast("error", "Gagal menambah stok: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?\nProduk tidak akan muncul lagi di kasir.`)) return;

    try {
      await supabase.from("stock_movements").delete().eq("product_id", id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        // Fallback soft delete jika ada relasi transaksi
        await supabase
          .from("products")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", id);
      }

      showToast("success", `Produk "${name}" berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      showToast("error", "Gagal menghapus produk: " + err.message);
    }
  };

  // Handle Kategori
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      const { error } = await supabase
        .from("categories")
        .insert([{ name: catName.trim(), description: catDesc.trim() || null }]);

      if (error) throw error;

      showToast("success", `Kategori "${catName}" berhasil dibuat!`);
      setCatName("");
      setCatDesc("");
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast("error", "Gagal membuat kategori: " + err.message);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <span>Katalog & Persediaan Stok Produk</span>
          </h1>
          <p className="text-sm text-muted">
            Kelola daftar snack kemasan repack, harga modal HPP, harga jual kasir, dan penambahan stok.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "products" ? (
            <Button
              variant="primary"
              onClick={() => {
                setProdSku(`SNK-ITEM-${prodWeight}G`);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
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
              ? "bg-lavender text-primary-dark shadow-2xs font-bold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Daftar Produk Snack ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-lavender text-primary-dark shadow-2xs font-bold"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Kategori Snack ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR PRODUK */}
      {activeTab === "products" && (
        <Card className="p-0 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau kode SKU snack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-xs focus:outline-hidden focus:border-primary"
              />
            </div>
            <p className="text-xs text-muted font-medium">
              Menampilkan <strong>{filteredProducts.length}</strong> produk snack
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-muted">Memuat data produk...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-muted space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Belum ada produk terdaftar</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Klik tombol "Tambah Produk Baru" untuk mendaftarkan snack kemasan siap jual.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Produk Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold bg-surface/80">
                    <th className="py-3 px-4">Nama Snack & SKU</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Ukuran Kemasan</th>
                    <th className="py-3 px-4 text-right">Modal HPP / Bks</th>
                    <th className="py-3 px-4 text-right">Harga Jual Kasir</th>
                    <th className="py-3 px-4 text-right">Laba / Bungkus</th>
                    <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredProducts.map((p) => {
                    const isLowStock = Number(p.current_stock || 0) <= Number(p.min_stock_alert || 5);
                    const margin = Number(p.selling_price || 0) - Number(p.cost_price || 0);

                    return (
                      <tr key={p.id} className="hover:bg-background/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-foreground text-sm">{p.name}</p>
                          <p className="text-[11px] text-muted font-mono">{p.sku}</p>
                        </td>
                        <td className="py-3 px-4">
                          {p.categories?.name ? (
                            <Badge variant="lavender" size="sm">
                              {p.categories.name}
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {p.package_weight_grams ? `${p.package_weight_grams} gram` : p.unit || "pack"}
                        </td>
                        <td className="py-3 px-4 text-right text-muted font-medium">
                          {formatRupiah(Number(p.cost_price || 0))}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-foreground text-sm">
                          {formatRupiah(Number(p.selling_price || 0))}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-success">
                          +{formatRupiah(margin)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-bold text-sm ${
                              isLowStock ? "text-danger" : "text-foreground"
                            }`}
                          >
                            {p.current_stock || 0}
                          </span>{" "}
                          <span className="text-muted text-[11px]">{p.unit || "bks"}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLowStock ? (
                            <Badge variant="peach" size="sm" className="inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-danger" />
                              Menipis
                            </Badge>
                          ) : (
                            <Badge variant="mint" size="sm">
                              Aman
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProductForStock(p);
                                setStockAddAmount("20");
                                setIsStockModalOpen(true);
                              }}
                              className="text-xs h-7 px-2.5 gap-1 border-line hover:border-primary text-muted hover:text-foreground"
                              title="Tambah Stok Bungkus"
                            >
                              <Plus className="w-3 h-3 text-primary" />
                              <span>+ Stok</span>
                            </Button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-lavender/50 transition-colors"
                              title="Edit Detail Produk"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <Card className="p-6">
          <CardHeader
            title="Kategori Produk Snack"
            subtitle="Kategori membantu mengelompokkan produk di kasir (misal: Basreng, Makaroni, Keripik, Seblak)"
            action={
              <Button variant="primary" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </Button>
            }
          />

          {categories.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center">Belum ada kategori yang dibuat.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-background border border-line flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{c.name}</h4>
                    <p className="text-[11px] text-muted mt-0.5">{c.description || "Tanpa deskripsi"}</p>
                  </div>
                  <Tag className="w-4 h-4 text-primary shrink-0" />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODAL 1: TAMBAH PRODUK BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Produk Snack Baru</h3>
                <p className="text-xs text-muted">Daftarkan produk kemasan siap jual dan modal HPP</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Snack / Produk *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Basreng Pedas Daun Jeruk 100g"
                  className="w-full px-3.5 py-2.5 bg-background border border-line rounded-xl text-sm font-semibold focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Kategori Snack
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Berat Kemasan (Gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prodWeight}
                    onChange={(e) => {
                      setProdWeight(e.target.value);
                      if (prodName) {
                        const code = prodName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                        setProdSku(`SNK-${code || "ITEM"}-${e.target.value || "100"}G`);
                      }
                    }}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  SKU / Kode Produk
                </label>
                <input
                  type="text"
                  required
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl uppercase font-mono text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Box Harga Modal & Jual */}
              <div className="p-4 rounded-2xl bg-lavender/30 border border-primary/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Modal HPP / Bungkus (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={prodCostPrice}
                      onChange={(e) => setProdCostPrice(e.target.value)}
                      placeholder="3500"
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-primary"
                    />
                    <p className="text-[10px] text-muted mt-0.5">Biaya isi + plastik + bumbu</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Harga Jual Kasir (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="8000"
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-success"
                    />
                    <p className="text-[10px] text-muted mt-0.5">Harga yang dibayar pembeli</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-xs">
                  <span className="text-muted">Estimasi Untung per Bungkus:</span>
                  <span className="font-bold text-success">
                    +{formatRupiah(Math.max(0, (Number(prodPrice) || 0) - (Number(prodCostPrice) || 0)))}
                  </span>
                </div>
              </div>

              {/* Stok Awal & Peringatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Stok Awal (Bungkus)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prodInitialStock}
                    onChange={(e) => setProdInitialStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Batas Peringatan Stok Tipis
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk Baru"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUK */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  <span>Edit Produk Snack</span>
                </h3>
                <p className="text-xs text-muted">Ubah nama, harga modal HPP, harga jual, atau stok</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Produk Snack *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-line rounded-xl text-sm font-semibold focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:outline-hidden focus:border-primary"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Berat Kemasan (Gram)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  SKU / Kode Produk
                </label>
                <input
                  type="text"
                  required
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl uppercase font-mono text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Box Harga Modal & Jual */}
              <div className="p-4 rounded-2xl bg-lavender/30 border border-primary/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Modal HPP / Bungkus (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editCostPrice}
                      onChange={(e) => setEditCostPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Harga Jual Kasir (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-success"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-xs">
                  <span className="text-muted">Keuntungan Bersih per Bungkus:</span>
                  <span className="font-bold text-success">
                    +{formatRupiah(Math.max(0, (Number(editPrice) || 0) - (Number(editCostPrice) || 0)))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Stok Saat Ini (Bungkus)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Batas Peringatan Stok Tipis
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isEditSubmitting}>
                  {isEditSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH STOK CEPAT */}
      {isStockModalOpen && selectedProductForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-sm w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Stok Snack Masuk</h3>
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

            <form onSubmit={handleQuickAddStock} className="space-y-4 text-sm">
              <div className="p-3 bg-background rounded-xl border border-line flex justify-between items-center text-xs">
                <span className="text-muted">Stok Tercatat Sekarang:</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedProductForStock.current_stock || 0} bungkus
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Jumlah Bungkus Masuk *
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
                    {Number(selectedProductForStock.current_stock || 0) +
                      (Number(stockAddAmount) || 0)}{" "}
                    bungkus
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
                    setSelectedProductForStock(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Tambah Stok"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH KATEGORI */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Tambah Kategori Baru</h3>
                <p className="text-xs text-muted">Contoh: Basreng, Makaroni, Keripik, Seblak</p>
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
                  placeholder="Misal: Basreng"
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  placeholder="Keterangan singkat kategori..."
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs focus:outline-hidden focus:border-primary resize-none"
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
                <Button type="submit" variant="primary" size="sm">
                  Simpan Kategori
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
