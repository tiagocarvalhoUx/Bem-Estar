import React from 'react';
import { View, Text } from 'react-native';

interface SessionCounterProps {
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

const SessionCounter: React.FC<SessionCounterProps> = ({
  completedSessions,
  sessionsUntilLongBreak,
}) => {
  const currentCycle = completedSessions % sessionsUntilLongBreak;

  return (
    <View className="bg-white rounded-2xl p-6 border border-slate-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-bold text-slate-700">
          Sessões de Hoje
        </Text>
        <View className="bg-sky-50 px-4 py-2 rounded-full">
          <Text className="text-sky-600 font-bold text-lg">
            {completedSessions}
          </Text>
        </View>
      </View>

      {/* Indicadores de progresso do ciclo */}
      <View>
        <Text className="text-xs text-slate-500 mb-3">
          Progresso até pausa longa
        </Text>
        <View className="flex-row gap-2">
          {[...Array(sessionsUntilLongBreak)].map((_, index) => {
            const isCompleted = index < currentCycle;
            return (
              <View
                key={index}
                className="flex-1 h-2.5 rounded-full"
                style={{
                  backgroundColor: isCompleted ? '#0ea5e9' : '#e2e8f0',
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default SessionCounter;