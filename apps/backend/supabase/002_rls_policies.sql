-- ============================================
-- Calorie Coach — Row Level Security (RLS)
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- ==========================================
-- 1. users_profile tablosu için RLS
-- ==========================================
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi profilini okuyabilir
CREATE POLICY "Kullanıcı kendi profilini okuyabilir"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcı kendi profilini oluşturabilir
CREATE POLICY "Kullanıcı kendi profilini oluşturabilir"
  ON users_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Kullanıcı kendi profilini silebilir
CREATE POLICY "Kullanıcı kendi profilini silebilir"
  ON users_profile FOR DELETE
  USING (auth.uid() = id);

-- ==========================================
-- 2. meals tablosu için RLS
-- ==========================================
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi öğünlerini okuyabilir
CREATE POLICY "Kullanıcı kendi öğünlerini okuyabilir"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcı kendi öğünlerini ekleyebilir
CREATE POLICY "Kullanıcı kendi öğünlerini ekleyebilir"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi öğünlerini güncelleyebilir
CREATE POLICY "Kullanıcı kendi öğünlerini güncelleyebilir"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

-- Kullanıcı kendi öğünlerini silebilir
CREATE POLICY "Kullanıcı kendi öğünlerini silebilir"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. food_items tablosu için RLS
-- ==========================================
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi yiyeceklerini okuyabilir (meal üzerinden)
CREATE POLICY "Kullanıcı kendi yiyeceklerini okuyabilir"
  ON food_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = food_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Kullanıcı kendi öğününe yiyecek ekleyebilir
CREATE POLICY "Kullanıcı kendi öğününe yiyecek ekleyebilir"
  ON food_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = food_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Kullanıcı kendi yiyeceklerini güncelleyebilir
CREATE POLICY "Kullanıcı kendi yiyeceklerini güncelleyebilir"
  ON food_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = food_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Kullanıcı kendi yiyeceklerini silebilir
CREATE POLICY "Kullanıcı kendi yiyeceklerini silebilir"
  ON food_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = food_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- ==========================================
-- 4. Service Role bypass (backend için)
-- ==========================================
-- Not: Backend service_role key kullandığı için
-- RLS otomatik olarak bypass edilir.
-- Bu sayede backend tüm kullanıcı verilerine erişebilir.
