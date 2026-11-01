"use client";

import React, { useState, useEffect } from "react";
import {
  PackageCheck,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  Scale,
  Calendar,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  type: "raw_material" | "finished_good";
  unit: string;
  package_weight_grams: number;
  current_stock: number;
  cost_price?: number;
}

interface RepackingOrder {
  id: string;
  order_number: string;
  production_date: string;
  raw_material_used_kg: number;
  raw_material_cost: number;
  package_weight_grams: number;
  target_output_packs: number;
  actual_output_packs: number;
  damaged_packs: number;
  waste_shrinkage_grams: number;
  total_production_cost: number;
  calculated_cogs_per_pack: number;
  notes: string | null;
  raw_product?: { name: string; sku: string };
  finished_product?: { name: string; sku: string };
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RepackingPage() {
  const supabase = createClient();

  const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<Product[]>([]);
  const [orders, setOrders] = useState<RepackingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Inputs
  const [selectedRawId, setSelectedRawId] = useState("");
  const [rawKgUsed, setRawKgUsed] = useState("5");
  const [rawCost, setRawCost] = useState("175000");

  const [selectedFinishedId, setSelectedFinishedId] = useState("");
  const [packWeightGrams, setPackWeightGrams] = useState(100);

  const [actualPacks, setActualPacks] = useState("48");
  const [damagedPacks, setDamagedPacks] = useState("0");
  const [leftoverGrams, setLeftoverGrams] = useState("0");

  // Biaya Kemasan fleksibel (bisa per buah atau total)
  const [costMode, setCostMode] = useState<"per_unit" | "total">("per_unit");
  const [plasticPerPcs, setPlasticPerPcs] = useState("60"); // Bebas: misal Rp 60
  const [labelPerPcs, setLabelPerPcs] = useState("50"); // Bebas: misal Rp 50
  const [customPackagingCost, setCustomPackagingCost] = useState("");
  const [customLabelCost, setCustomLabelCost] = useState("");
  const [otherCost, setOtherCost] = useState("0");
  const [notes, setNotes] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      const { data: prodData } = await supabase
        .from("products")
        .select("id, name, sku, type, unit, package_weight_grams, current_stock, cost_price")
        .eq("is_active", true);

      if (prodData) {
        setRawMaterials(prodData.filter((p) => p.type === "raw_material"));
        setFinishedGoods(prodData.filter((p) => p.type === "finished_good"));
      }

      // 2. Fetch repacking orders
      const { data: repData } = await supabase
        .from("repacking_orders")
        .select("*, raw_product:products!raw_material_product_id(name, sku), finished_product:products!finished_product_id(name, sku)")
        .order("created_at", { ascending: false });

      if (repData) {
        setOrders(repData as any);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Delete Repack Order
  const handleDeleteRepackOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus riwayat repacking #${orderNumber}?`)) return;

    setIsSubmitting(true);
    // Hapus stock movements yang terkait
    await supabase.from("stock_movements").delete().eq("reference_id", id);
    // Hapus order repacking
    const { error } = await supabase.from("repacking_orders").delete().eq("id", id);
    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal menghapus riwayat: " + error.message);
    } else {
      showToast("success", `Riwayat repacking #${orderNumber} berhasil dihapus.`);
      fetchData();
    }
  };

  // Update pack weight when finished product is selected
  const handleSelectFinishedProduct = (id: string) => {
    setSelectedFinishedId(id);
    const prod = finishedGoods.find((p) => p.id === id);
    if (prod && prod.package_weight_grams > 0) {
      setPackWeightGrams(prod.package_weight_grams);
    }
  };

  // Handle Raw Product change with auto calculation of cost
  const handleSelectRawProduct = (id: string) => {
    setSelectedRawId(id);
    const prod = rawMaterials.find((p) => p.id === id);
    if (prod && prod.cost_price) {
      const autoCost = (Number(rawKgUsed) || 0) * prod.cost_price;
      setRawCost(autoCost.toString());
    }
  };

