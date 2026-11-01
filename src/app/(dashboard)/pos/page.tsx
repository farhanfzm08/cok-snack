"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  RotateCcw,
  Tag,
  CreditCard,
  Banknote,
  QrCode,
  X,
  Package,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: "raw_material" | "finished_good";
  unit: string;
  package_weight_grams: number;
  selling_price: number;
  cost_price?: number;
  current_stock: number;
  category_id?: string | null;
  categories?: { name: string } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  cogs_per_unit: number;
  subtotal: number;
}

interface CompletedSale {
  invoice_number: string;
  sale_date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total_amount: number;
  amount_paid: number;
  change_due: number;
  payment_method: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PosPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "qris">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [storeSettings, setStoreSettings] = useState({
    storeName: "COK SNACK",
    tagline: "Cemilan Orang Kaya",
    phone: "0812-3456-7890",
    address: "Jl. Industri Keripik No. 8, Indonesia",
    receiptFooter: "Barang yang sudah dibeli\ntidak dapat ditukar/dikembalikan.\nTerima kasih atas kunjungan Anda!",
  });

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("sae_snack_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStoreSettings((prev) => ({
          ...prev,
          storeName: parsed.storeName || "COK SNACK",
          phone: parsed.phone || "0812-3456-7890",
          address: parsed.address || "Jl. Industri Keripik No. 8, Indonesia",
          receiptFooter: parsed.receiptFooter || prev.receiptFooter,
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from("categories").select("id, name");
      if (catData) setCategories(catData);

      // Hanya ambil produk jadi yang aktif dan siap dijual di kasir
      const { data: prodData } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("type", "finished_good")
        .eq("is_active", true)
        .order("name");

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
    fetchProducts();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Cart Operations
  const addToCart = (product: Product) => {
    if (product.current_stock <= 0) {
      showToast("error", `Stok ${product.name} habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) {
          showToast("error", `Stok maksimum untuk ${product.name} tercapai (${product.current_stock} ${product.unit}).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unit_price: Number(product.selling_price) || 0,
            cogs_per_unit: Number(product.cost_price) || 0,
            subtotal: Number(product.selling_price) || 0,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.current_stock) {
              showToast("error", `Stok maksimum tersedia hanya ${item.product.current_stock} bungkus.`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unit_price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount("0");
    setAmountPaid("");
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountNum = Number(discount) || 0;
  const totalAmount = Math.max(0, subtotal - discountNum);

  const amountPaidNum = paymentMethod === "cash" ? Number(amountPaid) || 0 : totalAmount;
  const changeDue = Math.max(0, amountPaidNum - totalAmount);

  // Auto set exact payment for non-cash
  useEffect(() => {
    if (paymentMethod !== "cash") {
      setAmountPaid(totalAmount.toString());
    }
  }, [paymentMethod, totalAmount]);

  // Submit Sale Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("error", "Keranjang belanja masih kosong!");
      return;
    }

    if (paymentMethod === "cash" && amountPaidNum < totalAmount) {
      showToast("error", "Nominal uang yang diterima kurang dari total belanja!");
      return;
    }

    setIsSubmitting(true);
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    const itemsPayload = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cogs_per_unit: item.cogs_per_unit,
      subtotal: item.subtotal,
    }));

    const { data, error } = await supabase.rpc("execute_sale", {
      p_invoice_number: invoiceNumber,
      p_items: itemsPayload,
      p_subtotal: subtotal,
      p_discount: discountNum,
      p_total_amount: totalAmount,
      p_amount_paid: amountPaidNum,
      p_change_due: changeDue,
      p_payment_method: paymentMethod,
      p_notes: "Penjualan Kasir POS",
    });

    setIsSubmitting(false);

    if (error) {
      showToast("error", "Transaksi gagal: " + error.message);
    } else {
      // Set completed sale for receipt
      setCompletedSale({
        invoice_number: invoiceNumber,
        sale_date: new Date().toLocaleString("id-ID"),
        items: [...cart],
        subtotal,
        discount: discountNum,
        total_amount: totalAmount,
        amount_paid: amountPaidNum,
        change_due: changeDue,
        payment_method: paymentMethod,
      });

      showToast("success", `Transaksi #${invoiceNumber} Berhasil! Stok produk telah berkurang.`);
      clearCart();
      fetchProducts(); // Refresh stock
    }
  };

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
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header POS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span>Kasir (Point of Sale)</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Pilih snack, klik untuk menambah ke keranjang, dan proses pembayaran tunai/QRIS secara instan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="mint" size="md">
            Kasir Aktif
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Stok</span>
          </Button>
        </div>
      </div>

