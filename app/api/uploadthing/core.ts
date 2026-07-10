// app/api/uploadthing/core.ts
//
// "FileRouter" ini mendefinisikan aturan upload: siapa yang boleh upload,
// tipe file apa, ukuran maksimal berapa. Middleware di bawah berjalan di
// SERVER sebelum file diterima — ini tempat kita cek "apakah orang ini
// benar-benar seller yang sudah disetujui?"

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user || session.user.role !== "SELLER") {
        // Melempar error di sini otomatis membatalkan upload
        throw new UploadThingError("Hanya seller yang boleh upload gambar produk");
      }

      if (!session.user.sellerId) {
        throw new UploadThingError("Akun seller kamu belum lengkap");
      }

      // Apapun yang di-return di sini bisa diakses di onUploadComplete
      return { sellerId: session.user.sellerId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload selesai untuk seller:", metadata.sellerId);
      console.log("URL file:", file.url);

      // Return value ini dikirim balik ke client (dipakai untuk simpan URL ke form)
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;