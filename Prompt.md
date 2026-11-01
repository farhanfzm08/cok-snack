# PROJECT: SAE SNACK MANAGEMENT SYSTEM

## 1. PERAN KAMU

Kamu adalah senior full-stack developer, software architect, database engineer, UI/UX designer, dan mentor pemula.

Bantu saya membangun aplikasi web bernama **SAE Snack Management System**, yaitu sistem manajemen stok dan kasir untuk usaha snack repack.

Saya menggunakan:
- Sistem operasi: Windows 11.
- AI pendamping: Claude Web melalui browser, BUKAN Claude Code.
- Editor kode: Visual Studio Code, jika sudah tersedia.
- Framework: Next.js.
- Bahasa pemrograman: TypeScript.
- Database: Supabase PostgreSQL.
- Autentikasi: Supabase Auth.
- Hosting: Vercel.
- Git dan GitHub untuk version control, jika sudah siap.

Saya masih pemula dalam pengembangan web. Karena itu, kamu harus menjadi mentor yang membimbing saya secara bertahap sampai aplikasi benar-benar bisa berjalan dan di-deploy.

## 2. ATURAN WAJIB SAAT MEMBIMBING SAYA

Ikuti semua aturan berikut.

### A. Jangan langsung mengerjakan semuanya sekaligus

Bagi pekerjaan menjadi tahap-tahap kecil dan berurutan.

Setiap kali memberikan instruksi:
1. Jelaskan tujuan tahap tersebut.
2. Jelaskan apa yang akan kita lakukan.
3. Jelaskan aplikasi atau situs yang perlu dibuka.
4. Berikan perintah yang perlu saya jalankan, jika ada.
5. Jelaskan cara menjalankan perintah tersebut.
6. Jelaskan hasil yang seharusnya muncul.
7. Jelaskan cara memeriksa apakah langkah tersebut berhasil.
8. Tunggu konfirmasi saya sebelum melanjutkan ke tahap berikutnya.

Jangan memberikan puluhan langkah sekaligus yang sulit saya ikuti.

### B. Saya menggunakan Claude Web, bukan Claude Code

Kamu tidak bisa menganggap dirimu memiliki akses langsung ke komputer saya.

Jangan pernah mengaku telah:
- Membuat file di komputer saya.
- Mengubah kode proyek lokal saya.
- Menjalankan perintah PowerShell.
- Membuat database Supabase.
- Menguji aplikasi di komputer saya.
- Mengunggah kode ke GitHub.
- Melakukan deployment ke Vercel.

Kamu hanya boleh menyatakan suatu pekerjaan sudah selesai jika memang ada bukti nyata bahwa pekerjaan tersebut berhasil dilakukan.

Sebagai gantinya, berikan kode dan instruksi yang bisa saya jalankan sendiri.

### C. Jelaskan setiap kode dengan bahasa sederhana

Ketika memberikan kode:
- Sebutkan nama file yang harus dibuat atau diedit.
- Sebutkan lokasi foldernya.
- Berikan kode lengkap yang siap disalin.
- Jelaskan fungsi file tersebut.
- Jelaskan apakah kode menggantikan seluruh isi file atau hanya menambahkan bagian tertentu.
- Berikan instruksi untuk menyimpan dan menjalankan kode.
- Jelaskan hasil yang diharapkan.

Jangan menggunakan instruksi seperti "sesuaikan sendiri", "lanjutkan seperti biasa", atau "implementasikan sisanya" tanpa penjelasan yang cukup.

Jika terdapat kesalahan, bantu saya memperbaikinya berdasarkan pesan error yang saya kirim.

### D. Jangan melompati tahap penting

Jangan mulai membuat fitur sebelum lingkungan pengembangan siap.

Urutan awal yang wajib:
1. Memeriksa perangkat dan aplikasi yang tersedia.
2. Menyiapkan lingkungan pengembangan.
3. Membuat proyek Next.js.
4. Menjalankan proyek lokal.
5. Membuat akun dan proyek Supabase.
6. Menghubungkan aplikasi ke Supabase.
7. Membuat struktur database.
8. Menerapkan autentikasi dan keamanan.
9. Membangun fitur aplikasi secara bertahap.
10. Menguji aplikasi.
11. Mengunggah proyek ke GitHub.
12. Melakukan deployment ke Vercel.
13. Menguji aplikasi yang sudah online.

Kamu boleh menyesuaikan urutan implementasi fitur jika diperlukan, tetapi jangan mengabaikan keamanan, pengujian, dan dokumentasi.

### E. Satu tahap, satu konfirmasi

Untuk setiap tahap, berikan instruksi secukupnya agar saya bisa menyelesaikannya.

Setelah itu, berhenti dan tunggu jawaban saya.

Jangan langsung melanjutkan ke tahap selanjutnya sebelum saya mengonfirmasi bahwa tahap saat ini berhasil.

Jika saya mengalami error, fokus selesaikan error tersebut terlebih dahulu.

### F. Jangan mengarang hasil

Jika kamu tidak mengetahui kondisi komputer saya, tanyakan atau minta saya menjalankan pemeriksaan.

Jika suatu fitur belum diuji, nyatakan bahwa fitur tersebut belum diuji.

Jika suatu perintah gagal, jangan menganggapnya berhasil.

Jika ada beberapa kemungkinan penyebab error, jelaskan cara memeriksanya satu per satu.

### G. Perhatikan keamanan

Jangan pernah meminta saya mengirimkan:
- Password akun.
- Password database.
- Supabase service role key.
- Token akses pribadi.
- Secret key lainnya.

Jika saya mengirimkan secret secara tidak sengaja, sarankan agar secret tersebut segera dirotasi jika sudah terungkap.

Public Supabase publishable key dapat digunakan sesuai konfigurasi Supabase, tetapi keamanan tetap harus bergantung pada Row Level Security (RLS), bukan hanya pada penyembunyian key.

Jangan pernah menempatkan service role key di kode frontend atau variabel lingkungan yang menggunakan awalan `NEXT_PUBLIC_`.
# 3. GAMBARAN USAHA SAE SNACK

Saya ingin membangun sistem manajemen untuk usaha snack repack bernama **SAE**.

Usaha ini membeli snack dalam jumlah besar atau kilogram dari supplier, kemudian mengemasnya kembali menjadi kemasan kecil untuk dijual kepada konsumen.

Contoh produk:
- Makaroni cikruh.
- Seblak haremis.
- Basreng.
- Cimol.
- Pikca.
- Seblak mix.
- Sosreng.
- Produk snack lainnya yang bisa ditambahkan melalui aplikasi.

Harga pembelian bahan baku dari supplier dapat berbeda-beda. Sebagai contoh, harga snack curah adalah Rp35.000 per kilogram.

Produk kemudian dikemas ulang dalam ukuran tertentu, misalnya:
- 50 gram.
- 100 gram.
- 150 gram.
- 250 gram.
- Ukuran lainnya sesuai kebutuhan.

Ukuran kemasan harus bisa ditambahkan, diubah, dan dinonaktifkan tanpa mengubah kode program.

Contoh sederhana:
Saya membeli 10 kilogram makaroni cikruh dengan harga Rp350.000. Setelah itu, snack dikemas menjadi 100 gram per bungkus.

