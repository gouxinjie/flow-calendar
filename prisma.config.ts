import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  /** datasource 的 url 由 schema.prisma 中 env("DATABASE_URL") 控制，此处不做覆盖 */
});
