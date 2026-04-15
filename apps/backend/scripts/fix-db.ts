import "dotenv/config";
import postgres from "postgres";

async function main() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[Script] DATABASE_URL bulunamadı!");
    process.exit(1);
  }

  // PgBouncer (6543) yerine doğrudan port (5432) kullanmayı dene
  url = url.replace(":6543", ":5432");

  console.log("[Script] Veritabanına (Port 5432) bağlanılıyor...");
  const sql_client = postgres(url, { ssl: "require", connect_timeout: 10 });
  
  try {
    console.log("[Script] Sütunlar ekleniyor...");
    
    await sql_client`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS off_code TEXT;`;
    console.log("[Script] 'off_code' eklendi.");
    
    await sql_client`ALTER TABLE food_items ADD COLUMN IF NOT EXISTS portion_gram INTEGER DEFAULT 100;`;
    console.log("[Script] 'portion_gram' eklendi.");
    
    console.log("[Script] Tüm işlemler başarıyla tamamlandı.");
    await sql_client.end();
    process.exit(0);
  } catch (err) {
    console.error("[Script] Hata:", err);
    await sql_client.end();
    process.exit(1);
  }
}

main();
