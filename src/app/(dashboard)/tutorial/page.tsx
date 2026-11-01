"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Package,
  Boxes,
  ShoppingBasket,
  Truck,
  PackageCheck,
  ShoppingCart,
  Wallet,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TutorialPage() {
  const [activeTab, setActiveTab] = useState<
    "flow" | "products" | "purchases" | "repacking" | "pos" | "reports" | "faq"
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
            Panduan lengkap memahami alur kerja sistem, rumus konversi repacking, kalkulasi HPP, dan operasional kasir.
          </p>
        </div>
        <Badge variant="mint" className="gap-1.5 py-1 px-3 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          SOP Terstandarisasi
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "flow", label: "1. Alur Bisnis Penuh", icon: Layers },
          { id: "products", label: "2. Master Data Produk", icon: Package },
          { id: "purchases", label: "3. Supplier & Pembelian", icon: Truck },
          { id: "repacking", label: "4. SOP Repacking & HPP", icon: PackageCheck },
          { id: "pos", label: "5. Kasir (POS)", icon: ShoppingCart },
          { id: "reports", label: "6. Keuangan & Laporan", icon: BarChart3 },
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

      {/* Tab 1: Alur Bisnis Penuh */}
      {activeTab === "flow" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Peta Alur Kerja (End-to-End Business Flow)
            </h2>
            <p className="text-xs text-muted mb-6">
              Sistem SAE Snack dirancang khusus untuk menjembatani pembelian bahan mentah curah (kg) hingga menjadi produk kemasan siap jual (gram/pack) di kasir toko:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-lavender/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Beli Bahan Mentah</h3>
                  <p className="text-[11px] text-muted">
                    Beli snack curah dari supplier dalam satuan <strong>Kilogram (Kg)</strong>. Catat faktur di menu <em>Pembelian</em>. Stok bahan bertambah otomatis.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="lavender" className="text-[10px]">Stok Bahan +Kg</Badge>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-mint/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-success text-white flex items-center justify-center font-bold text-xs mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Repacking & HPP</h3>
                  <p className="text-[11px] text-muted">
                    Ambil beberapa kg bahan mentah, kemas ke gram (100g, 250g, dll). Masukkan biaya plastik. Sistem menghitung <strong>HPP per bungkus</strong> secara otomatis.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="mint" className="text-[10px]">Bahan -Kg & Jadi +Pack</Badge>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-peach/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-accent-dark text-white flex items-center justify-center font-bold text-xs mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Kasir (POS)</h3>
                  <p className="text-[11px] text-muted">
                    Jual snack kemasan ke pelanggan. Terima bayar Tunai, QRIS, atau Transfer. Cetak struk belanja. Stok kemasan terpotong otomatis saat transaksi sukses.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="peach" className="text-[10px]">Stok Jadi -Pack</Badge>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-sky/40 border border-line relative flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-[#1D5B99] text-white flex items-center justify-center font-bold text-xs mb-3">
                    4
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Laba & Laporan</h3>
                  <p className="text-[11px] text-muted">
                    Sistem otomatis menghitung omzet penjualan, total HPP, <strong>Laba Kotor (Gross Margin)</strong>, serta menyediakan cetak dokumen laporan resmi berformat PDF.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line/60">
                  <Badge variant="sky" className="text-[10px]">Laba Bersih & PDF</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/purchases" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Mulai Beli Bahan</h4>
                  <p className="text-xs text-muted">Catat nota belanja dari vendor</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>

            <Link href="/repacking" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Mulai Repacking</h4>
                  <p className="text-xs text-muted">Kemas curah kg ke bungkus</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>

            <Link href="/pos" className="block">
              <Card className="p-4 hover:border-primary/50 transition-colors flex items-center justify-between group">
                <div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">Buka Kasir Toko</h4>
                  <p className="text-xs text-muted">Lakukan transaksi penjualan</p>
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
              Prinsip Pembedaan Bahan Baku vs Produk Jadi
            </h2>
            <p className="text-xs text-muted">
              Salah satu kunci akurasi inventaris adalah tidak mencampuradukkan barang mentah dengan barang kemasan. Di SAE Snack, produk dibagi menjadi dua kategori sistem:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-line bg-lavender/30 space-y-2">
                <Badge variant="lavender">Bahan Mentah (Curah)</Badge>
                <h4 className="font-bold text-sm text-foreground">Karakteristik Bahan Curah:</h4>
                <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                  <li>Satuan dasar selalu <strong>Kilogram (Kg)</strong>.</li>
                  <li>Mendukung angka desimal (contoh: <code>0.5 kg</code> atau <code>12.75 kg</code>).</li>
                  <li>Hanya memiliki <strong>Harga Beli (Cost Price) per kg</strong>.</li>
                  <li>Tidak dijual langsung di kasir POS, melainkan bahan masukan untuk proses repacking.</li>
                  <li>Contoh: <em>Makaroni Cikruh Pedas (Curah 10kg)</em>, <em>Keripik Kaca Curah</em>.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-line bg-mint/30 space-y-2">
                <Badge variant="mint">Produk Jadi (Kemasan)</Badge>
                <h4 className="font-bold text-sm text-foreground">Karakteristik Produk Kemasan:</h4>
                <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                  <li>Satuan kemasan adalah <strong>Bungkus / Pack / Pcs</strong>.</li>
                  <li>Memiliki berat isi kemasan dalam gram (contoh: <code>100 gram</code>, <code>250 gram</code>).</li>
                  <li>Memiliki <strong>Harga Jual Kasir (Selling Price)</strong> dan HPP yang terbentuk dari repacking.</li>
                  <li>Tampil aktif di layar kasir POS untuk dibeli pelanggan.</li>
                  <li>Contoh: <em>Makaroni Cikruh SAE 100g</em>, <em>Keripik Kaca Pedas 200g</em>.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-line flex items-center gap-3 text-xs text-muted">
              <ShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
              <span>
                <strong>Fitur Perlindungan Hapus Bersih:</strong> Jika Anda menghapus produk uji coba di menu Produk, sistem secara aman akan menghapus riwayat pergerakan stok terkait (*CASCADE Delete*).
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Supplier & Pembelian */}
      {activeTab === "purchases" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              SOP Pembelian Bahan Mentah Curah
            </h2>
            <p className="text-xs text-muted">
              Setiap kali Anda mendatangkan karung/bal snack curah dari supplier, lakukan pencatatan faktur di sistem agar stok dan nilai modal tercatat otomatis.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-lg bg-lavender text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Daftarkan Supplier di Menu Supplier</h4>
                  <p className="text-[11px] text-muted">
                    Masukkan nama toko/vendor, nomor kontak (WhatsApp), dan alamat. Halaman supplier juga otomatis menghitung total akumulasi uang yang sudah Anda belanjakan ke vendor tersebut.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-lg bg-lavender text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Catat Nota di Menu Pembelian</h4>
                  <p className="text-[11px] text-muted">
                    Pilih nama supplier, masukkan nomor faktur, dan pilih bahan mentah. Anda bisa memasukkan kuantiti desimal (misal <code>15.5 kg</code>) beserta harga beli per kg.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-lg bg-lavender text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-foreground">Otomatisasi Sistem Saat Pembelian Disimpan:</h4>
                  <ul className="text-[11px] text-muted list-disc list-inside mt-1 space-y-0.5">
                    <li>Stok bahan mentah (kg) langsung bertambah di menu Persediaan.</li>
                    <li>Harga beli per kg bahan baku otomatis diperbarui ke harga terbaru (mempengaruhi HPP repacking selanjutnya).</li>
                    <li>Jika Anda memilih status <strong>Lunas</strong>, pengeluaran uang langsung otomatis dicatat di Buku Kas Keuangan.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: SOP Repacking & HPP */}
      {activeTab === "repacking" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-success" />
              SOP Repacking, Konversi Gramasi, & Rumus HPP (Kritis!)
            </h2>
            <p className="text-xs text-muted">
              Repacking adalah inti bisnis UMKM Snack. Fitur ini mengkonversi bahan curah (kg) menjadi kemasan (gram) dengan rumus matematika presisi.
            </p>

            {/* Formula Card */}
            <div className="p-4 rounded-xl bg-background border border-line space-y-3">
              <h3 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Rumus Dasar Konversi & Susut Produksi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-line">
                  <span className="text-muted block text-[11px]">1. Konversi Berat:</span>
                  <span className="font-mono font-bold text-foreground block mt-1">1 Kg = 1.000 Gram</span>
                  <span className="text-[11px] text-muted block mt-0.5">Contoh: 5 kg = 5.000 gram</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-line">
                  <span className="text-muted block text-[11px]">2. Target Teoritis:</span>
                  <span className="font-mono font-bold text-foreground block mt-1">(Kg × 1000) ÷ Gram Kemasan</span>
                  <span className="text-[11px] text-muted block mt-0.5">5.000g ÷ 100g = 50 bungkus</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-line">
                  <span className="text-muted block text-[11px]">3. Susut Produksi (Shrinkage):</span>
                  <span className="font-mono font-bold text-danger block mt-1">Total Gram - Gram Terkemas</span>
                  <span className="text-[11px] text-muted block mt-0.5">Remahan hancur atau debu bumbu</span>
                </div>
              </div>
            </div>

            {/* HPP Calculation Example */}
            <div className="p-4 rounded-xl bg-mint/20 border border-success/30 space-y-2">
              <h4 className="font-bold text-xs text-success uppercase tracking-wider">
                Contoh Nyata Perhitungan HPP per Bungkus:
              </h4>
              <p className="text-xs text-foreground leading-relaxed">
                Anda mengambil <strong>5 kg Makaroni Curah</strong> seharga <strong>Rp 30.000/kg</strong> (Total bahan: Rp 150.000).<br />
                Target produksi kemasan 100 gram adalah 50 bungkus, namun hasil aktual yang layak jual adalah <strong>48 bungkus</strong> (ada remukan bumbu 200 gram).<br />
                Biaya plastik kemasan & stiker adalah <strong>Rp 200/bungkus</strong> (Total kemasan: Rp 9.600).
              </p>
              <div className="p-3 rounded-lg bg-surface border border-line text-xs font-mono">
                Total Biaya = Rp 150.000 (bahan) + Rp 9.600 (kemasan) = Rp 159.600<br />
                <strong>HPP per Bungkus = Rp 159.600 ÷ 48 bungkus = Rp 3.325 / bungkus</strong>
              </div>
              <p className="text-[11px] text-muted italic">
                * Jika Anda menjual dengan harga Rp 6.000/bungkus di kasir, maka keuntungan kotor Anda adalah Rp 2.675 per bungkus (Margin 44.5%).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-line flex items-center gap-3 text-xs text-muted">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <span>
                <strong>Eksekusi Atomik Database:</strong> Ketika Anda menekan <em>"Konfirmasi Produksi"</em>, stok bahan curah otomatis terpotong 5 kg dan stok kemasan bertambah 48 bungkus dalam 1 transaksi aman di database.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Kasir (POS) */}
      {activeTab === "pos" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent-dark" />
              Operasional Kasir (Point of Sale) & Cetak Struk
            </h2>
            <p className="text-xs text-muted">
              Halaman kasir didesain cepat dan nyaman digunakan baik di layar laptop maupun tablet kasir toko.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <h4 className="font-bold text-xs text-foreground">Fitur Utama Kasir:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li>Pencarian nama produk atau filter kategori instan.</li>
                  <li>Keranjang belanja otomatis menghitung subtotal dan kuantitas.</li>
                  <li>Kalkulator kembalian otomatis dengan tombol uang pas (10rb, 20rb, 50rb, 100rb).</li>
                  <li>Pilihan metode bayar: <strong>Tunai, QRIS, Transfer</strong>.</li>
                  <li>Input diskon fleksibel untuk potongan promosi.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <h4 className="font-bold text-xs text-foreground">Struk Nota Belanja:</h4>
                <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
                  <li>Format struk profesional dengan logo SAE Snack, nomor invoice, tanggal, rincian produk, dan pesan terima kasih.</li>
                  <li>Dapat dicetak langsung ke printer thermal kasir via tombol <em>"Cetak Struk"</em>.</li>
                  <li>Pesan footer struk dapat disesuaikan di menu <strong>Pengaturan</strong>.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: Keuangan & Laporan */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Buku Kas Keuangan & Cetak Laporan Resmi (PDF)
            </h2>
            <p className="text-xs text-muted">
              Evaluasi kinerja keuangan toko dengan memantau pemasukan, pengeluaran operasional, serta mencetak dokumen resmi untuk arsip atau investor.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-background border border-line space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-primary" />
                  Buku Kas Otomatis & Pengeluaran Operasional
                </h4>
                <p className="text-xs text-muted">
                  Setiap transaksi kasir otomatis masuk sebagai <em>Pemasukan Penjualan</em>, dan nota pembelian lunas otomatis masuk sebagai <em>Pengeluaran Bahan</em>. Di menu <strong>Keuangan</strong>, Anda juga dapat mencatat biaya operasional manual seperti listrik, bensin, atau gaji karyawan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-line space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-primary" />
                  Format Laporan Resmi PDF vs Ekspor CSV
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted pt-1">
                  <div className="p-3 rounded-lg bg-surface border border-line">
                    <strong className="text-foreground block mb-1">1. Laporan Resmi PDF:</strong>
                    Memiliki kop surat resmi SAE Snack, ringkasan eksekutif omzet & HPP, tabel data formal, dan kolom tanda tangan pemilik toko. Siap dicetak langsung ke lembar A4.
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-line">
                    <strong className="text-foreground block mb-1">2. Ekspor CSV:</strong>
                    Mengunduh seluruh baris transaksi dalam format spreadsheet yang dapat dibuka langsung di Microsoft Excel atau Google Sheets untuk olah data lanjutan.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 7: FAQ */}
      {activeTab === "faq" && (
        <div className="space-y-4 animate-in fade-in">
          {[
            {
              q: "Apakah biaya plastik kemasan bisa diisi angka kecil seperti Rp 60/buah?",
              a: "Bisa! Formulir alokasi biaya kemasan pada repacking maupun harga beli telah mendukung angka bebas tanpa pembulatan paksa, sehingga perhitungan HPP tetap presisi hingga satuan rupiah kecil.",
            },
            {
              q: "Bagaimana jika ada produk kemasan yang bocor atau snack curah yang berjamur?",
              a: "Buka menu 'Persediaan', cari produk terkait, lalu klik tombol 'Sesuaikan'. Pilih jenis 'Selisih Kurang/Rusak', masukkan jumlah susut dan alasannya. Sistem akan langsung memperbarui sisa stok dan mencatatnya ke log audit trail mutasi.",
            },
            {
              q: "Apakah riwayat produk yang dihapus akan menimbulkan error?",
              a: "Tidak. Basis data sudah menerapkan aturan CASCADE Delete sehingga seluruh mutasi stok dan riwayat repacking lama yang menempel pada produk tersebut akan terhapus bersih secara otomatis.",
            },
            {
              q: "Bagaimana cara mencadangkan seluruh data usaha saya untuk disimpan offline?",
              a: "Buka menu 'Pengaturan' di bilah samping, lalu pada bagian 'Status Database & Cadangan', klik tombol 'Unduh Cadangan JSON'. Seluruh daftar produk, nota pembelian, riwayat repacking, dan transaksi kasir akan terunduh sebagai 1 file arsip JSON aman.",
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
