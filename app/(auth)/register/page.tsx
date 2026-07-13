// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeCity: "",
    storePostalCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error
          : Object.values(data.error).flat().join(", ")
      );
      return;
    }

    router.push("/login");
  }

  return (
    <div
      className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm flex-col justify-center px-6 py-10"
      style={{ background: "var(--canvas)" }}
    >
      <Link href="/" className="wordmark mb-8">
        R.O.X.
        <small>MARKETPLACE FASHION</small>
      </Link>

      <p className="font-display mb-1 text-[22px] font-extrabold">Buat akun</p>
      <p className="mb-6 text-[12.5px]" style={{ color: "var(--gray)" }}>
        Daftar sebagai pembeli atau penjual.
      </p>

      {/* Pilihan role pakai gaya "tag" — konsisten dengan filter chip di katalog */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setRole("BUYER")}
          className={role === "BUYER" ? "tag" : "tag tag-ghost"}
        >
          Pembeli
        </button>
        <button
          type="button"
          onClick={() => setRole("SELLER")}
          className={role === "SELLER" ? "tag" : "tag tag-ghost"}
        >
          Penjual
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Nama</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Kata Sandi</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {role === "SELLER" && (
          <>
            <div className="field">
              <label>Nama Toko</label>
              <input
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label>Kota Toko</label>
                <input
                  required
                  value={form.storeCity}
                  onChange={(e) => setForm({ ...form, storeCity: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Kode Pos</label>
                <input
                  required
                  placeholder="40123"
                  value={form.storePostalCode}
                  onChange={(e) =>
                    setForm({ ...form, storePostalCode: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="-mt-2 mb-4 text-[11px]" style={{ color: "var(--gray)" }}>
              Dipakai untuk menghitung ongkos kirim ke pembeli.
            </p>
          </>
        )}

        {error && (
          <p className="mb-4 text-[12.5px]" style={{ color: "var(--stamp-red)" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <hr className="divider-dash" />

        <p className="text-center text-[12.5px]" style={{ color: "var(--gray)" }}>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold" style={{ color: "var(--ink)" }}>
            Masuk
          </Link>
        </p>
      </form>
    </div>
  );
}