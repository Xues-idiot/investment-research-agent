'use client';

import { useMemo } from 'react';

interface EquityCurveChartProps {
  dailyReturns: Array<{
    date: string;
    value: number;
    dailyReturn: number;
  }>;
  initialCapital: number;
  height?: number;
}

export default function EquityCurveChart({
  dailyReturns,
  initialCapital,
  height = 300,
}: EquityCurveChartProps) {
  const { points, minValue, maxValue, width } = useMemo(() => {
    if (!dailyReturns || dailyReturns.length === 0) {
      return { points: '', minValue: 0, maxValue: 100, width: 600 };
    }

    const w = 700;
    const values = dailyReturns.map((d) => d.value);
    // 使用reduce代替spread避免大数据量栈溢出
    const min = values.reduce((a, b) => Math.min(a, b), values[0]);
    const max = values.reduce((a, b) => Math.max(a, b), values[0]);
    const range = max - min || 1;
    const padding = range * 0.1;

    const chartWidth = w - 60;
    const chartHeight = height - 80;

    const pts = dailyReturns.map((d, i) => {
      const x = 50 + (i / (dailyReturns.length - 1)) * chartWidth;
      const y = chartHeight - ((d.value - min + padding) / (range + padding * 2)) * chartHeight + 20;
      return `${x},${y}`;
    });

    return {
      points: pts.join(' '),
      minValue: min,
      maxValue: max,
      width: w,
    };
  }, [dailyReturns, height]);

  if (!dailyReturns || dailyReturns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-background-500 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  const formatValue = (v: number) => {
    return `¥${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (v: number) => {
    const pct = ((v - initialCapital) / initialCapital * 100);
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  };

  const startValue = dailyReturns[0]?.value || initialCapital;
  const endValue = dailyReturns[dailyReturns.length - 1]?.value || initialCapital;
  const totalReturn = endValue - initialCapital;
  const isProfit = totalReturn >= 0;

  return (
    <div className="bg-background-500 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">最终市值</p>
          <p className="text-white text-xl font-bold">{formatValue(endValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">总收益率</p>
          <p className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatPercent(endValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">初始/最高/最低</p>
          <p className="text-gray-300 text-sm">
            {formatValue(startValue)} / {formatValue(maxValue)} / {formatValue(minValue)}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 20 + ratio * (height - 80);
          const value = maxValue - ratio * (maxValue - minValue);
          return (
            <g key={ratio}>
              <line
                x1="50"
                y1={y}
                x2={width - 10}
                y2={y}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x="45"
                y={y + 4}
                textAnchor="end"
                fill="#9CA3AF"
                fontSize="10"
              >
                {formatValue(value)}
              </text>
            </g>
          );
        })}

        {/* Initial capital line */}
        <line
          x1="50"
          y1={20 + ((maxValue - initialCapital) / (maxValue - minValue || 1)) * (height - 80)}
          x2={width - 10}
          y2={20 + ((maxValue - initialCapital) / (maxValue - minValue || 1)) * (height - 80)}
          stroke="#6B7280"
          strokeWidth="1"
          strokeDasharray="8,4"
        />

        {/* Area fill */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isProfit ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isProfit ? '#10B981' : '#EF4444'} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Fill area under curve */}
        <polygon
          points={`50,${height - 60} ${points} ${width - 10},${height - 60}`}
          fill="url(#areaGradient)"
        />

        {/* Equity curve line */}
        <polyline
          points={points}
          fill="none"
          stroke={isProfit ? '#10B981' : '#EF4444'}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Start point */}
        <circle
          cx={50}
          cy={20 + ((maxValue - startValue) / (maxValue - minValue || 1)) * (height - 80)}
          r="4"
          fill="#10B981"
        />

        {/* End point */}
        <circle
          cx={width - 10}
          cy={20 + ((maxValue - endValue) / (maxValue - minValue || 1)) * (height - 80)}
          r="4"
          fill={isProfit ? '#10B981' : '#EF4444'}
        />

        {/* X-axis labels */}
        <text
          x="50"
          y={height - 5}
          textAnchor="start"
          fill="#9CA3AF"
          fontSize="10"
        >
          {dailyReturns[0]?.date}
        </text>
        <text
          x={width - 10}
          y={height - 5}
          textAnchor="end"
          fill="#9CA3AF"
          fontSize="10"
        >
          {dailyReturns[dailyReturns.length - 1]?.date}
        </text>
      </svg>
    </div>
  );
}
