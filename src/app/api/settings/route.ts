import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  storeName: "COK Snack",
  tagline: "Cemilan Orang Kaya",
  phone: "0812-3456-7890",
  address: "Jl. Industri Keripik No. 8, Indonesia",
  receiptFooter: "Barang yang sudah dibeli\ntidak dapat ditukar/dikembalikan.\nTerima kasih atas kunjungan Anda!",
  defaultMinStock: 5,
};

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      storeName: data.store_name || DEFAULT_SETTINGS.storeName,
      tagline: data.tagline || DEFAULT_SETTINGS.tagline,
      phone: data.phone || DEFAULT_SETTINGS.phone,
      address: data.address || DEFAULT_SETTINGS.address,
      receiptFooter: data.receipt_footer || DEFAULT_SETTINGS.receiptFooter,
      defaultMinStock: Number(data.default_min_stock) || DEFAULT_SETTINGS.defaultMinStock,
    });
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await req.json();

    const payload = {
      id: "default",
      store_name: body.storeName?.trim() || DEFAULT_SETTINGS.storeName,
      tagline: body.tagline?.trim() || DEFAULT_SETTINGS.tagline,
      phone: body.phone?.trim() || DEFAULT_SETTINGS.phone,
      address: body.address?.trim() || DEFAULT_SETTINGS.address,
      receipt_footer: body.receiptFooter || DEFAULT_SETTINGS.receiptFooter,
      default_min_stock: parseInt(body.defaultMinStock) || 5,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin.from("store_settings").upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Database upsert error for store_settings:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan ke database cloud: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: {
        storeName: payload.store_name,
        tagline: payload.tagline,
        phone: payload.phone,
        address: payload.address,
        receiptFooter: payload.receipt_footer,
        defaultMinStock: payload.default_min_stock,
      },
    });
  } catch (err: any) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