      {/* Main POS Grid: Left Products (2 cols), Right Cart (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SECTION: PRODUCT SELECTION (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari snack kemasan atau scan SKU..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-surface border border-line text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                Semua Snack
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-surface border border-line text-muted hover:text-foreground hover:bg-background"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-muted text-sm">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuat katalog produk kasir...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center bg-surface border border-line rounded-3xl p-6">
              <div className="w-12 h-12 rounded-2xl bg-peach text-[#A04128] flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Tidak Ada Produk Siap Jual</h4>
              <p className="text-xs text-muted max-w-sm mt-1">
                Daftarkan produk jadi kemasan repack (misal Makaroni 100gr) dan pastikan stoknya tersedia dari proses repacking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock <= 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between text-left select-none ${
                      isOutOfStock
                        ? "bg-background/80 border-line opacity-60 cursor-not-allowed"
                        : "bg-surface border-line hover:border-primary/50 hover:shadow-xs active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-muted uppercase">
                          {p.sku}
                        </span>
                        <Badge variant={isOutOfStock ? "danger" : "mint"} size="sm">
                          {isOutOfStock ? "Habis" : `${p.current_stock} ${p.unit}`}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">
                        {p.name}
                      </h3>

                      <span className="text-[11px] text-muted block mt-0.5">
                        {p.package_weight_grams} gram
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-line/60">
                      <span className="text-sm font-extrabold text-primary">
                        {formatRupiah(p.selling_price)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isOutOfStock
                            ? "bg-line/60 text-muted"
                            : "bg-lavender text-primary-dark hover:bg-primary hover:text-white"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SECTION: CART & CHECKOUT PANEL (5 COLS) */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-3xl p-5 shadow-xs space-y-4 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-sm sm:text-base text-foreground">
                Pesanan Saat Ini ({cart.length})
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-danger font-medium hover:underline"
              >
                Reset Keranjang
              </button>
            )}
          </div>

          {/* Cart Item List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs flex flex-col items-center">
                <ShoppingCart className="w-8 h-8 text-line mb-2" />
                <span>Keranjang belanja masih kosong</span>
                <span className="text-[11px] text-muted/70 mt-0.5">
                  Klik snack di sebelah kiri untuk menambahkan
                </span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-background border border-line/70 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatRupiah(item.unit_price)} × {item.quantity} ={" "}
                      <strong className="text-foreground">{formatRupiah(item.subtotal)}</strong>
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-muted hover:text-foreground"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-foreground w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center text-muted hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-6 h-6 rounded-lg text-muted hover:text-danger flex items-center justify-center ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-3 border-t border-line space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted">
              <span>Subtotal Belanja:</span>
              <span className="font-semibold text-foreground">{formatRupiah(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-muted">
              <span>Diskon Promosi (Rp):</span>
              <input
                type="number"
                min="0"
                step="500"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 px-2 py-1 text-right bg-background border border-line rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line text-sm">
              <span className="font-bold text-foreground">Total Pembayaran:</span>
              <span className="text-lg font-black text-primary">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-muted">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  paymentMethod === "cash"
                    ? "bg-mint border-success text-success font-bold shadow-2xs"
                    : "bg-surface border-line text-muted"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  paymentMethod === "qris"
                    ? "bg-lavender border-primary text-primary-dark font-bold shadow-2xs"
                    : "bg-surface border-line text-muted"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  paymentMethod === "transfer"
                    ? "bg-sky border-[#1D5B99] text-[#1D5B99] font-bold shadow-2xs"
                    : "bg-surface border-line text-muted"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details (Amount Paid & Change Due) */}
          {paymentMethod === "cash" && (
            <div className="p-3 bg-mint/30 rounded-2xl border border-success/20 space-y-2 text-xs">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Uang Diterima dari Pelanggan (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-sm font-bold text-foreground focus:ring-2 focus:ring-success/20 focus:border-success"
                />
              </div>

              {/* Quick shortcut chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAmountPaid(totalAmount.toString())}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-line text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid("10000")}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-line text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  10rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid("20000")}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-line text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  20rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid("50000")}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-line text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  50rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid("100000")}
                  className="px-2 py-0.5 rounded-lg bg-surface border border-line text-[11px] font-semibold text-muted hover:text-foreground"
                >
                  100rb
                </button>
              </div>

              {/* Kembalian */}
              <div className="flex items-center justify-between pt-1.5 border-t border-success/20">
                <span className="font-semibold text-muted">Kembalian:</span>
                <span className="text-sm font-black text-success">
                  {formatRupiah(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={cart.length === 0 || (paymentMethod === "cash" && amountPaidNum < totalAmount)}
            isLoading={isSubmitting}
            onClick={handleCheckout}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Selesaikan Pembayaran</span>
          </Button>
        </div>
      </div>

      {/* MODAL STRUK BUKTI TRANSAKSI (AUTHENTIC THERMAL RECEIPT) */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-masuk overflow-y-auto">
          <div className="bg-surface border border-line rounded-3xl max-w-sm w-full p-5 shadow-2xl relative my-auto">
            {/* Header Dialog (Screen only) */}
            <div className="flex items-center justify-between pb-3 border-b border-line mb-3 no-print">
              <span className="text-xs font-bold text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pembayaran Sukses!</span>
              </span>
              <button
                onClick={() => setCompletedSale(null)}
                className="p-1 text-muted hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* REALISTIC THERMAL RECEIPT PAPER */}
            <div
              id="receipt-thermal-paper"
              className="bg-white text-black p-5 rounded-md shadow-inner border border-gray-300 font-mono text-[11px] leading-tight space-y-2.5 max-w-[320px] mx-auto select-none"
            >
              {/* Paper Jagged Top Tear Simulation */}
              <div className="text-center border-b-2 border-black border-dashed pb-3">
                <h2 className="font-black text-base tracking-wider uppercase text-black">
                  COK SNACK
                </h2>
                <p className="text-[10px] font-bold tracking-tight text-gray-800">
                  (Cemilan Orang Kaya)
                </p>
                <p className="text-[9px] text-gray-600 mt-1 leading-snug">
                  {storeSettings.address}
                </p>
                <p className="text-[9px] text-gray-600">
                  WA: {storeSettings.phone}
                </p>
              </div>

              {/* Transaction Metadata */}
              <div className="text-[10px] text-gray-800 space-y-0.5 border-b border-black border-dashed pb-2">
                <div className="flex justify-between">
                  <span>No. Nota :</span>
                  <span className="font-bold">{completedSale.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu    :</span>
                  <span>{new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir    :</span>
                  <span>Kasir 1 / Admin</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode   :</span>
                  <span className="font-bold uppercase">{completedSale.payment_method}</span>
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-1.5 border-b-2 border-black border-dashed pb-2.5">
                <div className="text-[10px] text-gray-600 flex justify-between border-b border-gray-200 pb-1">
                  <span>ITEM</span>
                  <span>SUBTOTAL</span>
                </div>
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-bold text-black truncate">{item.product.name}</div>
                    <div className="flex justify-between text-[10px] text-gray-700 pl-2">
                      <span>
                        {item.quantity} × {Number(item.unit_price).toLocaleString("id-ID")}
                      </span>
                      <span className="font-semibold text-black">
                        {Number(item.subtotal).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Summary Calculations */}
              <div className="space-y-1 text-[11px] border-b border-black border-dashed pb-2">
                <div className="flex justify-between text-[10px]">
                  <span>Total Kuantitas:</span>
                  <span className="font-bold">
                    {completedSale.items.reduce((sum, it) => sum + it.quantity, 0)} pcs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {Number(completedSale.subtotal).toLocaleString("id-ID")}</span>
                </div>
                {Number(completedSale.discount) > 0 && (
                  <div className="flex justify-between text-black">
                    <span>Diskon:</span>
                    <span>- Rp {Number(completedSale.discount).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-[13px] pt-1.5 border-t border-black text-black">
                  <span>TOTAL:</span>
                  <span>Rp {Number(completedSale.total_amount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>BAYAR ({completedSale.payment_method.toUpperCase()}):</span>
                  <span>Rp {Number(completedSale.amount_paid).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-black">
                  <span>KEMBALIAN:</span>
                  <span>Rp {Number(completedSale.change_due).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Barcode & Footer Notice */}
              <div className="text-center pt-2 space-y-1.5">
                {/* Barcode Graphic Simulation */}
                <div className="flex justify-center items-center py-1 overflow-hidden opacity-85">
                  <span className="font-mono text-base tracking-[0.25em] font-extrabold text-black">
                    |||||| | |||| ||| |||| | ||||||
                  </span>
                </div>
                <p className="text-[9px] font-mono text-gray-600">
                  *{completedSale.invoice_number}*
                </p>

                <div className="pt-2 text-[9px] text-gray-700 leading-tight">
                  <p className="font-bold">Barang yang sudah dibeli</p>
                  <p>tidak dapat ditukar/dikembalikan.</p>
                  <p className="font-bold mt-1.5 uppercase text-black">
                    TERIMA KASIH ATAS KUNJUNGAN ANDA!
                  </p>
                  <p className="text-[8px] text-gray-500 italic mt-0.5">
                    COK Snack - Bikin Nagih, Rasa Juara!
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Actions (Screen only) */}
            <div className="flex items-center gap-2 pt-4 no-print">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-line hover:border-primary gap-1.5 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 text-primary" />
                <span>Cetak Struk Thermal</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs"
                onClick={() => setCompletedSale(null)}
              >
                <span>Selesai (Kasir Baru)</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Thermal Receipt Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-thermal-paper,
          #receipt-thermal-paper * {
            visibility: visible;
          }
          #receipt-thermal-paper {
            position: fixed;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 72mm !important;
            max-width: 72mm !important;
            padding: 3mm !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
