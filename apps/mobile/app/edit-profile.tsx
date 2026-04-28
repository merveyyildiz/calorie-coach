import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { saveProfileToBackend } from "../services/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    age: profile?.age?.toString() || "",
    weight: profile?.weight?.toString() || "",
    height: profile?.height?.toString() || "",
    gender: profile?.gender || "male",
    activityLevel: profile?.activityLevel || "moderate",
    goal: profile?.goal || "maintain",
    dailyCalorieGoal: profile?.dailyCalorieGoal?.toString() || "2000",
  });

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.weight || !formData.height) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        dailyCalorieGoal: parseInt(formData.dailyCalorieGoal),
      };

      const result = await saveProfileToBackend(payload);
      setProfile(result);
      
      if (Platform.OS === "web") {
        alert("Profil başarıyla güncellendi!");
      } else {
        Alert.alert("Başarılı", "Profiliniz güncellendi.");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Profil güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View className="mb-6">
      <Text className="text-text-hint font-black text-[10px] uppercase tracking-widest mb-3 ml-1">{title}</Text>
      <View className="bg-white border border-border rounded-card overflow-hidden">
        {children}
      </View>
    </View>
  );

  const renderInput = (label: string, value: string, onChange: (text: string) => void, placeholder?: string, keyboardType: any = "default") => (
    <View className="flex-row items-center px-4 py-4 border-b border-border last:border-b-0">
      <Text className="w-24 text-text-secondary font-bold">{label}</Text>
      <TextInput
        className="flex-1 text-text-primary font-bold text-right"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderOption = (label: string, options: { id: string; label: string }[], currentValue: string, onSelect: (id: any) => void) => (
    <View className="px-4 py-4 border-b border-border">
      <Text className="text-text-secondary font-bold mb-3">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            className={`px-4 py-2 rounded-full border ${
              currentValue === opt.id ? "bg-primary border-primary" : "bg-white border-border"
            }`}
          >
            <Text className={`font-bold text-xs ${currentValue === opt.id ? "text-white" : "text-text-secondary"}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center border-b border-border bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-text-primary">Profili Düzenle</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {renderSection("KİŞİSEL BİLGİLER", (
          <>
            {renderInput("İsim", formData.name, (t) => setFormData({ ...formData, name: t }), "Adınız")}
            {renderInput("Yaş", formData.age, (t) => setFormData({ ...formData, age: t }), "25", "number-pad")}
            {renderOption("Cinsiyet", [
              { id: "male", label: "Erkek" },
              { id: "female", label: "Kadın" }
            ], formData.gender, (id) => setFormData({ ...formData, gender: id }))}
          </>
        ))}

        {renderSection("VÜCUT BİLGİLERİ", (
          <>
            {renderInput("Kilo (kg)", formData.weight, (t) => setFormData({ ...formData, weight: t }), "70", "decimal-pad")}
            {renderInput("Boy (cm)", formData.height, (t) => setFormData({ ...formData, height: t }), "175", "number-pad")}
          </>
        ))}

        {renderSection("HEDEFLER", (
          <>
            {renderOption("Hedef", [
              { id: "lose", label: "Kilo Ver" },
              { id: "maintain", label: "Kiloyu Koru" },
              { id: "gain", label: "Kilo Al" }
            ], formData.goal, (id) => setFormData({ ...formData, goal: id }))}
            {renderOption("Aktivite", [
              { id: "sedentary", label: "Hareketsiz" },
              { id: "light", label: "Az Hareketli" },
              { id: "moderate", label: "Orta Hareketli" },
              { id: "active", label: "Çok Hareketli" }
            ], formData.activityLevel, (id) => setFormData({ ...formData, activityLevel: id }))}
            {renderInput("Kalori Hedefi", formData.dailyCalorieGoal, (t) => setFormData({ ...formData, dailyCalorieGoal: t }), "2000", "number-pad")}
          </>
        ))}

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary h-14 rounded-button items-center justify-center mt-4"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Değişiklikleri Kaydet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
