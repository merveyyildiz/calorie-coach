import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayStr } from "./mealStore";

interface DailyWater {
  date: string;
  amount: number; // Litre cinsinden
}

interface WaterState {
  logs: DailyWater[];
  
  // Getters
  getWaterForDate: (date: string) => number;
  
  // Actions
  addWater: (amount: number, date?: string) => void;
  resetWater: (date?: string) => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      logs: [],

      getWaterForDate: (date) => {
        const log = get().logs.find((l) => l.date === date);
        return log ? log.amount : 0;
      },

      addWater: (amount, date = getTodayStr()) => {
        set((state) => {
          const index = state.logs.findIndex((l) => l.date === date);
          const newLogs = [...state.logs];
          
          if (index > -1) {
            // Mevcut günü güncelle
            newLogs[index] = { 
              ...newLogs[index], 
              amount: parseFloat((newLogs[index].amount + amount).toFixed(2)) 
            };
          } else {
            // Yeni gün kaydı aç
            newLogs.push({ date, amount });
          }
          
          return { logs: newLogs };
        });
      },

      resetWater: (date = getTodayStr()) => {
        set((state) => ({
          logs: state.logs.filter((l) => l.date !== date)
        }));
      }
    }),
    {
      name: "@calorie_coach_water",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
