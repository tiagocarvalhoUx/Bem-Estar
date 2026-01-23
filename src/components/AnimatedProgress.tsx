import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedProgressProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  animated?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  progress,
  height = 8,
  color = '#f43f5e',
  backgroundColor = '#e2e8f0',
  borderRadius = 999,
  animated = true,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      width.value = withSpring(progress, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      width.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color = '#f43f5e',
  backgroundColor = '#e2e8f0',
  children,
}) => {
  const rotation = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    rotation.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = (rotation.value / 100) * 360;
    return {
      transform: [{ rotate: `${angle - 90}deg` }],
    };
  });

  const dashOffset = circumference * (1 - progress / 100);

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
};