  // Handle Raw Kg change with auto recalculation of raw cost
  const handleRawKgUsedChange = (val: string) => {
    setRawKgUsed(val);
    const prod = rawMaterials.find((p) => p.id === selectedRawId);
    if (prod && prod.cost_price) {
      const autoCost = (Number(val) || 0) * prod.cost_price;
      setRawCost(autoCost.toString());
    }
  };

  // Selected raw product object
  const selectedRawProduct = rawMaterials.find((p) => p.id === selectedRawId);
  const selectedFinishedProduct = finishedGoods.find((p) => p.id === selectedFinishedId);

  // Calculations
  const rawUsedKgNum = Number(rawKgUsed) || 0;
  const rawUsedTotalGrams = rawUsedKgNum * 1000;
  const targetOutputPacks = packWeightGrams > 0 ? Math.floor(rawUsedTotalGrams / packWeightGrams) : 0;

  const actualPacksNum = Number(actualPacks) || 0;
  const damagedPacksNum = Number(damagedPacks) || 0;
  const leftoverGramsNum = Number(leftoverGrams) || 0;

  const finishedWeightGrams = actualPacksNum * packWeightGrams;
  const damagedWeightGrams = damagedPacksNum * packWeightGrams;
  const shrinkageGrams = Math.max(
    0,
    rawUsedTotalGrams - (finishedWeightGrams + damagedWeightGrams + leftoverGramsNum)
  );

  const rawCostNum = Number(rawCost) || 0;

  // Flexible packaging & label calculation
  const packagingCostNum =
    costMode === "per_unit"
      ? actualPacksNum * (Number(plasticPerPcs) || 0)
      : Number(customPackagingCost) || 0;

  const labelCostNum =
    costMode === "per_unit"
      ? actualPacksNum * (Number(labelPerPcs) || 0)
      : Number(customLabelCost) || 0;

  const otherCostNum = Number(otherCost) || 0;

  const totalProductionCost = rawCostNum + packagingCostNum + labelCostNum + otherCostNum;
  const cogsPerPack = actualPacksNum > 0 ? totalProductionCost / actualPacksNum : 0;

  // Validation
  const isStockSufficient =
    selectedRawProduct && Number(selectedRawProduct.current_stock || 0) >= rawUsedKgNum;

