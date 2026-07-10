// prisma.config.ts
// File ini menggantikan peran `url` yang dulu ada di dalam schema.prisma.
// Taruh file ini di ROOT project (sejajar dengan package.json), bukan di dalam folder prisma/.

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // dipakai nanti saat kita bikin seed data
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});