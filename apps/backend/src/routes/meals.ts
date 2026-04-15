import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc } from "drizzle-orm";
import { db, schema } from "../db/client";
import { authMiddleware, type AuthEnv } from "../middleware/auth";

export const mealRoutes = new Hono<AuthEnv>();

// Tüm meal route'larına auth uygula
mealRoutes.use("*", authMiddleware);

// --- Validasyon Şemaları ---

const macrosSchema = z.object({
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
});

const foodItemSchema = z.object({
  foodName: z.string().min(1),
  offCode: z.string().optional().nullable(),
  portionGram: z.number().min(0),
  calories: z.number().min(0),
  macros: macrosSchema,
  imageUrl: z.string().optional().nullable(), // URL validasyonu bazen boş string'lerde hata verebiliyor
  confidence: z.enum(["high", "medium", "low"]).default("high"),
  notes: z.string().nullable().optional(),
});

const createMealSchema = z.object({
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foods: z.array(foodItemSchema).min(1, "En az bir besin ekleyin"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı: YYYY-MM-DD"),
});

// POST /meals — Yeni öğün kaydet
mealRoutes.post(
  "/",
  zValidator("json", createMealSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "Geçersiz istek", details: result.error.issues },
        400
      );
    }
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      const { type, foods, date } = c.req.valid("json");

      // Toplam kalori ve makro hesapla (Yuvarlayarak tamsayı garantisi sağla)
      const totalCalories = Math.round(foods.reduce((sum, f) => sum + f.calories, 0));
      const totalMacros = foods.reduce(
        (acc, f) => ({
          protein: acc.protein + (f.macros.protein || 0),
          carbs: acc.carbs + (f.macros.carbs || 0),
          fat: acc.fat + (f.macros.fat || 0),
          fiber: acc.fiber + (f.macros.fiber || 0),
        }),
        { protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      // Öğünü veritabanına kaydet
      const [meal] = await db
        .insert(schema.meals)
        .values({
          userId,
          type,
          totalCalories,
          totalMacros,
          date,
        })
        .returning();

      // Yiyecekleri kaydet (DB'deki integer kısıtları için değerleri yuvarla)
      const foodRecords = await db
        .insert(schema.foodItems)
        .values(
          foods.map((food) => ({
            mealId: meal.id,
            foodName: food.foodName,
            offCode: food.offCode || null,
            portionGram: Math.round(food.portionGram),
            calories: Math.round(food.calories),
            macros: food.macros,
            imageUrl: food.imageUrl || null,
            confidence: food.confidence || "high",
            notes: food.notes || null,
          }))
        )
        .returning();

      return c.json(
        {
          success: true,
          data: {
            ...meal,
            foods: foodRecords,
          },
        },
        201
      );
    } catch (error) {
      console.error("[Meals] Kayıt hatası:", error);
      return c.json({ error: "Öğün kaydedilemedi" }, 500);
    }
  }
);

// GET /meals?date=2025-03-29 — Güne göre öğünleri getir
mealRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const date = c.req.query("date");

    if (!date) {
      return c.json({ error: "Tarih parametresi gerekli (?date=YYYY-MM-DD)" }, 400);
    }

    const userMeals = await db.query.meals.findMany({
      where: and(
        eq(schema.meals.userId, userId),
        eq(schema.meals.date, date)
      ),
      orderBy: [desc(schema.meals.createdAt)],
    });

    // Her öğünün yiyeceklerini getir
    const mealsWithFoods = await Promise.all(
      userMeals.map(async (meal) => {
        const foods = await db.query.foodItems.findMany({
          where: eq(schema.foodItems.mealId, meal.id),
        });
        return { ...meal, foods };
      })
    );

    return c.json({
      success: true,
      data: mealsWithFoods,
    });
  } catch (error) {
    console.error("[Meals] Getirme hatası:", error);
    return c.json({ error: "Öğünler getirilemedi" }, 500);
  }
});

// DELETE /meals/:id — Öğün sil
mealRoutes.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const mealId = c.req.param("id");

    // Öğünün bu kullanıcıya ait olduğunu doğrula
    const meal = await db.query.meals.findFirst({
      where: and(
        eq(schema.meals.id, mealId),
        eq(schema.meals.userId, userId)
      ),
    });

    if (!meal) {
      return c.json({ error: "Öğün bulunamadı" }, 404);
    }

    // Cascade ile foodItems da silinir
    await db.delete(schema.meals).where(eq(schema.meals.id, mealId));

    return c.json({ success: true, message: "Öğün silindi" });
  } catch (error) {
    console.error("[Meals] Silme hatası:", error);
    return c.json({ error: "Öğün silinemedi" }, 500);
  }
});

// GET /meals/summary?range=week — Haftalık/aylık özet
mealRoutes.get("/summary", async (c) => {
  try {
    const userId = c.get("userId");
    const range = c.req.query("range") || "week";

    // Tarih aralığını hesapla
    const now = new Date();
    const daysBack = range === "month" ? 30 : 7;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = now.toISOString().split("T")[0];

    // Aralıktaki tüm öğünleri getir
    const userMeals = await db.query.meals.findMany({
      where: eq(schema.meals.userId, userId),
    });

    // Tarih filtreleme (string karşılaştırma)
    const filteredMeals = userMeals.filter(
      (m) => m.date >= startDateStr && m.date <= endDateStr
    );

    // Günlük toplam hesapla
    const dailySummary = filteredMeals.reduce(
      (acc, meal) => {
        if (!acc[meal.date]) {
          acc[meal.date] = {
            date: meal.date,
            totalCalories: 0,
            totalMacros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
            mealCount: 0,
          };
        }
        acc[meal.date].totalCalories += meal.totalCalories;
        acc[meal.date].mealCount++;
        if (meal.totalMacros && typeof meal.totalMacros === "object") {
          const macros = meal.totalMacros as { protein: number; carbs: number; fat: number; fiber: number };
          acc[meal.date].totalMacros.protein += macros.protein || 0;
          acc[meal.date].totalMacros.carbs += macros.carbs || 0;
          acc[meal.date].totalMacros.fat += macros.fat || 0;
          acc[meal.date].totalMacros.fiber += macros.fiber || 0;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return c.json({
      success: true,
      data: {
        range,
        startDate: startDateStr,
        endDate: endDateStr,
        days: Object.values(dailySummary),
        totalMeals: filteredMeals.length,
        averageCalories:
          filteredMeals.length > 0
            ? Math.round(
                filteredMeals.reduce((sum, m) => sum + m.totalCalories, 0) /
                  Object.keys(dailySummary).length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("[Meals] Özet hatası:", error);
    return c.json({ error: "Özet hesaplanamadı" }, 500);
  }
});
