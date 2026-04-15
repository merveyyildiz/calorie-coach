import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Meal } from "../types";

interface MealState {
  meals: Meal[];
  selectedDate: string;
  isLoading: boolean;
  
  // Actions
  setSelectedDate: (date: string) => void;
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, updatedMeal: Meal) => void;
  setLoading: (state: boolean) => void;
  clearMeals: () => void;
}

// Bugünü YYYY-MM-DD olarak alma yardımcısı
export const getTodayStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useMealStore = create<MealState>()(
  persist(
    (set) => ({
      meals: [],
      selectedDate: getTodayStr(),
      isLoading: false,

      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setMeals: (meals) => set({ meals }),
      
      addMeal: (meal) =>
        set((state) => ({
          meals: [meal, ...state.meals],
        })),

      removeMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        })),

      updateMeal: (id, updatedMeal) =>
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? updatedMeal : m)),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      
      clearMeals: () => set({ meals: [], selectedDate: getTodayStr() }),
    }),
    {
      name: "@calorie_coach_meals",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
