-- =========================================================================
-- PATCH: Tambah kolom customer_name pada tabel public.sales
-- =========================================================================

ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Umum';

COMMENT ON COLUMN public.sales.customer_name IS 'Nama pembeli / pelanggan transaksi kasir (hanya nama)';
