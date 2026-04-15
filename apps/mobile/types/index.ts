export interface MacroNutrients {
  protein: number; // gram
  carbs: number;   // gram
  fat: number;     // gram
  fiber: number;   // gram
}

export interface FoodItem {
  id?: string;
  foodName: string;
  offCode?: string;     // Open Food Facts ürün kodu
  portionGram: number;  // kullanıcının seçtiği gram
  calories: number;
  macros: MacroNutrients;
  imageUrl?: string;
  confidence?: "high" | "medium" | "low";
  notes?: string;
}

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodItem[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  date: string;      // YYYY-MM-DD formatında
  createdAt: number | string | Date; // timestamp (string olarak da gelebilir DB'den)
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender?: "male" | "female"; // Geri uyumluluk ve UI için
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  dailyCalorieGoal: number;
  macroGoals: MacroNutrients;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string; // Google OAuth gibi platformlardan
}
