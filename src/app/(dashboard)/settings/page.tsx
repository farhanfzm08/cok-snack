"use client";

import React, { useState, useEffect } from "react";
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
  Bell
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  receiptFooter: string;
  defaultMinStock: number;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "COK Snack (Cemilan Orang Kaya)",
    phone: "0812-3456-7890",
    address: "Jl. Industri Keripik No. 8, Indonesia",
    receiptFooter: "Terima kasih atas kunjungan Anda!\nCOK Snack (Cemilan Orang Kaya) - Renyah & Gurih",
    defaultMinStock: 5,
  });

  const [dbStats, setDbStats] = useState({
    productsCount: 0,
    salesCount: 0,
    repackingCount: 0,
    purchasesCount: 0,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem("sae_snack_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Load db counts
    const fetchCounts = async () => {
      try {
        const { count: pCount } = await supabase.from("products").select("*", { count: "exact", head: true });
        const { count: sCount } = await supabase.from("sales").select("*", { count: "exact", head: true });
        const { count: rCount } = await supabase.from("repacking_orders").select("*", { count: "exact", head: true });
        const { count: bCount } = await supabase.from("purchases").select("*", { count: "exact", head: true });

        setDbStats({
          productsCount: pCount || 0,
          salesCount: sCount || 0,
          repackingCount: rCount || 0,
          purchasesCount: bCount || 0,
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
    localStorage.setItem("sae_snack_settings", JSON.stringify(settings));
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg("Pengaturan toko berhasil disimpan ke sistem!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  const handleExportAllData = async () => {
    setExporting(true);
    try {
      const { data: products } = await supabase.from("products").select("*");
      const { data: categories } = await supabase.from("categories").select("*");
      const { data: sales } = await supabase.from("sales").select("*, sale_items(*)");
      const { data: repacking } = await supabase.from("repacking_orders").select("*");
      const { data: purchases } = await supabase.from("purchases").select("*, purchase_items(*)");
      const { data: suppliers } = await supabase.from("suppliers").select("*");

      const exportBundle = {
        meta: {
          app: "SAE Snack Management System",
          version: "1.0.0",
          exported_at: new Date().toISOString(),
        },
        data: {
          categories,
          products,
          suppliers,
          purchases,
          repacking_orders: repacking,
          sales,
        },
      };

      const jsonStr = JSON.stringify(exportBundle, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_sae_snack_${new Date().toISOString().split("T")[0]}.json`;
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Pengaturan Toko & Sistem
        </h1>
        <p className="text-sm text-muted">
          Kelola profil identitas toko SAE Snack, format struk, dan cadangan data database.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-mint/50 border border-success/30 text-success text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-line">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">Identitas Usaha & Struk Kasir</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nama Usaha / Toko
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

        {/* Inventory Rules */}
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
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary-dark text-white gap-2 px-6">
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </form>

      {/* Database & Backup Section */}
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
            <span className="text-xs text-muted block">Order Repacking</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.repackingCount}
            </span>
          </div>
          <div className="p-3 bg-background rounded-xl border border-line text-center">
            <span className="text-xs text-muted block">Nota Pembelian</span>
            <span className="font-bold text-base text-foreground mt-0.5 block">
              {dbStats.purchasesCount}
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
    </div>
  );
}
