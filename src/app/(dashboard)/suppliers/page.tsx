"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  X, 
  AlertCircle,
  MessageCircle,
  ShoppingBasket,
  DollarSign,
  Receipt
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface PurchaseSummary {
  id: string;
  total_amount: number;
  payment_status: "paid" | "unpaid" | "partially_paid";
  invoice_number?: string;
  purchase_date?: string;
}

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  purchases?: PurchaseSummary[];
}

export default function SuppliersPage() {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    is_active: true,
  });

  // History Invoices Modal
  const [historyModalSupplier, setHistoryModalSupplier] = useState<Supplier | null>(null);
  const [supplierInvoices, setSupplierInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch suppliers along with purchases aggregation
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select(`
          *,
          purchases (
            id,
            total_amount,
            payment_status,
            invoice_number,
            purchase_date
          )
        `)
        .order("name", { ascending: true });

      if (error) {
        // Fallback without relation if RLS or join issue
        const { data: simpleData, error: simpleErr } = await supabase
          .from("suppliers")
          .select("*")
          .order("name", { ascending: true });
        if (simpleErr) throw simpleErr;
        setSuppliers(simpleData || []);
      } else {
        setSuppliers(data || []);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data supplier:", err.message);
      setErrorMsg("Gagal memuat data supplier: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      notes: "",
      is_active: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      phone: sup.phone || "",
      address: sup.address || "",
      notes: sup.notes || "",
      is_active: sup.is_active,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenInvoicesHistory = async (sup: Supplier) => {
    setHistoryModalSupplier(sup);
    setLoadingInvoices(true);
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          invoice_number,
          purchase_date,
          total_amount,
          payment_status,
          payment_method,
          purchase_items (
            quantity,
            cost_per_unit,
            product:products(name, unit)
          )
        `)
        .eq("supplier_id", sup.id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      setSupplierInvoices(data || []);
    } catch (err: any) {
      console.error(err);
      alert("Gagal memuat riwayat nota: " + err.message);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Nama supplier wajib diisi");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from("suppliers")
          .update({
            name: formData.name.trim(),
            phone: formData.phone.trim() || null,
            address: formData.address.trim() || null,
            notes: formData.notes.trim() || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSupplier.id);

        if (error) throw error;
        setSuccessMsg("Supplier berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("suppliers").insert([
          {
            name: formData.name.trim(),
            phone: formData.phone.trim() || null,
            address: formData.address.trim() || null,
            notes: formData.notes.trim() || null,
            is_active: formData.is_active,
          },
        ]);

        if (error) throw error;
        setSuccessMsg("Supplier baru berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      fetchSuppliers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus supplier "${name}"?`)) return;

    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
      setSuccessMsg(`Supplier "${name}" berhasil dihapus.`);
      fetchSuppliers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal menghapus supplier: " + err.message);
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(searchQuery)) ||
    (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Daftar Supplier & Vendor
          </h1>
          <p className="text-sm text-muted">
            Kelola data vendor pemasok, riwayat belanja bahan baku, serta status hutang nota beli.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/purchases">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-lavender/30 gap-1.5">
              <ShoppingBasket className="w-4 h-4" />
              Kelola Pembelian
            </Button>
          </Link>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary-dark text-white gap-2">
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </Button>
        </div>
      </div>

      {/* Alerts */}
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
            placeholder="Cari nama, no hp, atau alamat supplier..."
            className="w-full bg-transparent text-sm focus:outline-hidden"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Supplier Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 bg-lavender/40 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-lavender/30 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-lavender/20 rounded w-full"></div>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-peach text-accent-dark flex items-center justify-center mb-3">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">Belum Ada Data Supplier</h3>
          <p className="text-xs text-muted max-w-sm mt-1 mb-4">
            Tambahkan informasi supplier untuk menghubungkan pembelian bahan baku curah Anda.
          </p>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary-dark text-white gap-2">
            <Plus className="w-4 h-4" />
            Tambah Supplier Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => {
            const purchasesList = supplier.purchases || [];
            const totalOrders = purchasesList.length;
            const totalSpent = purchasesList.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
            const unpaidOrders = purchasesList.filter((p) => p.payment_status === "unpaid").length;

            return (
              <Card key={supplier.id} className="p-5 flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{supplier.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant={supplier.is_active ? "mint" : "peach"}>
                          {supplier.is_active ? "Aktif" : "Non-aktif"}
                        </Badge>
                        {unpaidOrders > 0 && (
                          <Badge variant="danger" className="text-[10px]">
                            {unpaidOrders} Belum Lunas
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(supplier)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-lavender/50 transition-colors"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-rose-50 transition-colors"
                        title="Hapus Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Box Transaksi Terkait */}
                  <div className="p-3 bg-background rounded-xl border border-line mb-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-muted">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-primary" />
                        Total Belanja:
                      </span>
                      <span className="font-bold text-foreground">
                        {totalOrders} Nota
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-success" />
                        Akumulasi Transaksi:
                      </span>
                      <span className="font-bold text-primary-dark">
                        Rp {totalSpent.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted mb-4">
                    {supplier.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          {supplier.phone}
                        </span>
                        <a
                          href={`https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-mint/50 text-success font-medium hover:bg-mint text-[11px]"
                        >
                          <MessageCircle className="w-3 h-3" />
                          WhatsApp
                        </a>
                      </div>
                    )}

                    {supplier.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent-dark flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}

                    {supplier.notes && (
                      <div className="flex items-start gap-1.5 pt-1 border-t border-line/60">
                        <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0 mt-0.5" />
                        <span className="italic line-clamp-2">{supplier.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenInvoicesHistory(supplier)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Riwayat Nota ({totalOrders})
                  </button>
                  <Link href="/purchases">
                    <Button variant="outline" className="text-xs h-7 px-2 border-line hover:border-primary gap-1">
                      <ShoppingBasket className="w-3 h-3 text-primary" />
                      Order Beli
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Riwayat Nota Supplier */}
      {historyModalSupplier && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20 flex-shrink-0">
              <div>
                <h3 className="font-bold text-foreground">
                  Riwayat Pembelian dari {historyModalSupplier.name}
                </h3>
                <p className="text-xs text-muted">Daftar seluruh nota beli dan bahan mentah yang pernah dipasok.</p>
              </div>
              <button
                onClick={() => setHistoryModalSupplier(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingInvoices ? (
                <div className="p-8 text-center text-muted text-sm">Memuat riwayat nota...</div>
              ) : supplierInvoices.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">
                  Belum ada transaksi pembelian yang tercatat dengan supplier ini.
                </div>
              ) : (
                supplierInvoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-background rounded-xl border border-line space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground">{inv.invoice_number}</span>
                        <span className="text-muted block text-[11px]">
                          {new Date(inv.purchase_date).toLocaleDateString("id-ID", { dateStyle: "long" })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-dark text-sm block">
                          Rp {Number(inv.total_amount).toLocaleString("id-ID")}
                        </span>
                        <Badge variant={inv.payment_status === "paid" ? "mint" : "peach"} className="mt-0.5">
                          {inv.payment_status === "paid" ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </div>
                    </div>

                    {inv.purchase_items && inv.purchase_items.length > 0 && (
                      <div className="pt-2 border-t border-line/60 space-y-1">
                        <span className="text-[11px] font-semibold text-muted">Item Bahan Mentah:</span>
                        {inv.purchase_items.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between text-[11px] text-muted">
                            <span>â€¢ {it.product?.name}</span>
                            <span>
                              {it.quantity} {it.product?.unit || "kg"} Ã— Rp {Number(it.cost_per_unit).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-line flex justify-end flex-shrink-0 bg-background/50">
              <Button variant="outline" onClick={() => setHistoryModalSupplier(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20">
              <h3 className="font-bold text-foreground">
                {editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Supplier / Toko <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Berkah Snack Curah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Alamat Lengkap / Gudang
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jl. Industri No. 12, Pasar Induk"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Supplier makaroni pedas & keripik singkong super"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="supplier_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="supplier_active" className="text-xs text-foreground font-medium cursor-pointer">
                  Supplier Aktif
                </label>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
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
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  {submitting ? "Menyimpan..." : editingSupplier ? "Simpan Perubahan" : "Tambah Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
