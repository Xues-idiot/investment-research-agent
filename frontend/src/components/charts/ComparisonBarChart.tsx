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

    const max = values.reduce((a, b) => Math.max(a, b), values[0]);
    const min = values.reduce((a, b) => Math.min(a, b), values[0]);
    const range = max - min || 1;

    const barsData = values.map((value, index) => {
      const heightPercent = ((value - min) / range) * 80 + 20;
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
      <div className="flex items-center justify-center bg-terminal-700 rounded-xl p-6 border border-border-subtle" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-content-muted text-sm">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-700 rounded-xl p-4 border border-border-subtle">
      {title && <h3 className="text-content-primary text-sm font-display font-medium mb-3">{title}</h3>}
      <div className="flex items-end justify-around gap-2" style={{ height }}>
        {bars.map((bar, index) => (
          <div key={index} className="flex flex-col items-center flex-1 max-w-16">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: `${bar.heightPercent}%` }}>
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  bar.isHighest
                    ? 'bg-gain'
                    : bar.isLowest
                    ? 'bg-loss'
                    : 'bg-brand-500'
                }`}
                style={{ minHeight: '4px' }}
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-content-muted text-xs truncate w-full">{bar.label}</p>
              <p className={`text-xs font-medium tabular-nums ${
                bar.isHighest ? 'text-gain' : bar.isLowest ? 'text-loss' : 'text-content-primary'
              }`}>
                {formatValue(bar.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-3 text-xs text-content-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-gain rounded" /> 最高
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-loss rounded" /> 最低
        </span>
      </div>
    </div>
  );
}
