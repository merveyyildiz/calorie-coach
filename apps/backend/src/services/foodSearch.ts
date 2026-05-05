// ============================================================
// FOOD SEARCH SERVICE  (replaces Open Food Facts integration)
//
// 3-Layer Hybrid Search:
//   1. Local in-memory data  (localFoods.ts)  — highest priority
//   2. USDA FoodData Central API              — primary external source
//   3. Edamam Food Database API               — fallback
//
// All layers return the unified FoodSearchResult shape so the
// existing route and UI remain fully compatible.
// ============================================================

import { LOCAL_FOODS, type LocalFood } from "./localFoods";
import { normalizeQuery } from "./queryNormalizer";

// ── Unified result type (kept identical to the old OFFProduct shape so UI doesn't break) ──

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
  /** Which data source provided this result */
  source: "local" | "usda" | "edamam";
}

// ── Simple Map-based cache ────────────────────────────────────────────────────

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

interface CacheEntry {
  results: FoodSearchResult[];
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry>();

function getCached(key: string): FoodSearchResult[] | null {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  return entry.results;
}

function setCache(key: string, results: FoodSearchResult[]): void {
  searchCache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Layer 1: Local Foods ──────────────────────────────────────────────────────

const EXACT_MATCH_SCORE = 2;
const PARTIAL_MATCH_SCORE = 1;

function scoreLocalFood(food: LocalFood, normalized: string): number {
  const lower = normalized.toLowerCase();

  // Exact key or alias match
  if (food.key === lower || food.aliases.some((a) => a.toLowerCase() === lower)) {
    return EXACT_MATCH_SCORE;
  }
  // Partial key or alias match
  if (
    food.key.includes(lower) ||
    food.aliases.some((a) => a.toLowerCase().includes(lower) || lower.includes(a.toLowerCase()))
  ) {
    return PARTIAL_MATCH_SCORE;
  }
  return 0;
}

function searchLocal(normalized: string): FoodSearchResult[] {
  return LOCAL_FOODS.flatMap((food) => {
    const score = scoreLocalFood(food, normalized);
    if (score === 0) return [];

    const result: FoodSearchResult = {
      id: `local-${food.key}`,
      name: food.name,
      servingSize: "100g",
      per100g: { ...food.per100g },
      source: "local",
    };
    return [{ score, result }];
  })
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result);
}

// ── Layer 2: USDA FoodData Central ───────────────────────────────────────────
// API Docs: https://fdc.nal.usda.gov/api-guide.html
// Key env var: USDA_API_KEY

const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_PAGE_SIZE = 10;

// USDA nutrient IDs (stable across API versions)
const USDA_NUTRIENT_IDS = {
  ENERGY_KCAL: 1008,
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
  FIBER: 1079,
} as const;

interface UsdaFoodNutrient {
  nutrientId: number;
  value: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaFoodNutrient[];
}

function findUsdaNutrient(nutrients: UsdaFoodNutrient[], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function mapUsdaFood(food: UsdaFood): FoodSearchResult {
  const n = food.foodNutrients;
  const servingSize =
    food.servingSize && food.servingSizeUnit
      ? `${food.servingSize}${food.servingSizeUnit}`
      : "100g";

  return {
    id: `usda-${food.fdcId}`,
    name: food.description,
    servingSize,
    per100g: {
      calories: Math.round(findUsdaNutrient(n, USDA_NUTRIENT_IDS.ENERGY_KCAL)),
      protein: findUsdaNutrient(n, USDA_NUTRIENT_IDS.PROTEIN),
      carbs: findUsdaNutrient(n, USDA_NUTRIENT_IDS.CARBS),
      fat: findUsdaNutrient(n, USDA_NUTRIENT_IDS.FAT),
      fiber: findUsdaNutrient(n, USDA_NUTRIENT_IDS.FIBER),
    },
    source: "usda",
  };
}

async function searchUsda(query: string): Promise<FoodSearchResult[]> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.warn("[FoodSearch] USDA_API_KEY not set, skipping USDA layer.");
    return [];
  }

  const params = new URLSearchParams({
    query,
    api_key: apiKey,
    pageSize: String(USDA_PAGE_SIZE),
    dataType: "Survey (FNDDS),SR Legacy",
  });

