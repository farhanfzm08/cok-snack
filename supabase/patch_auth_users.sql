-- ==============================================================================
-- PANDUAN PENGATURAN ROLE USER (Owner, Admin, Kasir)
-- ==============================================================================
-- Jalankan perintah ini di SQL Editor Supabase setelah user dibuat.

-- 1. Mengatur user sebagai OWNER (Akses Penuh)
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "owner"}'::jsonb
WHERE email = 'owner@coksnack.com';

UPDATE public.profiles
SET role = 'owner'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'owner@coksnack.com');


-- 2. Mengatur user sebagai ADMIN (Operasional Toko & Gudang)
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@coksnack.com';

UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@coksnack.com');


-- 3. Mengatur user sebagai KASIR (Hanya POS & Ringkasan Dashboard)
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "kasir"}'::jsonb
WHERE email = 'kasir@coksnack.com';

UPDATE public.profiles
SET role = 'kasir'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'kasir@coksnack.com');