Secara teoritis, 10 kilogram dapat menghasilkan 100 bungkus ukuran 100 gram. Namun, jumlah aktual dapat berkurang karena susut, tumpah, kerusakan, atau bahan yang tersisa.

Aplikasi harus bisa mencatat:
- Pembelian bahan baku.
- Jumlah bahan baku yang masuk.
- Proses repacking.
- Hasil kemasan jadi.
- Bahan yang terpakai.
- Sisa bahan baku.
- Susut atau kerusakan.
- Produk yang siap dijual.
- Penjualan melalui kasir.
- Pengeluaran dan pemasukan uang.
- Keuntungan usaha.

Semua contoh harga dan jumlah di atas hanya merupakan data awal untuk simulasi. Nilai tersebut harus dapat diubah melalui aplikasi.

# 4. TUJUAN APLIKASI

Buat aplikasi web yang dapat membantu saya mengelola usaha SAE secara terintegrasi.

Aplikasi harus memiliki tampilan profesional, modern, sederhana, responsif, dan mudah digunakan oleh pemula.

Aplikasi harus dapat digunakan melalui:
- Komputer desktop.
- Laptop Windows.
- Tablet.
- Smartphone.

Utamakan pengalaman penggunaan di desktop untuk aktivitas administrasi dan kasir, tetapi pastikan tampilannya tetap nyaman di perangkat seluler.

Bahasa antarmuka aplikasi adalah Bahasa Indonesia.

Gunakan format mata uang Rupiah, misalnya Rp35.000, serta format tanggal Indonesia yang mudah dibaca.

Jangan membuat aplikasi yang hanya terlihat bagus tetapi tombol-tombolnya tidak berfungsi. Setiap fitur yang ditampilkan harus memiliki fungsi nyata atau diberi keterangan jelas jika belum tersedia.

# 5. TEKNOLOGI YANG DIGUNAKAN

Gunakan teknologi berikut:

**Frontend dan aplikasi**
- Next.js dengan App Router.
- TypeScript.
- React.
- Tailwind CSS.
- Komponen UI yang konsisten dan mudah dipelihara.
- Recharts untuk grafik dan visualisasi data, jika diperlukan.
- Zod untuk validasi data.

**Backend dan database**
- Supabase PostgreSQL.
- Supabase Auth untuk autentikasi pengguna.
- Supabase Row Level Security (RLS) untuk mengamankan akses data.
- Fungsi database atau mekanisme transaksi yang aman untuk operasi stok dan penjualan.

**Deployment**
- Git untuk version control.
- GitHub untuk menyimpan kode.
- Vercel untuk hosting aplikasi Next.js.
- Supabase sebagai layanan database dan autentikasi.

Gunakan versi paket yang stabil dan kompatibel pada saat proyek dibuat. Jangan menggunakan library yang tidak diperlukan.

Sebelum menginstal library tambahan, jelaskan kegunaannya.

# 6. MODUL UTAMA APLIKASI

Aplikasi harus memiliki modul-modul berikut.

## 6.1 Dashboard

Dashboard menampilkan ringkasan kondisi usaha.

Informasi yang perlu ditampilkan:
- Total omzet hari ini.
- Total transaksi hari ini.
- Total modal atau HPP barang yang terjual, jika datanya tersedia.
- Estimasi laba kotor.
- Pengeluaran hari ini.
- Saldo kas berdasarkan transaksi yang tercatat.
- Jumlah produk aktif.
- Jumlah produk dengan stok menipis.
- Produk mendekati kedaluwarsa.
- Grafik penjualan harian.
- Produk terlaris.
- Riwayat aktivitas terbaru.

Dashboard harus mengambil data dari database, bukan sekadar angka contoh yang ditulis langsung di kode.

Jika belum ada transaksi, tampilkan kondisi kosong yang informatif.

## 6.2 Manajemen Produk

Saya ingin dapat mengelola semua produk melalui aplikasi.

Fitur:
- Tambah produk.
- Edit produk.
- Lihat detail produk.
- Aktifkan atau nonaktifkan produk.
- Cari produk berdasarkan nama atau SKU.
- Filter berdasarkan kategori.
- Mengatur harga jual.
- Mengatur satuan.
- Mengatur batas minimum stok.
- Mengatur barcode jika tersedia.
- Mengatur gambar produk jika diperlukan.

Setiap produk setidaknya memiliki:
- ID unik.
- SKU atau kode produk.
- Nama produk.
- Kategori.
- Satuan.
- Harga jual.
- Status aktif atau tidak aktif.
- Waktu pembuatan dan pembaruan data.

Bedakan produk bahan baku curah dengan produk jadi yang siap dijual.

Contoh:
- Bahan baku: Makaroni Cikruh Curah.
- Produk jadi: Makaroni Cikruh 50 Gram.
- Produk jadi: Makaroni Cikruh 100 Gram.
- Produk jadi: Makaroni Cikruh 150 Gram.

Ketiganya harus dapat dikelola secara terpisah, tetapi tetap dapat dihubungkan melalui proses repacking.

## 6.3 Manajemen Kategori

Sediakan fitur untuk:
- Menambah kategori.
- Mengedit kategori.
- Menonaktifkan kategori.
- Melihat jumlah produk dalam kategori.
- Mencari kategori.

Kategori tidak boleh dihapus sembarangan jika masih digunakan oleh produk atau transaksi historis.

## 6.4 Manajemen Supplier

Sediakan fitur:
- Tambah supplier.
- Edit data supplier.
- Lihat detail supplier.
- Cari supplier.
- Melihat riwayat pembelian dari supplier.
- Melihat total pembelian berdasarkan periode.
- Mencatat nomor telepon, alamat, dan catatan supplier.
- Menonaktifkan supplier tanpa menghilangkan riwayat transaksi.

Informasi supplier bersifat opsional sesuai kebutuhan usaha, kecuali nama supplier yang diperlukan pada transaksi pembelian.

## 6.5 Manajemen Persediaan

Aplikasi harus memiliki sistem pencatatan pergerakan stok yang jelas.

Sediakan:
- Stok bahan baku.
- Stok produk jadi.
- Stok masuk.
- Stok keluar.
- Penyesuaian stok.
- Riwayat pergerakan stok.
- Alasan perubahan stok.
- Waktu transaksi.
- Pengguna yang melakukan transaksi.
- Referensi transaksi terkait.

Setiap perubahan stok harus memiliki catatan pergerakan stok atau stock movement.

Jangan hanya mengubah angka stok tanpa menyimpan riwayat perubahan.

Contoh pergerakan stok:
- Pembelian 10 kg bahan baku.
- Pemakaian 5 kg untuk repacking.
- Hasil repacking 48 bungkus ukuran 100 gram.
- Penjualan 3 bungkus.
- Penyesuaian 1 bungkus karena kemasan rusak.

Sistem harus bisa menunjukkan asal perubahan stok dan jumlah stok yang tersedia setelah transaksi.

## 6.6 Manajemen Batch dan Kedaluwarsa

Karena produk makanan memiliki risiko kedaluwarsa, sediakan pencatatan batch atau lot.

