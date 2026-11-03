"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  Printer,
  Bell,
  Users,
  UserPlus,
  Trash2,
  ShieldAlert,
  X,
  Mail,
  Phone,
  Lock,
  User,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  address: string;
  receiptFooter: string;
  defaultMinStock: number;
}

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "kasir";
  phone: string;
  created_at: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "COK Snack",
    tagline: "Cemilan Orang Kaya",
    phone: "0812-3456-7890",
    address: "Jl. Industri Keripik No. 8, Indonesia",
    receiptFooter:
      "Terima kasih atas kunjungan Anda!\nCOK Snack (Cemilan Orang Kaya) - Renyah & Gurih",
    defaultMinStock: 5,
  });

  const [dbStats, setDbStats] = useState({
    productsCount: 0,
    salesCount: 0,
    usersCount: 0,
    movementsCount: 0,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // User Management State (Owner Only)
  const [currentUserRole, setCurrentUserRole] = useState<string>("kasir");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Form Tambah User
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"owner" | "admin" | "kasir">("kasir");
  const [submittingUser, setSubmittingUser] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // 1. Ambil data user aktif
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        const r = (user.user_metadata?.role as string) || "kasir";
        setCurrentUserRole(r);
        if (r === "owner") {
          fetchUsers();
        }
      }
    });

    // 2. Load settings dari localStorage
    const saved = localStorage.getItem("cok_snack_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Load DB counts
    const fetchCounts = async () => {
      try {
        const { count: pCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });
        const { count: sCount } = await supabase
          .from("sales")
          .select("*", { count: "exact", head: true });
        const { count: uCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        const { count: mCount } = await supabase
          .from("stock_movements")
          .select("*", { count: "exact", head: true });

        setDbStats({
          productsCount: pCount || 0,
          salesCount: sCount || 0,
          usersCount: uCount || 0,
          movementsCount: mCount || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounts();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    localStorage.setItem("cok_snack_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("cok_snack_settings_updated"));
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg("Pengaturan profil toko berhasil disimpan!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
          phone: newPhone,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat user");
      }

      setSuccessMsg(`Akun "${newEmail}" (${newRole.toUpperCase()}) berhasil dibuat!`);
      setIsAddUserModalOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewPhone("");
      setNewRole("kasir");
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat akun.");
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, targetRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: targetRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg("Hak akses akun berhasil diperbarui!");
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Gagal memperbarui role: " + err.message);
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (user.id === currentUserId) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus akun "${user.email}" (${user.role.toUpperCase()})?\nAkun tidak akan bisa login lagi.`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Akun "${user.email}" berhasil dihapus.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg("Gagal menghapus user: " + err.message);
    }
  };

  const handleExportAllData = async () => {
    setExporting(true);
    try {
      const { data: products } = await supabase.from("products").select("*");
      const { data: categories } = await supabase.from("categories").select("*");
      const { data: suppliers } = await supabase.from("suppliers").select("*");
      const { data: sales } = await supabase.from("sales").select("*, sale_items(*)");
      const { data: repacks } = await supabase.from("repacking_orders").select("*");
      const { data: cash } = await supabase.from("cash_movements").select("*");
      const { data: purchases } = await supabase
        .from("purchases")
        .select("*, purchase_items(*)");

      const backupData = {
        app: "COK Snack Management System",
        exportedAt: new Date().toISOString(),
        products,
        categories,
        suppliers,
        sales,
        repacks,
        cash,
        purchases,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_cok_snack_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccessMsg("Cadangan data berhasil diunduh dalam format JSON.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal mengekspor data: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const roleLabel: Record<string, string> = {
    owner: "👑 Owner",
    admin: "⚙️ Admin",
    kasir: "🧾 Kasir",
  };

  const roleBadgeVariant: Record<string, "lavender" | "mint" | "sky"> = {
    owner: "lavender",
    admin: "mint",
    kasir: "sky",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Pengaturan Toko & Sistem
          </h1>
          <p className="text-sm text-muted">
            Kelola profil toko, kontrol akses akun multi-role, dan cadangan data database.
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline" className="border-line hover:border-primary text-xs">
            <User className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Ubah Profil & Password Saya
          </Button>
        </Link>
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

      {/* SECTION 1: KONTROL AKUN & ROLE (HANYA OWNER) */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lavender text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>Kontrol Akun & Hak Akses Pengguna</span>
                <Badge variant="lavender" size="sm">
                  Khusus Owner
                </Badge>
              </h2>
              <p className="text-xs text-muted">
                Tambah akun baru, tentukan jabatan (Role), dan hapus akses staf usaha.
              </p>
            </div>
          </div>

          {currentUserRole === "owner" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddUserModalOpen(true)}
              className="gap-1.5 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </Button>
          )}
        </div>

        {currentUserRole !== "owner" ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Akses Terbatas: Hanya Pemilik (Owner)</p>
              <p className="text-amber-700 mt-0.5">
                Pengaturan tambah akun dan upgrade role hanya dapat dilakukan oleh akun dengan jabatan Owner. Untuk mengubah detail akun pribadi Anda (nama, no HP, password), silakan buka menu{" "}
                <Link href="/profile" className="underline font-semibold">
                  Profil Saya
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-line text-muted uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Nama & Email</th>
                    <th className="py-2.5 px-3">No. HP</th>
                    <th className="py-2.5 px-3">Jabatan (Role)</th>
                    <th className="py-2.5 px-3">Ubah / Upgrade Role</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted">
                        Memuat daftar pengguna...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted">
                        Belum ada user lain terdaftar.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isMe = u.id === currentUserId;
                      return (
                        <tr key={u.id} className="hover:bg-background/50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              {u.full_name}
                              {isMe && (
                                <span className="text-[10px] bg-lavender text-primary px-1.5 py-0.2 rounded-md font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-muted font-mono text-[11px]">{u.email}</div>
                          </td>
                          <td className="py-2.5 px-3 text-muted">{u.phone || "-"}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant={roleBadgeVariant[u.role] || "lavender"}>
                              {roleLabel[u.role] || u.role}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              disabled={isMe}
                              className="text-xs bg-background border border-line rounded-lg px-2 py-1 focus:outline-hidden focus:border-primary disabled:opacity-50"
                            >
                              <option value="owner">👑 Owner (Akses Penuh)</option>
                              <option value="admin">⚙️ Admin (Operasional)</option>
                              <option value="kasir">🧾 Kasir (Khusus POS)</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isMe}
                              className="p-1 rounded-lg text-muted hover:text-danger hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isMe ? "Tidak bisa menghapus akun sendiri" : "Hapus Akun"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-background border border-line text-[11px] text-muted space-y-1">
              <span className="font-semibold text-foreground block">Keterangan Hak Akses:</span>
              <p>• <strong>👑 Owner</strong>: Memiliki hak mutlak ke seluruh halaman sistem termasuk pengaturan akun & keuangan.</p>
              <p>• <strong>⚙️ Admin</strong>: Mengelola produk, stok, pembelian, repacking, kasir, dan laporan operasional.</p>
              <p>• <strong>🧾 Kasir</strong>: Khusus melayani transaksi penjualan di kasir (POS) dan dashboard ringkasan.</p>
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 2: IDENTITAS TOKO & STRUK KASIR */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-line">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">Identitas Usaha & Struk Kasir</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nama Usaha / Toko (Tampil di Kiri Atas)
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Slogan / Tagline Toko (Subjudul Kiri Atas)
              </label>
              <input
                type="text"
                placeholder="Contoh: Cemilan Orang Kaya"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Alamat Toko
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-muted" />
                Catatan Kaki Struk (Receipt Footer)
              </label>
              <textarea
                rows={2}
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full bg-background border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary resize-none font-mono"
              />
              <p className="text-[11px] text-muted mt-1">
                Teks ini akan muncul di bagian bawah struk saat dicetak di kasir.
              </p>
            </div>
          </div>
        </Card>

        {/* SECTION 3: PARAMETER PERSEDIAAN */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-line">
            <Bell className="w-5 h-5 text-accent-dark" />
            <h2 className="font-bold text-base text-foreground">Parameter Persediaan</h2>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-foreground mb-1">
              Batas Standar Peringatan Stok Tipis
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={settings.defaultMinStock}
                onChange={(e) =>
                  setSettings({ ...settings, defaultMinStock: parseInt(e.target.value) || 5 })
                }
                className="w-24 bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary text-center font-bold"
              />
              <span className="text-xs text-muted">unit / bungkus</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              Produk dengan sisa stok di bawah angka ini akan otomatis ditandai badge kuning/merah.
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white gap-2 px-6"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan Toko"}
          </Button>
        </div>
      </form>

      {/* SECTION 4: DATABASE & BACKUP */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-success" />
            <div>
              <h2 className="font-bold text-base text-foreground">Status Database & Cadangan</h2>
              <p className="text-xs text-muted">Koneksi Supabase PostgreSQL Cloud aktif.</p>
            </div>
          </div>
          <Badge variant="mint" className="gap-1 inline-flex items-center">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tersinkronisasi
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-background rounded-xl border border-line text-center">
            <span className="text-xs text-muted block">Total Produk</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.productsCount}
            </span>
          </div>
          <div className="p-3 bg-background rounded-xl border border-line text-center">
            <span className="text-xs text-muted block">Transaksi Kasir</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.salesCount}
            </span>
          </div>
          <div className="p-3 bg-background rounded-xl border border-line text-center">
            <span className="text-xs text-muted block">Akun Pengguna</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.usersCount}
            </span>
          </div>
          <div className="p-3 bg-background rounded-xl border border-line text-center">
            <span className="text-xs text-muted block">Mutasi Stok</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.movementsCount}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Unduh seluruh data transaksi, produk, dan supplier sebagai file JSON untuk backup berkala offline.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportAllData}
            disabled={exporting}
            className="border-line hover:border-primary gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-primary" />
            {exporting ? "Mengekspor Data..." : "Unduh Cadangan JSON"}
          </Button>
        </div>
      </Card>

      {/* MODAL TAMBAH AKUN BARU */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-lavender/20">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Pengguna / Karyawan"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Login <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@coksnack.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Kata Sandi (Password) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor HP / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Pilih Jabatan (Role) <span className="text-danger">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-background border border-line rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-primary font-medium"
                >
                  <option value="kasir">🧾 Kasir (Hanya akses transaksi POS kasir)</option>
                  <option value="admin">⚙️ Admin (Akses operasional produk, stok & kasir)</option>
                  <option value="owner">👑 Owner (Akses penuh ke seluruh sistem)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={submittingUser}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submittingUser}
                  variant="primary"
                >
                  {submittingUser ? "Membuat Akun..." : "Buat Akun Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
