import { Hono } from "hono";
import { searchFoods } from "../services/foodSearch";
import { authMiddleware, AuthEnv } from "../middleware/auth";

const food = new Hono<AuthEnv>();

// Tüm istekleri koruyoruz
food.use("*", authMiddleware);

food.get("/search", async (c) => {
  const q = c.req.query("q");
  const page = Number(c.req.query("page") ?? "1");

  if (!q || q.trim().length < 2) {
    return c.json({ error: "En az 2 karakter girin" }, 400);
  }

  try {
    const results = await searchFoods(q.trim(), page);
    return c.json({ results });
  } catch (error: any) {
    console.error(`[FoodRoute] Arama hatası detayı:`, error);
    return c.json({ 
      error: "Besin araması başarısız oldu", 
      message: error.message,
      debug: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, 500);
  }
});

export default food;
