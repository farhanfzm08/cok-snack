-- =========================================================================
-- PATCH: Tambah kolom customer_name pada tabel public.sales
--        dan update fungsi execute_sale untuk menyimpannya langsung
-- 
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Paste seluruh isi file ini, lalu klik Run
-- =========================================================================

-- Step 1: Tambah kolom customer_name (skip jika sudah ada)
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Umum';

COMMENT ON COLUMN public.sales.customer_name IS 'Nama pembeli / pelanggan transaksi kasir (hanya nama)';

-- Step 2: Migrate data lama dari kolom notes ke customer_name
UPDATE public.sales
SET customer_name = TRIM(notes)
WHERE (customer_name IS NULL OR customer_name = 'Umum')
  AND notes IS NOT NULL
  AND notes != ''
  AND notes != 'Penjualan Kasir POS';

-- Step 3: Update fungsi execute_sale agar langsung simpan customer_name
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

    -- Tentukan customer_name: gunakan p_notes, default 'Umum' jika kosong
    v_customer_name := COALESCE(NULLIF(TRIM(p_notes), ''), 'Umum');

    -- Validasi: Cek stok setiap produk di keranjang
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT,
        unit_price NUMERIC,
        cogs_per_unit NUMERIC,
        subtotal NUMERIC
    )
    LOOP
        SELECT current_stock, name
        INTO v_current_stock, v_product_name
        FROM public.products
        WHERE id = v_item.product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan!', v_item.product_id;
        END IF;

        IF v_current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Stok % tidak mencukupi! Stok saat ini: %, dibutuhkan: %',
                v_product_name, v_current_stock, v_item.quantity;
        END IF;

        v_total_cogs := v_total_cogs + (v_item.cogs_per_unit * v_item.quantity);
    END LOOP;

    -- Simpan Header Transaksi Penjualan (dengan customer_name)
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

    -- Simpan Detail Barang, Potong Stok & Catat Mutasi
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT,
        unit_price NUMERIC,
        cogs_per_unit NUMERIC,
        subtotal NUMERIC
    )
    LOOP
        -- Simpan detail item
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
            v_item.cogs_per_unit,
            v_item.subtotal
        );

        -- Potong stok produk
        UPDATE public.products
        SET current_stock = current_stock - v_item.quantity
        WHERE id = v_item.product_id
        RETURNING current_stock INTO v_stock_after;

        -- Catat mutasi stok
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity_change,
            stock_before,
            stock_after,
            reference_type,
            reference_id,
            notes
        ) VALUES (
            v_item.product_id,
            'out',
            -v_item.quantity,
            v_stock_after + v_item.quantity,
            v_stock_after,
            'sale',
            v_sale_id,
            'Terjual ke: ' || v_customer_name
        );
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
