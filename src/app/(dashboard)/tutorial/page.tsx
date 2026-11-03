"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Package,
  PlusCircle,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Edit,
  TrendingUp,
  Receipt
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState<
    "flow" | "products" | "stock" | "pos" | "reports" | "faq"
  >("flow");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-3 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Pusat Panduan & SOP COK Snack (Cemilan Orang Kaya)</span>
          </h1>
          <p className="text-sm text-muted">
            Panduan lengkap alur kerja sistem terpadu: Tambah Produk Jadi, Kelola Stok Masuk, Transaksi Kasir POS, dan Laporan Keuntungan.
          </p>
        </div>
        <Badge variant="mint" className="gap-1.5 py-1 px-3 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          SOP Praktis & Cepat
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "flow", label: "1. Alur Bisnis Praktis", icon: Layers },
          { id: "products", label: "2. Produk & Atur HPP", icon: Package },
          { id: "stock", label: "3. Tambah & Edit Stok", icon: PlusCircle },
          { id: "pos", label: "4. Kasir Penjualan (POS)", icon: ShoppingCart },
          { id: "reports", label: "5. Laporan & Keuntungan", icon: BarChart3 },
          { id: "faq", label: "FAQ / Tanya Jawab", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-line text-muted hover:text-foreground hover:bg-background"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Alur Bisnis Praktis */}
      {activeTab === "flow" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Peta Alur Kerja Sederhana (4 Langkah Cepat)
            </h2>
            <p className="text-xs text-muted mb-6">
              Sistem COK Snack telah disederhanakan tanpa kerumitan pencatatan bahan baku atau supplier. Fokus langsung pada produk kemasan siap jual:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-lavender/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Daftarkan Produk</h3>
                  <p className="text-[11px] text-muted">
                    Buat produk kemasan siap jual di menu <em>Produk & Stok</em>. Tentukan nama snack, gramasi (contoh: 100g), Modal HPP per bungkus, dan harga jual kasir.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="lavender" className="text-[10px]">HPP Ditentukan di Awal</Badge>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-mint/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-success text-white flex items-center justify-center font-bold text-xs mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Tambah Stok Masuk</h3>
                  <p className="text-[11px] text-muted">
                    Saat barang baru siap (hasil packing), cukup klik tombol <strong>+ Stok</strong> di tabel produk atau dashboard. Stok bungkus bertambah seketika.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="mint" className="text-[10px]">Cepat Sekali Klik</Badge>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-peach/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-accent-dark text-white flex items-center justify-center font-bold text-xs mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Kasir Toko (POS)</h3>
                  <p className="text-[11px] text-muted">
                    Layani pembeli di kasir dengan mudah. Bayar Tunai, QRIS, atau Transfer, lalu cetak struk belanja. Stok produk terpotong otomatis di database.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="peach" className="text-[10px]">Stok Terpotong Otomatis</Badge>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-sky/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-[#1D5B99] text-white flex items-center justify-center font-bold text-xs mb-3">
                    4
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Laporan Laba Rugi</h3>
                  <p className="text-[11px] text-muted">
                    Pantau omzet harian, beban modal HPP terjual, dan <strong>Laba Kotor Bersih</strong>. Cetak laporan formal berformat PDF atau unduh CSV.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="sky" className="text-[10px]">Otomatis & Siap Cetak</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/products" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Kelola Produk & Stok</h4>
                  <p className="text-xs text-muted">Tambah produk atau isi stok</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>

            <Link href="/pos" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Buka Kasir POS</h4>
                  <p className="text-xs text-muted">Mulai transaksi kasir toko</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>

            <Link href="/reports" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Lihat Laporan Penjualan</h4>
                  <p className="text-xs text-muted">Rekap omzet & cetak PDF</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Master Data Produk */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Pembuatan Produk Kemasan & Pengaturan HPP
            </h2>
            <p className="text-xs text-muted">
              Tidak perlu lagi pusing membedakan bahan mentah curah vs produk repacking. Semua snack langsung didaftarkan sebagai produk kemasan siap jual:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-line bg-lavender/30 space-y-2">
                <Badge variant="lavender">Formulir Tambah Produk Cepat</Badge>
                <h4 className="font-bold text-sm text-foreground">Data yang Diisi Saat Buat Produk:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li><strong>Nama Snack:</strong> Contoh: <em>Basreng Pedas Daun Jeruk 100g</em>.</li>
                  <li><strong>Kategori:</strong> Basreng, Makaroni, Keripik Kaca, Usus Krispi, dll.</li>
                  <li><strong>Berat Kemasan (Gram):</strong> Contoh: <code>100</code>, <code>250</code> gram.</li>
                  <li><strong>Modal Pokok (HPP) / bungkus:</strong> Ditetapkan di awal (misal Rp 3.500/bungkus).</li>
                  <li><strong>Harga Jual / bungkus:</strong> Harga yang tertera di kasir (misal Rp 6.000/bungkus).</li>
                  <li><strong>Stok Awal:</strong> Jumlah bungkus yang siap dijual di etalase.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-line bg-mint/30 space-y-2">
                <Badge variant="mint">Mode Edit Produk Fleksibel</Badge>
                <h4 className="font-bold text-sm text-foreground">Fitur Edit & Pembaruan Harga:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li>Terdapat tombol <strong>Pensil (Edit)</strong> di samping setiap baris produk.</li>
                  <li>Anda bebas mengubah nama, kategori, gramasi, harga jual, maupun nilai HPP kapan saja jika terjadi kenaikan harga pasar.</li>
                  <li>Perubahan HPP akan langsung berlaku untuk transaksi kasir berikutnya, memastikan perhitungan laba selalu akurat.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-line flex items-center gap-3 text-xs text-muted">
              <ShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
              <span>
                <strong>Tombol Hapus Produk Bersih:</strong> Jika ingin menghapus produk yang sudah tidak dijual, cukup klik ikon sampah merah di tabel produk. Data mutasi riwayat terkait akan terhapus dengan aman.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Tambah & Edit Stok */}
      {activeTab === "stock" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-success" />
              Penambahan Stok Masuk Cepat (+ Stok)
            </h2>
            <p className="text-xs text-muted">
              Saat Anda selesai mengemas snack baru, Anda tidak perlu mengisi formulir panjang atau alur yang rumit:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-start p-3 rounded-xl bg-surface border border-line">
                <div className="w-7 h-7 rounded-lg bg-mint text-success font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Buka Halaman Dashboard atau Produk</h4>
                  <p className="text-[11px] text-muted">
                    Di tabel inventaris produk, temukan produk yang ingin ditambah stoknya.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-xl bg-surface border border-line">
                <div className="w-7 h-7 rounded-lg bg-mint text-success font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Klik Tombol "+ Stok"</h4>
                  <p className="text-[11px] text-muted">
                    Akan muncul jendela popup cepat. Masukkan jumlah bungkus yang masuk (misal: <code>50</code> bungkus) dan catatan (opsional, misal: <em>"Packing gelombang 2"</em>).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 rounded-xl bg-surface border border-line">
                <div className="w-7 h-7 rounded-lg bg-mint text-success font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Simpan Stok Masuk</h4>
                  <p className="text-[11px] text-muted">
                    Stok produk langsung bertambah seketika di kasir POS dan sistem mencatat audit trail mutasi stok secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Kasir (POS) */}
      {activeTab === "pos" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent-dark" />
              Operasional Kasir (Point of Sale) & Cetak Struk
            </h2>
            <p className="text-xs text-muted">
              Layar kasir dibuat gesit untuk mempercepat antrean transaksi pelanggan di toko offline maupun pesanan online.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <h4 className="font-bold text-xs text-foreground">Fitur Kasir Pintar:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li>Cari snack dengan mengetik nama produk atau klik filter kategori.</li>
                  <li>Keranjang belanja otomatis menghitung subtotal pesanan.</li>
                  <li>Tombol uang cepat (10rb, 20rb, 50rb, 100rb) dan kalkulasi kembalian otomatis.</li>
                  <li>Pilihan metode bayar fleksibel: <strong>Tunai, QRIS, Transfer</strong>.</li>
                  <li>Fitur diskon rupiah langsung untuk potongan promosi.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <h4 className="font-bold text-xs text-foreground">Struk Belanja & Pengurangan Stok:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li>Format struk profesional lengkap dengan nama toko, no faktur, rincian barang, dan footer WhatsApp.</li>
                  <li>Tombol <strong>Cetak Struk</strong> untuk printer thermal 58mm/80mm maupun print browser biasa.</li>
                  <li>Stok produk di database berkurang secara atomik saat pembayaran sukses.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Laporan & Keuntungan */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Laporan Penjualan, Laba Rugi, & Cetak PDF Resmi
            </h2>
            <p className="text-xs text-muted">
              Evaluasi kinerja usaha secara transparan tanpa perlu menghitung buku kas manual yang membingungkan.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-background border border-line space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Kalkulasi Laba Kotor Otomatis (Gross Profit)
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Setiap kali transaksi kasir terjadi, sistem menghitung modal barang dari <strong>HPP</strong> produk yang telah Anda tentukan. Rumus laba yang ditampilkan:
                </p>
                <div className="p-3 rounded-lg bg-surface border border-line text-xs font-mono text-primary font-bold">
                  Laba Kotor = Total Omzet Kasir - Total Beban Pokok (HPP)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-line space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-primary" />
                  Format Dokumen Siap Cetak (A4 PDF) & Ekspor CSV
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted pt-1">
                  <div className="p-3 rounded-lg bg-surface border border-line">
                    <strong className="text-foreground block mb-1">1. Laporan Resmi PDF:</strong>
                    Telah dilengkapi kop surat resmi COK Snack, rekap omzet harian/bulanan, tabel transaksi faktur, serta lembar tanda tangan pemilik toko.
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-line">
                    <strong className="text-foreground block mb-1">2. Ekspor CSV:</strong>
                    Unduh data ke format spreadsheet untuk dibuka di Microsoft Excel atau Google Sheets kapan saja.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1 text-xs text-rose-800">
                <strong className="block font-semibold">Penghapusan Transaksi Kasir:</strong>
                <p>
                  Jika terjadi kesalahan input di kasir, pemilik toko (Owner/Admin) dapat menghapus transaksi tertentu langsung di tabel laporan penjualan dengan mengklik ikon tempat sampah pada baris transaksi tersebut.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: FAQ */}
      {activeTab === "faq" && (
        <div className="space-y-4 animate-in fade-in">
          {[
            {
              q: "Bagaimana cara menentukan HPP saat membuat produk baru?",
              a: "HPP (Harga Pokok Penjualan) adalah estimasi modal per bungkus produk siap jual. Misalnya: harga snack per bungkus Rp 3.000 + biaya kemasan plastik & stiker Rp 500 = HPP Rp 3.500. Nilai ini Anda masukkan saat mendaftarkan produk baru di menu Produk & Stok.",
            },
            {
              q: "Jika harga snack naik dari produsen, apakah HPP produk bisa diedit?",
              a: "Bisa! Cukup buka menu 'Produk & Stok', klik tombol pensil (Edit) pada produk terkait, ubah nilai HPP dan harga jualnya, lalu klik Simpan.",
            },
            {
              q: "Bagaimana jika ada snack yang melempem, bocor, atau rusak di toko?",
              a: "Buka menu 'Produk & Stok', klik tombol Edit, lalu sesuaikan jumlah stoknya ke angka aktual. Sistem akan langsung memperbarui sisa stok yang tersedia.",
            },
            {
              q: "Apakah kasir bisa menambah akun baru atau mengubah role?",
              a: "Tidak bisa. Hak kontrol akun (tambah akun karyawan, hapus akun, dan upgrade role kasir/admin/owner) hanya dapat diakses oleh akun dengan peran Owner di menu 'Pengaturan Toko'. Karyawan kasir hanya bisa mengakses halaman profil mereka sendiri untuk ubah nama, no telepon, dan password.",
            },
          ].map((faq, i) => (
            <Card key={i} className="p-5">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-muted leading-relaxed pl-6">{faq.a}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
