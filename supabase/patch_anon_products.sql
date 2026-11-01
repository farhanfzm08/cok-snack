-- ==============================================================================
-- IZIN AKSES TABEL KATEGORI & PRODUK UNTUK DEVELOPMENT & PENGUJIAN
-- ==============================================================================

-- Buka izin SELECT (baca), INSERT (tambah), UPDATE (edit), DELETE (hapus) untuk anon & authenticated
DROP POLICY IF EXISTS "Allow anon read categories" ON public.categories;
CREATE POLICY "Allow anon read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert categories" ON public.categories;
CREATE POLICY "Allow anon insert categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update categories" ON public.categories;
CREATE POLICY "Allow anon update categories" ON public.categories FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon read products" ON public.products;
CREATE POLICY "Allow anon read products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert products" ON public.products;
CREATE POLICY "Allow anon insert products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update products" ON public.products;
CREATE POLICY "Allow anon update products" ON public.products FOR UPDATE TO anon, authenticated USING (true);
