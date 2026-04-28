import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calculateForPortion } from "../utils/nutrition";

interface PortionSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  product: {
    id: string;
    name: string;
    per100g: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    imageUrl?: string;
  };
}

export const PortionSelector: React.FC<PortionSelectorProps> = ({
  isVisible,
  onClose,
  onAdd,
  product,
}) => {
  const [gram, setGram] = useState("100");
  const [selectedType, setSelectedType] = useState("lunch");
  const [calculated, setCalculated] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });

  useEffect(() => {
    const g = parseFloat(gram) || 0;
    const result = calculateForPortion(product.per100g, g);
    setCalculated(result);
  }, [gram, product]);

  const handleAdd = () => {
    onAdd({
      foodName: product.name,
      offCode: product.id,
      portionGram: parseFloat(gram) || 0,
      calories: calculated.calories,
      macros: {
        protein: calculated.protein,
        carbs: calculated.carbs,
        fat: calculated.fat,
        fiber: calculated.fiber,
      },
      imageUrl: product.imageUrl,
      type: selectedType,
    });
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="bg-white rounded-t-3xl p-6 min-h-[500px]">
             {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-text-primary">Ekle: {product.name}</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Info */}
              <View className="flex-row mb-8 items-center">
                <View className="w-20 h-20 bg-background rounded-card overflow-hidden items-center justify-center mr-4">
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="fast-food-outline" size={32} color="#BDBDBD" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-text-secondary text-sm">100 gramda</Text>
                  <Text className="text-text-primary font-semibold text-lg">{product.per100g.calories} kcal</Text>
                </View>
              </View>

              {/* Amount Input */}
              <View className="mb-8">
                <Text className="text-text-primary font-semibold mb-2">Kaç Gram?</Text>
                <View className="flex-row items-center border border-border bg-background rounded-button px-4 h-14">
                  <TextInput
                    className="flex-1 text-lg font-bold text-text-primary"
                    keyboardType="number-pad"
                    value={gram}
                    onChangeText={setGram}
                    placeholder="100"
                  />
                  <Text className="text-text-hint font-bold">gram</Text>
                </View>
              </View>

              {/* Instant Calculations */}
              <View className="flex-row justify-between bg-white rounded-card p-4 border border-border mb-8">
                 <ValueItem label="Kalori" value={calculated.calories} unit="kcal" color="#4CAF50" />
                 <ValueItem label="Protein" value={calculated.protein} unit="g" color="#2196F3" />
                 <ValueItem label="Karb" value={calculated.carbs} unit="g" color="#FFC107" />
                 <ValueItem label="Yağ" value={calculated.fat} unit="g" color="#F44336" />
              </View>

              {/* Meal Type Selection */}
              <Text className="text-text-primary font-semibold mb-3">Öğün Seç</Text>
              <View className="flex-row flex-wrap gap-2 mb-10">
                {[
                  { id: "breakfast", label: "Kahvaltı" },
                  { id: "lunch", label: "Öğle" },
                  { id: "dinner", label: "Akşam" },
                  { id: "snack", label: "Ara Öğün" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedType(item.id)}
                    className={`px-6 h-12 rounded-full items-center justify-center border ${
                      selectedType === item.id ? "bg-primary border-primary" : "bg-white border-border"
                    }`}
                  >
                    <Text className={`font-semibold ${selectedType === item.id ? "text-white" : "text-text-secondary"}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleAdd}
                className="bg-primary h-14 rounded-button items-center justify-center mb-10"
              >
                <Text className="text-white font-bold text-lg">Öğünüme Ekle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const ValueItem = ({ label, value, unit, color }: any) => (
  <View className="items-center">
    <Text className="text-[10px] text-text-hint uppercase font-bold mb-1">{label}</Text>
    <Text className="text-sm font-bold" style={{ color }}>{value}{unit}</Text>
  </View>
);
