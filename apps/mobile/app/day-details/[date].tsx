import React, { useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMeals, useDeleteMeal } from "../../services/api";
import { MealCard } from "../../components/MealCard";

export default function DayDetailsScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  // Veri Çekme
  const { data: meals = [], isLoading, refetch, isRefetching } = useMeals(date as string);
  const deleteMealMutation = useDeleteMeal();

  const totals = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0;
    meals.forEach((meal: any) => {
      cal += meal.totalCalories;
      pro += meal.totalMacros?.protein || 0;
      carb += meal.totalMacros?.carbs || 0;
      fat += meal.totalMacros?.fat || 0;
    });
    return { cal, pro, carb, fat };
  }, [meals]);

  const handleDeleteMeal = (id: string, mealDate: string) => {
    deleteMealMutation.mutate({ id, date: mealDate });
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  const displayDate = new Date(date as string).toLocaleDateString("tr-TR", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header with Back Button */}
        <View className="px-4 py-4 flex-row items-center bg-white/50 border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-4"
        >
          <Ionicons name="chevron-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-black text-text-primary">Gün Detayları</Text>
          <Text className="text-[10px] font-black text-text-hint uppercase tracking-widest">{displayDate}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22C55E" />}
      >
        <View className="px-4">
          {/* Day Summary Card */}
        <View className="bg-primary rounded-[16px] p-6 mb-8 shadow-xl shadow-primary/10">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">TOPLAM KALORİ</Text>
              <Text className="text-4xl font-black text-white">{totals.cal} kcal</Text>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Ionicons name="calendar" size={26} color="white" />
            </View>
          </View>

          <View className="flex-row justify-between items-center pt-4 border-t border-white/20">
            <MacroSummary label="PROT" value={totals.pro} color="#F97316" />
            <MacroSummary label="KARB" value={totals.carb} color="#3B82F6" />
            <MacroSummary label="YAĞ" value={totals.fat} color="#FFFFFF" />
          </View>
        </View>

        <Text className="text-lg font-black text-text-primary mb-4 uppercase tracking-widest text-[11px]">Günün Öğünleri</Text>

        {meals.length === 0 ? (
          <View className="bg-card border border-dashed border-slate-200 rounded-2xl py-12 items-center justify-center">
            <Text className="text-text-hint font-bold">Bu gün için öğün kaydedilmedi.</Text>
          </View>
        ) : (
          meals.map((meal: any) => (
            <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
          ))
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MacroSummary = ({ label, value, color }: any) => (
  <View className="items-center">
    <Text style={{ color }} className="text-[10px] font-black tracking-widest mb-1 uppercase">{label}</Text>
    <Text className="text-white font-black text-base">{Math.round(value)}g</Text>
  </View>
);
