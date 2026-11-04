-- ==============================================================================
-- PATCH: Tabel Pengaturan Toko Cloud (Sinkronisasi Antar Perangkat / Multi-Device)
-- ==============================================================================
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
-- agar pengaturan nama toko, slogan, dan kontak tersinkronisasi ke seluruh perangkat.

CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT NOT NULL DEFAULT 'COK Snack',
    tagline TEXT NOT NULL DEFAULT 'Cemilan Orang Kaya',
    phone TEXT DEFAULT '0812-3456-7890',
    address TEXT DEFAULT 'Jl. Industri Keripik No. 8, Indonesia',
    receipt_footer TEXT DEFAULT 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan. Terima kasih atas kunjungan Anda!',
    default_min_stock INT DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Izin Akses (RLS)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon and auth to read store_settings" ON public.store_settings;
CREATE POLICY "Allow anon and auth to read store_settings" 
ON public.store_settings FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow anon and auth to insert/update store_settings" ON public.store_settings;
CREATE POLICY "Allow anon and auth to insert/update store_settings" 
ON public.store_settings FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Data Default (Hanya dimasukkan jika belum ada)
INSERT INTO public.store_settings (
    id, store_name, tagline, phone, address, receipt_footer, default_min_stock
) VALUES (
    'default',
    'COK Snack',
    'Cemilan Orang Kaya',
    '0812-3456-7890',
    'Jl. Industri Keripik No. 8, Indonesia',
    'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan. Terima kasih atas kunjungan Anda!',
    5
)
ON CONFLICT (id) DO NOTHING;
