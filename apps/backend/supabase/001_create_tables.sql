-- ============================================
-- Calorie Coach — Supabase Veritabanı Kurulumu
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Enum tipleri oluştur
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE goal_type AS ENUM ('lose', 'maintain', 'gain');
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- 2. Kullanıcı Profili tablosu
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 10 AND age <= 120),
  gender gender_type NOT NULL,
  weight REAL NOT NULL CHECK (weight >= 20 AND weight <= 300),
  height REAL NOT NULL CHECK (height >= 100 AND height <= 250),
  activity_level activity_level NOT NULL DEFAULT 'moderate',
  goal goal_type NOT NULL DEFAULT 'maintain',
  daily_calorie_goal INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calorie_goal >= 800 AND daily_calorie_goal <= 6000),
  macro_goals JSONB DEFAULT '{"protein": 150, "carbs": 250, "fat": 65, "fiber": 25}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Öğünler tablosu
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  type meal_type NOT NULL,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0, "fiber": 0}'::jsonb,
  date TEXT NOT NULL, -- "2025-03-29" formatında
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Yiyecek öğeleri tablosu
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  portion TEXT NOT NULL,
  calories INTEGER NOT NULL,
  macros JSONB NOT NULL,
  confidence confidence_level NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. İndeksler (performans için)
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_food_items_meal_id ON food_items(meal_id);

-- 6. updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: users_profile güncelleme
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
