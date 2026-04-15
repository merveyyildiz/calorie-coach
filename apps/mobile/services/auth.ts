import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "./supabase";

// OAuth oturumunu tamamla (deep link ile geri dönüş)
WebBrowser.maybeCompleteAuthSession();

/**
 * Google ile giriş yap
 * Supabase OAuth akışını kullanır
 */
export async function signInWithGoogle() {
  try {
    const redirectUri = makeRedirectUri({
      scheme: "caloriecoach",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google OAuth hatası:", error.message);
      throw error;
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (result.type === "success") {
        // URL'den session bilgilerini çıkar
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    }
  } catch (error) {
    console.error("Google ile giriş başarısız:", error);
    throw error;
  }
}

/**
 * E-posta ile giriş yap
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * E-posta ile kayıt ol
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Oturumu kapat
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
