import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { PomodoroMode, TimerStatus } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface ModeSelectorProps {
  currentMode: PomodoroMode;
  status: TimerStatus;
  onModeChange: (mode: PomodoroMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  status,
  onModeChange,
}) => {
  const { darkMode } = useTheme();

  const modes = [
    {
      mode: PomodoroMode.WORK,
      label: "Foco",
      icon: "🎯",
      duration: 25,
      colors: {
        bg: "#fff1f2",
        text: "#f43f5e",
        border: "#fda4af",
      },
    },
    {
      mode: PomodoroMode.SHORT_BREAK,
      label: "Pausa",
      icon: "☕",
      duration: 5,
      colors: {
        bg: "#f0fdf4",
        text: "#10b981",
        border: "#6ee7b7",
      },
    },
    {
      mode: PomodoroMode.LONG_BREAK,
      label: "Descanso",
      icon: "🌴",
      duration: 15,
      colors: {
        bg: "#f0f9ff",
        text: "#0ea5e9",
        border: "#7dd3fc",
      },
    },
  ];

  const isDisabled = status === TimerStatus.RUNNING;

  return (
    <View className="flex-row gap-3">
      {modes.map(({ mode, label, icon, duration, colors }) => {
        const isActive = currentMode === mode;

        return (
          <TouchableOpacity
            key={mode}
            onPress={() => !isDisabled && onModeChange(mode)}
            disabled={isDisabled}
            className="flex-1 border-2 overflow-hidden"
            style={{
              backgroundColor: isActive
                ? colors.bg
                : darkMode
                  ? "#e8eaea"
                  : "white",
              borderColor: isActive ? colors.border : "#e2e8f0",
              opacity: isDisabled && !isActive ? 0.5 : 1,
              transform: isActive ? [{ scale: 1.05 }] : [{ scale: 1 }],
              borderRadius: 3,
            }}
          >
            <View className="p-4 items-center">
              <Text className="text-3xl mb-2">{icon}</Text>
              <Text
                className="text-sm font-bold mb-1"
                style={{ color: isActive ? colors.text : "#64748b" }}
              >
                {label}
              </Text>
              <Text className="text-xs text-slate-400">{duration} min</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ModeSelector;
