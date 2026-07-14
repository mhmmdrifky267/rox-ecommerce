// app/(seller)/dashboard/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

type StoreProfile = {
  storeName: string;
  description: string | null;
  storeAddress: string | null;
  storeCity: string | null;
  storePostalCode: string | null;
};

export default function SellerProfilePage() {
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    storeAddress: "",
    storeCity: "",
    storePostalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/seller/profile");
      if (res.ok) {
        const data: StoreProfile = await res.json();
        setForm({
          storeName: data.storeName ?? "",
          description: data.description ?? "",
          storeAddress: data.storeAddress ?? "",
          storeCity: data.storeCity ?? "",
          storePostalCode: data.storePostalCode ?? "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const res = await fetch("/api/seller/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error
          : Object.values(data.error).flat().join(", ")
      );
      return;
    }

    setSuccess(true);
  }

  if (loading) return <div className="py-10 text-center">Memuat...</div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Profil Toko</h1>
      <p className="mb-6 text-sm text-gray-500">
        Lengkapi alamat toko kamu — ini dipakai untuk menghitung ongkos
        kirim ke pembeli. Tanpa ini, produk kamu tidak bisa dibeli.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nama Toko</label>
          <input
            required
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Deskripsi Toko
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Alamat Lengkap Gudang/Toko
          </label>
          <textarea
            required
            rows={2}
            value={form.storeAddress}
            onChange={(e) =>
              setForm({ ...form, storeAddress: e.target.value })
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Kota</label>
            <input
              required
              value={form.storeCity}
              onChange={(e) =>
                setForm({ ...form, storeCity: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Kode Pos
            </label>
            <input
              required
              placeholder="cth. 40123"
              value={form.storePostalCode}
              onChange={(e) =>
                setForm({ ...form, storePostalCode: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Profil toko tersimpan!</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-black px-6 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}