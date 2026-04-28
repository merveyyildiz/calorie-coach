import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { saveProfileToBackend } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose" | "maintain" | "gain";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setProfile } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);

  // Otomatik kalori hesaplama (Adım 3'e gelir gelmez)
  useEffect(() => {
    if (step === 3 && height && weight && age && gender && activityLevel && goal) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const a = parseInt(age);
      
      let bmr = 0;
      if (gender === "male") {
        bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
      } else {
        bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
      }

      const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
      
      let target = tdee;
      if (goal === "lose") target -= 500;
      if (goal === "gain") target += 500;

      setDailyCalorieGoal(Math.round(target));
    }
  }, [step, goal]);

  const handleNextStep1 = () => {
    if (!name || !age || !gender) return setError("Lütfen tüm alanları doldur.");
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) return setError("Geçerli bir yaş gir.");
    setError("");
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!height || !weight || !activityLevel) return setError("Lütfen tüm alanları doldur.");
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || h < 100 || h > 250) return setError("Geçerli bir boy gir.");
    if (isNaN(w) || w < 20 || w > 300) return setError("Geçerli bir kilo gir.");
    setError("");
    setStep(3);
  };

  const handleFinish = async () => {
    if (!goal) return setError("Lütfen hedefini seç.");
    setError("");
    setLoading(true);

    try {
      const profileData = {
        name,
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        activityLevel,
        goal,
        dailyCalorieGoal,
      };

      const result = await saveProfileToBackend(profileData);
      setProfile(result); // Zustanda bas, layout izlesin ve main tabs'e göndersin
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Profil kaydedilemedi.");
      setLoading(false);
    }
  };

  // UI Helpers
  const renderProgressBar = () => (
    <View className="flex-row w-full h-2 bg-border rounded-full mb-8 overflow-hidden">
      <View
        className="h-full bg-primary"
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 py-12 pt-16">
          
          {/* Geri butonu (sadece 2. ve 3. adımda) */}
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} className="absolute top-12 left-6 z-10 w-10 h-10 items-center justify-center bg-white rounded-full border border-border">
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          )}

          {/* Stepper info & Progress */}
          <View className="flex-row justify-between mb-2 pl-2">
            <Text className="text-sm font-semibold text-text-hint uppercase tracking-wider">Adım {step}/3</Text>
          </View>
          {renderProgressBar()}

          {/* ----- ADIM 1 ----- */}
          {step === 1 && (
            <View className="flex-1">
              <Text className="text-3xl font-bold text-text-primary mb-2">Seni tanıyalım 👋</Text>
              <Text className="text-base text-text-secondary mb-8">Kişiselleştirilmiş bir deneyim için temel bilgilerine ihtiyacımız var.</Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-text-primary mb-1 ml-1">Adın</Text>
                  <TextInput
                    className="h-14 bg-card rounded-button border border-border px-4 text-base text-text-primary"
                    placeholder="Adın"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-text-primary mb-1 ml-1 mt-4">Yaşın</Text>
                  <TextInput
                    className="h-14 bg-card rounded-button border border-border px-4 text-base text-text-primary"
                    placeholder="25"
                    keyboardType="number-pad"
                    value={age}
                    onChangeText={setAge}
                  />
                  </View>

                <View>
                  <Text className="text-sm font-medium text-text-primary mb-2 ml-1 mt-4">Cinsiyetin</Text>
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      onPress={() => setGender("female")}
                      className={`flex-1 h-14 rounded-button items-center justify-center border mr-2 ${gender === "female" ? "bg-primary-light border-primary" : "bg-card border-border"}`}
                    >
                      <Text className={`font-semibold ${gender === "female" ? "text-primary" : "text-text-secondary"}`}>Kadın</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setGender("male")}
                      className={`flex-1 h-14 rounded-button items-center justify-center border ml-2 ${gender === "male" ? "bg-primary-light border-primary" : "bg-card border-border"}`}
                    >
                      <Text className={`font-semibold ${gender === "male" ? "text-primary" : "text-text-secondary"}`}>Erkek</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? <Text className="text-error mt-4 ml-1">{error}</Text> : null}
              </View>

              <TouchableOpacity onPress={handleNextStep1} className="h-14 bg-primary rounded-button items-center justify-center mt-auto mb-6">
                <Text className="text-white text-lg font-semibold">Devam Et</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ----- ADIM 2 ----- */}
          {step === 2 && (
            <View className="flex-1">
              <Text className="text-3xl font-bold text-text-primary mb-2">Vücudunu tanı 📏</Text>
              <Text className="text-base text-text-secondary mb-8">Bazal metabolizma hızını (BMR) hesaplayabilmemiz için gerekli.</Text>
              
              <View className="flex-row mb-6">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-medium text-text-primary mb-1 ml-1">Boy (cm)</Text>
                  <TextInput
                    className="h-14 bg-card rounded-button border border-border px-4 text-center text-lg font-medium text-text-primary"
                    placeholder="170"
                    keyboardType="number-pad"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-medium text-text-primary mb-1 ml-1">Kilo (kg)</Text>
                  <TextInput
                    className="h-14 bg-card rounded-button border border-border px-4 text-center text-lg font-medium text-text-primary"
                    placeholder="70"
                    keyboardType="decimal-pad"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
              </View>

              <Text className="text-sm font-medium text-text-primary mb-2 ml-1">Ne kadar hareketlisin?</Text>
              {[
                { id: "sedentary", title: "Hareketsiz", desc: "Masa başı iş, sıfır spor" },
                { id: "light", title: "Az Aktif", desc: "Haftada 1-3 gün hafif spor" },
                { id: "moderate", title: "Orta", desc: "Haftada 3-5 gün orta tempo" },
                { id: "active", title: "Aktif", desc: "Haftada 6-7 gün spor" },
                { id: "very_active", title: "Çok Aktif", desc: "Fiziksel güç gerektiren iş / Profesyonel sporcu" }
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setActivityLevel(item.id as ActivityLevel)}
                  className={`p-4 mb-3 rounded-card border ${activityLevel === item.id ? "bg-primary-light border-primary" : "bg-white border-border"}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-base font-bold ${activityLevel === item.id ? "text-primary" : "text-text-primary"}`}>{item.title}</Text>
                      <Text className={`text-sm mt-1 ${activityLevel === item.id ? "text-primary-dark" : "text-text-secondary"}`}>{item.desc}</Text>
                    </View>
                    {activityLevel === item.id && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
                  </View>
                </TouchableOpacity>
              ))}

              {error ? <Text className="text-error mt-2 ml-1">{error}</Text> : null}

              <TouchableOpacity onPress={handleNextStep2} className="h-14 bg-primary rounded-button items-center justify-center mt-6 mb-6">
                <Text className="text-white text-lg font-semibold">Devam Et</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ----- ADIM 3 ----- */}
          {step === 3 && (
            <View className="flex-1">
              <Text className="text-3xl font-bold text-text-primary mb-2">Hedefini belirle 🎯</Text>
              <Text className="text-base text-text-secondary mb-6">Hesaplanan BMR ve aktivite seviyene göre nasıl ilerlemek istiyorsun?</Text>

              <View className="space-y-4 mb-8">
                {[
                  { id: "lose", title: "Kilo Ver", icon: "arrow-down-circle" },
                  { id: "maintain", title: "Kilomu Koru", icon: "checkmark-circle" },
                  { id: "gain", title: "Kilo Al", icon: "arrow-up-circle" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setGoal(item.id as Goal)}
                    className={`p-5 rounded-card border flex-row items-center ${goal === item.id ? "bg-primary-light border-primary" : "bg-white border-border"}`}
                  >
                    <Ionicons name={item.icon as any} size={28} color={goal === item.id ? "#4CAF50" : "#9E9E9E"} className="mr-4" />
                    <Text className={`text-lg font-bold flex-1 ${goal === item.id ? "text-primary-dark" : "text-text-primary"}`}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {goal && (
                <View className="bg-white rounded-card border border-border p-6 items-center">
                  <Text className="text-text-secondary text-base font-medium mb-2">Önerilen Günlük Kalori Hedefi</Text>
                  <View className="flex-row items-end">
                    <Text className="text-5xl font-extrabold text-primary">{dailyCalorieGoal}</Text>
                    <Text className="text-xl font-bold text-text-hint mb-1 ml-2">kcal</Text>
                  </View>
                  <Text className="text-text-hint text-xs mt-3 text-center">Harris-Benedict formülü kullanılarak hesaplanmıştır</Text>
                </View>
              )}

              {error ? <Text className="text-error mt-4 ml-1">{error}</Text> : null}

              <TouchableOpacity onPress={handleFinish} disabled={loading} className="h-14 bg-primary rounded-button items-center justify-center mt-auto mb-6">
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-bold tracking-wide">Maceraya Başla!</Text>}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
