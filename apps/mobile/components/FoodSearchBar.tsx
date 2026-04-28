import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FoodSearchBarProps {
  onSearch: (text: string) => void;
  placeholder?: string;
}

export const FoodSearchBar: React.FC<FoodSearchBarProps> = ({ 
  onSearch, 
  placeholder = "Besin ara... (elma, fıstık ezmesi vb.)" 
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(text);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <View className="flex-row items-center bg-white border border-border rounded-button px-4 h-14">
      <Ionicons name="search" size={20} color="#9E9E9E" />
      <TextInput
        className="flex-1 ml-3 text-base text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        value={text}
        onChangeText={setText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={() => setText("")}>
          <Ionicons name="close-circle" size={20} color="#9E9E9E" />
        </TouchableOpacity>
      )}
    </View>
  );
};
