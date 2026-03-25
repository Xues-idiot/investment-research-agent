'use client';

// ComparisonKLineChart - 多股票K线叠加对比图表
// 使用normalized价格叠加显示不同股票的走势对比

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, LineSeries, Time, LineData } from 'lightweight-charts';

interface StockKLine {
  code: string;
  name: string;
  kline: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  current_price: number;
}

interface ComparisonKLineChartProps {
  data: StockKLine[];
  height?: number;
}

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ComparisonKLineChart({ data, height = 400 }: ComparisonKLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#1A1A2E' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D2D44' },
        horzLines: { color: '#2D2D44' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#C9A227',
          width: 1,
          style: 2,
          labelBackgroundColor: '#C9A227',
        },
        horzLine: {
          color: '#C9A227',
          width: 1,
          style: 2,
          labelBackgroundColor: '#C9A227',
        },
      },
      timeScale: {
        borderColor: '#2D2D44',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
      },
      rightPriceScale: {
        borderColor: '#2D2D44',
      },
    });

    chartRef.current = chart;

    // 为每只股票添加归一化价格线
    // 归一化：以第一天的收盘价为基准，计算相对变化百分比
    const seriesMap: Record<string, any> = {};

    data.forEach((stock, index) => {
      if (!stock.kline || stock.kline.length === 0) return;

      const color = COLORS[index % COLORS.length];

      // 创建线系列
      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      // 归一化处理：以第一天收盘价为100
      const basePrice = stock.kline[0].close;
      const normalizedData: LineData<Time>[] = stock.kline.map(k => ({
        time: k.time as Time,
        value: ((k.close - basePrice) / basePrice) * 100,  // 百分比变化
      }));

      lineSeries.setData(normalizedData);
      seriesMap[stock.code] = { series: lineSeries, color, name: stock.name || stock.code };
    });

    // 适应窗口
    chart.timeScale().fitContent();

    // 响应窗口大小变化
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-background-600 rounded-lg p-4 border border-background-400 flex items-center justify-center h-64">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-background-600 rounded-lg p-4 border border-background-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📈 多股票走势对比
        </h3>
        <div className="flex items-center gap-4 text-xs">
          {data.map((stock, index) => (
            <span
              key={stock.code}
              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              onMouseEnter={() => setHoveredStock(stock.code)}
              onMouseLeave={() => setHoveredStock(null)}
            >
              <span
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-400">{stock.name || stock.code}</span>
            </span>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>🖱️ 滚轮缩放 | 拖拽平移</span>
        <span className="text-yellow-400">注: 价格已归一化（首日=100%）</span>
      </div>
    </div>
  );
}
