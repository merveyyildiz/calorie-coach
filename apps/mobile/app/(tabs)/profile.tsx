import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { signOut } from "../../services/auth";

export default function ProfileScreen() {
  const { profile, user } = useAuthStore();

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")) {
        await signOut();
      }
      return;
    }

    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: async () => await signOut() },
    ]);
  };

  const calculateBmi = () => {
    if (!profile?.weight || !profile?.height) return 0;
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getGoalStatusLabel = (goal?: string) => {
    switch(goal) {
      case "lose": return "Kilo Verme";
      case "gain": return "Kilo Alma";
      case "maintain": return "Kiloyu Koruma";
      default: return "";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        
        {/* Head Bar */}
        <View className="px-4 py-4 border-b border-border bg-white flex-row items-center justify-between pb-6 pt-8">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-primary-light rounded-full border-[3px] border-primary/20 items-center justify-center mr-4">
              <Text className="text-xl font-bold text-primary">
                {user?.name?.substring(0, 2).toUpperCase() || "ÜY"}
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-text-primary mb-1">{user?.name || "İsimsiz"}</Text>
              <Text className="text-sm font-medium text-text-secondary">{user?.email}</Text>
            </View>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-text-primary mb-4">Metabolik Durum</Text>
          
          <View className="flex-row mb-4">
            <View className="flex-1 bg-white border border-border rounded-[16px] p-4 items-center mr-2">
              <Ionicons name="body-outline" size={24} color="#F97316" mb-2 />
              <Text className="text-[10px] text-text-hint font-black tracking-widest">BMI</Text>
              <Text className="text-xl font-black text-text-primary mt-1">{calculateBmi()}</Text>
            </View>

            <View className="flex-1 bg-white border border-border rounded-[16px] p-4 items-center mx-1">
              <Ionicons name="flame-outline" size={24} color="#22C55E" mb-2 />
              <Text className="text-[10px] text-text-hint font-black tracking-widest">Günlük Hedef</Text>
              <Text className="text-xl font-black text-text-primary mt-1">{profile?.dailyCalorieGoal || 0}</Text>
            </View>

            <View className="flex-1 bg-white border border-border rounded-[16px] p-4 items-center ml-2">
              <Ionicons name="fitness-outline" size={24} color="#3B82F6" mb-2 />
              <Text className="text-[10px] text-text-hint font-black tracking-widest">Ana Hedef</Text>
              <Text className="text-[10px] font-black text-primary mt-2" numberOfLines={1}>{getGoalStatusLabel(profile?.goal)}</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-text-primary mb-3 mt-4">Vücut Bilgileri</Text>
          <View className="bg-white border border-border rounded-card overflow-hidden">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-base text-text-secondary font-medium">Yaş</Text>
              <Text className="text-base font-bold text-text-primary">{profile?.age} yaş</Text>
            </View>
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-base text-text-secondary font-medium">Boy</Text>
              <Text className="text-base font-bold text-text-primary">{profile?.height} cm</Text>
            </View>
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-base text-text-secondary font-medium">Kilo</Text>
              <Text className="text-base font-bold text-text-primary">{profile?.weight} kg</Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <Text className="text-lg font-bold text-text-primary mb-3 mt-8">Hesap Ayarları</Text>
          <View className="bg-white border border-border rounded-card overflow-hidden mb-6">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-border">
              <Ionicons name="pencil" size={20} color="#9E9E9E" className="mr-3" />
              <Text className="flex-1 text-base text-text-primary font-medium">Profili Düzenle</Text>
              <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleLogout} className="flex-row items-center p-4">
              <Ionicons name="log-out-outline" size={20} color="#F44336" className="mr-3" />
              <Text className="flex-1 text-base text-error font-medium">Güvenli Çıkış Yap</Text>
              <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
            </TouchableOpacity>
          </View>
          
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
