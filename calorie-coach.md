# 🥗 Calorie Coach — Geliştirme Rehberi (Open Food Facts Edition)

## 📌 Proje Özeti

**Uygulama Adı:** Calorie Coach  
**Platform:** React Native (iOS + Android)  
**Besin Verisi:** Open Food Facts API (ücretsiz, API anahtarı gerektirmez)  
**Amaç:** Kullanıcının besin adı yazarak arama yapması, listeden seçmesi ve günlük öğünlerini takip etmesi

---

## 🗺️ Fazlar

| Faz | Kapsam | Durum |
|-----|--------|-------|
| **Faz 1** | Auth (Login/Kayıt/Onboarding), besin arama (metin), öğün takibi | ✅ Aktif |
| **Faz 2** | Barkod tarama ile besin ekleme | 🔒 Sonraki |
| **Faz 3** | Özel besin oluşturma, tarif analizi, su takibi | 🔒 Sonraki |

---

## 🍎 Besin Verisi — Open Food Facts

### Neden Open Food Facts?

- Tamamen ücretsiz, API anahtarı gerektirmez
- 3 milyondan fazla ürün, Türkçe ürünler dahil
- Barkod desteği (Faz 2'de kullanılacak)
- Açık kaynak, topluluk katkılı

### Temel API Kullanımı

**Besin adına göre arama:**
```
GET https://world.openfoodfacts.org/cgi/search.pl
  ?search_terms=elma
  &search_simple=1
  &action=process
  &json=1
  &page_size=20
  &fields=product_name,nutriments,serving_size,image_url
```

**Barkod ile arama (Faz 2):**
```
GET https://world.openfoodfacts.org/api/v0/product/{barkod}.json
```

### Besin Servisi Kodu (Backend)

```typescript
// backend/src/services/foodSearch.ts

export interface OFFProduct {
  code: string;
  product_name: string;
  serving_size?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    "proteins_100g"?: number;
    "carbohydrates_100g"?: number;
    "fat_100g"?: number;
    "fiber_100g"?: number;
  };
  image_url?: string;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  servingSize: string;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  imageUrl?: string;
}

// Ham OFF verisini uygulama formatına dönüştür
function mapProduct(p: OFFProduct): FoodSearchResult {
  const n = p.nutriments;
  return {
    id: p.code || crypto.randomUUID(),
    name: p.product_name || "İsimsiz ürün",
    servingSize: p.serving_size || "100g",
    per100g: {
      calories: Math.round(n["energy-kcal_100g"] ?? 0),
      protein:  Math.round(n["proteins_100g"] ?? 0),
      carbs:    Math.round(n["carbohydrates_100g"] ?? 0),
      fat:      Math.round(n["fat_100g"] ?? 0),
      fiber:    Math.round(n["fiber_100g"] ?? 0),
    },
    imageUrl: p.image_url,
  };
}

export async function searchFoods(query: string, page = 1): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "20",
    page: String(page),
    fields: "code,product_name,nutriments,serving_size,image_url",
  });

  const res = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
    { headers: { "User-Agent": "NutriTrack/1.0" } } // OFF bunu istiyor
  );

  const data = await res.json();

  return (data.products as OFFProduct[])
    .filter((p) => p.product_name && p.nutriments["energy-kcal_100g"])
    .map(mapProduct);
}
```

### Porsiyon Hesaplama (Frontend)

Kullanıcı gramaj girdikten sonra kalori ve makrolar otomatik hesaplanır:

```typescript
// utils/nutrition.ts

export function calculateForPortion(
  per100g: FoodSearchResult["per100g"],
  grams: number
) {
  const ratio = grams / 100;
  return {
    calories: Math.round(per100g.calories * ratio),
    protein:  Math.round(per100g.protein  * ratio),
    carbs:    Math.round(per100g.carbs    * ratio),
    fat:      Math.round(per100g.fat      * ratio),
    fiber:    Math.round(per100g.fiber    * ratio),
  };
}
```

---

## 🛠️ Tech Stack

### Frontend — React Native

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **React Native** | 0.74+ | Mobil uygulama çatısı |
| **Expo** | SDK 51+ | Geliştirme ortamı, native modüller |
| **Expo Router** | v3 | Dosya tabanlı navigasyon (Next.js tarzı) |
| **TypeScript** | 5.x | Tip güvenliği |
| **Zustand** | 4.x | Hafif global state yönetimi |
| **React Query (TanStack)** | 5.x | Sunucu state, arama cache, loading/error yönetimi |
| **AsyncStorage** | 1.x | Lokal veri kalıcılığı |
| **React Native Reanimated** | 3.x | Akıcı animasyonlar |
| **React Native Gesture Handler** | 2.x | Swipe, drag-drop hareketleri |
| **Victory Native** | 40.x | Grafik ve chart bileşenleri |
| **NativeWind** | 4.x | Tailwind CSS benzeri stillendirme |
| **Expo Haptics** | — | Dokunsal geri bildirim |
| **@supabase/supabase-js** | 2.x | Supabase Auth + DB istemcisi |
| **expo-auth-session** | 5.x | OAuth akışı (Google Sign-In) |
| **expo-web-browser** | — | Google auth için in-app browser |
| **expo-secure-store** | — | Session token güvenli saklama |

### Backend — Node.js / Hono

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Node.js** | 20 LTS | Runtime |
| **Hono** | 4.x | Hafif, hızlı web framework |
| **TypeScript** | 5.x | Tip güvenliği |
| **Zod** | 3.x | Request/response validasyonu |
| **Supabase Auth** | — | JWT token doğrulama |
| **Drizzle ORM** | 0.3x | Type-safe veritabanı sorguları |
| **PostgreSQL** | 16 | Ana veritabanı (Supabase üzerinde) |
| **node-fetch / undici** | — | Open Food Facts API istekleri |

> ℹ️ Anthropic SDK bu projede kullanılmamaktadır.

### DevOps & Servisler

| Servis | Kullanım Amacı |
|--------|----------------|
| **Open Food Facts** | Besin veritabanı (ücretsiz, açık kaynak) |
| **Supabase** | PostgreSQL + Auth (e-posta & Google OAuth) |
| **Railway / Render** | Backend deploy |
| **Expo EAS** | Mobil uygulama build & deploy |

---

## 📐 Gerekli Beceriler (Skills)

### Frontend Geliştirici

- React Native bileşen mimarisi (functional components, hooks)
- TypeScript — interface, generic, utility types
- Expo Router ile sayfa yönetimi, deep linking ve koruma (protected routes)
- Supabase Auth — e-posta/şifre kaydı, oturum yönetimi, session dinleme
- Google OAuth — expo-auth-session + expo-web-browser entegrasyonu
- expo-secure-store ile token güvenli saklama
- Zustand ile global state tasarımı (authStore dahil)
- React Query ile API entegrasyonu — özellikle `useQuery` ile arama debounce
- AsyncStorage ile offline-first veri saklama
- Reanimated ile `useAnimatedStyle`, `withTiming`, `withSpring`
- NativeWind / StyleSheet ile responsive tasarım
- Victory Native ile bar chart, line chart, pie chart
- Hata yönetimi ve loading/skeleton state tasarımı

### Backend Geliştirici

- Hono ile RESTful API tasarımı
- Open Food Facts API entegrasyonu (fetch, veri dönüşümü, hata yönetimi)
- Zod ile şema validasyonu
- Supabase JWT doğrulama — `Authorization: Bearer` header middleware
- Drizzle ORM ile PostgreSQL sorguları
- Harici API proxy pattern (frontend'in direkt OFF'a bağlanmaması için)
- Supabase entegrasyonu (auth, veritabanı, RLS)

### Genel

- REST API tasarımı ve HTTP metodları
- JSON işleme ve tip dönüşümleri
- Git versiyon kontrolü
- Environment variable yönetimi (.env)
- Temel güvenlik: CORS, input sanitization, rate limiting

---

## 🏗️ Klasör Yapısı

```
nutritrack/
├── apps/
│   ├── mobile/                      # React Native (Expo)
│   │   ├── app/
│   │   │   ├── (auth)/              # Giriş yapılmamışsa burada
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── login.tsx        # Giriş ekranı
│   │   │   │   ├── register.tsx     # Kayıt ekranı
│   │   │   │   └── onboarding.tsx   # İsim, kilo, boy, yaş, hedef
│   │   │   ├── (tabs)/              # Ana uygulama — oturum açıksa
│   │   │   │   ├── index.tsx        # Dashboard
│   │   │   │   ├── add-meal.tsx     # Besin arama + öğün ekleme
│   │   │   │   ├── history.tsx      # Geçmiş öğünler
│   │   │   │   └── profile.tsx      # Profil & hedefler
│   │   │   └── _layout.tsx          # Root layout — session kontrolü
│   │   ├── components/
│   │   │   ├── CalorieRing.tsx
│   │   │   ├── MacroBar.tsx
│   │   │   ├── MealCard.tsx
│   │   │   ├── FoodSearchBar.tsx    # Arama input + debounce
│   │   │   ├── FoodSearchResult.tsx # Arama sonuç listesi
│   │   │   └── PortionSelector.tsx  # Gram ayarlama + anlık makro hesabı
│   │   ├── services/
│   │   │   ├── api.ts               # Backend'e istek atan fonksiyonlar
│   │   │   ├── supabase.ts          # Supabase istemcisi
│   │   │   └── storage.ts           # AsyncStorage yardımcıları
│   │   ├── utils/
│   │   │   └── nutrition.ts         # calculateForPortion ve yardımcılar
│   │   ├── store/
│   │   │   ├── authStore.ts         # Zustand — session, user
│   │   │   ├── mealStore.ts         # Zustand — öğün state
│   │   │   └── userStore.ts         # Zustand — profil state
│   │   └── types/index.ts
│   │
│   └── backend/                     # Hono API
│       ├── src/
│       │   ├── index.ts             # Hono app entry
│       │   ├── routes/
│       │   │   ├── food.ts          # GET /food/search?q=
│       │   │   ├── meals.ts         # CRUD öğün endpointleri
│       │   │   └── profile.ts       # GET/POST /profile
│       │   ├── services/
│       │   │   └── foodSearch.ts    # Open Food Facts servisi
│       │   ├── middleware/
│       │   │   ├── auth.ts          # Supabase JWT doğrulama
│       │   │   └── rateLimit.ts     # Rate limiting
│       │   └── db/
│       │       ├── schema.ts        # Drizzle şeması
│       │       └── client.ts        # DB bağlantısı
│       └── .env
```

---

## 🔐 Auth Akışı

### Navigasyon Mantığı

```
Uygulama açılır
    ↓
Root _layout.tsx — Supabase session kontrol eder
    ├── Session YOK  → (auth)/login
    └── Session VAR
            ├── Profil DOLU → (tabs)/index (Dashboard)
            └── Profil EKSİK → (auth)/onboarding
```

### 1. Login Ekranı — `app/(auth)/login.tsx`

Claude'a şunu söyle:
> "React Native + NativeWind ile login ekranı oluştur.
> - Üstte logo + uygulama adı (Calorie Coach) + slogan
> - E-posta TextInput (keyboard: email-address)
> - Şifre TextInput (secureTextEntry, göster/gizle ikonu)
> - 'Giriş Yap' butonu → supabase.auth.signInWithPassword()
> - Ayırıcı: '— veya —'
> - Google ile Giriş butonu → OAuth akışı
> - 'Hesabın yok mu? Kayıt Ol' linki
> - Hata mesajları input altında kırmızı text
> - Loading sırasında buton disabled + spinner"

### 2. Kayıt Ekranı — `app/(auth)/register.tsx`

Claude'a şunu söyle:
> "React Native + NativeWind ile kayıt ekranı oluştur.
> - Ad Soyad, E-posta, Şifre, Şifre Tekrar alanları
> - 'Kayıt Ol' butonu → supabase.auth.signUp()
> - Google ile Kayıt Ol butonu
> - Başarılı kayıt → onboarding ekranına yönlendir"

### 3. Onboarding — `app/(auth)/onboarding.tsx`

### Bileşen Geliştirme Notları: Onboarding
> 3 adımlı onboarding wizard. Üstte progress bar (1/3, 2/3, 3/3).
>
> Adım 1 — Temel Bilgiler: Ad, Yaş, Cinsiyet chip seçici
> Adım 2 — Vücut: Boy (cm), Kilo (kg), Aktivite seviyesi (5 kart)
> Adım 3 — Hedef: Kilo Ver / Koru / Al kartları,
>   Harris-Benedict ile hesaplanan kalori hedefi otomatik göster,
>   slider ile ±500 kcal manuel ayar,
>   'Başla!' → POST /profile → (tabs)/index
>
> Veriler Zustand userStore'a yazılsın, backend'e de kaydedilsin.

### Supabase İstemci Kodu

```typescript
// services/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Root Layout — Session Kontrolü

```typescript
// app/_layout.tsx
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession, profile } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace(profile?.age ? "/(tabs)" : "/(auth)/onboarding");
    }
  }, [session, segments]);

  return <Slot />;
}
```

### Backend Auth Middleware

```typescript
// backend/src/middleware/auth.ts
import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Yetkisiz" }, 401);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return c.json({ error: "Geçersiz token" }, 401);

  c.set("userId", user.id);
  await next();
});
```

---

## 🔌 API Endpointleri

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/food/search?q=elma&page=1` | Open Food Facts proxy araması | ✅ |
| POST | `/meals` | Öğün kaydet | ✅ |
| GET | `/meals?date=2025-03-29` | Güne göre öğünler | ✅ |
| DELETE | `/meals/:id` | Öğün sil | ✅ |
| GET | `/meals/summary?range=week` | Haftalık özet | ✅ |
| POST | `/profile` | Onboarding profili kaydet | ✅ |
| GET | `/profile` | Profil getir | ✅ |

