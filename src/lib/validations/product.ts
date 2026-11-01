import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  sku: z.string().min(3, "SKU minimal 3 karakter (contoh: MKR-CURAH, MKR-100G)"),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  category_id: z.string().optional().nullable(),
  type: z.enum(["raw_material", "finished_good"]),
  unit: z.string().min(1, "Satuan wajib diisi (misal: kg, pack, pcs)"),
  package_weight_grams: z.number().min(0, "Berat kemasan tidak boleh negatif"),
  selling_price: z.number().min(0, "Harga jual tidak boleh negatif"),
  min_stock_alert: z.number().min(0, "Batas minimal stok tidak boleh negatif"),
  barcode: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
