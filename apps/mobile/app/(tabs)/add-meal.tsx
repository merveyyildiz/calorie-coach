import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useFoodSearch, useAddMeal, useMeals } from "../../services/api";
import { FoodSearchResult } from "../../components/FoodSearchResult";
import { PortionSelector } from "../../components/PortionSelector";
import { CommonFoodCard } from "../../components/CommonFoodCard";
import { RecentLogCard } from "../../components/RecentLogCard";
import { getTodayStr } from "../../store/mealStore";

// Statik Sık Kullanılanlar Datası
const COMMON_FOODS = [
  { id: "1", name: "Yulaf Ezmesi", calories: 150, icon: "flame", color: "#F97316" },
  { id: "2", name: "Haşlanmış Yumurta", calories: 78, icon: "water", color: "#3B82F6" },
  { id: "3", name: "Sade Kahve", calories: 2, icon: "cafe", color: "#22C55E" },
  { id: "4", name: "Elma", calories: 95, icon: "nutrition", color: "#F97316" },
];

export default function AddMealScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Veri Çekme
  const { data: searchResults, isLoading: isSearchLoading } = useFoodSearch(searchQuery);
  const { data: recentMeals = [], isLoading: isRecentLoading, isRefetching, refetch } = useMeals(getTodayStr());
  const addMealMutation = useAddMeal();

  const handleSearchTrigger = () => {
    if (inputText.length >= 2) {
      setSearchQuery(inputText);
      Keyboard.dismiss();
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
    Keyboard.dismiss();
  };

  const handleSelectRecentLog = (meal: any) => {
    const food = meal.foods[0];
    if (!food) return;

    // 100g bazlı değerleri geri hesapla
    const factor = 100 / (food.portionGram || 100);
    const product = {
      id: food.offCode || food.id,
      name: food.foodName,
      imageUrl: food.imageUrl,
      per100g: {
        calories: food.calories * factor,
        protein: food.macros.protein * factor,
        carbs: food.macros.carbs * factor,
        fat: food.macros.fat * factor,
        fiber: food.macros.fiber * factor,
      }
    };

    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleAddMeal = (mealData: any) => {
    const { type, ...foodItem } = mealData;
    addMealMutation.mutate(
      { type, date: getTodayStr(), foods: [foodItem] },
      {
        onSuccess: () => {
          setIsModalVisible(false);
          setSearchQuery("");
          setInputText("");
          router.replace("/(tabs)");
        },
        onError: (err: any) => {
          alert(err.message || "Öğün kaydedilemedi.");
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1">
        
        {/* Modern Search Bar Section */}
        <View className="px-4 py-8">
          <View 
            className={`flex-row items-center bg-white rounded-3xl px-5 h-16 border ${
              isFocused ? "border-primary" : "border-border"
            }`}
          >
            <Ionicons 
              name="search" 
              size={20} 
              color={isFocused ? "#22C55E" : "#94A3B8"} 
              className="mr-3" 
            />
            <TextInput
              placeholder="Bugün ne yedin?"
              className="flex-1 text-base text-text-primary"
              style={Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSearchTrigger}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {inputText.length > 0 && (
              <TouchableOpacity 
                onPress={() => setInputText("")}
                className="mr-2"
              >
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleSearchTrigger}
              className={`w-10 h-10 rounded-2xl items-center justify-center ${
                inputText.length >= 2 ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22C55E" />}
        >
          {/* Arama Sonuçları Var mı? */}
          {searchQuery.length >= 2 && (
            <View className="px-4 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-black text-text-primary">Arama Sonuçları</Text>
                <TouchableOpacity onPress={() => { setSearchQuery(""); setInputText(""); }}>
                  <Text className="text-xs font-bold text-secondary">TEMİZLE</Text>
                </TouchableOpacity>
              </View>
              
              {isSearchLoading ? (
                <ActivityIndicator color="#22C55E" />
              ) : searchResults?.results?.map((item: any) => (
                <View key={item.id} className="mb-2">
                  <RecentLogCard 
                    name={item.name}
                    time={`${item.per100g.calories} kcal / 100g`}
                    calories={item.per100g.calories}
                    imageUrl={item.imageUrl}
                    onPress={() => handleSelectProduct(item)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Common Foods Section */}
          <View className="px-4 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-text-primary">Sık Kullanılanlar</Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-secondary uppercase tracking-widest">Hepsini Gör</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {COMMON_FOODS.map((food) => (
                <CommonFoodCard 
                  key={food.id}
                  name={food.name}
                  calories={food.calories}
                  icon={food.icon}
                  color={food.color}
                  onPress={() => {
                    setInputText(food.name);
                    setSearchQuery(food.name);
                  }}
                />
              ))}
            </View>
          </View>

          {/* Recent Logs Section */}
          <View className="px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-text-primary">Son Kayıtlar</Text>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-secondary uppercase tracking-widest">TÜMÜNÜ GÖR</Text>
              </TouchableOpacity>
            </View>

            {isRecentLoading ? (
               <ActivityIndicator color="#22C55E" />
            ) : recentMeals.length === 0 ? (
              <View className="bg-white border border-dashed border-border rounded-[16px] py-10 items-center justify-center">
                <Text className="text-text-hint font-bold">Henüz kayıt yok</Text>
              </View>
            ) : (
              recentMeals.slice(0, 3).map((meal: any) => (
                <RecentLogCard 
                  key={meal.id}
                  name={meal.foods.map((f: any) => f.foodName).join(", ")}
                  time={meal.createdAt ? new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00"}
                  calories={meal.totalCalories}
                  imageUrl={meal.foods[0]?.imageUrl}
                  onPress={() => handleSelectRecentLog(meal)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Portion Selector Modal */}
      {selectedProduct && (
        <PortionSelector
          isVisible={isModalVisible}
          product={selectedProduct}
          onClose={() => setIsModalVisible(false)}
          onAdd={handleAddMeal}
        />
      )}
    </SafeAreaView>
  );
}
