import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// PostgreSQL bağlantısı (Supabase)
const connectionString = process.env.DATABASE_URL!;

// postgres.js istemcisi
const client = postgres(connectionString, {
  max: 10, // Bağlantı havuzu boyutu
  idle_timeout: 20,
  connect_timeout: 10,
});

// Drizzle ORM istemcisi
export const db = drizzle(client, { schema });

export { schema };
