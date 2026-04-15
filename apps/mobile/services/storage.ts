import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_PROFILE: "@calorie_coach_profile",
  DAILY_MEALS: "@calorie_coach_meals",
  ONBOARDING_COMPLETE: "@calorie_coach_onboarding",
  SELECTED_DATE: "@calorie_coach_date",
} as const;

/**
 * AsyncStorage yardımcı fonksiyonları
 * Offline-first veri saklama
 */
export const storage = {
  // Profil
  async saveProfile(profile: any) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async getProfile() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // Öğünler (günlük cache)
  async saveDailyMeals(date: string, meals: any[]) {
    const key = `${STORAGE_KEYS.DAILY_MEALS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(meals));
  },

  async getDailyMeals(date: string) {
    const key = `${STORAGE_KEYS.DAILY_MEALS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Onboarding durumu
  async setOnboardingComplete(complete: boolean) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ONBOARDING_COMPLETE,
      JSON.stringify(complete)
    );
  },

  async isOnboardingComplete() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return data ? JSON.parse(data) : false;
  },

  // Tüm verileri temizle (çıkış yaparken)
  async clearAll() {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter((k) => k.startsWith("@calorie_coach"));
    await Promise.all(appKeys.map((key) => AsyncStorage.removeItem(key)));
  },
};
