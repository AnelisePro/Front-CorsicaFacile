'use client';

import { useState } from 'react';
import styles from './StatsChart.module.scss';

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface StatsChartProps {
  data: ChartData[];
  type: 'line' | 'bar';
  height?: number;
}

export default function StatsChart({ data, type, height = 400 }: StatsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <span className={styles.emptyIcon}>📊</span>
          <p className={styles.emptyText}>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const keys = Object.keys(data[0]).filter(key => key !== 'date');
  const colors = ['#3498db', '#81A04A', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const allValues = data.flatMap(item => keys.map(key => Number(item[key]) || 0));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  const chartWidth = 600;
  const chartHeight = height - 160;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };

  return (
    <div className={styles.chartContainer}>
      {/* Header */}
      <div className={styles.chartHeader}>
        <p className={styles.chartSubtitle}>Analyse des données sur la période sélectionnée</p>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {keys.map((key, index) => (
          <div key={key} className={styles.legendItem}>
            <div 
              className={styles.legendColor}
              style={{ backgroundColor: colors[index] }}
            />
            <span className={styles.legendLabel}>{key}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={styles.chartWrapper}>
        <svg 
          width="100%" 
          height={height - 100}
          viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${chartHeight + padding.top + padding.bottom}`}
          className={styles.chartSvg}
        >
          {/* Background */}
          <rect 
            width="100%" 
            height="100%" 
            fill="#ffffff" 
          />
          
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={chartWidth} 
            height={chartHeight} 
            fill="url(#grid)" 
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#d1d5db"
            strokeWidth="2"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#d1d5db"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding.top + chartHeight - (ratio * chartHeight);
            const value = Math.round(minValue + (range * ratio));
            return (
              <g key={index}>
                <line
                  x1={padding.left - 5}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 10}
                  y={y + 5}
                  textAnchor="end"
                  className={styles.axisLabel}
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Data visualization */}
          {data.map((item, dataIndex) => {
            const x = padding.left + (dataIndex * chartWidth / (data.length - 1));
            
            return (
              <g key={dataIndex}>
                {/* X-axis labels */}
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className={styles.dateLabel}
                >
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </text>

                {/* Data points */}
                {keys.map((key, keyIndex) => {
                  const value = Number(item[key]) || 0;
                  const y = padding.top + chartHeight - ((value - minValue) / range * chartHeight);
                  
                  if (type === 'line') {
                    return (
                      <circle
                        key={`${dataIndex}-${keyIndex}`}
                        cx={x}
                        cy={y}
                        r={hoveredIndex === dataIndex ? 8 : 5}
                        fill={colors[keyIndex]}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className={styles.dataPoint}
                        onMouseEnter={() => setHoveredIndex(dataIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  } else {
                    const barWidth = Math.max(20, chartWidth / data.length / keys.length - 4);
                    const barX = x - (keys.length * barWidth) / 2 + keyIndex * barWidth;
                    const barHeight = Math.max(2, (value - minValue) / range * chartHeight);
                    
                    return (
                      <rect
                        key={`${dataIndex}-${keyIndex}`}
                        x={barX}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={colors[keyIndex]}
                        className={styles.dataBar}
                        onMouseEnter={() => setHoveredIndex(dataIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  }
                })}

                {/* Tooltip */}
                {hoveredIndex === dataIndex && (
                  <g className={styles.tooltip}>
                    <rect
                      x={x - 70}
                      y={padding.top - 10}
                      width="140"
                      height={40 + keys.length * 18}
                      fill="rgba(0, 0, 0, 0.9)"
                      rx="6"
                      stroke="none"
                    />
                    <text
                      x={x}
                      y={padding.top + 10}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </text>
                    {keys.map((key, keyIndex) => (
                      <text
                        key={key}
                        x={x}
                        y={padding.top + 25 + keyIndex * 18}
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                      >
                        {key}: {Number(item[key]).toLocaleString()}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* Connection lines for line chart */}
          {type === 'line' && keys.map((key, keyIndex) => {
            const points = data.map((item, dataIndex) => {
              const x = padding.left + (dataIndex * chartWidth / (data.length - 1));
              const value = Number(item[key]) || 0;
              const y = padding.top + chartHeight - ((value - minValue) / range * chartHeight);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polyline
                key={key}
                fill="none"
                stroke={colors[keyIndex]}
                strokeWidth="2"
                points={points}
                className={styles.connectionLine}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}


