import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

interface BarChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
  height?: number;
  barColor?: string;
  showValues?: boolean;
  animated?: boolean;
  onBarPress?: (item: ChartDataPoint, index: number) => void;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 200,
  barColor = '#f43f5e',
  showValues = true,
  animated = true,
  onBarPress,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <View style={{ height }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
        {data.map((item, index) => (
          <AnimatedBar
            key={index}
            item={item}
            index={index}
            maxValue={max}
            height={height - 60}
            color={item.color || barColor}
            showValue={showValues}
            animated={animated}
            onPress={onBarPress}
          />
        ))}
      </View>
    </View>
  );
};

interface AnimatedBarProps {
  item: ChartDataPoint;
  index: number;
  maxValue: number;
  height: number;
  color: string;
  showValue: boolean;
  animated: boolean;
  onPress?: (item: ChartDataPoint, index: number) => void;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
  item,
  index,
  maxValue,
  height,
  color,
  showValue,
  animated,
  onPress,
}) => {
  const barHeight = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const targetHeight = (item.value / maxValue) * height;
    if (animated) {
      barHeight.value = withDelay(
        index * 100,
        withSpring(targetHeight, {
          damping: 15,
          stiffness: 100,
        })
      );
      opacity.value = withDelay(
        index * 100,
        withSpring(1, {
          damping: 10,
        })
      );
    } else {
      barHeight.value = targetHeight;
      opacity.value = 1;
    }
  }, [item.value, maxValue, height, animated, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: Math.max(barHeight.value, 8),
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}
      onPress={() => onPress?.(item, index)}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
        {showValue && item.value > 0 && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            {item.value}
          </Text>
        )}
        <Animated.View
          style={[
            {
              width: '100%',
              backgroundColor: color,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              minHeight: 8,
            },
            animatedStyle,
          ]}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '500',
          color: '#64748b',
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {item.label}
      </Text>
      {item.sublabel && (
        <Text
          style={{
            fontSize: 10,
            color: '#94a3b8',
            marginTop: 2,
            textAlign: 'center',
          }}
        >
          {item.sublabel}
        </Text>
      )}
    </TouchableOpacity>
  );
};
