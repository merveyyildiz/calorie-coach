import { Hono } from "hono";
import { searchFoods } from "../services/foodSearch";
import { authMiddleware, AuthEnv } from "../middleware/auth";

// USER RULE: Magic strings defined as constants
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PAGE = 1;

const food = new Hono<AuthEnv>();

// All requests require a valid session
food.use("*", authMiddleware);

food.get("/search", async (c) => {
  const q = c.req.query("q");
  const page = Number(c.req.query("page") ?? String(DEFAULT_PAGE));

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return c.json({ error: "En az 2 karakter girin" }, 400);
  }

  try {
    const results = await searchFoods(q.trim(), page);
    return c.json({ results });
  } catch (error: any) {
    console.error(`[FoodRoute] Arama hatası:`, error);
    return c.json(
      {
        error: "Besin araması başarısız oldu",
        message: error.message,
        debug: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      500,
    );
  }
});

export default food;
