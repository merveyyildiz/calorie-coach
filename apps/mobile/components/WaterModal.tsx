import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useWaterStore } from "../store/waterStore";
import { getTodayStr } from "../store/mealStore";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export const WaterModal: React.FC<Props> = ({ isVisible, onClose }) => {
  const { addWater, resetWater, getWaterForDate } = useWaterStore();
  const today = getTodayStr();
  const currentWater = getWaterForDate(today);
  const targetWater = 2.5;

  const handleAdd = (amount: number) => {
    addWater(amount);
  };

  const handleReset = () => {
    resetWater(today);
  };

  const options = [
    { label: "250ml", amount: 0.25, icon: "water-outline" },
    { label: "500ml", amount: 0.5, icon: "water" },
    { label: "750ml", amount: 0.75, icon: "color-fill" },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose} 
          style={StyleSheet.absoluteFill} 
        />
        
        <View className="bg-card w-[90%] rounded-[32px] p-8 shadow-2xl">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="water" size={32} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-black text-text-primary">Su Takibi</Text>
            <Text className="text-text-hint text-sm mt-1">Günde en az 2.5L içmelisin</Text>
          </View>

          {/* Current Status */}
          <View className="bg-blue-50/50 rounded-2xl p-6 items-center mb-8 border border-blue-100">
             <Text className="text-4xl font-black text-blue-600">{currentWater} <Text className="text-lg">L</Text></Text>
             <Text className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">BUGÜN İÇİLEN</Text>
          </View>

          {/* Buttons */}
          <View className="flex-row justify-between mb-8">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => handleAdd(opt.amount)}
                className="items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl w-[30%]"
              >
                <Ionicons name={opt.icon as any} size={24} color="#3B82F6" />
                <Text className="text-[10px] font-bold text-text-primary mt-2">{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row space-x-3">
             <TouchableOpacity 
                onPress={handleReset}
                className="flex-1 h-14 bg-slate-100 rounded-2xl items-center justify-center"
             >
                <Text className="text-text-secondary font-bold">Sıfırla</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={onClose}
                className="flex-[2] h-14 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-300"
             >
                <Text className="text-white font-bold text-lg">Kapat</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
