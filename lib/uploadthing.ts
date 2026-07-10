// lib/uploadthing.ts
//
// Kenapa dibungkus lagi di sini? Supaya komponen <UploadButton /> di seluruh
// aplikasi otomatis tahu tipe route ("productImage") tanpa perlu import
// OurFileRouter berulang-ulang di tiap file.

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();