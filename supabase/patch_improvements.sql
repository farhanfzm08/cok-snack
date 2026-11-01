-- ==============================================================================
-- PATCH PERBAIKAN: HARGA BELI PER KG (MODAL) & IZIN HAPUS PRODUK/KATEGORI
-- ==============================================================================

-- 1. Tambah kolom cost_price (Harga Beli / Modal Bahan Baku per kg)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0;

-- 2. Izin Hapus (DELETE) untuk Kategori
DROP POLICY IF EXISTS "Allow anon delete categories" ON public.categories;
CREATE POLICY "Allow anon delete categories" ON public.categories FOR DELETE TO anon, authenticated USING (true);

-- 3. Izin Hapus (DELETE) untuk Produk
DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;
CREATE POLICY "Allow anon delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);
