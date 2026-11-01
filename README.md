# SAE Snack Management System

Sistem manajemen terintegrasi untuk usaha repacking dan penjualan snack (UMKM). Sistem ini dirancang untuk menangani pembelian bahan baku curah (satuan kilogram), proses pengemasan ulang (*repacking*) menjadi kemasan siap jual (satuan gram), kasir *Point of Sale* (POS) yang cepat, pencatatan mutasi stok otomatis, pembukuan kas keuangan, serta laporan laba-rugi terperinci.

---

## 1. Gambaran Proyek

SAE Snack Management System menghubungkan seluruh alur operasional:
1. **Pembelian Bahan Mentah Curah**: Membeli bahan dalam satuan kg dari supplier dengan pencatatan faktur dan penambahan stok otomatis.
2. **Repacking Atomik**: Mengubah bahan baku curah (kg) menjadi kemasan eceran (gram) dengan kalkulasi susut produksi, alokasi biaya kemasan, dan kalkulasi HPP otomatis per bungkus. Stok bahan baku berkurang dan stok produk jadi bertambah secara bersamaan (*atomic transaction*).
3. **Kasir (POS)**: Penjualan produk siap jual dengan keranjang responsif, kalkulator kembalian, cetak struk nota belanja, dan pemotongan stok otomatis.
4. **Keuangan & Buku Kas**: Pencatatan arus kas masuk dan keluar secara otomatis dari kasir dan nota beli, serta pencatatan manual biaya operasional (listrik, gaji, bensin, dll).
5. **Laporan & Ekspor Data**: Rekapitulasi penjualan, laba kotor (*Gross Margin*), riwayat repacking, audit stok barang, dan ekspor spreadsheet CSV instan.

---

## 2. Teknologi yang Digunakan

- **Frontend & Backend**: Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 dengan palet pastel lembut flat design (*Modern Flat Pastel Theme*).
- **Ikon**: Lucide React.
- **Database & Auth**: Supabase Cloud (PostgreSQL 15+).
- **Validasi Data**: Zod.

---

## 3. Persyaratan Sistem

- **Sistem Operasi**: Windows 10/11, macOS, atau Linux.
- **Node.js**: Versi 18.18+ atau 20+ LTS.
- **Package Manager**: npm atau yarn.
- **Browser Modern**: Google Chrome, Microsoft Edge, atau Mozilla Firefox.

---

## 4. Cara Menjalankan Aplikasi Secara Lokal

1. **Clone atau Buka Direktori Proyek**:
   ```bash
   cd c:\Projects\sae-snack
   ```

2. **Instal Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Pastikan file `.env.local` telah berisi kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

4. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 5. Menyiapkan Database di Supabase

Jalankan skrip SQL di **Supabase Dashboard > SQL Editor** dengan urutan berikut:

1. `supabase/schema.sql` — Tabel dasar, enum, dan relasi.
2. `supabase/patch_repacking_and_stock.sql` — Fungsi atomik repacking (`execute_repacking`).
3. `supabase/patch_full_cascade_and_delete.sql` — Relasi CASCADE delete bersih untuk produk dan mutasi stok.
4. `supabase/patch_pos_sales.sql` — Fungsi atomik kasir & pengurangan stok produk jadi (`execute_sale`).
5. `supabase/patch_purchases_and_suppliers.sql` — Fungsi atomik nota pembelian supplier & penambahan stok bahan baku curah (`execute_purchase`).

---

## 6. Pengujian & Type Checking

Untuk memverifikasi keutuhan kode dan tipe data:
```bash
npx tsc --noEmit
```

---

## 7. Cara Deployment ke Vercel

1. Buat repository baru di GitHub dan lakukan `git push` kode proyek.
2. Masuk ke [Vercel Dashboard](https://vercel.com) dan impor repository tersebut.
3. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Klik **Deploy**. Aplikasi akan otomatis online dalam hitungan menit.