  const url = `${USDA_BASE_URL}?${params}`;
  console.log(`[FoodSearch] USDA fetch: ${url}`);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`USDA API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { foods?: UsdaFood[] };

  if (!data.foods || !Array.isArray(data.foods)) return [];

  return data.foods
    .filter((f) => f.description && f.foodNutrients?.length > 0)
    .map(mapUsdaFood);
}

// ── Layer 3: Edamam Food Database ─────────────────────────────────────────────
// API Docs: https://developer.edamam.com/food-database-api-docs
// Env vars: EDAMAM_APP_ID, EDAMAM_APP_KEY

const EDAMAM_BASE_URL = "https://api.edamam.com/api/food-database/v2/parser";

interface EdamamNutrients {
  ENERC_KCAL?: number;
  PROCNT?: number;
  CHOCDF?: number;
  FAT?: number;
  FIBTG?: number;
}

interface EdamamFoodHint {
  food: {
    foodId: string;
    label: string;
    nutrients: EdamamNutrients;
    image?: string;
  };
}

function mapEdamamFood(hint: EdamamFoodHint): FoodSearchResult {
  const { food } = hint;
  const n = food.nutrients;

  return {
    id: `edamam-${food.foodId}`,
    name: food.label,
    servingSize: "100g",
    per100g: {
      calories: Math.round(n.ENERC_KCAL ?? 0),
      protein: n.PROCNT ?? 0,
      carbs: n.CHOCDF ?? 0,
      fat: n.FAT ?? 0,
      fiber: n.FIBTG ?? 0,
    },
    imageUrl: food.image,
    source: "edamam",
  };
}

async function searchEdamam(query: string): Promise<FoodSearchResult[]> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  if (!appId || !appKey) {
    console.warn("[FoodSearch] EDAMAM_APP_ID / EDAMAM_APP_KEY not set, skipping Edamam layer.");
    return [];
  }

  const params = new URLSearchParams({
    ingr: query,
    app_id: appId,
    app_key: appKey,
  });

  const url = `${EDAMAM_BASE_URL}?${params}`;
  console.log(`[FoodSearch] Edamam fetch: ${url}`);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Edamam API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { hints?: EdamamFoodHint[] };

  if (!data.hints || !Array.isArray(data.hints)) return [];

  return data.hints
    .filter((h) => h.food?.label && h.food?.nutrients)
    .map(mapEdamamFood);
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────

/**
 * Searches for food items using a 3-layer hybrid strategy:
 *
 *   1. Normalize the query (strip quantities, adjectives, Turkish → English)
 *   2. Check in-memory cache
 *   3. Search local database
 *   4. If no local results → USDA FoodData Central
 *   5. If USDA fails or empty → Edamam (fallback)
 *   6. Cache and return results
 *
 * The returned shape is identical to the previous Open Food Facts integration
 * so the existing route and UI remain fully compatible.
 */
export async function searchFoods(
  rawQuery: string,
  // `page` param kept for API compatibility, used only for external layers
  _page = 1,
): Promise<FoodSearchResult[]> {
  const normalized = normalizeQuery(rawQuery);
  const cacheKey = normalized;

  // 1. Cache hit
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[FoodSearch] Cache hit for "${cacheKey}"`);
    return cached;
  }

  // 2. Local search
  const localResults = searchLocal(normalized);
  if (localResults.length > 0) {
    console.log(
      `[FoodSearch] Local match for "${cacheKey}": ${localResults.length} results`,
    );
    setCache(cacheKey, localResults);
    return localResults;
  }

  // 3. USDA
  try {
    const usdaResults = await searchUsda(normalized);
    if (usdaResults.length > 0) {
      console.log(
        `[FoodSearch] USDA match for "${cacheKey}": ${usdaResults.length} results`,
      );
      setCache(cacheKey, usdaResults);
      return usdaResults;
    }
  } catch (err) {
    console.error(`[FoodSearch] USDA error for "${cacheKey}":`, err);
    // Fall through to Edamam
  }

  // 4. Edamam fallback
  try {
    const edamamResults = await searchEdamam(normalized);
    if (edamamResults.length > 0) {
      console.log(
        `[FoodSearch] Edamam match for "${cacheKey}": ${edamamResults.length} results`,
      );
      setCache(cacheKey, edamamResults);
      return edamamResults;
    }
  } catch (err) {
    console.error(`[FoodSearch] Edamam error for "${cacheKey}":`, err);
  }

  // 5. Nothing found
  console.warn(`[FoodSearch] No results found for "${cacheKey}"`);
  return [];
}
