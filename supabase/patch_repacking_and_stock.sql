-- ==============================================================================
-- FUNGSI ATOMIK REPACKING & PERGERAKAN STOK SECARA OTOMATIS
-- ==============================================================================

-- 1. Berikan izin akses RLS untuk repacking dan stock movements
DROP POLICY IF EXISTS "Allow anon read repacking" ON public.repacking_orders;
CREATE POLICY "Allow anon read repacking" ON public.repacking_orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert repacking" ON public.repacking_orders;
CREATE POLICY "Allow anon insert repacking" ON public.repacking_orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read stock_movements" ON public.stock_movements;
CREATE POLICY "Allow anon read stock_movements" ON public.stock_movements FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert stock_movements" ON public.stock_movements;
CREATE POLICY "Allow anon insert stock_movements" ON public.stock_movements FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2. Fungsi Atomik Penyesuaian / Penambahan Stok Awal
CREATE OR REPLACE FUNCTION public.adjust_product_stock(
    p_product_id UUID,
    p_quantity_change NUMERIC,
    p_reason TEXT,
    p_cost_per_unit NUMERIC DEFAULT 0
)
RETURNS NUMERIC AS $$
DECLARE
    v_new_stock NUMERIC;
    v_movement_type movement_type;
BEGIN
    IF p_quantity_change >= 0 THEN
        v_movement_type := 'purchase';
    ELSE
        v_movement_type := 'adjustment_loss';
    END IF;

    -- Update stok produk
    UPDATE public.products
    SET current_stock = current_stock + p_quantity_change,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_product_id
    RETURNING current_stock INTO v_new_stock;

    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Stok tidak boleh menjadi negatif! Stok saat ini tidak mencukupi.';
    END IF;

    -- Catat riwayat pergerakan stok (Audit Trail)
    INSERT INTO public.stock_movements (
        product_id,
        movement_type,
        quantity_change,
        stock_after,
        cost_per_unit,
        reason
    ) VALUES (
        p_product_id,
        v_movement_type,
        p_quantity_change,
        v_new_stock,
        p_cost_per_unit,
        p_reason
    );

    RETURN v_new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fungsi Atomik Eksekusi Repacking (Otomatis Kurangi Bahan Baku & Tambah Produk Jadi)
CREATE OR REPLACE FUNCTION public.execute_repacking(
    p_order_number TEXT,
    p_production_date DATE,
    p_raw_material_product_id UUID,
    p_raw_material_used_kg NUMERIC,
    p_raw_material_cost NUMERIC,
    p_finished_product_id UUID,
    p_package_weight_grams NUMERIC,
    p_target_output_packs INT,
    p_actual_output_packs INT,
    p_damaged_packs INT,
    p_leftover_grams NUMERIC,
    p_waste_shrinkage_grams NUMERIC,
    p_packaging_cost NUMERIC,
    p_label_cost NUMERIC,
    p_other_cost NUMERIC,
    p_total_production_cost NUMERIC,
    p_calculated_cogs_per_pack NUMERIC,
    p_notes TEXT
)
RETURNS UUID AS $$
DECLARE
    v_raw_current_stock NUMERIC;
    v_raw_stock_after NUMERIC;
    v_finished_stock_after NUMERIC;
    v_repack_id UUID;
BEGIN
    -- Validasi 1: Kunci baris bahan baku & cek stok
    SELECT current_stock INTO v_raw_current_stock
    FROM public.products
    WHERE id = p_raw_material_product_id
    FOR UPDATE;

    IF v_raw_current_stock IS NULL THEN
        RAISE EXCEPTION 'Bahan baku tidak ditemukan!';
    END IF;

    IF v_raw_current_stock < p_raw_material_used_kg THEN
        RAISE EXCEPTION 'Stok bahan baku tidak mencukupi! Stok saat ini: % kg, dibutuhkan: % kg',
            v_raw_current_stock, p_raw_material_used_kg;
    END IF;

    -- Simpan Transaksi Repacking Order
    INSERT INTO public.repacking_orders (
        order_number,
        production_date,
        raw_material_product_id,
        raw_material_used_kg,
        raw_material_cost,
        finished_product_id,
        package_weight_grams,
        target_output_packs,
        actual_output_packs,
        damaged_packs,
        leftover_grams,
        waste_shrinkage_grams,
        packaging_cost,
        label_cost,
        other_cost,
        total_production_cost,
        calculated_cogs_per_pack,
        status,
        notes
    ) VALUES (
        p_order_number,
        p_production_date,
        p_raw_material_product_id,
        p_raw_material_used_kg,
        p_raw_material_cost,
        p_finished_product_id,
        p_package_weight_grams,
        p_target_output_packs,
        p_actual_output_packs,
        p_damaged_packs,
        p_leftover_grams,
        p_waste_shrinkage_grams,
        p_packaging_cost,
        p_label_cost,
        p_other_cost,
        p_total_production_cost,
        p_calculated_cogs_per_pack,
        'completed',
        p_notes
    )
    RETURNING id INTO v_repack_id;

    -- LANGKAH INTI 1: KURANGI STOK BAHAN BAKU
    UPDATE public.products
    SET current_stock = current_stock - p_raw_material_used_kg,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_raw_material_product_id
    RETURNING current_stock INTO v_raw_stock_after;

    -- Catat riwayat stok bahan baku keluar (Audit Trail)
    INSERT INTO public.stock_movements (
        product_id,
        movement_type,
        quantity_change,
        stock_after,
        cost_per_unit,
        reference_id,
        reason
    ) VALUES (
        p_raw_material_product_id,
        'repack_out',
        -p_raw_material_used_kg,
        v_raw_stock_after,
        p_raw_material_cost / NULLIF(p_raw_material_used_kg, 0),
        v_repack_id::text,
        'Dipakai repacking #' || p_order_number
    );

    -- LANGKAH INTI 2: TAMBAH STOK PRODUK JADI KEMASAN
    UPDATE public.products
    SET current_stock = current_stock + p_actual_output_packs,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_finished_product_id
    RETURNING current_stock INTO v_finished_stock_after;

    -- Catat riwayat stok produk jadi masuk (Audit Trail)
    INSERT INTO public.stock_movements (
        product_id,
        movement_type,
        quantity_change,
        stock_after,
        cost_per_unit,
        reference_id,
        reason
    ) VALUES (
        p_finished_product_id,
        'repack_in',
        p_actual_output_packs,
        v_finished_stock_after,
        p_calculated_cogs_per_pack,
        v_repack_id::text,
        'Hasil repacking #' || p_order_number
    );

    RETURN v_repack_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
