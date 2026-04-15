import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

type TabIconName = "home" | "add-circle" | "time" | "person";
type TabIconOutlineName = "home-outline" | "add-circle-outline" | "time-outline" | "person-outline";

const TAB_CONFIG: {
  name: string;
  title: string;
  iconFocused: TabIconName;
  iconDefault: TabIconOutlineName;
}[] = [
  {
    name: "index",
    title: "Ana Sayfa",
    iconFocused: "home",
    iconDefault: "home-outline",
  },
  {
    name: "add-meal",
    title: "Ekle",
    iconFocused: "add-circle",
    iconDefault: "add-circle-outline",
  },
  {
    name: "history",
    title: "Geçmiş",
    iconFocused: "time",
    iconDefault: "time-outline",
  },
  {
    name: "profile",
    title: "Profil",
    iconFocused: "person",
    iconDefault: "person-outline",
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.iconDefault}
                size={tab.name === "add-meal" ? 30 : 24}
                color={tab.name === "add-meal" && focused ? "#22C55E" : color}
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            },
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 0,
    height: Platform.OS === "ios" ? 90 : 80,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: "visible",
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: "center",
    overflow: "visible",
  },
});