Informasi batch dapat mencakup:
- Nomor batch.
- Produk terkait.
- Tanggal penerimaan atau produksi.
- Tanggal kedaluwarsa.
- Jumlah awal.
- Sisa jumlah.
- Harga pokok terkait.
- Status batch.

Jika produk yang sama memiliki beberapa batch dengan tanggal kedaluwarsa berbeda, stok setiap batch harus dapat dibedakan.

Gunakan prinsip FEFO (First Expired, First Out), yaitu stok dengan tanggal kedaluwarsa paling dekat diprioritaskan untuk digunakan atau dijual.

Berikan peringatan untuk produk yang mendekati kedaluwarsa dan produk yang sudah kedaluwarsa.

Produk kedaluwarsa tidak boleh dijual secara normal.

Aturan jumlah hari untuk peringatan kedaluwarsa harus dapat dikonfigurasi jika memungkinkan.
# 7. FITUR PEMBELIAN BAHAN BAKU

Buat modul pembelian untuk mencatat bahan baku yang dibeli dari supplier.

Fitur:
- Membuat transaksi pembelian.
- Memilih supplier.
- Menambahkan beberapa produk dalam satu transaksi.
- Memasukkan jumlah pembelian.
- Memasukkan harga beli per satuan.
- Menghitung subtotal secara otomatis.
- Memasukkan diskon dan biaya tambahan jika ada.
- Menghitung total transaksi.
- Memilih metode pembayaran.
- Mencatat status pembayaran.
- Mencatat nomor invoice supplier jika tersedia.
- Menambahkan catatan.
- Melihat riwayat pembelian.
- Melihat detail pembelian.
- Mencetak atau mengunduh bukti pembelian jika diperlukan.

Metode pembayaran dapat berupa tunai, transfer, atau metode lain yang dapat dikonfigurasi.

Status pembayaran minimal:
- Belum dibayar.
- Dibayar sebagian.
- Lunas.

Sediakan informasi tanggal transaksi dan tanggal jatuh tempo jika pembelian dilakukan secara kredit.

Ketika transaksi pembelian dikonfirmasi, stok bahan baku harus bertambah sesuai jumlah yang benar-benar diterima.

Jangan menambahkan stok hanya karena pengguna membuka formulir pembelian atau menyimpan transaksi sebagai draft.

Jika barang yang diterima berbeda dari jumlah yang dipesan, sistem harus mencatat jumlah aktual yang diterima.

Setiap penerimaan stok harus mempunyai referensi ke transaksi pembelian.

Cegah stok bertambah dua kali jika pengguna menekan tombol konfirmasi berulang kali.

Jika pembelian yang sudah diposting perlu dibatalkan, gunakan mekanisme pembatalan yang aman dan catat riwayatnya. Jangan menghapus transaksi secara permanen jika transaksi tersebut sudah memengaruhi stok atau keuangan.

# 8. FITUR REPACKING ATAU PENGEMASAN ULANG

Modul repacking merupakan salah satu fitur terpenting dalam SAE Snack Management System.

Usaha saya membeli snack curah dalam kilogram, kemudian mengemasnya menjadi produk jadi dalam gram.

Contoh:
- Bahan baku: Makaroni Cikruh Curah.
- Jumlah bahan baku: 5 kg.
- Ukuran kemasan: 100 gram.
- Target produksi: 50 bungkus.

Secara teoritis, 5 kg dapat menghasilkan 50 bungkus berisi 100 gram. Namun, hasil aktual dapat berbeda karena proses produksi.

Karena itu, aplikasi harus mendukung pencatatan hasil aktual.

## 8.1 Data transaksi repacking

Setiap transaksi repacking setidaknya memiliki:
- Nomor produksi.
- Tanggal produksi.
- Bahan baku yang digunakan.
- Batch bahan baku.
- Jumlah bahan baku yang digunakan.
- Produk jadi yang dihasilkan.
- Batch produk jadi.
- Ukuran kemasan.
- Target hasil produksi.
- Hasil aktual.
- Jumlah produk rusak.
- Jumlah bahan yang tersisa, jika ada.
- Susut produksi.
- HPP produksi.
- Pengguna yang melakukan transaksi.
- Catatan.

## 8.2 Perhitungan satuan

Pastikan satuan kilogram dan gram tidak tercampur.

Gunakan satuan dasar yang konsisten untuk setiap jenis persediaan.

Contoh:
- 1 kg = 1.000 gram.
- 5 kg = 5.000 gram.
- Kemasan 100 gram sebanyak 48 bungkus = 4.800 gram.

Jika 5 kg bahan baku menghasilkan 48 bungkus ukuran 100 gram, maka terdapat selisih 200 gram yang perlu dijelaskan melalui pencatatan sisa, susut, atau kategori kehilangan lainnya.

Jangan langsung menganggap seluruh selisih sebagai kerugian tanpa mencatat penyebabnya.

Hindari kesalahan perhitungan akibat konversi satuan.

## 8.3 Alur repacking

Alur yang diharapkan:
1. Pengguna membuat transaksi repacking.
2. Pengguna memilih bahan baku dan batch.
3. Pengguna memasukkan jumlah bahan baku yang digunakan.
4. Pengguna memilih produk jadi dan ukuran kemasan.
5. Sistem menghitung target produksi.
6. Pengguna memasukkan hasil aktual.
7. Sistem menghitung pemakaian bahan dan selisih.
8. Sistem menampilkan perkiraan HPP.
9. Pengguna memeriksa transaksi.
10. Pengguna mengonfirmasi produksi.
11. Stok bahan baku berkurang.
12. Stok produk jadi bertambah sesuai hasil yang layak dijual.
13. Sistem menyimpan seluruh riwayat pergerakan stok.

Proses perubahan stok harus dilakukan secara atomik di database. Jika salah satu bagian gagal, seluruh transaksi harus dibatalkan agar stok tidak menjadi tidak konsisten.

Jangan membiarkan dua pengguna menggunakan stok bahan baku yang sama melebihi jumlah yang tersedia.

## 8.4 Perhitungan HPP repacking

Hitung HPP berdasarkan biaya aktual yang dapat diketahui, antara lain:
- Biaya bahan baku.
- Biaya kemasan.
- Biaya label.
- Biaya tambahan yang dialokasikan ke produksi, jika ada.
- Biaya produksi lain yang relevan.

Contoh:
Bahan baku 5 kg dibeli dengan harga Rp35.000/kg.

Total biaya bahan baku adalah Rp175.000.

Jika produksi menghasilkan 48 bungkus yang layak dijual dan biaya kemasan total Rp24.000, maka total biaya yang diperhitungkan adalah Rp199.000, dengan asumsi tidak ada biaya lain.

HPP per bungkus layak jual:

Rp199.000 ÷ 48 = sekitar Rp4.145,83.

Angka tersebut hanyalah contoh. Implementasi sebenarnya harus memperhitungkan metode alokasi biaya, susut, produk rusak, dan biaya tambahan secara konsisten.

Jangan menghitung biaya bahan baku yang sama dua kali.

Tampilkan rincian perhitungan agar pengguna dapat memahami asal nilai HPP.

# 9. FITUR KASIR ATAU POINT OF SALE (POS)

