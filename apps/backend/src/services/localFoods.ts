// ============================================================
// LOCAL FOODS DATABASE
// In-memory dataset for the most common foods.
// Serves as the highest-priority layer in the hybrid search.
// All nutritional values are per 100g.
// ============================================================

export interface LocalFood {
  /** Canonical English name used for matching */
  key: string;
  /** Display name (Turkish) */
  name: string;
  /** All aliases (Turkish, English, slang) that map to this food */
  aliases: string[];
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

// USER RULE: Important values defined as constants
export const LOCAL_FOODS: readonly LocalFood[] = [
  {
    key: "rice",
    name: "Beyaz Pirinç (Pişmiş)",
    aliases: ["rice", "pilav", "pirinç", "white rice", "cooked rice", "beyaz pirinç"],
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  },
  {
    key: "chicken_breast",
    name: "Tavuk Göğsü (Pişmiş)",
    aliases: [
      "chicken breast", "tavuk göğsü", "chicken", "tavuk", "grilled chicken",
      "ızgara tavuk", "haşlanmış tavuk", "boiled chicken", "cooked chicken",
    ],
    per100g: { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  },
  {
    key: "egg",
    name: "Yumurta (Haşlanmış)",
    aliases: [
      "egg", "yumurta", "boiled egg", "haşlanmış yumurta", "scrambled egg",
      "omelet", "omlet", "fried egg", "sahanda yumurta",
    ],
    per100g: { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0.0 },
  },
  {
    key: "milk",
    name: "Süt (Tam Yağlı)",
    aliases: ["milk", "süt", "whole milk", "tam yağlı süt", "full fat milk"],
    per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0.0 },
  },
  {
    key: "oatmeal",
    name: "Yulaf Ezmesi (Pişmiş)",
    aliases: ["oatmeal", "oats", "yulaf", "yulaf ezmesi", "oat"],
    per100g: { calories: 68, protein: 2.4, carbs: 12.0, fat: 1.4, fiber: 1.7 },
  },
  {
    key: "banana",
    name: "Muz",
    aliases: ["banana", "muz"],
    per100g: { calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6 },
  },
  {
    key: "apple",
    name: "Elma",
    aliases: ["apple", "elma"],
    per100g: { calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4 },
  },
  {
    key: "bread",
    name: "Ekmek (Beyaz)",
    aliases: ["bread", "ekmek", "white bread", "beyaz ekmek", "toast"],
    per100g: { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7 },
  },
  {
    key: "pasta",
    name: "Makarna (Pişmiş)",
    aliases: ["pasta", "makarna", "spaghetti", "noodles"],
    per100g: { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8 },
  },
  {
    key: "salmon",
    name: "Somon (Pişmiş)",
    aliases: ["salmon", "somon", "somon balığı", "cooked salmon"],
    per100g: { calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0, fiber: 0.0 },
  },
  {
    key: "tuna",
    name: "Ton Balığı (Konserve)",
    aliases: ["tuna", "ton balığı", "tuna fish", "canned tuna"],
    per100g: { calories: 116, protein: 25.5, carbs: 0.0, fat: 1.0, fiber: 0.0 },
  },
  {
    key: "yogurt",
    name: "Yoğurt (Tam Yağlı)",
    aliases: ["yogurt", "yoğurt", "plain yogurt", "sade yoğurt", "greek yogurt"],
    per100g: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0.0 },
  },
  {
    key: "cheese",
    name: "Beyaz Peynir",
    aliases: [
      "cheese", "peynir", "white cheese", "beyaz peynir", "feta", "kaşar",
      "cheddar", "lor peyniri",
    ],
    per100g: { calories: 264, protein: 14.0, carbs: 4.1, fat: 21.0, fiber: 0.0 },
  },
  {
    key: "potato",
    name: "Patates (Haşlanmış)",
    aliases: [
      "potato", "patates", "boiled potato", "haşlanmış patates", "baked potato",
      "french fries", "pommes frites",
    ],
    per100g: { calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8 },
  },
  {
    key: "lentil",
    name: "Mercimek (Pişmiş)",
    aliases: [
      "lentil", "mercimek", "red lentil", "kırmızı mercimek",
      "lentil soup", "mercimek çorbası",
    ],
    per100g: { calories: 116, protein: 9.0, carbs: 20.1, fat: 0.4, fiber: 7.9 },
  },
  {
    key: "coffee",
    name: "Siyah Kahve",
    aliases: ["coffee", "kahve", "black coffee", "siyah kahve", "sade kahve", "espresso"],
    per100g: { calories: 2, protein: 0.3, carbs: 0.0, fat: 0.0, fiber: 0.0 },
  },
] as const;
