// app/api/auth/[...nextauth]/route.ts
//
// File ini pendek karena semua logika sudah ada di auth.ts.
// Ini cuma "menyambungkan" Auth.js ke sistem routing Next.js.

// app/api/auth/[...nextauth]/route.ts
//
// auth.ts meng-export "handlers" (objek berisi GET & POST di dalamnya),
// bukan GET/POST langsung. Jadi kita ambil dulu, baru re-export.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;