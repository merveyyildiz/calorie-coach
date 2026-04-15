import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "../types";

interface UserState {
  profile: UserProfile | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateGoal: (goal: number) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,

      setProfile: (profile) => set({ profile }),

      // Kalori hedefini manuel ayarlamak için kolaylaştırıcı
      updateGoal: (goal) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, dailyCalorieGoal: goal }
            : null,
        })),

      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "@calorie_coach_user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
