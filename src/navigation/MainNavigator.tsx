import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types";
import { Platform } from "react-native";

// Icons (usaremos Ionicons do Expo)
import { Ionicons } from "@expo/vector-icons";

// Screens (vamos criar depois)
import HomeScreen from "../screens/main/HomeScreen";
import StatisticsScreen from "../screens/main/StatisticsScreen";
import PlannerScreen from "../screens/main/PlannerScreen";
import MoodScreen from "../screens/main/MoodScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import AIInsightsScreen from "../screens/main/AIInsightsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "timer" : "timer-outline";
          } else if (route.name === "Statistics") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "AIInsights") {
            iconName = focused ? "sparkles" : "sparkles-outline";
          } else if (route.name === "Planner") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Mood") {
            iconName = focused ? "happy" : "happy-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          position: 'relative',
          height: Platform.OS === "ios" ? 70 : 56,
          
          paddingBottom: Platform.OS === "ios" ? 16 : 4,
          marginTop: 0,
          paddingHorizontal: 8,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Timer" }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ tabBarLabel: "Stats" }}
      />
      <Tab.Screen
        name="AIInsights"
        component={AIInsightsScreen}
        options={{ tabBarLabel: "AI" }}
      />
      <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{ tabBarLabel: "Planner" }}
      />
      <Tab.Screen
        name="Mood"
        component={MoodScreen}
        options={{ tabBarLabel: "Humor" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
