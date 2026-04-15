import crypto from "node:crypto";

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

// Ham OFF verisini uygulama formatına dönüştür (Hata ihtimaline karşı daha güvenli hale getirildi)
function mapProduct(p: OFFProduct): FoodSearchResult | null {
  try {
    if (!p) return null;
    const n = p.nutriments || {};
    
    // Güvenli sayı dönüşümü ve yuvarlama fonksiyonu
    const toNum = (val: any) => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    return {
      id: p.code || `off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: p.product_name || "İsimsiz ürün",
      servingSize: p.serving_size || "100g",
      per100g: {
        calories: Math.round(toNum(n["energy-kcal_100g"])),
        protein:  toNum(n["proteins_100g"]),
        carbs:    toNum(n["carbohydrates_100g"]),
        fat:      toNum(n["fat_100g"]),
        fiber:    toNum(n["fiber_100g"]),
      },
      imageUrl: p.image_url,
    };
  } catch (err) {
    console.error(`[OFF Service] Ürün eşleme hatası:`, err);
    return null;
  }
}

export async function searchFoods(query: string, page = 1): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    search_terms: query,
    json: "true",
    page_size: "24",
    page: String(page),
    fields: "code,product_name,nutriments,serving_size,image_url",
  });

  const url = `https://world.openfoodfacts.org/api/v2/search?${params}`;
  console.log(`[OFF Service] Fetching: ${url}`);

  const res = await fetch(
    url,
    { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://world.openfoodfacts.org/",
        "Origin": "https://world.openfoodfacts.org",
        "DNT": "1",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
      } 
    }
  );

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Çok fazla istek gönderildi. Lütfen bir saniye bekleyin.");
    }
    if (res.status === 503 || res.status === 504) {
      throw new Error(`Open Food Facts şu an meşgul (API kısıtlaması devam ediyor). IP adresi kısıtlanmış olabilir.`);
    }
    throw new Error(`Open Food Facts API hatası: ${res.status} ${res.statusText}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err) {
     throw new Error("Open Food Facts yanıtı ayrıştırılamadı (JSON hatası).");
  }

  if (!data || !data.products || !Array.isArray(data.products)) {
    console.error("[OFF Service] Beklenmedik veya boş API yanıtı:", data);
    return [];
  }

  const products: OFFProduct[] = data.products;

  return products
    .map((p) => mapProduct(p))
    .filter((p): p is FoodSearchResult => p !== null && !!p.name);
}