Buat halaman kasir yang cepat, sederhana, dan nyaman digunakan.

Fitur:
- Menampilkan daftar produk aktif.
- Mencari produk berdasarkan nama atau SKU.
- Memilih produk untuk dimasukkan ke keranjang.
- Memasukkan jumlah barang.
- Mengubah jumlah barang.
- Menghapus barang dari keranjang.
- Menampilkan harga satuan.
- Menampilkan subtotal.
- Menghitung total belanja.
- Memasukkan diskon jika diizinkan.
- Memasukkan jumlah uang yang diterima.
- Menghitung kembalian otomatis.
- Memilih metode pembayaran.
- Mengonfirmasi transaksi.
- Mencetak atau menyimpan struk.
- Melihat riwayat transaksi.
- Melihat detail transaksi.
- Mencari transaksi berdasarkan nomor atau tanggal.

Metode pembayaran minimal:
- Tunai.
- Transfer.
- QRIS.

Metode pembayaran harus dapat diperluas sesuai kebutuhan.

## 9.1 Proses transaksi kasir

Ketika transaksi dikonfirmasi:
1. Validasi seluruh item keranjang.
2. Validasi harga dan jumlah.
3. Periksa ketersediaan stok.
4. Hitung ulang total di sisi server atau database.
5. Buat nomor transaksi yang unik.
6. Simpan transaksi dan detail barang.
7. Kurangi stok produk jadi.
8. Catat pergerakan stok keluar.
9. Catat penerimaan pembayaran.
10. Catat transaksi kas atau keuangan yang terkait.
11. Simpan HPP barang terjual agar laporan laba historis tidak berubah saat HPP produk diperbarui.
12. Tampilkan bukti transaksi.

Langkah-langkah tersebut harus konsisten dan aman.

Jangan hanya menghitung total dari frontend karena nilai frontend dapat dimanipulasi.

Jangan mengurangi stok jika transaksi gagal.

Cegah transaksi ganda ketika pengguna menekan tombol pembayaran berkali-kali atau koneksi internet terputus.

## 9.2 Pembatalan dan pengembalian barang

Sediakan mekanisme untuk menangani pembatalan dan retur.

Namun, transaksi yang telah selesai tidak boleh dihapus begitu saja.

Jika terjadi pembatalan atau retur:
- Simpan referensi ke transaksi asli.
- Catat alasan.
- Catat waktu dan pengguna yang melakukan tindakan.
- Kembalikan stok hanya jika barang benar-benar layak dijual kembali.
- Catat pengembalian uang jika memang terjadi.
- Pastikan laporan keuangan dan penjualan ikut diperbarui melalui transaksi koreksi yang dapat diaudit.

Aksi pembatalan atau retur dapat memerlukan izin khusus dari pemilik atau admin.

# 10. MANAJEMEN KAS DAN KEUANGAN

Buat modul pencatatan keuangan sederhana yang cocok untuk UMKM.

Fitur utama:
- Saldo kas.
- Penerimaan uang.
- Pengeluaran uang.
- Kategori pemasukan.
- Kategori pengeluaran.
- Metode pembayaran.
- Riwayat transaksi keuangan.
- Filter berdasarkan tanggal.
- Ringkasan keuangan.
- Laporan pemasukan dan pengeluaran.

Contoh kategori pengeluaran:
- Pembelian bahan baku.
- Kemasan.
- Label.
- Ongkos kirim.
- Transportasi.
- Listrik.
- Peralatan.
- Biaya operasional lainnya.

Contoh pemasukan:
- Penjualan tunai.
- Penerimaan transfer.
- Penerimaan pembayaran piutang, jika fitur tersebut diterapkan.

Penting: **jangan mencatat satu arus uang dua kali.**

Contohnya, jika pembelian bahan baku telah menghasilkan catatan pengeluaran kas, jangan membuat catatan pengeluaran kedua yang identik untuk pembelian yang sama.

Demikian juga, pembayaran penjualan yang sudah tercatat pada transaksi kasir tidak boleh kembali dihitung sebagai penerimaan terpisah tanpa mekanisme yang jelas.

Bedakan antara:
- Omzet penjualan.
- Penerimaan uang.
- Pengeluaran kas.
- HPP barang terjual.
- Laba kotor.
- Laba bersih.

Jangan menyebut seluruh omzet sebagai keuntungan.

Jika suatu nilai belum dapat dihitung dengan benar karena data belum tersedia, jelaskan keterbatasannya.

# 11. LAPORAN USAHA

Buat halaman laporan yang mudah dibaca dan difilter.

Laporan yang diperlukan:
- Laporan penjualan.
- Laporan pembelian.
- Laporan stok.
- Laporan pergerakan stok.
- Laporan hasil repacking.
- Laporan HPP.
- Laporan laba kotor.
- Laporan pemasukan dan pengeluaran kas.
- Laporan produk terlaris.
- Laporan stok menipis.
- Laporan produk mendekati kedaluwarsa.
- Laporan retur dan pembatalan.

Sediakan filter tanggal:
- Hari ini.
- Kemarin.
- Tujuh hari terakhir.
- Bulan ini.
- Bulan sebelumnya.
- Rentang tanggal khusus.

Sediakan ekspor CSV jika memungkinkan.

Jika menambahkan ekspor Excel atau PDF, pastikan hasil ekspornya benar-benar berfungsi dan isinya sesuai filter yang dipilih.

Semua laporan harus bersumber dari data yang benar di database.

Pastikan rumus omzet, HPP, laba, kas, dan stok konsisten di seluruh aplikasi.
# 12. DESAIN UI/UX DAN IDENTITAS VISUAL

Saya ingin SAE Snack Management System memiliki desain yang modern, menarik, ringan, dan mudah digunakan.

**Arah desain wajib: flat design, pastel, clean, modern, icon-rich, responsive, dan fast.**

Jangan membuat tampilan seperti template admin yang kaku, membosankan, atau terlalu padat.

## 12.1 Gaya visual

Gunakan karakter desain berikut:
- Flat design.
- Minimalis tetapi tetap menarik.
- Warna pastel yang lembut.
- Tata letak yang rapi dan konsisten.
- Ikon yang digunakan secara luas.
- Sudut komponen sedikit membulat.
- Bayangan sangat tipis jika memang diperlukan.
- Ruang kosong yang cukup agar halaman tidak terasa sesak.
- Tipografi modern dan mudah dibaca.
- Animasi ringan dan halus.
- Hierarki informasi yang jelas.
- Tampilan profesional untuk pengelolaan usaha UMKM.

Hindari:
- Efek glassmorphism yang berlebihan.
- Gradien berlebihan.
- Bayangan terlalu tebal.
- Efek 3D yang tidak diperlukan.
- Warna neon.
- Terlalu banyak warna dalam satu halaman.
- Teks yang terlalu kecil.
- Ikon dekoratif yang tidak memiliki fungsi.
- Animasi yang mengganggu aktivitas kasir.
- Elemen visual berat yang membuat aplikasi lambat.

## 12.2 Palet warna

Gunakan palet pastel yang konsisten.

Sebagai titik awal, pertimbangkan warna berikut:

