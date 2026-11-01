"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("kasir");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
        setRole(user.user_metadata?.role || "kasir");

        // Coba ambil dari tabel public.profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.phone) setPhone(profile.phone);
          if (profile.role) setRole(profile.role);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Update user metadata & email (jika berubah) di Supabase Auth
      const updateData: { email?: string; data: { full_name: string; phone: string } } = {
        data: {
          full_name: fullName,
          phone: phone,
        },
      };

      if (email) {
        updateData.email = email;
      }

      const { error: authErr } = await supabase.auth.updateUser(updateData);
      if (authErr) throw authErr;

      // 2. Update tabel public.profiles
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone: phone,
        email: email,
        updated_at: new Date().toISOString(),
      });

      setSuccessMsg("Profil akun berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMsg("Password berhasil diubah! Gunakan password baru saat login berikutnya.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengganti password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel: Record<string, string> = {
    owner: "👑 Pemilik (Owner)",
    admin: "⚙️ Administrator",
    kasir: "🧾 Kasir Toko",
  };

  const roleBadgeVariant: Record<string, "lavender" | "mint" | "sky"> = {
    owner: "lavender",
    admin: "mint",
    kasir: "sky",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          <span>Profil Pengguna & Keamanan Akun</span>
        </h1>
        <p className="text-sm text-muted">
          Kelola informasi nama, nomor kontak, email, dan kata sandi akun Anda.
        </p>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-mint/50 border border-success/30 text-success text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-danger text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Ringkasan Akun Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-lavender text-primary flex items-center justify-center font-bold text-2xl shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {fullName || email.split("@")[0] || "Pengguna COK Snack"}
                </h2>
                <Badge variant={roleBadgeVariant[role] || "lavender"}>
                  {roleLabel[role] || role}
                </Badge>
              </div>
              <p className="text-sm text-muted flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {email}
              </p>
              {phone && (
                <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {phone}
                </p>
              )}
            </div>
          </div>
          <div className="text-xs text-muted sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
            <span className="block font-medium">Tingkat Hak Akses</span>
            <span className="text-primary font-semibold">{roleLabel[role] || role}</span>
          </div>
        </div>
      </Card>

      {/* Grid: Form Data Diri & Ganti Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Ubah Data Diri */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-line">
            <div className="w-9 h-9 rounded-xl bg-lavender text-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Informasi Pribadi</h3>
              <p className="text-xs text-muted">Perbarui nama lengkap, nomor HP, dan email</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Alamat Email Login
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
              </div>
              <p className="text-[11px] text-muted mt-1">
                Jika email diganti, gunakan email baru saat login berikutnya.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={savingProfile || loading}
                variant="primary"
                className="w-full justify-center"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Form 2: Ganti Password */}
        <Card className="p-6">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-line">
            <div className="w-9 h-9 rounded-xl bg-peach text-[#A04128] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Ganti Kata Sandi</h3>
              <p className="text-xs text-muted">Amankan akun Anda dengan password baru</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-10 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full pl-9 pr-10 py-2 bg-background border border-line rounded-xl text-sm focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-line text-xs text-muted space-y-1">
              <span className="font-semibold text-foreground block">Tips Keamanan:</span>
              <p>• Gunakan minimal 6 karakter kombinasi huruf dan angka.</p>
              <p>• Jangan gunakan password yang mudah ditebak.</p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={savingPassword || loading}
                variant="outline"
                className="w-full justify-center border-line hover:border-primary"
              >
                <KeyRound className="w-4 h-4 mr-1.5 text-primary" />
                {savingPassword ? "Mengganti..." : "Perbarui Kata Sandi"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
