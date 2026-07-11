// app/(shop)/checkout/page.tsx
//
// Alur halaman ini:
// 1. Muat cart (dikelompokkan per toko) + daftar alamat user
// 2. User pilih alamat pengiriman
// 3. Untuk tiap toko, user klik "Cek Ongkir" -> panggil Biteship -> pilih kurir
// 4. Setelah SEMUA toko sudah pilih kurir, tombol "Bayar" aktif
// 5. Klik bayar -> buat Order (satu per toko) -> dapat Snap token per Order
//    -> tampilkan popup pembayaran Midtrans satu per satu

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type CartGroup = {
  sellerId: string;
  storeName: string;
  itemsTotal: number;
  totalWeight: number;
  items: {
    id: string;
    qty: number;
    variant: {
      size: string | null;
      color: string | null;
      product: {
        name: string;
        price: number;
        weight: number;
        images: { url: string }[];
      };
    };
  }[];
};

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

type CourierRate = {
  courier_name: string;
  courier_service_name: string;
  duration: string;
  price: number;
};

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<CartGroup[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Nyimpan hasil cek ongkir & kurir yang dipilih, per sellerId
  const [rates, setRates] = useState<Record<string, CourierRate[]>>({});
  const [checkingRates, setCheckingRates] = useState<string | null>(null); // sellerId yang sedang loading
  const [selectedCourier, setSelectedCourier] = useState<
    Record<string, CourierRate>
  >({});

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [summaryRes, addressRes] = await Promise.all([
        fetch("/api/checkout/summary"),
        fetch("/api/addresses"),
      ]);

      if (summaryRes.ok) setGroups(await summaryRes.json());
      if (addressRes.ok) {
        const data: Address[] = await addressRes.json();
        setAddresses(data);
        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleCheckRates(group: CartGroup) {
    if (!selectedAddressId) {
      setError("Pilih alamat pengiriman dulu");
      return;
    }
    setError(null);
    setCheckingRates(group.sellerId);

    const res = await fetch("/api/shipping/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddressId,
        sellerId: group.sellerId,
        items: group.items.map((item) => ({
          name: item.variant.product.name,
          value: item.variant.product.price,
          weight: item.variant.product.weight,
          quantity: item.qty,
        })),
      }),
    });

    setCheckingRates(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal cek ongkir");
      return;
    }

    const data: CourierRate[] = await res.json();
    setRates((prev) => ({ ...prev, [group.sellerId]: data }));
  }

  function handleSelectCourier(sellerId: string, rate: CourierRate) {
    setSelectedCourier((prev) => ({ ...prev, [sellerId]: rate }));
  }

  const allCourierSelected =
    groups.length > 0 && groups.every((g) => selectedCourier[g.sellerId]);

  const grandTotal =
    groups.reduce((sum, g) => sum + g.itemsTotal, 0) +
    Object.values(selectedCourier).reduce((sum, c) => sum + c.price, 0);

  async function handlePay() {
    if (!selectedAddressId || !allCourierSelected) return;
    setPaying(true);
    setError(null);

    const shipments = groups.map((g) => ({
      sellerId: g.sellerId,
      courierName: selectedCourier[g.sellerId].courier_name,
      courierService: selectedCourier[g.sellerId].courier_service_name,
      shippingCost: selectedCourier[g.sellerId].price,
    }));

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: selectedAddressId, shipments }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Checkout gagal");
      setPaying(false);
      return;
    }

    const { paymentSessions } = await res.json();

    // Tampilkan popup Midtrans SATU PER SATU (kalau lebih dari 1 toko).
    // Setelah satu selesai/ditutup, baru lanjut ke sesi berikutnya.
    async function processNext(index: number) {
      if (index >= paymentSessions.length) {
        router.push("/orders");
        return;
      }

      const session = paymentSessions[index];
      window.snap.pay(session.snapToken, {
        onSuccess: () => processNext(index + 1),
        onPending: () => processNext(index + 1),
        onError: () => processNext(index + 1),
        onClose: () => processNext(index + 1),
      });
    }

    processNext(0);
  }

  if (loading) return <div className="py-10 text-center">Memuat checkout...</div>;

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        Keranjang kamu kosong.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

        {/* ---- Pilih alamat ---- */}
        <div className="mb-6 rounded-md border p-4">
          <p className="mb-3 font-medium">Alamat Pengiriman</p>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">
              Kamu belum punya alamat.{" "}
              <a href="/profile" className="text-blue-600 underline">
                Tambah alamat dulu
              </a>
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <input
                    type="radio"
                    checked={selectedAddressId === address.id}
                    onChange={() => {
                      setSelectedAddressId(address.id);
                      setRates({});
                      setSelectedCourier({});
                    }}
                  />
                  <span>
                    <strong>{address.label}</strong> — {address.recipient},{" "}
                    {address.fullAddress}, {address.city} {address.postalCode}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ---- Per toko: item + ongkir ---- */}
        {groups.map((group) => (
          <div key={group.sellerId} className="mb-6 rounded-md border p-4">
            <p className="mb-3 font-semibold">{group.storeName}</p>

            <div className="space-y-2">
              {group.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.variant.product.name}
                    {item.variant.size && ` (${item.variant.size})`} x{item.qty}
                  </span>
                  <span>
                    Rp
                    {(item.variant.product.price * item.qty).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium">
              <span>Subtotal</span>
              <span>Rp{group.itemsTotal.toLocaleString("id-ID")}</span>
            </div>

            {/* Ongkir */}
            <div className="mt-4">
              {!rates[group.sellerId] ? (
                <button
                  onClick={() => handleCheckRates(group)}
                  disabled={checkingRates === group.sellerId}
                  className="text-sm text-blue-600"
                >
                  {checkingRates === group.sellerId
                    ? "Mengecek ongkir..."
                    : "Cek Ongkir"}
                </button>
              ) : (
                <div className="space-y-1">
                  {rates[group.sellerId].map((rate, i) => (
                    <label
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`courier-${group.sellerId}`}
                          checked={
                            selectedCourier[group.sellerId]?.courier_service_name ===
                            rate.courier_service_name
                          }
                          onChange={() => handleSelectCourier(group.sellerId, rate)}
                        />
                        {rate.courier_name.toUpperCase()} - {rate.courier_service_name}{" "}
                        <span className="text-gray-400">({rate.duration})</span>
                      </span>
                      <span>Rp{rate.price.toLocaleString("id-ID")}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-lg font-semibold">
            Total: Rp{grandTotal.toLocaleString("id-ID")}
          </p>
          <button
            onClick={handlePay}
            disabled={!allCourierSelected || paying}
            className="rounded-md bg-black px-6 py-2 text-white disabled:opacity-40"
          >
            {paying ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </>
  );
}