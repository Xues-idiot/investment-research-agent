'use client';

// DrawdownChart - 回测亏损图表
// 显示策略的回撤幅度随时间变化

interface DrawdownChartProps {
  dailyReturns: Array<{
    date: string;
    value: number;
    dailyReturn: number;
  }>;
  height?: number;
}

export default function DrawdownChart({ dailyReturns, height = 200 }: DrawdownChartProps) {
  if (!dailyReturns || dailyReturns.length === 0) {
    return (
      <div className="flex items-center justify-center bg-terminal-700 rounded-xl p-6 border border-border-subtle" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📉</div>
          <p className="text-content-muted text-sm">暂无数据</p>
        </div>
      </div>
    );
  }

  const width = 700;
  const chartHeight = height - 60;

  let peak = dailyReturns[0].value;
  const drawdowns: { date: string; value: number; drawdown: number }[] = [];

  dailyReturns.forEach(d => {
    if (d.value > peak) peak = d.value;
    const drawdown = peak > 0 ? ((peak - d.value) / peak) * 100 : 0;
    drawdowns.push({ date: d.date, value: d.value, drawdown });
  });

  const maxDrawdown = drawdowns.reduce((max, d) => Math.max(max, d.drawdown), 0);
  const avgDrawdown = drawdowns.reduce((sum, d) => sum + d.drawdown, 0) / drawdowns.length;

  const points = drawdowns.map((d, i) => {
    const x = 50 + (i / (drawdowns.length - 1)) * (width - 60);
    const y = chartHeight - (d.drawdown / (maxDrawdown * 1.2)) * chartHeight + 20;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `50,${chartHeight + 20} ${points} ${width - 10},${chartHeight + 20}`;

  return (
    <div className="bg-terminal-700 rounded-xl p-4 border border-border-subtle">
      <div className="flex items-center justify-between mb-2">
        <span className="text-content-primary text-sm font-display font-medium">回撤分析</span>
        <div className="flex gap-4 text-xs">
          <span className="text-content-muted">
            最大回撤: <span className="text-loss font-medium tabular-nums">{maxDrawdown.toFixed(2)}%</span>
          </span>
          <span className="text-content-muted">
            平均回撤: <span className="text-accent font-medium tabular-nums">{avgDrawdown.toFixed(2)}%</span>
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ backgroundColor: 'transparent' }}
      >
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
                stroke="#2D3648"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x="45"
                y={y + 4}
                textAnchor="end"
                fill="#64748B"
                fontSize="10"
              >
                {value.toFixed(1)}%
              </text>
            </g>
          );
        })}

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

        <polyline
          points={points}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <text
          x="50"
          y={height - 5}
          textAnchor="start"
          fill="#64748B"
          fontSize="10"
        >
          {drawdowns[0]?.date}
        </text>
        <text
          x={width - 10}
          y={height - 5}
          textAnchor="end"
          fill="#64748B"
          fontSize="10"
        >
          {drawdowns[drawdowns.length - 1]?.date}
        </text>
      </svg>
    </div>
  );
}
