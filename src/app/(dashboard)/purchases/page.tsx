"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBasket, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  Building,
  DollarSign
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: string;
  unit: string;
  current_stock: number;
  cost_price: number;
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
}

interface PurchaseItemInput {
  product_id: string;
  product_name: string;
  quantity: number;
  cost_per_unit: number;
  subtotal: number;
  batch_number: string;
  expired_at: string;
}

interface Purchase {
  id: string;
  invoice_number: string;
  supplier_id: string | null;
  purchase_date: string;
  subtotal: number;
  discount: number;
  additional_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: "paid" | "unpaid" | "partially_paid";
  notes: string | null;
  created_at: string;
  supplier?: Supplier;
  items?: any[];
}

export default function PurchasesPage() {
  const supabase = createClient();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "qris">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "partially_paid">("paid");
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseItemInput[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch all dependencies
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch raw material products
      const { data: prodData } = await supabase
        .from("products")
        .select("id, name, sku, type, unit, current_stock, cost_price")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (prodData) setProducts(prodData);

      // 2. Fetch suppliers
      const { data: supData } = await supabase
        .from("suppliers")
        .select("id, name, phone")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (supData) setSuppliers(supData);

      // 3. Fetch purchases
      const { data: purchData, error: purchError } = await supabase
        .from("purchases")
        .select(`
          *,
          supplier:suppliers(id, name, phone)
        `)
        .order("purchase_date", { ascending: false });

      if (purchError) throw purchError;
      setPurchases(purchData || []);
    } catch (err: any) {
      console.error("Gagal memuat data pembelian:", err.message);
      setErrorMsg("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    const autoInv = `INV-${Date.now().toString().slice(-6)}`;
    setInvoiceNumber(autoInv);
    setSupplierId(suppliers.length > 0 ? suppliers[0].id : "");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("cash");
    setPaymentStatus("paid");
    setAdditionalFee(0);
    setDiscount(0);
    setNotes("");

    // Initialize with 1 item row if products exist
    const rawMaterials = products.filter((p) => p.type === "raw_material");
    const initialProduct = rawMaterials.length > 0 ? rawMaterials[0] : products[0];

    if (initialProduct) {
      setItems([
        {
          product_id: initialProduct.id,
          product_name: initialProduct.name,
          quantity: 1,
          cost_per_unit: initialProduct.cost_price || 0,
          subtotal: initialProduct.cost_price || 0,
          batch_number: "",
          expired_at: "",
        },
      ]);
    } else {
      setItems([]);
    }

    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const rawMaterials = products.filter((p) => p.type === "raw_material");
    const p = rawMaterials.length > 0 ? rawMaterials[0] : products[0];
    if (!p) return;

    setItems([
      ...items,
      {
        product_id: p.id,
        product_name: p.name,
        quantity: 1,
        cost_per_unit: p.cost_price || 0,
        subtotal: p.cost_price || 0,
        batch_number: "",
        expired_at: "",
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemInput, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === "product_id") {
      const selectedProd = products.find((p) => p.id === value);
      if (selectedProd) {
        item.product_id = selectedProd.id;
        item.product_name = selectedProd.name;
        item.cost_per_unit = selectedProd.cost_price || 0;
        item.subtotal = item.quantity * item.cost_per_unit;
      }
    } else if (field === "quantity") {
      const qty = parseFloat(value) || 0;
      item.quantity = qty;
      item.subtotal = qty * item.cost_per_unit;
    } else if (field === "cost_per_unit") {
      const cost = parseFloat(value) || 0;
      item.cost_per_unit = cost;
      item.subtotal = item.quantity * cost;
    } else {
      (item as any)[field] = value;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      alert("Minimal satu item bahan baku dalam pembelian.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotalItems = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalAmount = Math.max(0, subtotalItems + additionalFee - discount);

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setErrorMsg("Nomor invoice/nota wajib diisi");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Tambahkan minimal satu bahan baku");
      return;
    }
    for (const it of items) {
      if (it.quantity <= 0) {
        setErrorMsg(`Jumlah untuk "${it.product_name}" harus lebih dari 0`);
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Try PostgreSQL RPC execute_purchase
      const { data: rpcData, error: rpcError } = await supabase.rpc("execute_purchase", {
        p_invoice_number: invoiceNumber.trim(),
        p_supplier_id: supplierId || null,
        p_purchase_date: purchaseDate,
        p_items: items.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          cost_per_unit: it.cost_per_unit,
          subtotal: it.subtotal,
          batch_number: it.batch_number.trim() || null,
          expired_at: it.expired_at || null,
        })),
        p_subtotal: subtotalItems,
        p_discount: discount,
        p_additional_fee: additionalFee,
        p_total_amount: totalAmount,
        p_payment_method: paymentMethod,
        p_payment_status: paymentStatus,
        p_notes: notes.trim() || null,
      });

      if (rpcError) {
        console.warn("RPC execute_purchase gagal, mencoba alur manual:", rpcError.message);
        
        // Manual fallback if RPC patch is not run yet
        // 1. Insert Purchases
        const { data: newPurch, error: errPurch } = await supabase
          .from("purchases")
          .insert([
            {
              invoice_number: invoiceNumber.trim(),
              supplier_id: supplierId || null,
              purchase_date: purchaseDate,
              subtotal: subtotalItems,
              discount: discount,
              additional_fee: additionalFee,
              total_amount: totalAmount,
              payment_method: paymentMethod,
              payment_status: paymentStatus,
              notes: notes.trim() || null,
            },
          ])
          .select("id")
          .single();

        if (errPurch) throw errPurch;

        // 2. Insert items & update stocks
        for (const item of items) {
          await supabase.from("purchase_items").insert([
            {
              purchase_id: newPurch.id,
              product_id: item.product_id,
              quantity: item.quantity,
              cost_per_unit: item.cost_per_unit,
              subtotal: item.subtotal,
              batch_number: item.batch_number.trim() || null,
              expired_at: item.expired_at || null,
            },
          ]);

          // Fetch current stock
          const { data: curProd } = await supabase
            .from("products")
            .select("current_stock")
            .eq("id", item.product_id)
            .single();

          const prevStock = Number(curProd?.current_stock || 0);
          const nextStock = prevStock + item.quantity;

          // Update product stock and cost price
          await supabase
            .from("products")
            .update({
              current_stock: nextStock,
              cost_price: item.cost_per_unit,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);

          // Log movement
          await supabase.from("stock_movements").insert([
            {
              product_id: item.product_id,
              movement_type: "purchase",
              quantity_change: item.quantity,
              stock_after: nextStock,
              cost_per_unit: item.cost_per_unit,
              reference_id: invoiceNumber.trim(),
              reason: `Pembelian nota ${invoiceNumber.trim()}`,
            },
          ]);
        }

        // 3. Log cash expense if paid
        if (paymentStatus === "paid") {
          await supabase.from("cash_movements").insert([
            {
              movement_type: "expense",
              amount: totalAmount,
              category: "Pembelian Bahan Baku",
              description: `Pembelian nota ${invoiceNumber.trim()}`,
              payment_method: paymentMethod,
              movement_date: purchaseDate,
            },
          ]);
        }
      }

      setSuccessMsg(`Pembelian nota ${invoiceNumber} berhasil dicatat! Stok bahan baku telah bertambah.`);
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan pembelian.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (p: Purchase) => {
    setSelectedPurchase(p);
    try {
      const { data: itemData } = await supabase
        .from("purchase_items")
        .select(`
          *,
          product:products(name, unit)
        `)
        .eq("purchase_id", p.id);
      
      setSelectedPurchase({ ...p, items: itemData || [] });
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
      setIsDetailOpen(true);
    }
  };

  const handleDeletePurchase = async (p: Purchase) => {
    if (!confirm(`Hapus data pembelian nota "${p.invoice_number}"? Data item pembelian terkait akan ikut terhapus.`)) return;

    try {
      const { error } = await supabase.from("purchases").delete().eq("id", p.id);
      if (error) throw error;

      setSuccessMsg(`Data pembelian "${p.invoice_number}" berhasil dihapus.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal menghapus pembelian: " + err.message);
    }
  };

  // Metrics summary
  const totalSpend = purchases.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const unpaidCount = purchases.filter((p) => p.payment_status === "unpaid").length;
  const filteredPurchases = purchases.filter(
    (p) =>
      p.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.supplier?.name && p.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBasket className="w-6 h-6 text-primary" />
            Pembelian Bahan Baku
          </h1>
          <p className="text-sm text-muted">
            Catat nota beli curah dari supplier dan otomatis tambah stok bahan baku.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-dark text-white gap-2">
          <Plus className="w-4 h-4" />
          Buat Pembelian
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-primary flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Total Belanja Tercatat</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              Rp {totalSpend.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-mint flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Total Transaksi Nota</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {purchases.length} Transaksi
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-mint text-success flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-peach flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">Nota Belum Lunas (Hutang)</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {unpaidCount} Nota
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-peach text-accent-dark flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Notification Alerts */}
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

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 bg-background border border-line rounded-xl px-3 py-2 w-full max-w-md focus-within:border-primary">
          <Search className="w-4 h-4 text-muted flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no faktur atau nama supplier..."
            className="w-full bg-transparent text-sm focus:outline-hidden"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Purchases Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Riwayat Pembelian Bahan Baku</h2>
          <span className="text-xs text-muted">{filteredPurchases.length} transaksi ditemukan</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Memuat riwayat pembelian...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mb-3">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Belum Ada Transaksi Pembelian</h3>
            <p className="text-xs text-muted max-w-sm mt-1 mb-4">
              Catat nota pembelian bahan mentah Anda untuk memperbarui stok kilogram secara otomatis.
            </p>
            <Button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-dark text-white gap-2">
              <Plus className="w-4 h-4" />
              Catat Pembelian Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lavender/30 text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">No. Faktur / Tanggal</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3">Metode & Status</th>
                  <th className="px-5 py-3 text-right">Total Tagihan</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{p.invoice_number}</div>
                      <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.purchase_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        {p.supplier?.name || "Supplier Umum"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="lavender" className="capitalize">
                          {p.payment_method}
                        </Badge>
                        <Badge
                          variant={
                            p.payment_status === "paid"
                              ? "mint"
                              : p.payment_status === "unpaid"
                              ? "peach"
                              : "yellow"
                          }
                        >
                          {p.payment_status === "paid"
                            ? "Lunas"
                            : p.payment_status === "unpaid"
                            ? "Belum Lunas"
                            : "Sebagian"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="font-bold text-foreground">
                        Rp {Number(p.total_amount).toLocaleString("id-ID")}
                      </div>
                      {p.notes && (
                        <div className="text-[11px] text-muted italic line-clamp-1">{p.notes}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(p)}
                          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-lavender/40 transition-colors"
                          title="Lihat Detail Nota"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(p)}
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-rose-50 transition-colors"
                          title="Hapus Nota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Buat Pembelian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-lavender/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-base">Buat Transaksi Pembelian Bahan Baku</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Header Faktur */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    No. Faktur / Invoice <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Pilih Supplier <span className="text-danger">*</span>
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                    {suppliers.length === 0 && (
                      <option value="">(Belum ada supplier terdaftar)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tanggal Pembelian
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Daftar Item Bahan Baku (Curah)
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItemRow}
                    className="text-xs h-8 px-2.5 gap-1.5 text-primary border-primary/40 hover:bg-lavender/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baris
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-background border border-line rounded-xl grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-muted mb-1">Bahan Baku</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                          className="w-full bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-muted mb-1">
                          Jumlah ({products.find((p) => p.id === item.product_id)?.unit || "kg"})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.001"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-muted mb-1">
                          Harga Beli Satuan (Rp)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={item.cost_per_unit}
                          onChange={(e) => handleItemChange(idx, "cost_per_unit", e.target.value)}
                          className="w-full bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div className="col-span-10 sm:col-span-2 text-right">
                        <label className="block text-[11px] font-semibold text-muted mb-1">Subtotal</label>
                        <div className="text-xs font-bold text-foreground py-1.5">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1 text-center">
                        <label className="block text-[11px] font-semibold text-transparent mb-1">X</label>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-muted hover:text-danger hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biaya Tambahan & Pembayaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-line">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["cash", "transfer", "qris"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium uppercase transition-colors ${
                            paymentMethod === m
                              ? "bg-lavender text-primary-dark border-primary font-bold shadow-2xs"
                              : "border-line text-muted hover:bg-background"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Status Pembayaran
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "paid", label: "Lunas" },
                        { id: "unpaid", label: "Belum Lunas" },
                        { id: "partially_paid", label: "Sebagian" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setPaymentStatus(s.id as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                            paymentStatus === s.id
                              ? "bg-mint text-success border-success font-bold shadow-2xs"
                              : "border-line text-muted hover:bg-background"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    {paymentStatus === "paid" && (
                      <p className="text-[11px] text-muted mt-1.5 italic">
                        * Otomatis mencatat pengeluaran kas di buku kas keuangan.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Catatan / Keterangan Nota
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Pembelian makaroni kualitas super batch pagi..."
                      className="w-full bg-background border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary resize-none"
                    />
                  </div>
                </div>

                {/* Ringkasan Biaya */}
                <div className="bg-background/80 p-4 rounded-xl border border-line space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal Bahan Baku:</span>
                      <span className="font-semibold text-foreground">
                        Rp {subtotalItems.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted">Biaya Ongkir / Lainnya:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={additionalFee}
                        onChange={(e) => setAdditionalFee(parseFloat(e.target.value) || 0)}
                        className="w-32 bg-surface border border-line rounded-lg px-2 py-1 text-right text-xs font-semibold focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted">Diskon / Potongan:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="w-32 bg-surface border border-line rounded-lg px-2 py-1 text-right text-xs font-semibold focus:outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line flex justify-between items-center">
                    <div>
                      <div className="text-xs font-medium text-muted">Total Pembelian:</div>
                      <div className="text-lg font-bold text-primary-dark">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-line flex items-center justify-end gap-3 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-dark text-white px-6"
                >
                  {submitting ? "Menyimpan & Menambah Stok..." : "Konfirmasi Pembelian"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pembelian */}
      {isDetailOpen && selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20">
              <h3 className="font-bold text-foreground">Detail Nota {selectedPurchase.invoice_number}</h3>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-background p-3.5 rounded-xl border border-line">
                <div>
                  <span className="text-muted block">Supplier:</span>
                  <span className="font-semibold text-foreground">
                    {selectedPurchase.supplier?.name || "Supplier Umum"}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Tanggal:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedPurchase.purchase_date).toLocaleDateString("id-ID", {
                      dateStyle: "long",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Metode Bayar:</span>
                  <span className="font-semibold text-foreground uppercase">
                    {selectedPurchase.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Status:</span>
                  <Badge
                    variant={selectedPurchase.payment_status === "paid" ? "mint" : "peach"}
                    className="mt-0.5"
                  >
                    {selectedPurchase.payment_status === "paid" ? "Lunas" : "Belum Lunas"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Daftar Bahan Yang Diterima
                </h4>
                <div className="divide-y divide-line border border-line rounded-xl overflow-hidden text-xs">
                  {selectedPurchase.items && selectedPurchase.items.length > 0 ? (
                    selectedPurchase.items.map((it: any) => (
                      <div key={it.id} className="p-2.5 flex justify-between items-center bg-surface">
                        <div>
                          <span className="font-semibold text-foreground">{it.product?.name}</span>
                          <span className="text-muted block">
                            {it.quantity} {it.product?.unit || "kg"} × Rp{" "}
                            {Number(it.cost_per_unit).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span className="font-bold text-foreground">
                          Rp {Number(it.subtotal).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted">Memuat data item...</div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span>Rp {Number(selectedPurchase.subtotal).toLocaleString("id-ID")}</span>
                </div>
                {Number(selectedPurchase.additional_fee) > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Biaya Tambahan / Ongkir:</span>
                    <span>Rp {Number(selectedPurchase.additional_fee).toLocaleString("id-ID")}</span>
                  </div>
                )}
                {Number(selectedPurchase.discount) > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Diskon:</span>
                    <span>- Rp {Number(selectedPurchase.discount).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-line">
                  <span>Total Faktur:</span>
                  <span className="text-primary-dark">
                    Rp {Number(selectedPurchase.total_amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
