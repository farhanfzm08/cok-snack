-- ==============================================================================
-- FIX: IZINKAN HAPUS PRODUK DENGAN CASCADE PADA TABEL MUTASI STOK & REPACKING
-- ==============================================================================

-- 1. stock_movements: Ubah RESTRICT menjadi CASCADE
ALTER TABLE public.stock_movements 
DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey;

ALTER TABLE public.stock_movements 
ADD CONSTRAINT stock_movements_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

-- 2. inventory_batches: Ubah RESTRICT menjadi CASCADE
ALTER TABLE public.inventory_batches 
DROP CONSTRAINT IF EXISTS inventory_batches_product_id_fkey;

ALTER TABLE public.inventory_batches 
ADD CONSTRAINT inventory_batches_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

-- 3. repacking_orders: Ubah RESTRICT menjadi CASCADE
ALTER TABLE public.repacking_orders 
DROP CONSTRAINT IF EXISTS repacking_orders_raw_material_product_id_fkey;

ALTER TABLE public.repacking_orders 
ADD CONSTRAINT repacking_orders_raw_material_product_id_fkey 
    FOREIGN KEY (raw_material_product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

ALTER TABLE public.repacking_orders 
DROP CONSTRAINT IF EXISTS repacking_orders_finished_product_id_fkey;

ALTER TABLE public.repacking_orders 
ADD CONSTRAINT repacking_orders_finished_product_id_fkey 
    FOREIGN KEY (finished_product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;
