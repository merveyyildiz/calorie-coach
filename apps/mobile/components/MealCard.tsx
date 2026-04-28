import React from "react";
import { View, Text, Alert, Platform, Image } from "react-native";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import type { Meal } from "../types";

interface Props {
  meal: Meal;
  onDelete: (id: string, date: string) => void;
}

export function MealCard({ meal, onDelete }: Props) {
  // Silme onayı sor
  const confirmDelete = () => {
    if (Platform.OS === "web") {
      if (confirm("Bu öğünü silmek istediğinizden emin misiniz?")) {
        onDelete(meal.id, meal.date);
      }
      return;
    }

    Alert.alert(
      "Öğünü Sil",
      "Bu öğünü silmek istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => onDelete(meal.id, meal.date) },
      ]
    );
  };

  // Sağ taraftaki (swipe) aksiyon butonu
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        onPress={confirmDelete}
        className="bg-error w-20 items-center justify-center rounded-[20px] my-2 ml-3 shadow-sm"
      >
        <Ionicons name="trash-outline" size={24} color="#FFF" />
        <Text className="text-white text-xs font-semibold mt-1">Sil</Text>
      </TouchableOpacity>
    );
  };

  // Öğün tipine göre etiket
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "breakfast": return "Kahvaltı";
      case "lunch": return "Öğle";
      case "dinner": return "Akşam";
      case "snack": return "Aperatif";
      default: return "Öğün";
    }
  };

  const mealLabel = getMealTypeLabel(meal.type);
  const time = meal.createdAt ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00";
  const firstFood = meal.foods[0];

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2}>
      <TouchableOpacity 
        onLongPress={confirmDelete}
        activeOpacity={0.7}
      >
        <View 
          style={{ flexDirection: "row", alignItems: "center" }}
          className="bg-white rounded-[24px] p-4 my-2 border border-border mx-1"
        >
          {/* 1. Sol: Ürün Görseli */}
          <View className="w-[72px] h-[72px] bg-slate-100 rounded-xl overflow-hidden items-center justify-center">
            {firstFood?.imageUrl ? (
              <Image 
                source={{ uri: firstFood.imageUrl }} 
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="fast-food-outline" size={32} color="#94A3B8" />
            )}
          </View>

          {/* 2. Orta: Başlık ve Zaman Bilgisi */}
          <View className="flex-1 px-4 justify-center">
            <Text className="text-text-primary text-[17px] font-bold leading-tight mb-1" numberOfLines={2}>
              {meal.foods.map(f => f.foodName).join(", ")}
            </Text>
            <Text className="text-text-hint text-[12px] font-medium text-slate-400 capitalize">
              {mealLabel} • {time}
            </Text>
          </View>

          {/* 3. Sağ: Kalori Değeri */}
          <View className="items-end pr-3 min-w-[70px]">
            <Text className="text-primary text-[20px] font-black">{meal.totalCalories}</Text>
            <Text className="text-text-hint text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">KCAL</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