### Besin Arama Endpoint'i

```typescript
// backend/src/routes/food.ts
import { Hono } from "hono";
import { searchFoods } from "../services/foodSearch";
import { authMiddleware } from "../middleware/auth";

const food = new Hono();
food.use("*", authMiddleware);

food.get("/search", async (c) => {
  const q = c.req.query("q");
  const page = Number(c.req.query("page") ?? "1");

  if (!q || q.trim().length < 2) {
    return c.json({ error: "En az 2 karakter girin" }, 400);
  }

  const results = await searchFoods(q.trim(), page);
  return c.json({ results });
});

export default food;
```

---

## 📱 Öğün Ekleme Ekranı — Besin Arama Akışı

### Kullanıcı Akışı

```
Kullanıcı "elma" yazar
    ↓ debounce 400ms
GET /food/search?q=elma
    ↓
Sonuç listesi gösterilir (isim + 100g kalori)
    ↓
Kullanıcı bir ürüne tıklar
    ↓
PortionSelector açılır (kaç gram?)
    ↓ anlık hesaplama
Kalori + makrolar güncellenir
    ↓
Öğün tipi seçilir (Kahvaltı / Öğle / Akşam / Atıştırmalık)
    ↓
"Ekle" → POST /meals → Dashboard güncellenir
```

