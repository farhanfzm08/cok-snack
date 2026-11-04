"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LogIn, Store } from "lucide-react";
import { getLocalSettings, syncStoreSettings } from "@/lib/settings";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("COK Snack");
  const [tagline, setTagline] = useState("Cemilan Orang Kaya");

  useEffect(() => {
    const s = getLocalSettings();
    setStoreName(s.storeName);
    setTagline(s.tagline);

    syncStoreSettings().then((cloud) => {
      if (cloud) {
        setStoreName(cloud.storeName);
        setTagline(cloud.tagline);
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#E8E0F8] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C4B0F0]/40">
            <Store className="w-8 h-8 text-[#7C5CBF]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{storeName}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{tagline}</p>
          <p className="text-xs text-gray-400 mt-1">Sistem Manajemen Bisnis Snack</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Selamat Datang!</h2>
          <p className="text-sm text-gray-500 mb-6">Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4B0F0] focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4B0F0] focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C5CBF] hover:bg-[#6B4DAF] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Sedang Masuk..." : "Masuk"}
            </button>
          </form>

          {/* Role Info */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Akses berdasarkan role akun:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#E8E0F8] rounded-xl p-2.5 text-center">
                <p className="text-xs font-bold text-[#7C5CBF]">👑 Owner</p>
                <p className="text-[10px] text-[#7C5CBF]/70 mt-0.5">Akses Penuh</p>
              </div>
              <div className="bg-[#DDF3E4] rounded-xl p-2.5 text-center">
                <p className="text-xs font-bold text-green-700">⚙️ Admin</p>
                <p className="text-[10px] text-green-600/70 mt-0.5">Operasional</p>
              </div>
              <div className="bg-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-xs font-bold text-blue-700">🧾 Kasir</p>
                <p className="text-[10px] text-blue-600/70 mt-0.5">Hanya POS</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} {storeName} ({tagline})
        </p>
      </div>
    </div>
  );
}
