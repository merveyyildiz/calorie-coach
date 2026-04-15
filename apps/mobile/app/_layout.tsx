import "../global.css";
import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/authStore";
import { fetchProfileFromBackend } from "../services/api";
import type { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 dakika
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession, profile } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      if (currentSession) {
        try {
          const stProfile = useAuthStore.getState().profile;
          if (!stProfile || !stProfile.age) {
            const res = await fetchProfileFromBackend();
            useAuthStore.getState().setProfile(res);
          }
        } catch (error) {
          useAuthStore.getState().setProfile(null);
        }
      } else {
        useAuthStore.getState().setProfile(null);
      }
      setIsReady(true);
    };

    // Supabase session değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        handleSession(session);
      }
    );

    // İlk session kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    // Debug logları (kontrol için)
    console.log("[Auth] Session:", !!session, "ProfileAge:", profile?.age, "Path:", segments.join('/'));

    if (!session) {
      // Oturum yoksa ve auth grubunda değilsek login'e at
      if (!inAuthGroup) router.replace("/(auth)/login");
    } else {
      // Oturum varsa:
      if (!profile?.age) {
        // Profil (yaş) yoksa HER ZAMAN onboarding'e yönlendir (Hala onboarding'de değilsek)
        const isOnboarding = segments.includes("onboarding");
        if (!isOnboarding) {
           console.log("[Auth] Profil eksik, onboarding'e yönlendiriliyor...");
           router.replace("/(auth)/onboarding");
        }
      } else if (inAuthGroup) {
        // Oturum var, profil de tamamsa ve hala auth grubundaysak (Login/Register/Onboarding) ana sayfaya at
        console.log("[Auth] Giriş başarılı, ana sayfaya yönlendiriliyor...");
        router.replace("/(tabs)");
      }
    }
  }, [session, segments, isReady, profile]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
});
