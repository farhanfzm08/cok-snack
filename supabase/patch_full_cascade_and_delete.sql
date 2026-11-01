-- ==============================================================================
-- FULL CASCADE DELETE: PRODUK & RIWAYAT REPACKING / MUTASI STOK
-- ==============================================================================

-- 1. Izin DELETE pada seluruh tabel terkait
DROP POLICY IF EXISTS "Allow anon delete repacking" ON public.repacking_orders;
CREATE POLICY "Allow anon delete repacking" ON public.repacking_orders FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon delete stock_movements" ON public.stock_movements;
CREATE POLICY "Allow anon delete stock_movements" ON public.stock_movements FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon delete products" ON public.products;
CREATE POLICY "Allow anon delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- 2. CASCADE DELETE pada stock_movements (otomatis terhapus saat produk dihapus)
ALTER TABLE public.stock_movements 
DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey;
ALTER TABLE public.stock_movements 
ADD CONSTRAINT stock_movements_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

-- 3. CASCADE DELETE pada repacking_orders (otomatis terhapus saat produk bahan atau jadi dihapus)
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

-- 4. CASCADE DELETE pada inventory_batches
ALTER TABLE public.inventory_batches 
DROP CONSTRAINT IF EXISTS inventory_batches_product_id_fkey;
ALTER TABLE public.inventory_batches 
ADD CONSTRAINT inventory_batches_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

-- 5. CASCADE DELETE pada purchase_items & sale_items jika produk dihapus
ALTER TABLE public.purchase_items 
DROP CONSTRAINT IF EXISTS purchase_items_product_id_fkey;
ALTER TABLE public.purchase_items 
ADD CONSTRAINT purchase_items_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;

ALTER TABLE public.sale_items 
DROP CONSTRAINT IF EXISTS sale_items_product_id_fkey;
ALTER TABLE public.sale_items 
ADD CONSTRAINT sale_items_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;
