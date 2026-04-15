import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  name: string;
  time: string;
  calories: number;
  imageUrl?: string;
  onPress?: () => void;
}

export function RecentLogCard({ name, time, calories, imageUrl, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center" }}
      className="bg-card rounded-[16px] p-2.5 my-1.5 border border-slate-100 shadow-sm mx-0.5"
    >
      {/* Sol: Görsel */}
      <View className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden items-center justify-center">
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="restaurant-outline" size={24} color="#94A3B8" />
        )}
      </View>

      {/* Orta: Bilgi */}
      <View className="flex-1 px-3 justify-center">
        <Text className="text-text-primary text-base font-bold" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-text-hint text-[11px] font-medium text-slate-400">
          {time}
        </Text>
      </View>

      {/* Sağ: Kalori Durumu */}
      <View className="items-end pr-3">
        <Text className="text-primary text-base font-black">{calories} kcal</Text>
        <Text className="text-text-hint text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">KAYDEDİLDİ</Text>
      </View>
    </TouchableOpacity>
  );
}
