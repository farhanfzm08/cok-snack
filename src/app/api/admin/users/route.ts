import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = createAdminClient();

    // 1. Ambil seluruh user dari Supabase Auth
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers();
    if (authErr) throw authErr;

    // 2. Ambil seluruh profil dari public.profiles
    const { data: profilesData } = await admin.from("profiles").select("*");

    const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

    const users = (authData.users || []).map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        full_name: p?.full_name || u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
        role: p?.role || u.user_metadata?.role || "kasir",
        phone: p?.phone || u.user_metadata?.phone || "-",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Gagal memuat daftar user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json();
    const { email, password, full_name, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const assignedRole = ["owner", "admin", "kasir"].includes(role) ? role : "kasir";

    // 1. Buat user di Supabase Auth
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || email.split("@")[0],
        phone: phone || "",
        role: assignedRole,
      },
    });

    if (createErr) throw createErr;
    if (!newUser.user) throw new Error("Gagal membuat user");

    // 2. Simpan/Upsert ke tabel public.profiles
    await admin.from("profiles").upsert({
      id: newUser.user.id,
      full_name: full_name || email.split("@")[0],
      role: assignedRole,
      phone: phone || null,
      email: email,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: assignedRole,
      },
    });
  } catch (err: any) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat user baru" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json();
    const { id, role, full_name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (role && ["owner", "admin", "kasir"].includes(role)) updates.role = role;
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;

    // 1. Update Auth user metadata
    const { error: authErr } = await admin.auth.admin.updateUserById(id, {
      user_metadata: updates,
    });
    if (authErr) throw authErr;

    // 2. Update public.profiles
    const { error: profErr } = await admin
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (profErr) throw profErr;

    return NextResponse.json({ success: true, message: "User berhasil diperbarui" });
  } catch (err: any) {
    console.error("PATCH /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Gagal memperbarui user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    // 1. Hapus profile dari database
    await admin.from("profiles").delete().eq("id", id);

    // 2. Hapus akun dari auth.users
    const { error: authErr } = await admin.auth.admin.deleteUser(id);
    if (authErr) throw authErr;

    return NextResponse.json({ success: true, message: "Akun user berhasil dihapus" });
  } catch (err: any) {
    console.error("DELETE /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Gagal menghapus user" }, { status: 500 });
  }
}
