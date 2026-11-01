-- ==============================================================================
-- IZIN DELETE TRANSAKSI KAS & PENJUALAN
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor Supabase agar user bisa menghapus riwayat
-- transaksi kas di halaman Keuangan dan riwayat penjualan di Laporan.

-- 1. Izin DELETE pada cash_movements
DROP POLICY IF EXISTS "Cash movements delete" ON public.cash_movements;
CREATE POLICY "Cash movements delete" 
ON public.cash_movements 
FOR DELETE 
TO authenticated, anon 
USING (true);

-- 2. Izin DELETE pada sales & sale_items (otomatis CASCADE)
DROP POLICY IF EXISTS "Sales delete access" ON public.sales;
CREATE POLICY "Sales delete access" 
ON public.sales 
FOR DELETE 
TO authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Sale items delete access" ON public.sale_items;
CREATE POLICY "Sale items delete access" 
ON public.sale_items 
FOR DELETE 
TO authenticated, anon 
USING (true);

-- 3. Berikan hak akses tabel profiles untuk kolom phone dan email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

GRANT ALL ON TABLE public.cash_movements TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.sales TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.sale_items TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.profiles TO postgres, service_role, authenticated, anon;
