import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

interface RadarDataPoint {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  levels?: number;
  fillColor?: string;
  strokeColor?: string;
  fillOpacity?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 200,
  levels = 5,
  fillColor = '#f43f5e',
  strokeColor = '#f43f5e',
  fillOpacity = 0.3,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (2 * Math.PI) / data.length;

  // Calculate points for the data
  const dataPoints = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (item.value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  });

  const dataPointsString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Calculate label positions
  const labels = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelDistance = radius + 25;
    return {
      x: center + labelDistance * Math.cos(angle),
      y: center + labelDistance * Math.sin(angle),
      text: item.label,
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Grid circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const levelRadius = radius * ((i + 1) / levels);
          return (
            <Circle
              key={`circle-${i}`}
              cx={center}
              cy={center}
              r={levelRadius}
              stroke="#e2e8f0"
              strokeWidth="1"
              fill="none"
            />
          );
        })}

        {/* Grid lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const endX = center + radius * Math.cos(angle);
          const endY = center + radius * Math.sin(angle);
          return (
            <Line
              key={`line-${index}`}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPointsString}
          fill={fillColor}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={strokeColor}
          />
        ))}

        {/* Labels */}
        {labels.map((label, index) => (
          <SvgText
            key={`label-${index}`}
            x={label.x}
            y={label.y}
            fill="#475569"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            {label.text}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};
