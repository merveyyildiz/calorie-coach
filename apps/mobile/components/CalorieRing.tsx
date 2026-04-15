import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  current: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

export function CalorieRing({ current, max, size = 160, strokeWidth = 14 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = useSharedValue(0);

  useEffect(() => {
    // Eksi veya hedefin üzerinde kalori hesaplamaları için koruma
    const safeCurrent = Math.max(0, current);
    const safeMax = Math.max(1, max);

    // Animasyon hedefini belirle (eğer max değeri aşılmışsa çember tamamen dolar)
    const targetProgress = Math.min(safeCurrent / safeMax, 1);
    
    // Değer değiştiğinde yaylanarak (spring) animasyonu çalıştır
    progress.value = withSpring(targetProgress, {
      damping: 15,
      stiffness: 90,
      mass: 1,
    });
  }, [current, max]);

  const animatedProps = useAnimatedProps(() => {
    // Çemberin ne kadar dolu olacağını hesapla
    const strokeDashoffset = circumference - circumference * progress.value;
    return {
      strokeDashoffset,
    };
  });

  const isOverGoal = current > max;
  const strokeColor = isOverGoal ? "#F97316" : "#22C55E"; // Hedefi aştıysa turuncu, değilse yeşil

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {/* Arkaplan Çemberi (Boş) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* İlerleme Çemberi (Dolu) */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>

      {/* Ortadaki Metinler - REMAINING formatı */}
      <View className="absolute items-center justify-center">
        <Text className="text-[10px] font-bold text-text-hint tracking-widest mb-1">
          KALAN
        </Text>
        <Text className="text-4xl font-extrabold text-text-primary">
          {Math.max(0, Math.round(max - current)).toLocaleString()}
        </Text>
        <Text className="text-xs font-semibold text-text-hint mt-1">
          / {max.toLocaleString()} kcal
        </Text>
      </View>
    </View>
  );
}
