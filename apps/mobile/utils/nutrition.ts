/**
 * 100g'lık makro değerlerini belirtilen gramaj için hesaplar.
 */
export function calculateForPortion(
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  },
  grams: number
) {
  const ratio = grams / 100;
  return {
    calories: Math.round(per100g.calories * ratio),
    protein:  parseFloat((per100g.protein  * ratio).toFixed(1)),
    carbs:    parseFloat((per100g.carbs    * ratio).toFixed(1)),
    fat:      parseFloat((per100g.fat      * ratio).toFixed(1)),
    fiber:    parseFloat((per100g.fiber    * ratio).toFixed(1)),
  };
}

/**
 * Harris-Benedict Formülü kullanarak Bazal Metabolizma Hızı (BMR) hesaplar.
 */
export function calculateBMR(weight: number, height: number, age: number, gender: "male" | "female") {
  if (gender === "male") {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Aktivite seviyesine göre Toplam Günlük Enerji Harcamasını (TDEE) hesaplar.
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(
  bmr: number, 
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS, 
  goal: "lose" | "maintain" | "gain"
) {
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  
  if (goal === "lose") return Math.round(tdee - 500);
  if (goal === "gain") return Math.round(tdee + 500);
  return Math.round(tdee);
}
