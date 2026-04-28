import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storage";
import { useAuthStore } from "../store/authStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// USER RULE: Magic numbers and strings must be defined as constants
const ONBOARDING_COLORS = {
  PRIMARY: "#22C55E",
  SECONDARY: "#3B82F6",
  TEXT_PRIMARY: "#0F172A",
  TEXT_SECONDARY: "#475569",
  BACKGROUND: "#F8FAFC",
  INDICATOR_INACTIVE: "#E2E8F0",
};

const ONBOARDING_SLIDES = [
  {
    id: "1",
    title: "Calorie Coach'a Hoş Geldin",
    description: "Sağlıklı bir yaşam tarzına giden yolculuğun burada başlıyor. Beslenme hedeflerine birlikte ulaşalım!",
    image: require("../assets/images/welcome.png"),
  },
  {
    id: "2",
    title: "Beslenmeni Takip Et",
    description: "Öğünlerini kolayca kaydet; kalori, makro ve besin değerlerini anlık olarak takip et.",
    image: require("../assets/images/nutrition.png"),
  },
  {
    id: "3",
    title: "Hidrasyonu Unutma",
    description: "Su, enerjin için temeldir. Günlük su tüketimini takip et ve her zaman taze kal.",
    image: require("../assets/images/water.png"),
  },
  {
    id: "4",
    title: "Hedeflerine Ulaş",
    description: "Kişiselleştirilmiş hedefler belirle ve gelişimini izle. Bunu başarabilirsin!",
    image: require("../assets/images/goals.png"),
  },
];

export default function OnboardingSlider() {
  const { width } = useWindowDimensions();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { setHasOnboarded } = useAuthStore();

  const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    if (currentIndex !== currentSlideIndex) {
      setCurrentSlideIndex(currentIndex);
    }
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < ONBOARDING_SLIDES.length) {
      const offset = nextSlideIndex * width;
      flatListRef.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const goToPrevSlide = () => {
    const prevSlideIndex = currentSlideIndex - 1;
    if (prevSlideIndex >= 0) {
      const offset = prevSlideIndex * width;
      flatListRef.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(prevSlideIndex);
    }
  };

  const skipToLast = () => {
    const lastSlideIndex = ONBOARDING_SLIDES.length - 1;
    const offset = lastSlideIndex * width;
    flatListRef.current?.scrollToOffset({ offset });
    setCurrentSlideIndex(lastSlideIndex);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, "true");
      setHasOnboarded(true);
      // Navigate to Login/Register flow
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(auth)/login");
    }
  };

  const renderSlide = ({ item }: { item: typeof ONBOARDING_SLIDES[0] }) => {
    return (
      <View style={{ width, alignItems: "center", paddingHorizontal: 30 }}>
        <View className="w-full h-3/5 items-center justify-center">
          <Image
            source={item.image}
            style={{ width: width * 0.8, height: width * 0.8, resizeMode: "contain" }}
          />
        </View>
        <View className="mt-4">
          <Text className="text-3xl font-bold text-center text-text-primary mb-4">
            {item.title}
          </Text>
          <Text className="text-base text-center text-text-secondary leading-6 px-4">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-2 h-14 mb-2">
        <TouchableOpacity 
          onPress={goToPrevSlide} 
          className={`w-10 h-10 items-start justify-center ${currentSlideIndex === 0 ? "opacity-0" : ""}`}
          disabled={currentSlideIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color="#22C55E" />
        </TouchableOpacity>
        
        <Text className="text-[#22C55E] font-bold text-xl">Calorie Coach</Text>

        <TouchableOpacity 
          onPress={skipToLast} 
          className={`w-10 h-10 items-end justify-center ${currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "opacity-0" : ""}`}
        >
          <Text className="text-[#22C55E] font-semibold text-lg">Atla</Text>
        </TouchableOpacity>
      </View>

      {/* Slider */}
      <FlatList
        ref={flatListRef}
        onScroll={updateCurrentSlideIndex}
        scrollEventThrottle={16}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(item) => item.id}
        bounces={false}
      />

      {/* Footer */}
      <View className="px-8 pb-10">
        {/* Pagination Pills */}
        <View className="flex-row mb-12 justify-center">
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-[6px] rounded-full mx-1 ${
                currentSlideIndex === index ? "w-10 bg-[#22C55E]" : "w-5 bg-[#E2E8F0]"
              }`}
            />
          ))}
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-between items-center w-full">
          {/* Back Circle Button */}
          <View className="w-14 h-14">
            {currentSlideIndex > 0 && (
              <TouchableOpacity
                onPress={goToPrevSlide}
                className="w-14 h-14 rounded-full bg-[#F1F5F9] items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Next Capsule Button */}
          <TouchableOpacity
            onPress={currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? handleGetStarted : goToNextSlide}
            className="bg-[#22C55E] h-[56px] px-8 rounded-full flex-row items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Text className="text-white text-base font-bold mr-2 tracking-widest">
              {currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "BAŞLA" : "DEVAM"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
