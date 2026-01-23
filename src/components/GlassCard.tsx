import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: string[];
  blur?: boolean;
  opacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  colors = ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
  blur = true,
  opacity = 0.9,
}) => {
  return (
    <View
      style={[
        {
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 8,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 20,
          opacity,
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

interface NeuCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressed?: boolean;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  style,
  pressed = false,
}) => {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          backgroundColor: '#f1f5f9',
          padding: 20,
          shadowColor: pressed ? '#000' : '#cbd5e1',
          shadowOffset: pressed
            ? { width: 0, height: 2 }
            : { width: -6, height: -6 },
          shadowOpacity: pressed ? 0.1 : 0.3,
          shadowRadius: pressed ? 4 : 10,
          elevation: pressed ? 2 : 8,
        },
        style,
      ]}
    >
      {!pressed && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '100%',
            borderRadius: 20,
            shadowColor: '#fff',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 0.9,
            shadowRadius: 10,
          }}
        />
      )}
      {children}
    </View>
  );
};
