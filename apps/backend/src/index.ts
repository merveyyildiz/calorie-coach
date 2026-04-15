import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import "dotenv/config";

import { mealRoutes } from "./routes/meals";
import { profileRoutes } from "./routes/profile";
import food from "./routes/food";
import { db } from "./db/client";
import { sql } from "drizzle-orm";

// Hono app oluştur
const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:8081", "http://localhost:19006", "exp://localhost:8081"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    name: "Calorie Coach API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Route'ları bağla
app.route("/food", food);
app.route("/meals", mealRoutes);
app.route("/profile", profileRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Endpoint bulunamadı" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Sunucu hatası:", err);
  return c.json(
    {
      error: "Sunucu hatası",
      message: process.env.NODE_ENV === "development" ? err.message : "Bir hata oluştu",
    },
    500
  );
});

// --- OTOMATIK VERITABANI DUZELTME (TEMP) ---
async function bootstrap() {
  console.log("🛠️ Veritabanı şeması kontrol ediliyor...");
  try {
    // food_items tablosu için eksik olabilecek tüm sütunları tek tek kontrol et ve ekle
    await db.execute(sql`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS off_code TEXT;`);
    await db.execute(sql`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS portion_gram INTEGER DEFAULT 100;`);
    await db.execute(sql`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS image_url TEXT;`);
    await db.execute(sql`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS confidence confidence_level DEFAULT 'medium';`);
    await db.execute(sql`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS notes TEXT;`);
    
    // Eski portion (text) sütununu tamamen kaldır (valid syntax: DROP COLUMN IF EXISTS)
    await db.execute(sql`ALTER TABLE food_items DROP COLUMN IF EXISTS portion;`);
    
    console.log("✅ Veritabanı şeması başarıyla güncellendi.");
  } catch (err) {
    console.error("❌ Veritabanı şema güncelleme hatası:", err);
  }
}

bootstrap();

// Sunucuyu başlat
const port = parseInt(process.env.PORT || "3000");

console.log(`
🥗 Calorie Coach API
📍 http://localhost:${port}
🌍 Environment: ${process.env.NODE_ENV || "development"}
`);

serve({
  fetch: app.fetch,
  port,
});
