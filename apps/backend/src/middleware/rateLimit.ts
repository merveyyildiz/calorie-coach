import { createMiddleware } from "hono/factory";

// Basit in-memory rate limiter (production'da Redis/Upstash kullanılmalı)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  maxRequests: number;   // Pencere başına maksimum istek
  windowMs: number;      // Pencere süresi (ms)
  keyGenerator?: (c: any) => string; // Kullanıcı tanımlama
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    maxRequests = 50,
    windowMs = 24 * 60 * 60 * 1000, // 24 saat
    keyGenerator = (c: any) => c.get("userId") || c.req.header("x-forwarded-for") || "anonymous",
  } = options;

  // Süresi dolmuş kayıtları temizle (her 5 dakikada)
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return createMiddleware(async (c, next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Rate limit header'ları ekle
    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count).toString());
    c.header("X-RateLimit-Reset", new Date(record.resetTime).toISOString());

    if (record.count > maxRequests) {
      return c.json(
        {
          error: "Rate limit aşıldı",
          message: `Günlük ${maxRequests} istek sınırına ulaştınız. Lütfen daha sonra tekrar deneyin.`,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        429
      );
    }

    await next();
  });
}

// Varsayılan rate limiter — Claude API çağrıları için (günlük 50 istek)
export const analyzeRateLimiter = createRateLimiter({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "50"),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "86400000"),
});

// Genel API rate limiter (dakikada 100 istek)
export const generalRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
});
