'use client';

import { useMemo } from 'react';

interface ComparisonBarChartProps {
  labels: string[];
  values: number[];
  formatValue?: (v: number) => string;
  title?: string;
  height?: number;
}

export default function ComparisonBarChart({
  labels,
  values,
  formatValue = (v) => v.toFixed(2),
  title,
  height = 200,
}: ComparisonBarChartProps) {
  const { maxValue, minValue, bars } = useMemo(() => {
    if (!values || values.length === 0) {
      return { maxValue: 1, minValue: 0, bars: [] };
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const barsData = values.map((value, index) => {
      const heightPercent = ((value - min) / range) * 80 + 20; // 20-100%
      return {
        label: labels[index],
        value,
        heightPercent,
        isHighest: value === max,
        isLowest: value === min,
      };
    });

    return { maxValue: max, minValue: min, bars: barsData };
  }, [labels, values]);

  if (!values || values.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-background-500 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-background-500 rounded-lg p-4">
      {title && <h3 className="text-white text-sm font-medium mb-3">{title}</h3>}
      <div className="flex items-end justify-around gap-2" style={{ height }}>
        {bars.map((bar, index) => (
          <div key={index} className="flex flex-col items-center flex-1 max-w-16">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: `${bar.heightPercent}%` }}>
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  bar.isHighest
                    ? 'bg-green-500'
                    : bar.isLowest
                    ? 'bg-red-500'
                    : 'bg-primary-500'
                }`}
                style={{ minHeight: '4px' }}
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-gray-400 text-xs truncate w-full">{bar.label}</p>
              <p className={`text-xs font-medium ${
                bar.isHighest ? 'text-green-400' : bar.isLowest ? 'text-red-400' : 'text-white'
              }`}>
                {formatValue(bar.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded" /> 最高
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded" /> 最低
        </span>
      </div>
    </div>
  );
}