- Background utama: `#F8F7FC`
- Permukaan kartu: `#FFFFFF`
- Pastel lavender: `#E8E0F8`
- Pastel mint: `#DDF3E4`
- Pastel peach: `#FFE6D5`
- Pastel yellow: `#FFF1C9`
- Pastel blue: `#DCEBFA`
- Teks utama: `#25263A`
- Teks sekunder: `#606579`
- Garis pembatas: `#E5E7EF`
- Warna sukses: gunakan hijau yang tetap terbaca.
- Warna peringatan: gunakan kuning atau oranye dengan kontras memadai.
- Warna bahaya: gunakan merah yang jelas terlihat.

Warna di atas merupakan rekomendasi awal. Kamu boleh menyempurnakannya agar seluruh tampilan lebih harmonis, tetapi jangan mengganti warna secara sembarangan pada setiap halaman.

Warna pastel terutama digunakan untuk latar komponen, badge, ilustrasi kecil, dan aksen.

**Keterbacaan lebih penting daripada estetika.**

Jangan menggunakan teks putih di atas warna pastel yang terlalu terang. Jangan menggunakan teks pastel di atas latar putih jika kontrasnya rendah.

Untuk teks utama, gunakan warna gelap yang jelas.

Untuk tombol utama, gunakan warna yang cukup kuat agar pengguna langsung mengetahui tindakan utama.

Pastikan status penting seperti stok habis, produk kedaluwarsa, pembayaran gagal, dan transaksi berhasil mudah dikenali.

## 12.3 Tipografi

Gunakan font modern yang nyaman dibaca.

Prioritaskan font yang ringan dan memiliki karakter profesional, seperti Inter atau font sistem yang setara.

Jangan memuat terlalu banyak jenis font.

Gunakan hierarki tipografi yang konsisten untuk:
- Judul halaman.
- Judul kartu.
- Label formulir.
- Isi tabel.
- Angka keuangan.
- Pesan validasi.
- Teks bantuan.

Angka pada dashboard dan kasir harus mudah dibaca.

Gunakan ukuran teks yang cukup besar untuk harga, total belanja, saldo, dan informasi stok.

## 12.4 Ikon pada seluruh aplikasi

Saya ingin aplikasi menggunakan ikon secara luas.

Gunakan library ikon yang ringan dan konsisten, misalnya Lucide Icons.

Contoh penerapan:
- Dashboard menggunakan ikon layout/dashboard.
- Produk menggunakan ikon package.
- Persediaan menggunakan ikon boxes.
- Pembelian menggunakan ikon shopping basket.
- Supplier menggunakan ikon truck.
- Repacking menggunakan ikon package-check atau factory.
- Kasir menggunakan ikon shopping cart.
- Keuangan menggunakan ikon wallet.
- Laporan menggunakan ikon chart.
- Pengaturan menggunakan ikon settings.
- Notifikasi menggunakan ikon bell.
- Pencarian menggunakan ikon search.
- Tambah data menggunakan ikon plus.
- Edit menggunakan ikon pencil.
- Hapus atau nonaktifkan menggunakan ikon yang sesuai.

Gunakan ikon yang konsisten, bukan emoji sebagai pengganti ikon UI.

Setiap ikon interaktif harus memiliki fungsi yang jelas.

Untuk ikon tanpa teks, sediakan tooltip atau label aksesibel agar pengguna mengetahui fungsinya.

Jangan menggunakan ikon saja pada tindakan berisiko tinggi jika maknanya tidak jelas.

Tombol penting seperti "Simpan", "Bayar", "Konfirmasi", dan "Batalkan" sebaiknya tetap mempunyai label teks yang jelas, disertai ikon jika sesuai.

## 12.5 Layout dan navigasi

Gunakan sidebar pada desktop dengan ikon dan label menu.

Menu utama yang disarankan:
1. Dashboard.
2. Kasir.
3. Produk.
4. Persediaan.
5. Pembelian.
6. Supplier.
7. Repacking.
8. Keuangan.
9. Laporan.
10. Pengaturan.

Pada desktop:
- Sidebar mudah dipahami.
- Area konten memiliki ruang yang cukup.
- Informasi penting berada di area yang mudah terlihat.
- Tabel tidak terlalu padat.
- Header halaman konsisten.

Pada smartphone:
- Sidebar dapat berubah menjadi navigasi yang sesuai untuk layar kecil.
- Formulir tetap mudah diisi.
- Tombol utama mudah disentuh.
- Tabel yang lebar memiliki solusi responsif.
- Halaman kasir tetap nyaman digunakan.

Jangan sekadar mengecilkan tampilan desktop untuk dijadikan tampilan mobile.

## 12.6 Dashboard visual

Gunakan kartu statistik dengan desain flat dan aksen pastel.

Setiap kartu dapat menampilkan:
- Ikon.
- Nama metrik.
- Nilai utama.
- Perbandingan dengan periode sebelumnya jika datanya tersedia.
- Keterangan singkat.

Gunakan grafik yang sederhana dan mudah dibaca.

Jangan menggunakan terlalu banyak grafik dalam satu layar.

Pastikan grafik mempunyai label yang jelas dan tetap mudah dipahami tanpa hanya mengandalkan warna.

Jika belum ada data, tampilkan empty state yang menarik dan informatif.

Jangan membuat angka statistik palsu hanya untuk mengisi dashboard.

## 12.7 Formulir, tabel, dan feedback

Buat komponen yang konsisten untuk:
- Input teks.
- Input angka.
- Input mata uang.
- Pilihan produk.
- Pilihan supplier.
- Pemilih tanggal.
- Dropdown.
- Checkbox.
- Modal.
- Dialog konfirmasi.
- Toast notification.
- Badge status.
- Tabel.
- Pagination.
- Filter.
- Pencarian.

Formulir harus memiliki label yang jelas dan pesan kesalahan yang mudah dimengerti.

Tampilkan status loading ketika data sedang diproses.

Tampilkan pesan sukses setelah tindakan berhasil.

Tampilkan pesan error yang membantu pengguna memperbaiki masalah.

Untuk operasi yang mengubah stok atau uang, minta konfirmasi pada tindakan penting.

Jangan menampilkan notifikasi sukses jika transaksi gagal disimpan ke database.

## 12.8 Animasi

Gunakan animasi yang halus, ringan, dan tidak mengganggu.

Contoh:
- Transisi warna tombol saat hover.
- Transisi sidebar.
- Animasi masuk yang ringan pada dialog.
- Feedback ketika produk dimasukkan ke keranjang.
- Transisi loading yang sederhana.
- Animasi kecil ketika transaksi berhasil.
- Perubahan status komponen yang lembut.

Durasi animasi sebaiknya singkat, umumnya sekitar 150–250 milidetik untuk interaksi sederhana.

Jangan menggunakan animasi berat pada setiap komponen.

Jangan membuat animasi yang menghambat klik, input, atau pembayaran.

Hormati pengaturan `prefers-reduced-motion` agar pengguna yang mengurangi animasi tetap nyaman.

## 12.9 Performa

Aplikasi harus terasa cepat, termasuk ketika data mulai bertambah.

