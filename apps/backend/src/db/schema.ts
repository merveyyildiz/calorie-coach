import { pgTable, uuid, text, integer, real, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enum tanımları
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);
export const confidenceEnum = pgEnum("confidence_level", ["high", "medium", "low"]);
export const activityLevelEnum = pgEnum("activity_level", ["sedentary", "light", "moderate", "active", "very_active"]);
export const goalEnum = pgEnum("goal_type", ["lose", "maintain", "gain"]);
export const genderEnum = pgEnum("gender_type", ["male", "female"]);

// Kullanıcı Profili tablosu
export const usersProfile = pgTable("users_profile", {
  id: uuid("id").primaryKey(), // FK → auth.users
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  weight: real("weight").notNull(),
  height: real("height").notNull(),
  activityLevel: activityLevelEnum("activity_level").notNull().default("moderate"),
  goal: goalEnum("goal").notNull().default("maintain"),
  dailyCalorieGoal: integer("daily_calorie_goal").notNull().default(2000),
  macroGoals: jsonb("macro_goals").$type<{
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>().default({ protein: 150, carbs: 250, fat: 65, fiber: 25 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Öğünler tablosu
export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersProfile.id),
  type: mealTypeEnum("type").notNull(),
  totalCalories: integer("total_calories").notNull().default(0),
  totalMacros: jsonb("total_macros").$type<{
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>().default({ protein: 0, carbs: 0, fat: 0, fiber: 0 }),
  date: text("date").notNull(), // "2025-03-29" formatında
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Yiyecek öğeleri tablosu
export const foodItems = pgTable("food_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  mealId: uuid("meal_id").notNull().references(() => meals.id, { onDelete: "cascade" }),
  foodName: text("food_name").notNull(),
  offCode: text("off_code"), // Open Food Facts ürün kodu
  portionGram: integer("portion_gram").notNull().default(100),
  calories: integer("calories").notNull(),
  macros: jsonb("macros").$type<{
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>().notNull(),
  imageUrl: text("image_url"),
  confidence: confidenceEnum("confidence").notNull().default("medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tip dışa aktarmaları
export type UserProfile = typeof usersProfile.$inferSelect;
export type NewUserProfile = typeof usersProfile.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type FoodItem = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;
