-- ==============================================================================
-- LINK PRODUK BAHAN BAKU & PRODUK JADI REPACK + IZIN EDIT PRODUK
-- ==============================================================================

-- 1. Tambahkan kolom relasi induk bahan baku pada tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS raw_material_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- 2. Pastikan kebijakan UPDATE produk diizinkan (untuk fitur Edit Produk)
DROP POLICY IF EXISTS "Products update access" ON public.products;
CREATE POLICY "Products update access" 
ON public.products 
FOR UPDATE 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);

-- 3. Berikan hak akses penuh pada products
GRANT ALL ON TABLE public.products TO postgres, service_role, authenticated, anon;
