import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Meal, FoodItem } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Merkezi Fetch Yardımcısı
 * Supabase token'ını otomatik olarak ekler ve hata fırlatır.
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const token = session?.access_token;
  if (!token) {
    throw new Error("Oturum süresi dolmuş veya giriş yapılmamış.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || json.message || "Bilinmeyen bir API hatası oluştu.");
  }

  // Backend'imiz genelde { success: true, data: {...} } dönüyor
  return json.data !== undefined ? json.data : json;
}

// ==========================================
// PROFIL API'si
// ==========================================

export async function fetchProfileFromBackend() {
  return fetchApi("/profile", {
    method: "GET",
  });
}

export async function saveProfileToBackend(profileData: any) {
  return fetchApi("/profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

// ==========================================
// REACT QUERY HOOKS
// ==========================================

/**
 * 1. Besin Araması (Open Food Facts Proxy)
 */
export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ["foodSearch", query],
    queryFn: () => fetchApi(`/food/search?q=${query}`),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  });
}

/**
 * 2. Güne Göre Öğünleri Getir
 */
export function useMeals(date: string) {
  return useQuery({
    queryKey: ["meals", date],
    queryFn: () => fetchApi(`/meals?date=${date}`),
    enabled: !!date, // Date yoksa istek atma
  });
}

/**
 * 3. Yeni Öğün Ekle
 */
export function useAddMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; foods: Partial<FoodItem>[]; date: string }) =>
      fetchApi("/meals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Ekleme başarılı olduğunda ilgili tarihteki listeyi ve özetleri tazele
      queryClient.invalidateQueries({ queryKey: ["meals", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

/**
 * 4. Öğün Sil
 */
export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; date: string }) =>
      fetchApi(`/meals/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, variables) => {
      // Silme işlemi bitince listeyi ve özeti tazele
      queryClient.invalidateQueries({ queryKey: ["meals", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

/**
 * 5. Haftalık/Aylık Özet Listesi Getir
 */
export function useWeeklySummary(range: "week" | "month" = "week") {
  return useQuery({
    queryKey: ["summary", range],
    queryFn: () => fetchApi(`/meals/summary?range=${range}`),
  });
}
