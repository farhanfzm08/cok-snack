export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  address: string;
  receiptFooter: string;
  defaultMinStock: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "COK Snack",
  tagline: "Cemilan Orang Kaya",
  phone: "0812-3456-7890",
  address: "Jl. Industri Keripik No. 8, Indonesia",
  receiptFooter:
    "Barang yang sudah dibeli\ntidak dapat ditukar/dikembalikan.\nTerima kasih atas kunjungan Anda!",
  defaultMinStock: 5,
};

const STORAGE_KEY = "cok_snack_settings";

/**
 * Membaca pengaturan dari cache browser (localStorage) untuk render kilat tanpa lag.
 */
export function getLocalSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Gagal membaca localStorage settings:", e);
  }
  return DEFAULT_STORE_SETTINGS;
}

/**
 * Menyimpan pengaturan ke localStorage dan memicu event sinkronisasi lokal.
 */
export function saveLocalSettings(settings: Partial<StoreSettings>) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cok_snack_settings_updated"));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage:", e);
  }
}

/**
 * Sinkronisasi data dari Cloud Supabase (/api/settings)
 * Mengambil data terbaru dari cloud, lalu otomatis memperbarui cache localStorage jika berbeda.
 */
export async function syncStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      if (data && data.storeName) {
        saveLocalSettings(data);
        return data;
      }
    }
  } catch (e) {
    console.warn("Gagal sinkronisasi cloud settings, menggunakan cache lokal:", e);
  }
  return getLocalSettings();
}
