-- ==============================================================================
-- SAE SNACK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'kasir');
CREATE TYPE product_type AS ENUM ('raw_material', 'finished_good');
CREATE TYPE movement_type AS ENUM ('purchase', 'repack_in', 'repack_out', 'sale', 'adjustment_loss', 'adjustment_found', 'return');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'qris');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid');
CREATE TYPE repacking_status AS ENUM ('draft', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- 3. PROFILES (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'kasir',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'kasir')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type product_type NOT NULL DEFAULT 'finished_good',
    unit TEXT NOT NULL, -- e.g. 'kg', 'gram', 'pcs', 'pack'
    package_weight_grams NUMERIC(10, 2) DEFAULT 0, -- weight in grams for repack products
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC(10, 2) NOT NULL DEFAULT 5,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    barcode TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INVENTORY BATCHES (Supports FEFO: First Expired, First Out)
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    initial_quantity NUMERIC(10, 2) NOT NULL,
    remaining_quantity NUMERIC(10, 2) NOT NULL CHECK (remaining_quantity >= 0),
    cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    received_or_produced_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expired_at DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. STOCK MOVEMENTS (Audit trail for any stock change)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
    movement_type movement_type NOT NULL,
    quantity_change NUMERIC(10, 2) NOT NULL, -- positive for in, negative for out
    stock_after NUMERIC(10, 2) NOT NULL,
    cost_per_unit NUMERIC(12, 2) DEFAULT 0,
    reference_id TEXT, -- ID of purchase, repack, or sale
    reason TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PURCHASES
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    additional_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    payment_status payment_status NOT NULL DEFAULT 'paid',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    cost_per_unit NUMERIC(12, 2) NOT NULL CHECK (cost_per_unit >= 0),
    subtotal NUMERIC(12, 2) NOT NULL,
    batch_number TEXT,
    expired_at DATE
);

-- 10. REPACKING ORDERS (Bulk kg -> Pack grams)
CREATE TABLE IF NOT EXISTS public.repacking_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    production_date DATE NOT NULL DEFAULT CURRENT_DATE,
    raw_material_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    raw_material_batch_id UUID REFERENCES public.inventory_batches(id) ON DELETE SET NULL,
    raw_material_used_kg NUMERIC(10, 3) NOT NULL CHECK (raw_material_used_kg > 0),
    raw_material_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    
    finished_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    package_weight_grams NUMERIC(10, 2) NOT NULL,
    target_output_packs INT NOT NULL,
    actual_output_packs INT NOT NULL,
    damaged_packs INT NOT NULL DEFAULT 0,
    leftover_grams NUMERIC(10, 2) NOT NULL DEFAULT 0,
    waste_shrinkage_grams NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    packaging_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    label_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    other_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_production_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    calculated_cogs_per_pack NUMERIC(12, 2) NOT NULL DEFAULT 0,
    
    status repacking_status NOT NULL DEFAULT 'completed',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. SALES (POS & Kasir)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_cogs NUMERIC(12, 2) NOT NULL DEFAULT 0, -- snapshot HPP for gross profit calculation
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    change_due NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    cogs_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 12. EXPENSES & CASH MOVEMENTS
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type transaction_type NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL DEFAULT 'cash',
    reference_id TEXT, -- sale_id or purchase_id or expense_id
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repacking_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile, owner & admin can view all
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.get_my_role() IN ('owner', 'admin'));
CREATE POLICY "Users can update own profile name" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products: Authenticated users can read
CREATE POLICY "Authenticated users can read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Owners can manage categories" ON public.categories FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

CREATE POLICY "Authenticated users can read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Owners can manage products" ON public.products FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

-- Suppliers: Admins and Owners can manage, Kasir can read
CREATE POLICY "Authenticated users can read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Owners can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

-- Inventory & Batches: Read for all authenticated, manage for Admin & Owner
CREATE POLICY "Authenticated users can read batches" ON public.inventory_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Owners can manage batches" ON public.inventory_batches FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

CREATE POLICY "Authenticated users can read stock movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create stock movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Purchases: Admin & Owner only
CREATE POLICY "Purchases read access" ON public.purchases FOR SELECT TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));
CREATE POLICY "Purchases manage access" ON public.purchases FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));
CREATE POLICY "Purchase items access" ON public.purchase_items FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

-- Repacking: Admin & Owner only
CREATE POLICY "Repacking read access" ON public.repacking_orders FOR SELECT TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));
CREATE POLICY "Repacking manage access" ON public.repacking_orders FOR ALL TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));

-- Sales: Cashiers, Admins, and Owners can create and read sales
CREATE POLICY "Sales read access" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales insert access" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Sales items read access" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales items insert access" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- Cash Movements: Owner & Admin can view all, Cashier can insert cash from sales
CREATE POLICY "Cash movements read" ON public.cash_movements FOR SELECT TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));
CREATE POLICY "Cash movements insert" ON public.cash_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Audit logs: Owner & Admin only
CREATE POLICY "Audit logs read" ON public.audit_logs FOR SELECT TO authenticated USING (public.get_my_role() IN ('owner', 'admin'));