Prioritaskan:
- Komponen yang sederhana.
- Bundle JavaScript sekecil mungkin.
- Penggunaan Server Components Next.js jika sesuai.
- Client Components hanya ketika interaktivitas diperlukan.
- Query database yang efisien.
- Pagination untuk tabel besar.
- Pencarian dan filter yang efisien.
- Indeks database yang sesuai.
- Gambar yang dioptimalkan.
- Lazy loading untuk komponen yang tidak langsung diperlukan.
- Penghindaran request API yang tidak perlu.
- Penghindaran render ulang yang tidak perlu.
- Feedback loading yang cepat dan jelas.

Jangan mengunduh seluruh tabel transaksi untuk melakukan pagination di browser jika data dapat bertambah banyak.

Jangan melakukan query terpisah berulang kali untuk setiap baris jika dapat dihindari.

Jangan menambahkan library animasi besar jika CSS sudah cukup.

Jangan menjanjikan skor performa tertentu tanpa pengujian.

Jika memungkinkan, gunakan Lighthouse atau alat sejenis setelah aplikasi siap untuk mengevaluasi performa, aksesibilitas, praktik terbaik, dan SEO.

## 12.10 Aksesibilitas

Pastikan:
- Tombol memiliki nama yang jelas.
- Formulir memiliki label.
- Navigasi dapat digunakan dengan keyboard.
- Fokus keyboard terlihat.
- Pesan error dapat dipahami.
- Warna bukan satu-satunya penanda status.
- Dialog memiliki perilaku aksesibel.
- Kontras teks memadai.
- Ikon dekoratif tidak mengganggu pembaca layar.

# 13. AUTENTIKASI DAN ROLE PENGGUNA

Gunakan Supabase Auth untuk login pengguna.

Sediakan setidaknya tiga peran:

### Owner
Pemilik usaha dengan akses penuh:
- Melihat seluruh dashboard.
- Mengelola produk.
- Mengelola stok.
- Mengelola supplier.
- Mengelola pembelian.
- Mengelola repacking.
- Mengelola kasir.
- Melihat seluruh laporan.
- Mengelola keuangan.
- Mengelola pengguna dan pengaturan.
- Melakukan tindakan koreksi yang diizinkan.

### Admin
Pengguna yang mengelola operasional:
- Mengelola produk.
- Mengelola persediaan.
- Mengelola supplier.
- Mengelola pembelian.
- Mengelola repacking.
- Melihat laporan operasional.
- Melakukan tugas lain sesuai izin yang diberikan owner.

### Kasir
Pengguna yang fokus pada transaksi:
- Membuka halaman kasir.
- Melakukan transaksi penjualan.
- Melihat transaksi yang diizinkan.
- Mencetak struk.
- Melihat informasi produk dan harga yang diperlukan.

Kasir tidak boleh otomatis memiliki akses ke pengaturan sensitif, pengelolaan pengguna, atau laporan keuangan lengkap.

Pastikan aturan izin diterapkan di backend dan database, bukan hanya dengan menyembunyikan menu frontend.

Sediakan halaman login, logout, status sesi, dan halaman akses ditolak jika pengguna tidak mempunyai izin.

Gunakan alur autentikasi Supabase yang sesuai dengan Next.js App Router dan versi library yang digunakan.

Jangan menyimpan password pengguna dalam tabel buatan sendiri.

Jangan memberikan akses owner kepada semua pengguna secara default.

# 14. ARSITEKTUR DATABASE DAN KEAMANAN

Gunakan Supabase PostgreSQL sebagai database utama.

Sebelum menulis kode fitur yang bergantung pada database, buat rancangan skema database dan jelaskan hubungan antartabel.

Tabel yang diperlukan dapat mencakup:
- profiles.
- categories.
- products.
- units atau unit_conversions, jika diperlukan.
- suppliers.
- purchase_orders atau purchases.
- purchase_items.
- inventory_batches.
- stock_movements.
- repacking_orders.
- repacking_items atau detail bahan dan hasil produksi.
- sales.
- sale_items.
- payments.
- expenses.
- cash_movements.
- product_cost_history, jika diperlukan.
- audit_logs, untuk aktivitas penting.

Struktur akhir boleh disesuaikan setelah analisis, tetapi harus mendukung seluruh kebutuhan aplikasi.

Gunakan primary key, foreign key, constraint, dan indeks yang tepat.

Gunakan tipe data yang sesuai untuk uang dan jumlah persediaan.

Jangan menggunakan floating point biasa untuk menghitung uang. Gunakan tipe numerik atau mekanisme presisi yang sesuai.

Terapkan migration SQL yang terdokumentasi agar struktur database dapat dibuat ulang secara konsisten.

Jangan mengandalkan pembuatan tabel secara manual yang tidak terdokumentasi.

## 14.1 Keamanan database

Terapkan Row Level Security pada seluruh tabel yang berisi data bisnis atau data pengguna yang membutuhkan pembatasan akses.

Pastikan setiap kebijakan RLS sesuai dengan role dan kepemilikan data.

Jangan menganggap data aman hanya karena aplikasi mempunyai halaman login.

Validasi input di sisi server.

Gunakan Zod atau mekanisme validasi yang sesuai.

Lakukan pemeriksaan otorisasi di setiap operasi sensitif.

Jangan mempercayai role yang dikirim oleh browser tanpa verifikasi.

Jangan menaruh service role key di frontend.

Jangan menyimpan secret di GitHub.

Gunakan file `.env.local` untuk variabel lingkungan lokal dan pastikan file tersebut masuk ke `.gitignore`.

Untuk deployment, atur environment variables melalui pengaturan proyek Vercel.

Jangan pernah mengirim secret ke log atau pesan error yang terlihat pengguna.

## 14.2 Konsistensi transaksi

Operasi berikut harus dirancang agar konsisten dan atomik:
- Konfirmasi pembelian yang menambah stok.
- Konfirmasi repacking yang mengurangi bahan baku dan menambah produk jadi.
- Penjualan yang mengurangi stok dan mencatat pembayaran.
- Pembatalan dan retur.
- Pergerakan kas yang terkait dengan transaksi bisnis.

Gunakan transaksi database atau fungsi PostgreSQL yang sesuai.

Jangan melakukan rangkaian perubahan penting melalui beberapa request independen jika kegagalannya dapat menyebabkan data tidak konsisten.

Cegah:
- Stok negatif.
- Pembayaran ganda.
- Transaksi ganda.
- Nomor transaksi yang bentrok.
- Perubahan harga yang mengubah riwayat transaksi lama.
- Penghapusan data historis secara tidak sengaja.

Simpan snapshot harga jual dan HPP pada transaksi saat transaksi dilakukan.

Jika stok dikelola berdasarkan batch, pastikan stok batch dan total stok produk tetap konsisten.

# 15. AUDIT DAN RIWAYAT

Sistem harus menyimpan riwayat aktivitas penting.

Contoh:
- Pengguna membuat transaksi pembelian.
- Pengguna mengonfirmasi produksi repacking.
- Pengguna melakukan penyesuaian stok.
- Pengguna membatalkan transaksi.
- Pengguna melakukan retur.
- Pengguna mengubah harga produk.
- Pengguna mengubah izin akses.

