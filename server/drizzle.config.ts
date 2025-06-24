import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: "../.env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default {
  // Point schema to the DIRECTORY containing all individual *.schema.ts files
  schema: "./src/db/schema/",
  // Point out to the directory where SQL migrations should be GENERATED
  out: "./drizzle/migrations",
  dialect: "postgresql",
  // Add this line to only manage the 'public' schema
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
