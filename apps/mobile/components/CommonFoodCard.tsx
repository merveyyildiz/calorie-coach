import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  name: string;
  calories: number;
  icon: any;
  color: string;
  onPress: () => void;
}

export function CommonFoodCard({ name, calories, icon, color, onPress }: Props) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white rounded-[16px] p-5 border border-border w-[48%] items-center mb-4"
    >
      <View 
        style={{ backgroundColor: `${color}15` }} 
        className="w-12 h-12 rounded-full items-center justify-center mb-3"
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-text-primary font-bold text-sm mb-1">{name}</Text>
      <Text className="text-text-hint text-[10px] font-bold uppercase tracking-widest">{calories} KCAL</Text>
    </TouchableOpacity>
  );
}
