-- Fungsi untuk set role user (dijalankan sebagai admin)
-- Cara pakai: panggil fungsi ini di SQL Editor Supabase

-- Buat user owner (ganti email & password sesuai keinginan)
-- CATATAN: User dibuat via Supabase Auth Dashboard atau API
-- Setelah user dibuat, set role-nya via SQL berikut:

-- Update role user berdasarkan email (jalankan per user)
-- Contoh untuk set user sebagai owner:
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "owner"}'::jsonb
WHERE email = 'owner@coksnack.com';

-- Contoh untuk set user sebagai admin:
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@coksnack.com';

-- Contoh untuk set user sebagai kasir:
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "kasir"}'::jsonb
WHERE email = 'kasir@coksnack.com';
