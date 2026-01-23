import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface HeatmapDay {
  date: Date;
  value: number; // 0-4 intensity level
  label?: string;
}

interface HeatmapCalendarProps {
  data: HeatmapDay[];
  weeks?: number;
  colors?: string[];
  onDayPress?: (day: HeatmapDay) => void;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  data,
  weeks = 12,
  colors = ['#f1f5f9', '#bfdbfe', '#60a5fa', '#3b82f6', '#1e40af'],
  onDayPress,
}) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeks * 7);

  const days: (HeatmapDay | null)[][] = [];
  let currentWeek: (HeatmapDay | null)[] = [];

  // Fill with nulls to start from correct day of week
  const startDay = startDate.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  // Generate all days
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayData = data.find(
      d => d.date.toDateString() === date.toDateString()
    );

    currentWeek.push(dayData || { date, value: 0 });

    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    days.push(currentWeek);
  }

  const getColor = (value: number) => {
    return colors[Math.min(Math.floor(value), colors.length - 1)];
  };

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <View style={{ width: 20 }} />
        {weekDays.map((day, i) => (
          <Text
            key={i}
            style={{
              width: 16,
              marginHorizontal: 2,
              fontSize: 10,
              color: '#94a3b8',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {day}
          </Text>
        ))}
      </View>

      {days.map((week, weekIndex) => (
        <View key={weekIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
          {weekIndex % 4 === 0 && (
            <Text
              style={{
                width: 20,
                fontSize: 10,
                color: '#94a3b8',
                textAlign: 'right',
                marginRight: 4,
              }}
            >
              {week[0]?.date.toLocaleDateString('pt-BR', { month: 'short' })}
            </Text>
          )}
          {weekIndex % 4 !== 0 && <View style={{ width: 20 }} />}
          
          {week.map((day, dayIndex) => (
            <TouchableOpacity
              key={dayIndex}
              onPress={() => day && onDayPress?.(day)}
              disabled={!day || day.value === 0}
              style={{
                width: 16,
                height: 16,
                marginHorizontal: 2,
                borderRadius: 3,
                backgroundColor: day ? getColor(day.value) : 'transparent',
                borderWidth: day ? 1 : 0,
                borderColor: 'rgba(0,0,0,0.05)',
              }}
            />
          ))}
        </View>
      ))}

      {/* Legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 10, color: '#94a3b8', marginRight: 8 }}>Menos</Text>
        {colors.map((color, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 14,
              marginHorizontal: 2,
              borderRadius: 3,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.05)',
            }}
          />
        ))}
        <Text style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>Mais</Text>
      </View>
    </View>
  );
};
