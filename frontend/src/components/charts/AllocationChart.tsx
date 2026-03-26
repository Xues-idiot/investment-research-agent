'use client';

// AllocationChart - 组合配置可视化图表
// 显示持仓权重分配的环形图

interface AllocationChartProps {
  holdings: Array<{
    stockCode: string;
    stockName: string;
    weight: number;
  }>;
  cashReservePct?: number;
  height?: number;
}

export default function AllocationChart({ holdings, cashReservePct = 0, height = 300 }: AllocationChartProps) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-background-500 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const size = height - 60;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius * 0.6; // donut hole

  // 计算每个持仓的弧度
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0) + cashReservePct;

  let currentAngle = -Math.PI / 2; // 从顶部开始

  const paths = holdings.map((holding, index) => {
    const weight = holding.weight / totalWeight;
    const angle = weight * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const color = COLORS[index % COLORS.length];

    // 计算弧线路径
    const x1 = centerX + Math.cos(startAngle) * outerRadius;
    const y1 = centerY + Math.sin(startAngle) * outerRadius;
    const x2 = centerX + Math.cos(endAngle) * outerRadius;
    const y2 = centerY + Math.sin(endAngle) * outerRadius;

    const ix1 = centerX + Math.cos(startAngle) * innerRadius;
    const iy1 = centerY + Math.sin(startAngle) * innerRadius;
    const ix2 = centerX + Math.cos(endAngle) * innerRadius;
    const iy2 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { d, color, holding, percentage: (holding.weight * 100).toFixed(1) };
  });

  // 添加现金保留
  if (cashReservePct > 0) {
    const weight = cashReservePct / totalWeight;
    const angle = weight * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const x1 = centerX + Math.cos(startAngle) * outerRadius;
    const y1 = centerY + Math.sin(startAngle) * outerRadius;
    const x2 = centerX + Math.cos(endAngle) * outerRadius;
    const y2 = centerY + Math.sin(endAngle) * outerRadius;

    const ix1 = centerX + Math.cos(startAngle) * innerRadius;
    const iy1 = centerY + Math.sin(startAngle) * innerRadius;
    const ix2 = centerX + Math.cos(endAngle) * innerRadius;
    const iy2 = centerY + Math.sin(endAngle) * innerRadius;

    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    paths.push({ d, color: '#6B7280', holding: { stockCode: '', stockName: '现金', weight: cashReservePct }, percentage: (cashReservePct * 100).toFixed(1) });
  }

  return (
    <div className="bg-background-500 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
          {paths.map((path, index) => (
            <path
              key={path.holding.stockCode || `path-${index}`}
              d={path.d}
              fill={path.color}
              className="transition-all hover:opacity-80 cursor-pointer"
            />
          ))}
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize="12"
          >
            持仓数量
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="24"
            fontWeight="bold"
          >
            {holdings.length}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-2 pr-4">
          {paths.map((path, index) => (
            <div key={path.holding.stockCode || `cash-${index}`} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: path.color }}
              />
              <span className="text-white text-sm">
                {path.holding.stockName || path.holding.stockCode}
              </span>
              <span className="text-gray-400 text-sm">
                {path.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