Riwayat minimal memuat:
- Waktu kejadian.
- Pengguna.
- Jenis tindakan.
- Jenis data atau transaksi.
- Referensi data terkait.
- Informasi perubahan yang relevan jika memungkinkan.

Jangan menyimpan password, token, atau secret dalam audit log.

Transaksi yang sudah memengaruhi stok atau uang harus diperbaiki melalui mekanisme koreksi atau pembatalan yang dapat dilacak, bukan dengan menghapus riwayatnya begitu saja.
# 16. STANDAR IMPLEMENTASI KODE

Bangun aplikasi dengan struktur kode yang rapi, konsisten, mudah dipahami, dan mudah dikembangkan.

Gunakan TypeScript dengan tipe data yang jelas.

Hindari penggunaan `any` jika tipe data yang tepat dapat dibuat.

Pisahkan tanggung jawab kode, misalnya:
- Komponen UI.
- Halaman aplikasi.
- Logika bisnis.
- Validasi data.
- Akses database.
- Autentikasi dan otorisasi.
- Perhitungan HPP.
- Pengelolaan stok.
- Laporan.
- Utilitas.

Jangan membuat satu file yang berisi seluruh logika aplikasi.

Jangan menduplikasi logika perhitungan stok, harga, HPP, dan keuangan di banyak tempat.

Gunakan fungsi bersama jika diperlukan agar perhitungan konsisten.

Buat komponen yang dapat digunakan kembali, tetapi jangan membuat abstraksi yang terlalu rumit untuk kebutuhan UMKM.

Ikuti konvensi penamaan yang konsisten.

Gunakan Server Components Next.js secara default jika sesuai. Gunakan Client Components ketika memang membutuhkan interaktivitas browser.

Jangan menempatkan kredensial atau logika sensitif di dalam kode frontend.

## 16.1 Penanganan error

Setiap fitur harus memiliki penanganan error yang memadai.

Jika terjadi error:
- Jangan menampilkan stack trace kepada pengguna.
- Jangan membocorkan informasi rahasia.
- Berikan pesan yang mudah dipahami.
- Catat detail teknis secara aman untuk kebutuhan debugging.
- Jangan menampilkan pesan sukses jika operasi gagal.

Contoh pesan:
- "Stok tidak mencukupi untuk menyelesaikan transaksi."
- "Pembelian gagal disimpan. Silakan coba kembali."
- "Sesi login telah berakhir. Silakan login kembali."
- "Kamu tidak memiliki izin untuk melakukan tindakan ini."

## 16.2 Kualitas formulir

Semua formulir harus:
- Memiliki label.
- Memvalidasi input.
- Menampilkan pesan error.
- Mencegah pengiriman data yang tidak valid.
- Menampilkan status loading.
- Mencegah pengiriman ganda.
- Menjaga data input jika terjadi kesalahan yang memungkinkan pengguna memperbaikinya.

Untuk nominal uang, tampilkan format Rupiah yang mudah dibaca.

Pastikan nilai yang dikirim ke database tetap berupa angka yang valid, bukan string hasil pemformatan.

Untuk kuantitas, pastikan satuan dan presisinya sesuai kebutuhan.

Jangan menerima jumlah negatif untuk transaksi normal.

## 16.3 Standar kode yang dapat dipelihara

Gunakan:
- Komponen yang ukurannya wajar.
- Nama variabel yang jelas.
- Fungsi dengan tanggung jawab spesifik.
- Validasi input.
- Penanganan error.
- Komentar pada logika bisnis yang tidak langsung jelas.
- Dokumentasi untuk operasi database yang penting.

Hindari:
- File terlalu panjang.
- Kode duplikat.
- Logika bisnis di dalam komponen UI secara berlebihan.
- Penggunaan data palsu pada fitur yang seharusnya menggunakan database.
- Menonaktifkan pemeriksaan TypeScript hanya untuk menghilangkan error.
- Menggunakan `@ts-ignore` tanpa alasan kuat.
- Mengabaikan error build.
- Menambahkan library tanpa manfaat yang jelas.

# 17. PENGUJIAN APLIKASI

Jangan menganggap aplikasi selesai hanya karena halaman berhasil dibuka.

Buat rencana pengujian sejak awal.

Gunakan metode pengujian yang sesuai dengan skala aplikasi.

Jika memungkinkan, gunakan:
- TypeScript type checking.
- ESLint.
- Unit test untuk perhitungan penting.
- Integration test untuk operasi database penting.
- End-to-end test untuk alur utama jika sesuai.

Jelaskan cara menjalankan setiap pengujian di Windows PowerShell.

## 17.1 Pengujian stok

Uji skenario berikut:
1. Menambahkan stok melalui pembelian.
2. Menggunakan bahan baku untuk repacking.
3. Menambahkan produk jadi dari hasil repacking.
4. Menjual produk jadi.
5. Melakukan retur.
6. Membatalkan transaksi.
7. Melakukan penyesuaian stok.
8. Mencegah stok menjadi negatif.
9. Mencegah transaksi yang sama diproses dua kali.
10. Memastikan riwayat stok sesuai dengan jumlah stok terkini.

## 17.2 Pengujian repacking

Contoh pengujian:

Bahan baku awal: 10 kg.

Bahan baku yang digunakan: 5 kg.

Hasil produksi: 48 bungkus ukuran 100 gram.

Dengan asumsi seluruh 48 bungkus layak dijual:
- Bahan baku yang digunakan harus tercatat sebesar 5 kg.
- Produk jadi bertambah 48 bungkus.
- Isi bersih produk jadi berjumlah 4,8 kg.
- Selisih 0,2 kg harus dicatat sebagai sisa, susut, atau kehilangan sesuai hasil aktual yang dapat dijelaskan.
- Bahan baku yang belum digunakan tetap tersedia sesuai perhitungan stok.

Jangan otomatis menganggap seluruh selisih sebagai susut tanpa pencatatan yang sesuai.

## 17.3 Pengujian kasir

Uji:
- Penjualan satu produk.
- Penjualan beberapa produk.
- Perubahan jumlah produk di keranjang.
- Pembayaran tunai.
- Perhitungan kembalian.
- Pembayaran non-tunai.
- Stok tidak mencukupi.
- Harga berubah setelah transaksi lama selesai.
- Transaksi dibatalkan.
- Retur sebagian.
- Retur penuh.
- Percobaan pembayaran ganda.

Pastikan transaksi lama tetap menggunakan harga dan HPP pada saat transaksi dilakukan.

## 17.4 Pengujian keuangan

Uji agar:
- Penjualan tidak dihitung dua kali sebagai pemasukan.
- Pembelian tidak dihitung dua kali sebagai pengeluaran.
- Pembayaran kredit tidak dianggap sebagai pembayaran tunai jika belum diterima.
- Omzet tidak disamakan dengan laba.
- HPP barang terjual dihitung secara konsisten.
- Saldo kas sesuai dengan catatan arus kas.
- Retur dan pembatalan tercermin dengan benar dalam laporan.

## 17.5 Pengujian akses

Pastikan:
- Pengguna yang belum login tidak dapat membuka halaman privat.
- Kasir tidak dapat mengakses fitur khusus owner.
- Admin tidak dapat melakukan tindakan yang dilarang oleh kebijakan izin.
- Kebijakan RLS mencegah akses database yang tidak sah.
- Pengguna tidak dapat mengubah role dirinya sendiri menjadi owner melalui request frontend.
- API atau operasi server tetap memeriksa izin meskipun halaman frontend menyembunyikan tombol tertentu.

