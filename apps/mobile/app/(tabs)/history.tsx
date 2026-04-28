import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWeeklySummary } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function HistoryScreen() {
  const [range, setRange] = useState<"week" | "month">("week");
  const { profile } = useAuthStore();
  const { data: summary, isLoading, isRefetching, refetch } = useWeeklySummary(range);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header Section */}
      <View className="px-4 py-6 flex-row justify-between items-center bg-white/50">
        <Text className="text-2xl font-black text-text-primary tracking-tight">Geçmiş ve İstatistikler</Text>
        
        {/* Modern Toggle Switch */}
        <View className="flex-row bg-slate-100/80 rounded-2xl p-1 border border-slate-200/50">
          <TouchableOpacity 
            onPress={() => setRange("week")}
            className={`px-4 py-1.5 rounded-xl ${range === "week" ? "bg-white" : "bg-transparent"}`}
          >
            <Text className={`text-xs font-black ${range === "week" ? "text-primary" : "text-text-hint"}`}>HAFTA</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setRange("month")}
            className={`px-4 py-1.5 rounded-xl ${range === "month" ? "bg-white" : "bg-transparent"}`}
          >
            <Text className={`text-xs font-black ${range === "month" ? "text-primary" : "text-text-hint"}`}>AY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-text-hint font-bold mt-4">Analiz ediliyor...</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22C55E" />}
        >
          <View className="px-4">
            {/* Average Progress Card */}
            <View className="bg-primary rounded-[32px] p-8 mb-8 relative overflow-hidden">
              <View className="flex-row items-center mb-4">
                 <Ionicons name="flash" size={18} color="white" className="mr-2" />
                 <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">
                   ORTALAMA GELİŞİM
                 </Text>
              </View>
              
              <View className="flex-row items-baseline mb-4">
                <Text className="text-5xl font-black text-white">{summary?.averageCalories || 0}</Text>
                <Text className="text-white/80 font-bold ml-2 text-xl">kcal/gün</Text>
              </View>

              <Text className="text-white text-sm font-medium leading-5 pr-10">
                Enerji verimliliğin geçen haftaya göre <Text className="font-black underline">%12</Text> iyileşti.
              </Text>

              {/* Decorative Graph/Chart Background Icon */}
              <View className="absolute bottom-[-10px] right-[-10px] opacity-20">
                <Ionicons name="analytics" size={120} color="white" />
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-text-primary">Günlük Detaylar</Text>
              <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
                  {new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                </Text>
              </View>
            </View>

            {summary?.days?.length === 0 ? (
              <View className="bg-white border border-dashed border-border rounded-2xl py-12 items-center justify-center">
                <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
                <Text className="text-text-hint mt-4 font-bold">Bu aralıkta veri bulunamadı.</Text>
              </View>
            ) : (
              summary?.days?.map((day: any) => {
                const isOnTrack = day.totalCalories < (profile?.dailyCalorieGoal || 2000) + 100;
                return (
                  <TouchableOpacity 
                    key={day.date} 
                    activeOpacity={0.7}
                    onPress={() => router.push(`/day-details/${day.date}`)}
                    className="bg-white mb-4 rounded-[24px] border border-border flex-row items-center overflow-hidden"
                  >
                    {/* Status Accent Border */}
                    <View className={`w-1.5 self-stretch ${isOnTrack ? "bg-primary" : "bg-orange-400"}`} />
                    
                    <View className="flex-1 flex-row items-center p-4">
                      {/* Date Square */}
                      <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4 border border-border">
                        <Text className="text-[10px] font-black text-slate-300 uppercase">
                          {new Date(day.date).toLocaleDateString("tr-TR", { weekday: "short" })}
                        </Text>
                        <Text className="text-lg font-black text-text-primary">
                          {new Date(day.date).getDate()}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                         <View className="flex-row space-x-1 mb-1">
                            <View className="w-2 h-2 rounded-full bg-primary" />
                            <View className="w-2 h-2 rounded-full bg-primary" />
                            <View className={`w-2 h-2 rounded-full ${day.mealCount > 2 ? "bg-primary" : "bg-slate-100"}`} />
                            <View className={`w-2 h-2 rounded-full ${day.mealCount > 3 ? "bg-primary" : "bg-slate-100"}`} />
                         </View>
                        <Text className="text-[10px] text-text-hint font-black uppercase tracking-widest">
                           {day.mealCount} öğün kaydedildi
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-[20px] font-black text-text-primary">
                          {day.totalCalories.toLocaleString()} <Text className="text-[10px] text-text-hint font-bold">kcal</Text>
                        </Text>
                        <Text className={`text-[9px] font-black uppercase tracking-tighter ${isOnTrack ? "text-primary" : "text-orange-400"}`}>
                           {isOnTrack ? "HEDEFTE" : "DÜŞÜK ENERJİ"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
