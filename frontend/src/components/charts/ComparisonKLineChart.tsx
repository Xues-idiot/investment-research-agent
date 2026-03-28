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
  currentPrice: number;
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

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#1A1F28' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D3648' },
        horzLines: { color: '#2D3648' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#F59E0B',
          width: 1,
          style: 2,
          labelBackgroundColor: '#F59E0B',
        },
        horzLine: {
          color: '#F59E0B',
          width: 1,
          style: 2,
          labelBackgroundColor: '#F59E0B',
        },
      },
      timeScale: {
        borderColor: '#2D3648',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
      },
      rightPriceScale: {
        borderColor: '#2D3648',
      },
    });

    chartRef.current = chart;

    const seriesMap: Record<string, { series: any; color: string; name: string }> = {};

    data.forEach((stock, index) => {
      if (!stock.kline || stock.kline.length === 0) return;

      const color = COLORS[index % COLORS.length];

      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });

      const basePrice = stock.kline[0].close;
      const normalizedData: LineData<Time>[] = stock.kline.map(k => ({
        time: k.time as Time,
        value: ((k.close - basePrice) / basePrice) * 100,
      }));

      lineSeries.setData(normalizedData);
      seriesMap[stock.code] = { series: lineSeries, color, name: stock.name || stock.code };
    });

    chart.timeScale().fitContent();

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
      <div className="bg-terminal-700 rounded-xl p-4 border border-border-subtle flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-content-muted text-sm">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-terminal-700 rounded-xl p-4 border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-content-primary flex items-center gap-2">
          📈 多股票走势对比
        </h3>
        <div className="flex items-center gap-4 text-xs">
          {data.map((stock, index) => (
            <span
              key={stock.code}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              onMouseEnter={() => setHoveredStock(stock.code)}
              onMouseLeave={() => setHoveredStock(null)}
            >
              <span
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-content-muted">{stock.name || stock.code}</span>
            </span>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />

      <div className="mt-3 flex items-center justify-between text-xs text-content-subtle">
        <span>🖱️ 滚轮缩放 | 拖拽平移</span>
        <span className="text-accent">注: 价格已归一化（首日=100%）</span>
      </div>
    </div>
  );
}
