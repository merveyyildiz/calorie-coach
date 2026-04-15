import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/client";
import { authMiddleware, type AuthEnv } from "../middleware/auth";

export const profileRoutes = new Hono<AuthEnv>();

// Tüm profile route'larına auth uygula
profileRoutes.use("*", authMiddleware);

// --- Validasyon Şemaları ---

const createProfileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  age: z.number().int().min(10).max(120),
  gender: z.enum(["male", "female"]),
  weight: z.number().min(20).max(300),
  height: z.number().min(100).max(250),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  dailyCalorieGoal: z.number().int().min(800).max(6000),
  macroGoals: z.object({
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0),
  }).optional(),
});

const updateProfileSchema = createProfileSchema.partial();

// POST /profile — Onboarding sırasında profil oluştur
profileRoutes.post(
  "/",
  zValidator("json", createProfileSchema, (result, c) => {
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
      const profileData = c.req.valid("json");

      // Profil zaten var mı kontrol et
      const existing = await db.query.usersProfile.findFirst({
        where: eq(schema.usersProfile.id, userId),
      });

      if (existing) {
        // Varsa güncelle
        const [updated] = await db
          .update(schema.usersProfile)
          .set({
            ...profileData,
            updatedAt: new Date(),
          })
          .where(eq(schema.usersProfile.id, userId))
          .returning();

        return c.json({ success: true, data: updated });
      }

      // Yoksa oluştur
      const [profile] = await db
        .insert(schema.usersProfile)
        .values({
          id: userId,
          ...profileData,
          macroGoals: profileData.macroGoals || {
            protein: 150,
            carbs: 250,
            fat: 65,
            fiber: 25,
          },
        })
        .returning();

      return c.json({ success: true, data: profile }, 201);
    } catch (error) {
      console.error("[Profile] Oluşturma hatası:", error);
      return c.json({ error: "Profil oluşturulamadı" }, 500);
    }
  }
);

// GET /profile — Profil getir
profileRoutes.get("/", async (c) => {
  try {
    const userId = c.get("userId");

    const profile = await db.query.usersProfile.findFirst({
      where: eq(schema.usersProfile.id, userId),
    });

    if (!profile) {
      return c.json({ error: "Profil bulunamadı", needsOnboarding: true }, 404);
    }

    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error("[Profile] Getirme hatası:", error);
    return c.json({ error: "Profil getirilemedi" }, 500);
  }
});

// PUT /profile — Profil güncelle
profileRoutes.put(
  "/",
  zValidator("json", updateProfileSchema, (result, c) => {
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
      const updates = c.req.valid("json");

      const [updated] = await db
        .update(schema.usersProfile)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(schema.usersProfile.id, userId))
        .returning();

      if (!updated) {
        return c.json({ error: "Profil bulunamadı" }, 404);
      }

      return c.json({ success: true, data: updated });
    } catch (error) {
      console.error("[Profile] Güncelleme hatası:", error);
      return c.json({ error: "Profil güncellenemedi" }, 500);
    }
  }
);
