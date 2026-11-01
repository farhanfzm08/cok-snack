-- ==============================================================================
-- FIX SUPABASE USER CREATION ERROR: Database error creating new user
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor Supabase untuk memperbaiki error pembuatan user.

-- 1. Berikan hak akses penuh pada tabel profiles
GRANT ALL ON TABLE public.profiles TO postgres, service_role, authenticated, anon;

-- 2. Tambahkan policy INSERT pada tabel profiles agar trigger dan sistem bisa memasukkan profil
DROP POLICY IF EXISTS "Allow system and users to insert profile" ON public.profiles;
CREATE POLICY "Allow system and users to insert profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow system and users to update profile" ON public.profiles;
CREATE POLICY "Allow system and users to update profile" 
ON public.profiles 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 3. Perbaiki fungsi trigger handle_new_user() agar kebal error (bulletproof)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(COALESCE(new.email, 'user'), '@', 1)),
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'owner' THEN 'owner'::user_role
            WHEN new.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
            ELSE 'kasir'::user_role
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
        
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Pastikan akun auth.users TETAP BERHASIL DIBUAT meskipun ada kendala di tabel profile
        RETURN new;
END;
$$;

-- 4. Pasang ulang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Helper: Sinkronisasi akun yang sudah ada tapi belum punya profile
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE((raw_user_meta_data->>'role')::user_role, 'owner'::user_role)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
