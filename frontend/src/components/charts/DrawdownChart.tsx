'use client';

// DrawdownChart - 回测亏损图表
// 显示策略的回撤幅度随时间变化

interface DrawdownChartProps {
  dailyReturns: Array<{
    date: string;
    value: number;
    daily_return: number;
  }>;
  height?: number;
}

export default function DrawdownChart({ dailyReturns, height = 200 }: DrawdownChartProps) {
  if (!dailyReturns || dailyReturns.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-background-500 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  const width = 700;
  const chartHeight = height - 60;

  // 计算累计最大值和回撤
  let peak = dailyReturns[0].value;
  const drawdowns: { date: string; value: number; drawdown: number }[] = [];

  dailyReturns.forEach(d => {
    if (d.value > peak) peak = d.value;
    const drawdown = peak > 0 ? ((peak - d.value) / peak) * 100 : 0;
    drawdowns.push({ date: d.date, value: d.value, drawdown });
  });

  const maxDrawdown = Math.max(...drawdowns.map(d => d.drawdown));
  const avgDrawdown = drawdowns.reduce((sum, d) => sum + d.drawdown, 0) / drawdowns.length;

  // 绘制回撤曲线
  const points = drawdowns.map((d, i) => {
    const x = 50 + (i / (drawdowns.length - 1)) * (width - 60);
    const y = chartHeight - (d.drawdown / (maxDrawdown * 1.2)) * chartHeight + 20;
    return `${x},${y}`;
  }).join(' ');

  // 面积填充
  const areaPoints = `50,${chartHeight + 20} ${points} ${width - 10},${chartHeight + 20}`;

  return (
    <div className="bg-background-500 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">回撤分析</span>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-400">
            最大回撤: <span className="text-red-400 font-medium">{maxDrawdown.toFixed(2)}%</span>
          </span>
          <span className="text-gray-400">
            平均回撤: <span className="text-yellow-400 font-medium">{avgDrawdown.toFixed(2)}%</span>
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = 20 + ratio * chartHeight;
          const value = maxDrawdown * (1 - ratio);
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
                {value.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <polygon
          points={areaPoints}
          fill="url(#drawdownGradient)"
        />

        {/* Drawdown line */}
        <polyline
          points={points}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X-axis labels */}
        <text
          x="50"
          y={height - 5}
          textAnchor="start"
          fill="#9CA3AF"
          fontSize="10"
        >
          {drawdowns[0]?.date}
        </text>
        <text
          x={width - 10}
          y={height - 5}
          textAnchor="end"
          fill="#9CA3AF"
          fontSize="10"
        >
          {drawdowns[drawdowns.length - 1]?.date}
        </text>
      </svg>
    </div>
  );
}
