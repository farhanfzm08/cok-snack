import {
  Boxes,
  Check,
  Clock,
  Package,
  PackageCheck,
  ShoppingBasket,
  ShoppingCart,
  Store,
  Wallet,
} from "lucide-react";

const modul = [
  {
    nama: "Kasir",
    deskripsi: "Catat penjualan, pembayaran, dan kembalian.",
    ikon: ShoppingCart,
    warna: "bg-peach",
  },
  {
    nama: "Produk",
    deskripsi: "Kelola daftar snack, ukuran kemasan, dan harga jual.",
    ikon: Package,
    warna: "bg-lavender",
  },
  {
    nama: "Persediaan",
    deskripsi: "Pantau stok bahan baku dan produk siap jual.",
    ikon: Boxes,
    warna: "bg-mint",
  },
  {
    nama: "Pembelian",
    deskripsi: "Catat pembelian bahan baku dari supplier.",
    ikon: ShoppingBasket,
    warna: "bg-yellow",
  },
  {
    nama: "Repacking",
    deskripsi: "Ubah snack curah menjadi kemasan kecil dan hitung HPP.",
    ikon: PackageCheck,
    warna: "bg-sky",
  },
  {
    nama: "Keuangan",
    deskripsi: "Lihat arus kas, pengeluaran, dan keuntungan usaha.",
    ikon: Wallet,
    warna: "bg-mint",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
      <header className="animate-masuk flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
          <Store className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold">SAE Snack</h1>
          <p className="text-sm text-muted">Manajemen stok dan kasir</p>
        </div>
      </header>

      <section
        className="animate-masuk mt-8 rounded-3xl border border-line bg-surface p-6 sm:p-10"
        style={{ animationDelay: "80ms" }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-sm font-medium text-success">
          <Check className="h-4 w-4" aria-hidden="true" />
          Proyek berhasil berjalan
        </span>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          Selamat datang di SAE Snack
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Ini adalah tampilan awal aplikasi. Fitur-fitur di bawah akan kita
          bangun satu per satu, mulai dari database sampai kasir.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Modul yang akan dibangun</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modul.map((item, index) => {
            const Ikon = item.ikon;
            return (
              <article
                key={item.nama}
                className="animate-masuk rounded-2xl border border-line bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5"
                style={{ animationDelay: `${160 + index * 60}ms` }}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.warna}`}
                >
                  <Ikon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{item.nama}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.deskripsi}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Segera hadir
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}