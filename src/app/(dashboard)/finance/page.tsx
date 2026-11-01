"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  Calendar,
  Banknote,
  CreditCard,
  QrCode,
  DollarSign,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface CashMovement {
  id: string;
  movement_date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  payment_method: "cash" | "transfer" | "qris";
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const expenseCategories = [
  "Pembelian Bahan Baku",
  "Plastik Kemasan",
  "Stiker & Label",
  "Ongkir & Transportasi",
  "Listrik & Air",
  "Peralatan & Perlengkapan",
  "Gaji / Upah",
  "Operasional Lainnya",
];

const incomeCategories = [
  "Penjualan Kasir",
  "Penerimaan Piutang",
  "Tambahan Modal Pemilik",
  "Pendapatan Lainnya",
];

export default function FinancePage() {
  const supabase = createClient();

  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Inputs
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Plastik Kemasan");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "qris">("cash");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cash_movements")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setMovements(data as CashMovement[]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Save Cash Movement
  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      showToast("error", "Nominal transaksi harus lebih dari 0!");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("cash_movements").insert([
      {
        movement_date: txDate,
        type: txType,
        category: category,
        amount: amountNum,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal menyimpan transaksi kas: " + error.message);
    } else {
      showToast("success", `Catatan ${txType === "expense" ? "pengeluaran" : "pemasukan"} berhasil disimpan!`);
      setIsModalOpen(false);
      setAmount("");
      setNotes("");
      fetchMovements();
    }
  };

  // Delete Cash Movement
  const handleDeleteMovement = async (id: string, cat: string, nominal: number) => {
    if (!confirm(`Hapus catatan kas "${cat}" sebesar ${formatRupiah(nominal)}?`)) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("cash_movements").delete().eq("id", id);
    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal menghapus: " + error.message);
    } else {
      showToast("success", "Catatan transaksi kas berhasil dihapus.");
      fetchMovements();
    }
  };

  // Calculations
  const totalIncome = movements
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const totalExpense = movements
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const filteredMovements = movements.filter((m) => {
    if (filterType === "all") return true;
    return m.type === filterType;
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
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span>Keuangan & Arus Kas</span>
          </h1>
          <p className="text-sm text-muted">
            Pantau saldo kas masuk dari penjualan kasir dan catat pengeluaran operasional usaha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setTxType("expense");
              setCategory(expenseCategories[0]);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kas Keluar / Masuk</span>
          </Button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card pastelAccent={netBalance >= 0 ? "mint" : "peach"}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Saldo Kas Bersih</p>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                netBalance >= 0 ? "bg-mint text-success" : "bg-peach text-[#A04128]"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p
            className={`text-2xl font-black mt-2 tracking-tight ${
              netBalance >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatRupiah(netBalance)}
          </p>
          <p className="text-[11px] text-muted mt-0.5">Pemasukan dikurangi pengeluaran</p>
        </Card>

        <Card pastelAccent="lavender">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Total Pemasukan (Kas Masuk)</p>
            <div className="w-9 h-9 rounded-xl bg-lavender text-primary flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
            {formatRupiah(totalIncome)}
          </p>
          <p className="text-[11px] text-muted mt-0.5">Dari kasir & sumber lainnya</p>
        </Card>

        <Card pastelAccent="yellow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Total Pengeluaran (Kas Keluar)</p>
            <div className="w-9 h-9 rounded-xl bg-yellow text-warning flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
            {formatRupiah(totalExpense)}
          </p>
          <p className="text-[11px] text-muted mt-0.5">Bahan baku, plastik, label & operasional</p>
        </Card>
      </div>

      {/* Cash Movements Table */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-line">
          <div>
            <h3 className="font-bold text-base text-foreground">Buku Kas & Riwayat Transaksi</h3>
            <p className="text-xs text-muted">Seluruh arus masuk kasir dan kas keluar tercatat transparan</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-muted border-line hover:bg-background"
              }`}
            >
              Semua Arus Kas
            </button>
            <button
              onClick={() => setFilterType("income")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "income"
                  ? "bg-success text-white border-success"
                  : "bg-surface text-muted border-line hover:bg-background"
              }`}
            >
              Kas Masuk (+)
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                filterType === "expense"
                  ? "bg-danger text-white border-danger"
                  : "bg-surface text-muted border-line hover:bg-background"
              }`}
            >
              Kas Keluar (-)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted text-sm">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Memuat buku kas...
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Belum Ada Transaksi Kas</h4>
            <p className="text-xs text-muted max-w-sm mt-1">
              Transaksi kasir otomatis tercatat di sini. Anda juga dapat mencatat biaya kemasan, stiker, atau operasional.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Tipe / Kategori</th>
                  <th className="py-3 px-3">Keterangan</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3">Nominal Arus Kas</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredMovements.map((m) => {
                  const isIncome = m.type === "income";
                  return (
                    <tr key={m.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-foreground">
                        {m.movement_date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={isIncome ? "mint" : "peach"} size="sm">
                            {isIncome ? "Masuk" : "Keluar"}
                          </Badge>
                          <span className="font-semibold text-foreground text-xs">{m.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted">
                        {m.notes || (m.reference_id ? `Ref #${m.reference_id}` : "-")}
                      </td>
                      <td className="py-3 px-3">
                        <span className="uppercase text-xs font-semibold font-mono text-muted">
                          {m.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-sm ${
                            isIncome ? "text-success" : "text-danger"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatRupiah(m.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteMovement(m.id, m.category, m.amount)}
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                          title="Hapus Catatan Kas"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* MODAL CATAT ARUS KAS BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Catat Transaksi Keuangan</h3>
                <p className="text-xs text-muted">Tambah catatan pengeluaran biaya atau kas masuk</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-sm">
              {/* Type Switch */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType("expense");
                      setCategory(expenseCategories[0]);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      txType === "expense"
                        ? "bg-peach border-danger/40 text-[#A04128] font-bold shadow-2xs"
                        : "bg-background border-line text-muted"
                    }`}
                  >
                    Pengeluaran (Kas Keluar)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType("income");
                      setCategory(incomeCategories[0]);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      txType === "income"
                        ? "bg-mint border-success text-success font-bold shadow-2xs"
                        : "bg-background border-line text-muted"
                    }`}
                  >
                    Pemasukan (Kas Masuk)
                  </button>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Kategori {txType === "expense" ? "Pengeluaran" : "Pemasukan"} *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {(txType === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nominal Amount */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Nominal Transaksi (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 150000"
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  >
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Beli plastik 1 rim, isi bensin..."
                  className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Simpan Transaksi Kas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
