import { create } from "zustand";
import { supabase } from "../services/supabase";
import type { Session } from "@supabase/supabase-js";

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  dailyCalorieGoal: number;
  macroGoals: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  hasOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setHasOnboarded: (val: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  hasOnboarded: false,

  setSession: (session: Session | null) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
        avatarUrl: session.user.user_metadata?.avatar_url,
      };
      set({ session, user, isLoading: false });
    } else {
      set({ session: null, user: null, isLoading: false });
    }
  },

  setProfile: (profile: UserProfile | null) => {
    set({ profile });
  },

  setHasOnboarded: (hasOnboarded: boolean) => {
    set({ hasOnboarded });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
