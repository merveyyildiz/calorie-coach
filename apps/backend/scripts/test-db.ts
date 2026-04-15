import "dotenv/config";
import postgres from "postgres";

async function testConnection() {
  console.log("Testing pooler connection with object parameters...");
  const sql = postgres({
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    username: 'postgres.flzcnmvxglqikahtmqua',
    password: 'M3rv3252641!',
    ssl: 'require',
    prepare: false,
  });
  
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log("Success!", result);
    await sql.end();
  } catch (err) {
    console.error("Connection failed:", err);
    await sql.end();
  }
}

testConnection();