Jika pengujian gagal, perbaiki masalahnya sebelum melanjutkan ke deployment.

# 18. ROADMAP PENGEMBANGAN

Bagi proyek menjadi beberapa tahap berikut.

## Tahap 0 — Pemeriksaan lingkungan

Periksa apakah Windows 11 saya sudah memiliki:
- Node.js.
- npm.
- Git.
- Visual Studio Code.
- Browser modern.
- Koneksi internet.

Jangan mengasumsikan semua perangkat lunak tersebut sudah terpasang.

Berikan instruksi pemeriksaan menggunakan PowerShell.

Jelaskan setiap perintah, termasuk arti output yang muncul.

Jika ada perangkat lunak yang belum tersedia, bantu saya menginstalnya satu per satu.

Jangan meminta saya menginstal ulang sesuatu yang sudah terpasang dan berfungsi dengan baik.

## Tahap 1 — Persiapan proyek

- Menentukan folder proyek.
- Membuat proyek Next.js.
- Menyiapkan TypeScript dan Tailwind CSS.
- Memastikan aplikasi berjalan secara lokal.
- Menjelaskan struktur folder proyek.
- Membuat tampilan awal dengan desain flat pastel.

## Tahap 2 — Persiapan Supabase

- Membuat proyek Supabase.
- Menjelaskan fungsi database dan autentikasi.
- Menghubungkan Next.js dengan Supabase.
- Mengatur environment variables.
- Membuat migration database.
- Membuat kebijakan RLS.
- Menguji koneksi database.

Jangan pernah meminta saya mengirimkan password atau secret key melalui chat.

## Tahap 3 — Fondasi aplikasi

- Layout utama.
- Sidebar dan navigasi.
- Komponen UI.
- Halaman login.
- Autentikasi.
- Role dan otorisasi.
- Penanganan loading, error, dan empty state.

## Tahap 4 — Master data

- Kategori.
- Produk.
- Satuan.
- Supplier.
- Batch dan kedaluwarsa.

## Tahap 5 — Persediaan dan pembelian

- Pencatatan pembelian.
- Penerimaan barang.
- Pergerakan stok.
- Penyesuaian stok.
- Peringatan stok minimum.
- Peringatan kedaluwarsa.

## Tahap 6 — Repacking dan HPP

- Transaksi repacking.
- Konversi kilogram ke gram.
- Hasil produksi aktual.
- Pencatatan susut.
- Penambahan stok produk jadi.
- Perhitungan HPP.

## Tahap 7 — Kasir

- Keranjang.
- Pembayaran.
- Pengurangan stok.
- Struk.
- Riwayat transaksi.
- Retur dan pembatalan.

## Tahap 8 — Keuangan dan laporan

- Arus kas.
- Pengeluaran.
- Ringkasan laba.
- Laporan penjualan.
- Laporan stok.
- Laporan pembelian.
- Laporan repacking.
- Ekspor data.

## Tahap 9 — Pengujian dan penyempurnaan

- Memperbaiki error.
- Menguji keamanan.
- Menguji konsistensi stok dan uang.
- Memeriksa tampilan mobile.
- Menguji akses pengguna.
- Mengoptimalkan performa.
- Menyiapkan data awal.

## Tahap 10 — Deployment

- Membuat repository GitHub.
- Mengunggah kode.
- Menghubungkan GitHub dengan Vercel.
- Mengatur environment variables.
- Melakukan deployment.
- Menguji aplikasi online.
- Memeriksa log error.
- Menjelaskan cara pembaruan aplikasi.

Jangan berpindah tahap hanya karena kode sudah ditulis. Pastikan langkah penting pada tahap tersebut telah diuji.

# 19. DOKUMENTASI PROYEK

Bantu saya membuat dokumentasi sederhana yang selalu diperbarui.

Dokumentasi minimal:

### README.md
Berisi:
- Gambaran proyek.
- Teknologi yang digunakan.
- Persyaratan sistem.
- Cara menjalankan aplikasi.
- Cara mengatur environment variables.
- Cara menyiapkan database.
- Cara menjalankan pengujian.
- Cara melakukan deployment.

### PROJECT_STATUS.md
Berisi:
- Tahap proyek saat ini.
- Fitur yang sudah selesai.
- Fitur yang sedang dikerjakan.
- Fitur yang belum dikerjakan.
- Error yang masih ada.
- Pengujian yang sudah dilakukan.
- Langkah berikutnya.

### DECISIONS.md
Berisi keputusan arsitektur penting, alasan pemilihan teknologi, serta keputusan bisnis yang memengaruhi implementasi.

Jika dokumentasi belum dapat dibuat otomatis, berikan isi lengkap file yang harus saya buat sendiri.

Jangan menyatakan dokumentasi telah diperbarui jika saya belum menerapkan perubahan tersebut.

# 20. CARA KAMU HARUS MENJAWAB SAYA

Setiap kali memberikan langkah teknis, gunakan format berikut.

**Tahap:** Nama tahap.

**Tujuan:** Hasil yang ingin dicapai.

**Penjelasan:** Uraian sederhana tentang apa yang sedang kita kerjakan.

**Langkah-langkah:** Instruksi terurut yang dapat saya ikuti.

**Perintah atau kode:** Kode lengkap jika memang dibutuhkan.

**Hasil yang diharapkan:** Gambaran output yang seharusnya muncul.

**Jika gagal:** Cara mengidentifikasi masalah dan informasi yang perlu saya kirimkan.

Setelah memberikan langkah-langkah untuk satu tahap, berhenti dan tunggu konfirmasi saya.

Jangan langsung memberikan semua kode untuk seluruh aplikasi.

Jangan membuat saya bingung dengan terlalu banyak alternatif teknologi.

Jika terdapat keputusan teknis yang dapat kamu tentukan secara wajar, pilih opsi yang paling sederhana, aman, dan mudah dipelihara untuk UMKM.

Jika keputusan benar-benar memengaruhi kebutuhan usaha dan belum diketahui, ajukan pertanyaan yang spesifik.

# 21. MULAI SEKARANG

Mulailah dari **Tahap 0: Pemeriksaan Lingkungan Windows 11**.

Jangan langsung membuat kode aplikasi.

Pertama, jelaskan bahwa kita akan memeriksa perangkat lunak yang sudah tersedia di komputer saya.

Kemudian minta saya membuka PowerShell dengan langkah berikut:
1. Tekan tombol Windows.
2. Ketik PowerShell.
3. Buka Windows PowerShell atau Terminal.
4. Jalankan perintah pemeriksaan yang kamu berikan.

Berikan perintah untuk memeriksa versi Node.js, npm, Git, dan ketersediaan Visual Studio Code.

Jelaskan bahwa hasil pemeriksaan akan menentukan langkah selanjutnya.

Jangan menganggap perintah berhasil sebelum saya mengirimkan hasilnya.

**Berhenti setelah memberikan instruksi pemeriksaan pertama dan tunggu jawaban saya.**