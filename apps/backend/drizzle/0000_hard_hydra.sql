CREATE TYPE "public"."activity_level" AS ENUM('sedentary', 'light', 'moderate', 'active', 'very_active');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."gender_type" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('lose', 'maintain', 'gain');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TABLE "food_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"food_name" text NOT NULL,
	"off_code" text,
	"portion_gram" integer DEFAULT 100 NOT NULL,
	"calories" integer NOT NULL,
	"macros" jsonb NOT NULL,
	"image_url" text,
	"confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "meal_type" NOT NULL,
	"total_calories" integer DEFAULT 0 NOT NULL,
	"total_macros" jsonb DEFAULT '{"protein":0,"carbs":0,"fat":0,"fiber":0}'::jsonb,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender_type" NOT NULL,
	"weight" real NOT NULL,
	"height" real NOT NULL,
	"activity_level" "activity_level" DEFAULT 'moderate' NOT NULL,
	"goal" "goal_type" DEFAULT 'maintain' NOT NULL,
	"daily_calorie_goal" integer DEFAULT 2000 NOT NULL,
	"macro_goals" jsonb DEFAULT '{"protein":150,"carbs":250,"fat":65,"fiber":25}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_users_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_profile"("id") ON DELETE no action ON UPDATE no action;