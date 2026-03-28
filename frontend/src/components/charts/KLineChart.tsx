'use client';

// KLineChart - K线图表组件 (使用TradingView lightweight-charts v5)

import { useEffect, useRef, useCallback, useState } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenHeight, setFullscreenHeight] = useState(0);

  // 获取全屏时的高度（避免直接访问window导致hydration不匹配）
  useEffect(() => {
    if (isFullscreen) {
      setFullscreenHeight(window.innerHeight - 100);
    }
  }, [isFullscreen]);

  const handleResetZoom = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Resize chart after entering fullscreen
        setTimeout(() => {
          if (chartRef.current && chartContainerRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: window.innerHeight - 100,
            });
          }
        }, 100);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        // Resize chart after exiting fullscreen
        setTimeout(() => {
          if (chartRef.current && chartContainerRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height,
            });
          }
        }, 100);
      });
    }
  }, [height]);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        rightOffset: 5,
      },
      rightPriceScale: {
        borderColor: '#2D2D44',
      },
      handleScroll: {
        vertTouchDrag: false,
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
    <div ref={wrapperRef} className="bg-terminal-700 rounded-xl p-4 border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-content-primary flex items-center gap-2">
          📈 {symbol} K线走势图
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={handleFullscreen}
            className="px-3 py-1.5 text-xs bg-terminal-600 hover:bg-terminal-500 text-content-muted hover:text-content-primary rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-border-subtle"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? '⊠' : '⛶'}
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1.5 text-xs bg-terminal-600 hover:bg-terminal-500 text-content-muted hover:text-content-primary rounded-lg transition-colors border border-transparent hover:border-border-subtle"
            title="重置缩放"
          >
            重置
          </button>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gain"></span>
            <span className="text-content-muted">上涨</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-loss"></span>
            <span className="text-content-muted">下跌</span>
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height: `${isFullscreen ? fullscreenHeight : height}px` }} />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>🖱️ 滚轮缩放 | 拖拽平移 |十字光标查看详情</span>
        <span>数据来源: yfinance | 更新时间: {new Date().toLocaleTimeString('zh-CN')}</span>
      </div>
    </div>
  );
}