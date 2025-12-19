import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

const envPath = resolve(__dirname, "../../.env.local");
config({ path: envPath });

export default defineConfig({
  schema: "./src/auth-db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_AUTH_DB_URL!,
  },
});
