import React, { useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { useMeals, useDeleteMeal } from "../../services/api";
import { getTodayStr } from "../../store/mealStore";
import { CalorieRing } from "../../components/CalorieRing";
import { MealCard } from "../../components/MealCard";
import { WaterModal } from "../../components/WaterModal";
import { useWaterStore } from "../../store/waterStore";

export default function DashboardScreen() {
  const { profile, user } = useAuthStore();
  const today = getTodayStr();
  const router = useRouter();
  const [isWaterModalVisible, setIsWaterModalVisible] = React.useState(false);

  // Water Store
  const { getWaterForDate } = useWaterStore();
  const currentWater = getWaterForDate(today);

  // React Query endpoint'i
  const { data: meals = [], isLoading, refetch, isRefetching } = useMeals(today);
  const deleteMealMutation = useDeleteMeal();

  // Matematik hesaplamaları (Günlük toplamlar)
  const totals = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;
    meals.forEach((meal: any) => {
      cal += meal.totalCalories;
      pro += meal.totalMacros?.protein || 0;
      carb += meal.totalMacros?.carbs || 0;
      fat += meal.totalMacros?.fat || 0;
      fib += meal.totalMacros?.fiber || 0;
    });
    return { cal, pro, carb, fat, fib };
  }, [meals]);

  const handleDeleteMeal = (id: string, date: string) => {
    deleteMealMutation.mutate({ id, date });
  };

  const currentGoal = profile?.dailyCalorieGoal || 2000;
  const pGoal = profile?.macroGoals?.protein || 150;
  const cGoal = profile?.macroGoals?.carbs || 250;
  const fGoal = profile?.macroGoals?.fat || 65;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22C55E" />}
      >
        {/* Modern Header */}
        <View className="px-4 py-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.push("/(tabs)/profile")}
              className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="person" size={20} color="#22C55E" />
            </TouchableOpacity>
            <Text className="text-primary text-xl font-black tracking-tight">
              Calorie Coach
            </Text>
          </View>
        </View>

        {/* Main Progress Section */}
        <View className="items-center py-6">
          <CalorieRing current={totals.cal} max={currentGoal} size={220} strokeWidth={18} />
        </View>

        {/* Summary Row */}
        <View className="flex-row px-4 justify-between mb-8">
          <ActivityCard 
            label="YAKILAN" 
            value="780" 
            unit="kcal" 
            icon="flame" 
            color="#F97316" 
            containerClass="w-[48%]"
          />
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => setIsWaterModalVisible(true)}
            className="w-[48%]"
          >
            <ActivityCard 
              label="SU TAKİBİ" 
              value={currentWater} 
              unit="L" 
              icon="water" 
              color="#3B82F6" 
              containerClass="w-full"
            />
          </TouchableOpacity>
        </View>

        {/* Daily Macros Section */}
        <View className="px-4 mb-8">
          <View className="flex-row justify-between items-end mb-4 px-1">
            <Text className="text-lg font-black text-text-primary">Günlük Makrolar</Text>
            <Text className="text-[10px] font-black text-primary uppercase tracking-widest">HEDEFE ULAŞILDI %{(totals.cal / currentGoal * 100).toFixed(0)}</Text>
          </View>

          {/* Protein (Wide Card) */}
          <View className="bg-white rounded-[24px] p-6 mb-4 border border-border">
             <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                   <View className="w-2 h-2 rounded-full bg-tertiary mr-2" />
                   <Text className="text-text-primary font-bold text-base">Protein</Text>
                </View>
                <Text className="text-text-primary font-bold text-sm">{Math.round(totals.pro)}g <Text className="text-text-hint">/ {pGoal}g</Text></Text>
             </View>
             <View className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <View 
                  style={{ width: `${Math.min((totals.pro/pGoal)*100, 100)}%` }} 
                  className="h-full bg-tertiary rounded-full" 
                />
             </View>
          </View>

          {/* Carbs & Fats Row */}
          <View className="flex-row justify-between">
             <MacroMiniCard 
                label="Karbonhidrat" 
                value={totals.carb} 
                max={cGoal} 
                color="#3B82F6" 
             />
             <MacroMiniCard 
                label="Yağ" 
                value={totals.fat} 
                max={fGoal} 
                color="#22C55E" 
             />
          </View>
        </View>

        {/* Recent Meals Section */}
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black text-text-primary">Son Öğünler</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text className="text-[10px] font-black text-secondary uppercase tracking-widest">TÜMÜNÜ GÖR</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
             <ActivityIndicator color="#22C55E" />
          ) : meals.length === 0 ? (
            <View className="bg-card border border-dashed border-border rounded-2xl py-10 items-center justify-center">
              <Text className="text-text-hint font-bold">Bugün henüz öğün kaydedilmedi</Text>
            </View>
          ) : (
            meals.slice(0, 5).map((meal: any) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        onPress={() => router.push("/(tabs)/add-meal")}
        activeOpacity={0.85}
        className="absolute bottom-28 right-6 w-16 h-16 bg-primary rounded-[20px] items-center justify-center"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Water Tracking Modal */}
      <WaterModal 
        isVisible={isWaterModalVisible} 
        onClose={() => setIsWaterModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

// Helper Components
const ActivityCard = ({ label, value, icon, color, unit, containerClass }: any) => (
  <View className={`bg-white rounded-[24px] p-6 items-center border border-border ${containerClass}`}>
    <View className="mb-3">
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <View className="flex-row items-baseline">
      <Text className="text-[18px] font-black text-text-primary">{value}</Text>
      {unit && <Text className="text-[10px] font-bold text-text-hint ml-1">{unit}</Text>}
    </View>
    <Text className="text-[10px] font-black text-text-hint uppercase tracking-widest mt-1">{label}</Text>
  </View>
);

const MacroMiniCard = ({ label, value, max, color }: any) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <View className="bg-white rounded-[24px] p-6 w-[48%] border border-border">
       <View className="mb-4">
          <Text className="text-text-primary font-bold text-sm mb-1">{label}</Text>
          <Text className="text-text-primary font-bold text-xs">{Math.round(value)}g <Text className="text-text-hint font-medium">/ {max}g</Text></Text>
       </View>
       <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <View style={{ width: `${percentage}%`, backgroundColor: color }} className="h-full rounded-full" />
       </View>
    </View>
  );
};
