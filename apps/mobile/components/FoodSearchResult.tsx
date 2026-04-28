import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodSearchResultProps {
  name: string;
  caloriesPer100g: number;
  imageUrl?: string;
  onPress: () => void;
}

export const FoodSearchResult: React.FC<FoodSearchResultProps> = ({ 
  name, 
  caloriesPer100g, 
  imageUrl, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white p-3 mb-2 rounded-card border border-border"
    >
      {/* Görsel Kutusu */}
      <View className="w-12 h-12 bg-background rounded-lg items-center justify-center mr-4 overflow-hidden">
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={{ width: "100%", height: "100%" }} 
            resizeMode="cover" 
          />
        ) : (
          <Ionicons name="fast-food-outline" size={24} color="#BDBDBD" />
        )}
      </View>

      {/* Bilgiler */}
      <View className="flex-1">
        <Text 
          className="text-base font-bold text-text-primary" 
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-sm text-text-hint">
          {caloriesPer100g} kcal / 100g
        </Text>
      </View>

      {/* Artı Butonu İkonu */}
      <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center">
        <Ionicons name="add" size={20} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );
};
