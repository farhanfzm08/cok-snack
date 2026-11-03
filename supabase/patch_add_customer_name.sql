-- =========================================================================
-- PATCH: Perbaikan Eksekusi Penjualan Kasir (execute_sale) & customer_name
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Paste seluruh kode di bawah ini, lalu klik Run
-- =========================================================================

-- Step 1: Tambah kolom customer_name ke tabel sales jika belum ada
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Umum';

COMMENT ON COLUMN public.sales.customer_name IS 'Nama pembeli / pelanggan transaksi kasir (hanya nama)';

-- Step 2: Sinkronisasi data lama dari notes ke customer_name
UPDATE public.sales
SET customer_name = TRIM(notes)
WHERE (customer_name IS NULL OR customer_name = 'Umum')
  AND notes IS NOT NULL
  AND notes != ''
  AND notes != 'Penjualan Kasir POS';

-- Step 3: Pasang kembali fungsi execute_sale yang sesuai dengan struktur tabel stock_movements
CREATE OR REPLACE FUNCTION public.execute_sale(
    p_invoice_number TEXT,
    p_items JSONB,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_total_amount NUMERIC,
    p_amount_paid NUMERIC,
    p_change_due NUMERIC,
    p_payment_method payment_method,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item RECORD;
    v_product_id UUID;
    v_quantity INT;
    v_unit_price NUMERIC;
    v_cogs_unit NUMERIC;
    v_subtotal NUMERIC;
    v_current_stock NUMERIC;
    v_product_name TEXT;
    v_stock_after NUMERIC;
    v_total_cogs NUMERIC := 0;
    v_customer_name TEXT;
BEGIN
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Keranjang belanja tidak boleh kosong!';
    END IF;

    -- Tentukan nama pembeli: bersihkan input atau fallback ke 'Umum'
    v_customer_name := COALESCE(NULLIF(TRIM(p_notes), ''), 'Umum');

    -- Validasi 1: Kunci dan periksa stok setiap produk terlebih dahulu
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT,
        unit_price NUMERIC,
        cogs_per_unit NUMERIC,
        subtotal NUMERIC
    )
    LOOP
        SELECT current_stock, name INTO v_current_stock, v_product_name
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan!', v_item.product_id;
        END IF;

        IF v_current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Stok untuk produk "%" tidak mencukupi! Tersedia: %, Dibutuhkan: %',
                v_product_name, v_current_stock, v_item.quantity;
        END IF;

        v_total_cogs := v_total_cogs + (COALESCE(v_item.cogs_per_unit, 0) * v_item.quantity);
    END LOOP;

    -- Simpan Header Transaksi Penjualan (termasuk kolom customer_name)
    INSERT INTO public.sales (
        invoice_number,
        sale_date,
        subtotal,
        discount,
        total_amount,
        total_cogs,
        amount_paid,
        change_due,
        payment_method,
        notes,
        customer_name
    ) VALUES (
        p_invoice_number,
        timezone('utc'::text, now()),
        p_subtotal,
        p_discount,
        p_total_amount,
        v_total_cogs,
        p_amount_paid,
        p_change_due,
        p_payment_method,
        p_notes,
        v_customer_name
    )
    RETURNING id INTO v_sale_id;

    -- Simpan Detail Barang, Potong Stok & Catat Riwayat Mutasi
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT,
        unit_price NUMERIC,
        cogs_per_unit NUMERIC,
        subtotal NUMERIC
    )
    LOOP
        -- 1. Insert detail item penjualan
        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            cogs_per_unit,
            subtotal
        ) VALUES (
            v_sale_id,
            v_item.product_id,
            v_item.quantity,
            v_item.unit_price,
            COALESCE(v_item.cogs_per_unit, 0),
            v_item.subtotal
        );

        -- 2. Kurangi stok produk
        UPDATE public.products
        SET current_stock = current_stock - v_item.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item.product_id
        RETURNING current_stock INTO v_stock_after;

        -- 3. Catat riwayat pergerakan stok (sesuai kolom tabel stock_movements)
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
            'sale',
            -v_item.quantity,
            v_stock_after,
            COALESCE(v_item.cogs_per_unit, 0),
            v_sale_id::text,
            'Penjualan kasir #' || p_invoice_number || ' (' || v_customer_name || ')'
        );
    END LOOP;

    -- Catat Arus Kas Masuk
    INSERT INTO public.cash_movements (
        movement_date,
        type,
        category,
        amount,
        payment_method,
        reference_id,
        notes
    ) VALUES (
        CURRENT_DATE,
        'income',
        'Penjualan Kasir',
        p_total_amount,
        p_payment_method,
        v_sale_id::text,
        'Transaksi Kasir #' || p_invoice_number || ' (' || v_customer_name || ')'
    );

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
