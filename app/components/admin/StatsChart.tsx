'use client';

import { useState } from 'react';

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface StatsChartProps {
  data: ChartData[];
  type: 'line' | 'bar';
  height?: number;
}

export default function StatsChart({ data, type, height = 300 }: StatsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <span className="text-4xl mb-2 block">📊</span>
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  // Extraire les clés (sauf 'date')
  const keys = Object.keys(data[0]).filter(key => key !== 'date');
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  // Calculer les valeurs min/max pour la mise à l'échelle
  const allValues = data.flatMap(item => keys.map(key => item[key] as number));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);

  return (
    <div className="w-full" style={{ height }}>
      <div className="mb-4 flex flex-wrap gap-4">
        {keys.map((key, index) => (
          <div key={key} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span className="text-sm font-medium text-gray-700">{key}</span>
          </div>
        ))}
      </div>

      <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: height - 60 }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grille de fond */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Lignes de valeurs */}
          {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = height - 120 - (ratio * (height - 120));
            const value = Math.round(minValue + (maxValue - minValue) * ratio);
            return (
              <g key={index}>
                <line
                  x1="40"
                  y1={y}
                  x2="100%"
                  y2={y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="35"
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Données */}
          {data.map((item, dataIndex) => {
            const x = 50 + (dataIndex * (100 - 60) / (data.length - 1)) + '%';
            const xNum = 50 + (dataIndex * (document.querySelector('svg')?.clientWidth || 500 - 60) / (data.length - 1));

            return (
              <g key={dataIndex}>
                {/* Lignes verticales pour les dates */}
                <line
                  x1={x}
                  y1="10"
                  x2={x}
                  y2={height - 60}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />

                {/* Étiquettes des dates */}
                <text
                  x={x}
                  y={height - 40}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {new Date(item.date).toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </text>

                {/* Points de données pour chaque série */}
                {keys.map((key, keyIndex) => {
                  const value = item[key] as number;
                  const y = height - 60 - ((value - minValue) / (maxValue - minValue)) * (height - 120);
                  
                  if (type === 'line') {
                    return (
                      <circle
                        key={`${dataIndex}-${keyIndex}`}
                        cx={x}
                        cy={y}
                        r={hoveredIndex === dataIndex ? "6" : "4"}
                        fill={colors[keyIndex]}
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(dataIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  } else {
                    const barWidth = Math.min(30, (100 - 60) / data.length / keys.length - 2);
                    const barX = xNum - (keys.length * barWidth) / 2 + keyIndex * barWidth;
                    
                    return (
                      <rect
                        key={`${dataIndex}-${keyIndex}`}
                        x={barX}
                        y={y}
                        width={barWidth}
                        height={height - 60 - y}
                        fill={colors[keyIndex]}
                        className="transition-all duration-200 cursor-pointer hover:opacity-80"
                        onMouseEnter={() => setHoveredIndex(dataIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  }
                })}

                {/* Tooltip au survol */}
                {hoveredIndex === dataIndex && (
                  <g>
                    <rect
                      x={xNum - 60}
                      y="10"
                      width="120"
                      height={20 + keys.length * 18}
                      fill="rgba(0, 0, 0, 0.8)"
                      rx="4"
                      ry="4"
                    />
                    <text
                      x={xNum}
                      y="25"
                      textAnchor="middle"
                      className="text-xs fill-white font-medium"
                    >
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </text>
                    {keys.map((key, keyIndex) => (
                      <text
                        key={key}
                        x={xNum}
                        y={40 + keyIndex * 18}
                        textAnchor="middle"
                        className="text-xs fill-white"
                      >
                        {key}: {(item[key] as number).toLocaleString()}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* Lignes de connexion pour le graphique linéaire */}
          {type === 'line' && keys.map((key, keyIndex) => {
            const points = data.map((item, dataIndex) => {
              const x = 50 + (dataIndex * (100 - 60) / (data.length - 1));
              const value = item[key] as number;
              const y = height - 60 - ((value - minValue) / (maxValue - minValue)) * (height - 120);
              return `${x}%,${y}`;
            }).join(' ');

            return (
              <polyline
                key={key}
                fill="none"
                stroke={colors[keyIndex]}
                strokeWidth="2"
                points={points}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
