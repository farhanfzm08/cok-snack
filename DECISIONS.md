# Catatan Keputusan Arsitektur (DECISIONS.md)

## 1. Pemilihan Stack Database & Autentikasi: Supabase
- **Keputusan:** Menggunakan Supabase PostgreSQL dengan Row Level Security (RLS) dan Supabase Auth terintegrasi.
- **Alasan:** Supabase menyediakan database relasional ACID PostgreSQL dengan kemampuan RLS tingkat baris yang menjamin otorisasi aman dari level database. Mendukung tipe data numerik presisi untuk nominal mata uang Rupiah dan satuan berat persediaan.

## 2. Arsitektur Repacking (Curah Kilogram ke Eceran Gram)
- **Keputusan:** 
  - Produk mentah disimpan dalam satuan `kg` (contoh: Makaroni Cikruh Curah).
  - Produk jadi disimpan dalam satuan kemasan (misal: bungkus/pack dengan atribut `package_weight_grams`).
  - Menggunakan tabel `repacking_orders` yang mencatat pemakaian aktual, target vs aktual bungkus, sisa bahan, dan susut (*shrinkage*), serta menghitung HPP per bungkus berdasarkan alokasi bahan + kemasan + label.
- **Alasan:** Memastikan kalkulasi konversi 1 kg = 1.000 gram tidak menghasilkan selisih tak terlacak, dan menjaga nilai HPP tercatat akurat untuk laporan margin keuntungan historis.

## 3. Skema Klien Supabase di Next.js App Router
- **Keputusan:** Menggunakan `@supabase/ssr` dengan pemisahan `createClient` browser di `src/lib/supabase/client.ts` dan server di `src/lib/supabase/server.ts`.
- **Alasan:** Sesuai rekomendasi resmi Supabase untuk Next.js App Router (Next.js 15+ dan 16) dengan manajemen cookie sesi yang aman di sisi server.

## 4. Transaksi Atomik Database (PostgreSQL Stored Procedures / RPC)
- **Keputusan:** Seluruh mutasi stok dan keuangan kritis dijalankan melalui prosedur tersimpan database (`execute_repacking`, `execute_sale`, `execute_purchase`).
- **Alasan:** Menghindari *race condition*, inkonsistensi data ketika koneksi terputus di tengah transaksi, dan memastikan validasi ketersediaan stok diverifikasi langsung pada level database menggunakan mekanisme *row-level locking* (`FOR UPDATE`).

## 5. Fleksibilitas Angka Desimal (Stock & Biaya Satuan)
- **Keputusan:** Seluruh kolom kuantiti stok (`current_stock`, `raw_material_used_kg`, `quantity`) menggunakan tipe `NUMERIC(10, 3)` dan kolom biaya kemasan serta HPP menggunakan `NUMERIC(12, 2)` tanpa batasan bilangan bulat.
- **Alasan:** Menyesuaikan realita operasional snack UMKM di mana pembelian atau pengemasan seringkali menggunakan desimal (misal: 0.5 kg bahan baku atau biaya plastik satuan Rp60/pcs).

## 6. Penghapusan Bersih Cascade (CASCADE Deletion)
- **Keputusan:** Memasang aturan `ON DELETE CASCADE` pada seluruh tabel anak yang berelasi dengan tabel `products` (`stock_movements`, `repacking_orders`, `inventory_batches`, `purchase_items`, `sale_items`).
- **Alasan:** Memberikan keleluasaan bagi pemilik UMKM untuk menghapus produk uji coba atau kategori tanpa terkendala galat integritas referensial kunci asing (*foreign key constraint violation*).

## 7. Engine Bundler Webpack untuk Tailwind CSS v4 di Windows
- **Keputusan:** Menggunakan Next.js dengan flag `--webpack` dan modul `@tailwindcss/postcss` terstandar.
- **Alasan:** Mencegah isu kompatibilitas loader IPC subproses Turbopack pada lingkungan Windows 11 saat memproses aturan `@theme` baru dari Tailwind v4.
