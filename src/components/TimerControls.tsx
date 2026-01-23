import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimerStatus, PomodoroMode } from '../types';

interface TimerControlsProps {
  status: TimerStatus;
  mode: PomodoroMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  mode,
  onStart,
  onPause,
  onReset,
  onSkip,
}) => {
  const getModeColor = () => {
    switch (mode) {
      case PomodoroMode.WORK:
        return '#f43f5e';
      case PomodoroMode.SHORT_BREAK:
        return '#10b981';
      case PomodoroMode.LONG_BREAK:
        return '#0ea5e9';
      default:
        return '#0ea5e9';
    }
  };

  const mainButtonColor = getModeColor();

  return (
    <View className="flex-row items-center justify-center">
      {/* Botão de Reset */}
      {status !== TimerStatus.IDLE && (
        <TouchableOpacity
          onPress={onReset}
          className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mr-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="refresh" size={24} color="#64748b" />
        </TouchableOpacity>
      )}

      {/* Botão Principal (Play/Pause) */}
      <TouchableOpacity
        onPress={status === TimerStatus.RUNNING ? onPause : onStart}
        className="w-20 h-20 rounded-full items-center justify-center"
        style={{
          backgroundColor: mainButtonColor,
          shadowColor: mainButtonColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ scale: 1 }],
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name={status === TimerStatus.RUNNING ? 'pause' : 'play'}
          size={36}
          color="white"
          style={{ marginLeft: status === TimerStatus.RUNNING ? 0 : 3 }}
        />
      </TouchableOpacity>

      {/* Botão de Skip */}
      {status !== TimerStatus.IDLE && (
        <TouchableOpacity
          onPress={onSkip}
          className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center ml-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="play-skip-forward" size={24} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TimerControls;