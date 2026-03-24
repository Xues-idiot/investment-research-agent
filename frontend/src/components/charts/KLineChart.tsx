'use client';

// KLineChart - K线图表组件 (使用TradingView lightweight-charts v5)

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeries, HistogramSeries, CandlestickData, HistogramData, Time } from 'lightweight-charts';

interface KLineChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }[];
  symbol?: string;
  width?: number;
  height?: number;
}

export default function KLineChart({ data, symbol = 'Stock', width = 800, height = 400 }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width,
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
      },
      rightPriceScale: {
        borderColor: '#2D2D44',
      },
    });

    chartRef.current = chart;

    // 添加K线系列 (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // 添加成交量系列 (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26A69A',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // 转换数据格式
    const candleData: CandlestickData<Time>[] = data.map(item => ({
      time: item.time as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData: HistogramData<Time>[] = data.map(item => ({
      time: item.time as Time,
      value: item.volume || 0,
      color: item.close >= item.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }));

    // 设置数据
    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);

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
  }, [data, width, height]);

  return (
    <div className="bg-background-600 rounded-lg p-4 border border-background-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📈 {symbol} K线走势图
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-400">上涨</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-400">下跌</span>
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
      <div className="mt-2 text-xs text-gray-500 text-center">
        数据来源: yfinance | 时间范围: 近1年
      </div>
    </div>
  );
}