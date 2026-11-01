-- ==============================================================================
-- FUNGSI ATOMIK PEMBELIAN BAHAN BAKU (PURCHASES) & MANAJEMEN SUPPLIER
-- ==============================================================================

-- 1. Izin RLS untuk suppliers, purchases, dan purchase_items
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all suppliers" ON public.suppliers;
CREATE POLICY "Allow anon all suppliers" ON public.suppliers 
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all purchases" ON public.purchases;
CREATE POLICY "Allow anon all purchases" ON public.purchases 
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all purchase_items" ON public.purchase_items;
CREATE POLICY "Allow anon all purchase_items" ON public.purchase_items 
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Fungsi Atomik Transaksi Pembelian
CREATE OR REPLACE FUNCTION public.execute_purchase(
    p_invoice_number TEXT,
    p_supplier_id UUID,
    p_purchase_date DATE,
    p_items JSONB,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_additional_fee NUMERIC,
    p_total_amount NUMERIC,
    p_payment_method payment_method,
    p_payment_status payment_status,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_purchase_id UUID;
    v_item RECORD;
    v_current_stock NUMERIC;
    v_product_name TEXT;
    v_stock_after NUMERIC;
BEGIN
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Item pembelian tidak boleh kosong!';
    END IF;

    -- Simpan Header Transaksi Pembelian
    INSERT INTO public.purchases (
        invoice_number,
        supplier_id,
        purchase_date,
        subtotal,
        discount,
        additional_fee,
        total_amount,
        payment_method,
        payment_status,
        notes
    ) VALUES (
        p_invoice_number,
        p_supplier_id,
        p_purchase_date,
        p_subtotal,
        p_discount,
        p_additional_fee,
        p_total_amount,
        p_payment_method,
        p_payment_status,
        p_notes
    )
    RETURNING id INTO v_purchase_id;

    -- Proses Setiap Item Pembelian
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity NUMERIC,
        cost_per_unit NUMERIC,
        subtotal NUMERIC,
        batch_number TEXT,
        expired_at DATE
    )
    LOOP
        -- Kunci dan ambil stok produk saat ini
        SELECT current_stock, name INTO v_current_stock, v_product_name
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan!', v_item.product_id;
        END IF;

        v_stock_after := v_current_stock + v_item.quantity;

        -- 1. Simpan detail item pembelian
        INSERT INTO public.purchase_items (
            purchase_id,
            product_id,
            quantity,
            cost_per_unit,
            subtotal,
            batch_number,
            expired_at
        ) VALUES (
            v_purchase_id,
            v_item.product_id,
            v_item.quantity,
            v_item.cost_per_unit,
            v_item.subtotal,
            v_item.batch_number,
            v_item.expired_at
        );

        -- 2. Tambah stok produk dan perbarui cost_price (HPP bahan baku)
        UPDATE public.products
        SET 
            current_stock = v_stock_after,
            cost_price = v_item.cost_per_unit,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item.product_id;

        -- 3. Catat audit trail pergerakan stok masuk
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity_change,
            stock_after,
            cost_per_unit,
            reference_id,
            reason
        ) VALUES (
            v_item.product_id,
            'purchase',
            v_item.quantity,
            v_stock_after,
            v_item.cost_per_unit,
            p_invoice_number,
            'Pembelian bahan baku (Invoice: ' || p_invoice_number || ')'
        );
    END LOOP;

    -- Jika status pembayaran lunas, otomatis catat pengeluaran kas
    IF p_payment_status = 'paid' THEN
        INSERT INTO public.cash_movements (
            movement_type,
            amount,
            category,
            description,
            payment_method,
            movement_date
        ) VALUES (
            'expense',
            p_total_amount,
            'Pembelian Bahan Baku',
            'Pembelian bahan baku faktur ' || p_invoice_number,
            p_payment_method,
            p_purchase_date
        );
    END IF;

    RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
