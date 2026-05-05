// ============================================================
// QUERY NORMALIZER
// Normalizes user food queries before searching:
//  - Lowercases input
//  - Strips quantities  ("1 kase", "2 dilim")
//  - Strips cooking adjectives ("ızgara", "haşlanmış")
//  - Maps Turkish food names → canonical English keys
// ============================================================

// USER RULE: Magic strings must be defined as constants
const QUANTITY_PATTERN =
  /\b(\d+(\.\d+)?)\s*(kase|dilim|adet|porsiyon|gram|g|kg|ml|litre|bardak|fincan|çay\s*kaşığı|yemek\s*kaşığı|bowl|slice|piece|cup|tbsp|tsp|oz|lb)\b/gi;

const ADJECTIVE_TOKENS: readonly string[] = [
  // Turkish cooking methods
  "ızgara", "izgara", "haşlanmış", "haslanmis", "haşlama", "fırında", "firinda",
  "çiğ", "cig", "pişmiş", "pismis", "kızarmış", "kizarmis", "buğulama", "bugulama",
  "sote", "soteli", "taze", "dondurulmuş", "dondurulmus", "konserve",
  // English cooking methods
  "grilled", "boiled", "baked", "fried", "steamed", "raw", "cooked",
  "roasted", "poached", "smoked", "frozen", "canned", "fresh",
];

/** Turkish phrase → canonical English key (must match a key in localFoods.ts) */
const TURKISH_TO_ENGLISH_MAP: Readonly<Record<string, string>> = {
  // Grains
  "pilav": "rice",
  "pirinç": "rice",
  "beyaz pirinç": "rice",
  "makarna": "pasta",
  "spaghetti": "pasta",
  "ekmek": "bread",
  "yulaf": "oatmeal",
  "yulaf ezmesi": "oatmeal",

  // Proteins
  "tavuk": "chicken breast",
  "tavuk göğsü": "chicken breast",
  "tavuk gogsu": "chicken breast",
  "piliç": "chicken breast",
  "yumurta": "egg",
  "omlet": "egg",
  "somon": "salmon",
  "ton balığı": "tuna",
  "ton baligi": "tuna",
  "mercimek": "lentil",
  "kırmızı mercimek": "lentil",
  "kirmizi mercimek": "lentil",

  // Dairy
  "süt": "milk",
  "yoğurt": "yogurt",
  "yogurt": "yogurt",
  "peynir": "cheese",
  "beyaz peynir": "cheese",
  "kaşar": "cheese",

  // Vegetables/Fruits
  "patates": "potato",
  "muz": "banana",
  "elma": "apple",

  // Drinks
  "kahve": "coffee",
  "siyah kahve": "coffee",
  "sade kahve": "coffee",
};

/**
 * Strips leading quantity expressions such as "1 kase" or "2 dilim".
 */
function stripQuantities(input: string): string {
  return input.replace(QUANTITY_PATTERN, "").trim();
}

/**
 * Removes cooking adjectives / preparation method tokens.
 */
function stripAdjectives(input: string): string {
  const tokens = input.split(/\s+/);
  const filtered = tokens.filter(
    (t) => !ADJECTIVE_TOKENS.includes(t.toLowerCase()),
  );
  return filtered.join(" ").trim();
}

/**
 * Attempts to map the entire phrase or individual words via the Turkish→English map.
 * Returns the mapped English phrase, or the original input if no mapping found.
 */
function mapTurkishToEnglish(input: string): string {
  const lower = input.toLowerCase().trim();

  // Try full-phrase match first (e.g. "tavuk göğsü")
  if (TURKISH_TO_ENGLISH_MAP[lower]) {
    return TURKISH_TO_ENGLISH_MAP[lower];
  }

  // Try word-by-word substitution for partial matches
  const words = lower.split(/\s+/);
  const mapped = words.map((w) => TURKISH_TO_ENGLISH_MAP[w] ?? w);
  const candidate = mapped.join(" ");

  // Only return mapped result if it differs from input
  return candidate !== lower ? candidate : lower;
}

/**
 * Main normalization entry point.
 * Applies all transformations in order and returns a clean, lowercase query.
 *
 * Examples:
 *  "1 kase pilav"          → "rice"
 *  "ızgara tavuk göğsü"    → "chicken breast"
 *  "2 dilim ekmek"         → "bread"
 */
export function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();
  q = stripQuantities(q);
  q = stripAdjectives(q);
  q = mapTurkishToEnglish(q);
  // Remove any leftover extra whitespace
  return q.replace(/\s{2,}/g, " ").trim();
}
