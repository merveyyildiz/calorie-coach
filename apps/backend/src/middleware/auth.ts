import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role — sadece backend'de
);

// Hono context'e userId eklemek için tip tanımı
export type AuthEnv = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader) {
    return c.json({ error: "Yetkilendirme başlığı eksik" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    return c.json({ error: "Token eksik" }, 401);
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Geçersiz veya süresi dolmuş token" }, 401);
    }

    // Sonraki handler'larda kullanılmak üzere userId'yi kaydet
    c.set("userId", user.id);
    c.set("userEmail", user.email || "");
    
    await next();
  } catch (err) {
    console.error("Auth middleware hatası:", err);
    return c.json({ error: "Yetkilendirme hatası" }, 500);
  }
});
