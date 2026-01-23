import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { PomodoroMode, TimerStatus } from '../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerCircleProps {
  timeRemaining: number;
  totalTime: number;
  mode: PomodoroMode;
  status: TimerStatus;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(width * 0.75, 320);
const STROKE_WIDTH = 16;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerCircle: React.FC<TimerCircleProps> = ({
  timeRemaining,
  totalTime,
  mode,
  status,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    const newProgress = totalTime > 0 ? (timeRemaining / totalTime) : 0;
    progress.value = withTiming(newProgress, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [timeRemaining, totalTime]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const getModeConfig = () => {
    switch (mode) {
      case PomodoroMode.WORK:
        return {
          color: '#f43f5e',
          bgColor: '#fef2f2',
          label: 'Foco',
        };
      case PomodoroMode.SHORT_BREAK:
        return {
          color: '#10b981',
          bgColor: '#f0fdf4',
          label: 'Pausa Curta',
        };
      case PomodoroMode.LONG_BREAK:
        return {
          color: '#0ea5e9',
          bgColor: '#f0f9ff',
          label: 'Pausa Longa',
        };
      default:
        return {
          color: '#0ea5e9',
          bgColor: '#f0f9ff',
          label: 'Pomodoro',
        };
    }
  };

  const config = getModeConfig();
  const backgroundColor = status === TimerStatus.RUNNING ? '#f1f5f9' : '#f8fafc';

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="items-center justify-center">
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        {/* Círculo de fundo */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={backgroundColor}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        {/* Círculo de progresso */}
        <AnimatedCircle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={config.color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
        />
      </Svg>

      {/* Texto central */}
      <View className="absolute items-center">
        <Text className="text-sm font-semibold text-slate-500 mb-3">
          {config.label}
        </Text>
        <Text
          className="text-7xl font-bold tracking-tight"
          style={{ color: config.color }}
        >
          {formatTime(timeRemaining)}
        </Text>
        {status === TimerStatus.PAUSED && (
          <Text className="text-sm font-semibold text-slate-400 mt-4">
            Pausado
          </Text>
        )}
        {status === TimerStatus.COMPLETED && (
          <View className="flex-row items-center mt-4">
            <Text className="text-sm font-semibold text-emerald-600">
              ✓ Concluído!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TimerCircle;