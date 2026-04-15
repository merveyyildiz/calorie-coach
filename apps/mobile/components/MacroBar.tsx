import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function MacroBar({ label, value, max, color }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const safeMax = Math.max(1, max);
    const target = Math.min(value / safeMax, 1);
    
    // Barın genişliğini esneyerek ayarla
    progress.value = withSpring(target, {
      damping: 15,
      stiffness: 90,
    });
  }, [value, max]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-text-primary">{label}</Text>
        <Text className="text-sm font-medium text-text-hint">
          {Math.round(value)}<Text className="text-xs">/{Math.round(max)}g</Text>
        </Text>
      </View>
      
      {/* Arkaplan Barı */}
      <View className="h-[6px] w-full bg-border rounded-full overflow-hidden">
        {/* İlerleme Animasyonlu Bar */}
        <Animated.View
          style={[{ height: "100%", backgroundColor: color }, animatedStyle]}
          className="rounded-full"
        />
      </View>
    </View>
  );
}