### Bileşen Mantığı: Öğün Ekleme (Search Flow)

> "React Native ile öğün ekleme ekranı oluştur.
>
> Bileşenler:
> 1. FoodSearchBar — TextInput, onChange'de useQuery ile GET /food/search?q= çağır, debounce 400ms
> 2. FoodSearchResult listesi — her satırda ürün adı + 100g kalori + sağda '+'
> 3. Ürüne tıklanınca PortionSelector bottom sheet açılır:
>    - Ürün adı ve görseli (varsa)
>    - Gram sayısı input (default: 100)
>    - Anlık kalori / protein / karb / yağ hesabı (calculateForPortion ile)
>    - Öğün tipi seçici (Kahvaltı / Öğle / Akşam / Atıştırmalık)
>    - 'Ekle' butonu → POST /meals → bottom sheet kapanır → başarı toast
> 4. Arama boşken 'Son Eklenenler' listesi göster (AsyncStorage'dan)"

---

## 💾 Veri Modeli (TypeScript)

```typescript
// types/index.ts

export interface MacroNutrients {
  protein: number; // gram
  carbs:   number; // gram
  fat:     number; // gram
  fiber:   number; // gram
}

export interface FoodItem {
  id:          string;
  foodName:    string;
  offCode?:    string;  // Open Food Facts ürün kodu
  portionGram: number;  // kullanıcının seçtiği gram
  calories:    number;  // hesaplanmış
  macros:      MacroNutrients; // hesaplanmış
  imageUrl?:   string;
}

export interface Meal {
  id:            string;
  type:          "breakfast" | "lunch" | "dinner" | "snack";
  foods:         FoodItem[];
  totalCalories: number;
  totalMacros:   MacroNutrients;
  date:          string;   // "2025-03-29"
  createdAt:     number;   // timestamp
}

export interface UserProfile {
  name:              string;
  age:               number;
  weight:            number;
  height:            number;
  gender:            "male" | "female";
  activityLevel:     "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal:              "lose" | "maintain" | "gain";
  dailyCalorieGoal:  number;
  macroGoals:        MacroNutrients;
}

export interface AuthUser {
  id:         string;
  email:      string;
  name:       string;
  avatarUrl?: string;
}
```

---

## 🚀 Geliştirme Adımları — Faz 1

### Adım 1 — Frontend Kurulumu
```
"Expo ile yeni React Native projesi başlat (TypeScript template).
Şu paketleri kur ve yapılandır:
- expo-router v3
- nativewind v4 + tailwindcss
- zustand
- @tanstack/react-query
- @react-native-async-storage/async-storage
- react-native-reanimated
- react-native-gesture-handler
- victory-native
- expo-haptics
- @supabase/supabase-js
- expo-auth-session
- expo-web-browser
- expo-secure-store

Klasör yapısını oluştur:
- app/(auth)/_layout.tsx
- app/(tabs)/_layout.tsx — 4 tab: Ana Sayfa, Ekle, Geçmiş, Profil
- app/_layout.tsx — root layout (session kontrolü)"
```

### Adım 2 — Backend Kurulumu
```
"Hono + TypeScript ile backend projesi kur.
Paketler: hono, zod, drizzle-orm, @supabase/supabase-js
Dosyalar:
- src/index.ts (Hono app, CORS)
- src/routes/food.ts (GET /food/search — OFF proxy)
- src/routes/meals.ts (CRUD)
- src/routes/profile.ts (GET/POST /profile)
- src/services/foodSearch.ts (yukarıdaki OFF servis kodunu kullan)
- src/middleware/auth.ts (Supabase JWT — yukarıdaki kodu kullan)
- src/middleware/rateLimit.ts
.env.example: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
```

### Adım 3 — Supabase Kurulumu
```
"services/supabase.ts oluştur (yukarıdaki kodu kullan).
Supabase Dashboard:
1. Authentication > Providers > Google etkinleştir
2. SQL Editor ile tablolar:
   users_profile: id (uuid FK), name, age, weight, height,
     gender, activity_level, goal, daily_calorie_goal,
     macro_goals (jsonb), created_at, updated_at
   meals: id, user_id (FK), type, foods (jsonb),
     total_calories, total_macros (jsonb), date, created_at
3. Her iki tabloda RLS etkinleştir"
```

### Adım 4 — Auth Store ve Root Layout
```
"Zustand ile authStore.ts oluştur (session, user, profile).
Root _layout.tsx'i yaz — yukarıdaki session kontrol kodunu kullan."
```

### Adım 5 — Auth Ekranları
```
"Sırasıyla:
1. (auth)/login.tsx
2. (auth)/register.tsx
3. (auth)/onboarding.tsx — 3 adımlı wizard
Her ekranın promptu yukarıda mevcut."
```

### Adım 6 — Tipler ve Store'lar
```
"types/index.ts dosyasını oluştur.
Zustand store'ları:
1. mealStore — günlük öğünler, seçili tarih, CRUD
2. userStore — profil, kalori hedefi
AsyncStorage ile persist etsin."
```

### Adım 7 — Besin Yardımcıları
```
"utils/nutrition.ts oluştur.
calculateForPortion(per100g, grams) fonksiyonu — yukarıdaki kodu kullan.
Ayrıca Harris-Benedict formülü ile günlük kalori hesabı:
calculateTDEE(weight, height, age, gender, activityLevel, goal) → number"
```

### Adım 8 — API Servisi (Frontend)
```
"services/api.ts oluştur.
Her istekte Supabase token eklensin:
  const { data: { session } } = await supabase.auth.getSession();
  headers: { Authorization: 'Bearer ' + session?.access_token }

React Query hook'ları:
- useFoodSearch(query) — GET /food/search?q=, enabled: query.length >= 2
- useMeals(date) — GET /meals?date=
- useAddMeal() — POST /meals mutation
- useDeleteMeal() — DELETE /meals/:id mutation
- useWeeklySummary() — GET /meals/summary?range=week"
```

### Adım 9 — UI Bileşenleri
```
"Şu bileşenleri oluştur (NativeWind):
1. CalorieRing.tsx — SVG + Reanimated halka, ortada 'X / Y kcal'
2. MacroBar.tsx — renkli progress bar
3. MealCard.tsx — swipe left ile sil
4. FoodSearchBar.tsx — debounce'lu arama input
5. FoodSearchResult.tsx — sonuç listesi satırı
6. PortionSelector.tsx — gram input + anlık makro hesabı"
```

### Adım 10 — Ana Ekranlar
```
"Sırasıyla:
1. (tabs)/index.tsx — Dashboard (CalorieRing + MacroBars + öğün listesi)
2. (tabs)/add-meal.tsx — Besin arama + öğün ekleme (yukarıdaki akışı uygula)
3. (tabs)/history.tsx — Haftalık grafik + geçmiş liste
4. (tabs)/profile.tsx — Profil & hedefler düzenleme"
```

### Adım 11 — Test & Polish
```
"Şu senaryoları kontrol et:
- Oturum açık → direkt dashboard
- Oturum kapalı → login
- Onboarding tamamlanmamış → wizard
- Arama sonucu boş → 'Ürün bulunamadı' göster
- OFF API yavaş/hatalı → retry + hata mesajı
- Kalori hedefi aşılınca kırmızı ring + haptic
- Skeleton loader, boş state UI"
```

---

## 🔒 Güvenlik

```typescript
// ✅ DOĞRU — OFF API'sine mobil direkt bağlanmaz
// Backend proxy kullanılır → rate limit ve veri temizleme backend'de yapılır

// Mobil → kendi backend'ine istek atar
const res = await fetch(`${API_URL}/food/search?q=${query}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// Backend → OFF'a istek atar, veriyi temizler, geri döner
```

---

## 🎨 Tasarım Sistemi

```
"Bu renk ve tasarım değerlerini kullan:
- Primary:    #4CAF50 (yeşil)
- Secondary:  #FF7043 (turuncu)
- Protein:    #2196F3 (mavi)
- Karb:       #FFC107 (sarı)
- Yağ:        #F44336 (kırmızı)
- Background: #F8F9FA
- Card:       #FFFFFF
- Border radius: 16 (kart), 12 (buton), 8 (chip)
- Font: System default (SF Pro / Roboto)"
```

---

## 🔮 Faz 2 — Barkod Tarama Hazırlık Notları

- `expo-barcode-scanner` veya `expo-camera` kurulumu
- `GET /food/barcode/:code` endpoint'i → OFF barkod API'si
- Add Meal ekranına barkod tarama butonu
- Barkod sonucu → direkt PortionSelector açılır (arama atlanır)

---

*Bu rehber Faz 1 için hazırlanmıştır. AI entegrasyonu yoktur; besin verisi Open Food Facts API üzerinden sağlanmaktadır. Her yeni Claude sohbetinde bu dosyayı bağlam olarak ekle.*