  // Submit Repacking
  const handleSubmitRepacking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRawId || !selectedFinishedId) {
      showToast("error", "Pilih bahan baku dan produk jadi terlebih dahulu!");
      return;
    }

    if (rawUsedKgNum <= 0) {
      showToast("error", "Jumlah bahan baku harus lebih dari 0 kg!");
      return;
    }

    if (!isStockSufficient) {
      showToast(
        "error",
        `Stok bahan baku tidak mencukupi! Tersedia: ${selectedRawProduct?.current_stock} kg, Dibutuhkan: ${rawUsedKgNum} kg.`
      );
      return;
    }

    if (actualPacksNum <= 0) {
      showToast("error", "Hasil aktual bungkus jadi harus lebih dari 0!");
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `RPK-${Date.now().toString().slice(-6)}`;

    // Call atomic PostgreSQL function
    const { data, error } = await supabase.rpc("execute_repacking", {
      p_order_number: orderNumber,
      p_production_date: new Date().toISOString().split("T")[0],
      p_raw_material_product_id: selectedRawId,
      p_raw_material_used_kg: rawUsedKgNum,
      p_raw_material_cost: rawCostNum,
      p_finished_product_id: selectedFinishedId,
      p_package_weight_grams: packWeightGrams,
      p_target_output_packs: targetOutputPacks,
      p_actual_output_packs: actualPacksNum,
      p_damaged_packs: damagedPacksNum,
      p_leftover_grams: leftoverGramsNum,
      p_waste_shrinkage_grams: shrinkageGrams,
      p_packaging_cost: packagingCostNum,
      p_label_cost: labelCostNum,
      p_other_cost: otherCostNum,
      p_total_production_cost: totalProductionCost,
      p_calculated_cogs_per_pack: cogsPerPack,
      p_notes: notes.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      showToast("error", "Gagal memproses repacking: " + error.message);
    } else {
      showToast(
        "success",
        `Repacking #${orderNumber} Berhasil! Stok ${selectedRawProduct?.name} berkurang -${rawUsedKgNum} kg & Stok ${selectedFinishedProduct?.name} bertambah +${actualPacksNum} bungkus!`
      );
      setIsModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 animate-masuk ${
            notification.type === "success"
              ? "bg-surface border-success/40 text-success"
              : "bg-surface border-danger/40 text-danger"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Produksi Repacking & Kalkulasi HPP
          </h1>
          <p className="text-sm text-muted">
            Konversi snack curah (kg) menjadi kemasan (gram) dengan pemotongan stok bahan baku otomatis.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (rawMaterials.length === 0) {
              showToast("error", "Daftarkan bahan baku kiloan terlebih dahulu di menu Produk!");
              return;
            }
            if (finishedGoods.length === 0) {
              showToast("error", "Daftarkan produk jadi kemasan terlebih dahulu di menu Produk!");
              return;
            }
            const firstRaw = rawMaterials[0];
            setSelectedRawId(firstRaw.id);
            if (firstRaw.cost_price) {
              setRawCost(((Number(rawKgUsed) || 0) * firstRaw.cost_price).toString());
            }
            handleSelectFinishedProduct(finishedGoods[0].id);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Repacking Baru</span>
        </Button>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card pastelAccent="mint">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Total Batch Repacking</p>
            <div className="w-8 h-8 rounded-xl bg-mint text-success flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{orders.length} Batch</p>
          <p className="text-xs text-muted mt-0.5">Produksi tersimpan atomik</p>
        </Card>

        <Card pastelAccent="lavender">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Bahan Curah Terpakai</p>
            <div className="w-8 h-8 rounded-xl bg-lavender text-primary flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {orders.reduce((sum, o) => sum + Number(o.raw_material_used_kg || 0), 0)} kg
          </p>
          <p className="text-xs text-muted mt-0.5">Stok bahan baku terpotong</p>
        </Card>

        <Card pastelAccent="peach">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">Kemasan Siap Jual</p>
            <div className="w-8 h-8 rounded-xl bg-peach text-[#A04128] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {orders.reduce((sum, o) => sum + Number(o.actual_output_packs || 0), 0)} Bungkus
          </p>
          <p className="text-xs text-muted mt-0.5">Stok produk jadi bertambah</p>
        </Card>
      </div>

      {/* Repacking History Table */}
      <Card>
        <CardHeader
          title="Riwayat Transaksi Repacking"
          subtitle="Setiap proses repacking otomatis memotong bahan baku dan mencatat snapshot HPP per bungkus"
        />

        {loading ? (
          <div className="py-16 text-center text-muted text-sm">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Memuat riwayat repacking...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-mint text-success flex items-center justify-center mb-3">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Belum Ada Transaksi Repacking</h3>
            <p className="text-xs text-muted max-w-sm mt-1">
              Klik tombol &quot;Mulai Repacking Baru&quot; di atas untuk memproses konversi bahan curah (kg) menjadi bungkus kemasan kecil.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3 px-3">No. Batch & Tanggal</th>
                  <th className="py-3 px-3">Bahan Baku (kg)</th>
                  <th className="py-3 px-3">Hasil Repack (Bungkus)</th>
                  <th className="py-3 px-3">Susut (Gram)</th>
                  <th className="py-3 px-3">Total Biaya Produksi</th>
                  <th className="py-3 px-3">HPP / Bungkus</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-background/60 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-foreground font-mono">{order.order_number}</p>
                      <p className="text-xs text-muted">{order.production_date}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-foreground">{order.raw_product?.name || "Bahan Baku"}</p>
                      <Badge variant="lavender" size="sm">
                        -{order.raw_material_used_kg} kg
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-foreground">{order.finished_product?.name || "Produk Jadi"}</p>
                      <Badge variant="mint" size="sm">
                        +{order.actual_output_packs} bks ({order.package_weight_grams}g)
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted">
                      {order.waste_shrinkage_grams} gram
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {formatRupiah(order.total_production_cost)}
                    </td>
                    <td className="py-3 px-3 font-bold text-primary">
                      {formatRupiah(order.calculated_cogs_per_pack)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="mint" size="sm">
                        Selesai
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRepackOrder(order.id, order.order_number)}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                        title="Hapus Riwayat Repacking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL INPUT PROSES REPACKING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-masuk">
          <div className="bg-surface border border-line rounded-3xl max-w-2xl w-full p-6 shadow-xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Proses Repacking & Hitung HPP</h3>
                <p className="text-xs text-muted">Sistem akan otomatis mengurangi stok bahan curah dan menambah stok kemasan</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepacking} className="space-y-4 text-sm">
              {/* SECTION 1: BAHAN BAKU */}
              <div className="p-4 rounded-2xl bg-lavender/30 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    <span>1. Bahan Baku Curah (Kiloan)</span>
                  </h4>
                  {selectedRawProduct?.cost_price ? (
                    <Badge variant="lavender" size="sm">
                      Modal: {formatRupiah(selectedRawProduct.cost_price)} / kg
                    </Badge>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Pilih Bahan Baku (kg) *
                    </label>
                    <select
                      value={selectedRawId}
                      onChange={(e) => handleSelectRawProduct(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-semibold"
                    >
                      {rawMaterials.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stok: {p.current_stock} kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Jumlah Bahan Digunakan (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.001"
                      step="any"
                      value={rawKgUsed}
                      onChange={(e) => handleRawKgUsedChange(e.target.value)}
                      placeholder="Misal: 0.5 atau 5"
                      className={`w-full px-3 py-2 bg-surface border rounded-xl text-xs font-bold ${
                        !isStockSufficient ? "border-danger text-danger" : "border-line text-foreground"
                      }`}
                    />
                    {!isStockSufficient && (
                      <p className="text-[11px] text-danger font-semibold mt-1">
                        ⚠️ Stok bahan baku tidak mencukupi (Tersedia: {selectedRawProduct?.current_stock} kg).
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-muted">
                      Biaya Bahan Baku Terpakai (Rp) *
                    </label>
                    {selectedRawProduct?.cost_price ? (
                      <span className="text-[11px] text-primary font-medium">
                        Otomatis: {rawKgUsed} kg × {formatRupiah(selectedRawProduct.cost_price)}
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={rawCost}
                    onChange={(e) => setRawCost(e.target.value)}
                    placeholder="175000"
                    className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-bold text-primary"
                  />
                  <p className="text-[10px] text-muted mt-0.5">
                    Terhitung otomatis dari harga beli per kg bahan baku (angka bebas disesuaikan).
                  </p>
                </div>
              </div>

              {/* SECTION 2: PRODUK JADI REPACK */}
              <div className="p-4 rounded-2xl bg-mint/30 border border-success/20 space-y-3">
                <h4 className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-2">
                  <PackageCheck className="w-4 h-4" />
                  <span>2. Produk Jadi Kemasan Repack</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Pilih Produk Jadi *
                    </label>
                    <select
                      value={selectedFinishedId}
                      onChange={(e) => handleSelectFinishedProduct(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-xs font-semibold"
                    >
                      {finishedGoods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.package_weight_grams} gram)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">
                      Ukuran Kemasan (Gram)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={packWeightGrams}
                      className="w-full px-3 py-2 bg-background border border-line rounded-xl text-xs font-semibold text-muted"
                    />
                  </div>
                </div>

                {/* Target vs Actual output */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-surface border border-line">
                    <span className="text-[11px] text-muted">Target Teoritis</span>
                    <p className="text-sm font-bold text-foreground">{targetOutputPacks} Bungkus</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Hasil Aktual Jadi *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={actualPacks}
                      onChange={(e) => setActualPacks(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-success rounded-xl text-xs font-bold text-success"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Rusak / Cacat
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={damagedPacks}
                      onChange={(e) => setDamagedPacks(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-surface border border-line rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Sisa & Susut Gram */}
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-surface/80 border border-line/60">
                  <span className="text-muted">Total Bobot Kemasan Jadi:</span>
                  <span className="font-semibold">{finishedWeightGrams} gram ({finishedWeightGrams / 1000} kg)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-peach/40 border border-peach">
                  <span className="text-[#A04128] font-medium">Susut / Selisih Kehilangan:</span>
                  <span className="font-bold text-[#A04128]">{shrinkageGrams} gram</span>
                </div>
              </div>

              {/* SECTION 3: BIAYA PRODUKSI & KALKULASI HPP */}
              <div className="p-4 rounded-2xl bg-yellow/30 border border-warning/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-warning uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>3. Alokasi Biaya & Kalkulasi HPP</span>
                  </h4>
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-line text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCostMode("per_unit")}
                      className={`px-2 py-0.5 rounded-lg font-semibold transition-colors ${
                        costMode === "per_unit"
                          ? "bg-yellow text-warning font-bold"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      Hitung per Bungkus (cth: Rp60/pcs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostMode("total")}
                      className={`px-2 py-0.5 rounded-lg font-semibold transition-colors ${
                        costMode === "total"
                          ? "bg-yellow text-warning font-bold"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      Input Total Langsung
                    </button>
                  </div>
                </div>

                {costMode === "per_unit" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Biaya Plastik / Bungkus (Rp) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={plasticPerPcs}
                        onChange={(e) => setPlasticPerPcs(e.target.value)}
                        placeholder="Contoh: 60"
                        className="w-full px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-semibold"
                      />
                      <p className="text-[10px] text-muted mt-1">
                        Total: {actualPacksNum} bks × Rp{plasticPerPcs || 0} = <strong className="text-foreground">{formatRupiah(packagingCostNum)}</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Biaya Stiker Label / Bungkus (Rp) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={labelPerPcs}
                        onChange={(e) => setLabelPerPcs(e.target.value)}
                        placeholder="Contoh: 50"
                        className="w-full px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-semibold"
                      />
                      <p className="text-[10px] text-muted mt-1">
                        Total: {actualPacksNum} bks × Rp{labelPerPcs || 0} = <strong className="text-foreground">{formatRupiah(labelCostNum)}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Total Biaya Plastik Kemasan (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={customPackagingCost}
                        onChange={(e) => setCustomPackagingCost(e.target.value)}
                        placeholder="Contoh: 2880"
                        className="w-full px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Total Biaya Stiker & Label (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={customLabelCost}
                        onChange={(e) => setCustomLabelCost(e.target.value)}
                        placeholder="Contoh: 2400"
                        className="w-full px-3 py-1.5 bg-surface border border-line rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">
                    Biaya Tambahan Lainnya (Opsional, Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 bg-surface border border-line rounded-xl text-xs"
                  />
                </div>

                {/* TOTAL HPP SUMMARY */}
                <div className="p-3.5 rounded-2xl bg-surface border border-line space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Total Biaya Produksi:</span>
                    <span className="font-bold text-foreground text-sm">
                      {formatRupiah(totalProductionCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-line">
                    <span className="font-bold text-primary">HPP per Bungkus Layak Jual:</span>
                    <span className="text-base font-extrabold text-primary">
                      {formatRupiah(cogsPerPack)} / bks
                    </span>
                  </div>
                  <p className="text-[10px] text-muted italic">
                    * Rumus: (Biaya Bahan {formatRupiah(rawCostNum)} + Kemasan {formatRupiah(packagingCostNum)} + Stiker {formatRupiah(labelCostNum)}) ÷ {actualPacksNum} bungkus
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isStockSufficient}
                  isLoading={isSubmitting}
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Konfirmasi & Potong Stok Bahan</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
