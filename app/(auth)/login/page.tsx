// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
      return;
    }

    router.push("/");
    router.refresh();
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

      <p className="font-display mb-1 text-[22px] font-extrabold">Masuk ke akun</p>
      <p className="mb-6 text-[12.5px]" style={{ color: "var(--gray)" }}>
        Belanja &amp; jual produk fashion pilihan.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Kata Sandi</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-5 flex justify-end">
          <Link
            href="/forgot-password"
            className="font-mono text-[11px]"
            style={{ color: "var(--stamp-blue)" }}
          >
            Lupa sandi?
          </Link>
        </div>

        {error && (
          <p className="mb-4 text-[12.5px]" style={{ color: "var(--stamp-red)" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <hr className="divider-dash" />

        <p className="text-center text-[12.5px]" style={{ color: "var(--gray)" }}>
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold" style={{ color: "var(--ink)" }}>
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}