'use client';

// TechnicalChart - 技术分析图表组件
// 显示MACD、RSI、KDJ等技术指标 (lightweight-charts v5)

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineSeries, HistogramSeries, Time, LineData, HistogramData } from 'lightweight-charts';

interface TechnicalData {
  time: string;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  rsi?: number;
  kdjK?: number;
  kdjD?: number;
  kdjJ?: number;
}

interface TechnicalChartProps {
  data: TechnicalData[];
  symbol?: string;
  height?: number;
}

export default function TechnicalChart({ data, symbol = 'Stock', height = 300 }: TechnicalChartProps) {
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const kdjContainerRef = useRef<HTMLDivElement>(null);

  const macdChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const kdjChartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!macdContainerRef.current || !rsiContainerRef.current || !kdjContainerRef.current) return;

    // MACD图表
    const macdChart = createChart(macdContainerRef.current, {
      width: macdContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1A2E' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D2D44' },
        horzLines: { color: '#2D2D44' },
      },
      timeScale: { borderColor: '#2D2D44', timeVisible: true },
      rightPriceScale: { borderColor: '#2D2D44' },
    });

    const macdLine = macdChart.addSeries(LineSeries, { color: '#3B82F6', lineWidth: 2 });
    const signalLine = macdChart.addSeries(LineSeries, { color: '#F59E0B', lineWidth: 2 });
    const histogramSeries = macdChart.addSeries(HistogramSeries, { color: '#10B981' });

    macdLine.setData(
      data.filter(d => d.macd !== undefined).map(d => ({
        time: d.time as Time,
        value: d.macd!,
      })) as LineData<Time>[]
    );

    signalLine.setData(
      data.filter(d => d.macdSignal !== undefined).map(d => ({
        time: d.time as Time,
        value: d.macdSignal!,
      })) as LineData<Time>[]
    );

    histogramSeries.setData(
      data.filter(d => d.macdHistogram !== undefined).map(d => ({
        time: d.time as Time,
        value: d.macdHistogram!,
        color: d.macdHistogram! >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      })) as HistogramData<Time>[]
    );

    macdChart.timeScale().fitContent();
    macdChartRef.current = macdChart;

    // RSI图表
    const rsiChart = createChart(rsiContainerRef.current, {
      width: rsiContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1A2E' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D2D44' },
        horzLines: { color: '#2D2D44' },
      },
      timeScale: { borderColor: '#2D2D44', timeVisible: true },
      rightPriceScale: { borderColor: '#2D2D44' },
    });

    const rsiLine = rsiChart.addSeries(LineSeries, { color: '#8B5CF6', lineWidth: 2 });

    // 添加超买超卖线
    const overboughtLine = rsiChart.addSeries(LineSeries, {
      color: 'rgba(239, 68, 68, 0.5)',
      lineWidth: 1,
      lineStyle: 2,
    });
    const oversoldLine = rsiChart.addSeries(LineSeries, {
      color: 'rgba(16, 185, 129, 0.5)',
      lineWidth: 1,
      lineStyle: 2,
    });

    rsiLine.setData(
      data.filter(d => d.rsi !== undefined).map(d => ({
        time: d.time as Time,
        value: d.rsi!,
      })) as LineData<Time>[]
    );

    const rsiDates = data.filter(d => d.rsi !== undefined).map(d => d.time as Time);
    overboughtLine.setData(rsiDates.map(t => ({ time: t, value: 70 })) as LineData<Time>[]);
    oversoldLine.setData(rsiDates.map(t => ({ time: t, value: 30 })) as LineData<Time>[]);

    rsiChart.timeScale().fitContent();
    rsiChartRef.current = rsiChart;

    // KDJ图表
    const kdjChart = createChart(kdjContainerRef.current, {
      width: kdjContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1A2E' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D2D44' },
        horzLines: { color: '#2D2D44' },
      },
      timeScale: { borderColor: '#2D2D44', timeVisible: true },
      rightPriceScale: { borderColor: '#2D2D44' },
    });

    const kLine = kdjChart.addSeries(LineSeries, { color: '#06B6D4', lineWidth: 2 });
    const dLine = kdjChart.addSeries(LineSeries, { color: '#F97316', lineWidth: 2 });
    const jLine = kdjChart.addSeries(LineSeries, { color: '#EC4899', lineWidth: 2 });

    kLine.setData(
      data.filter(d => d.kdjK !== undefined).map(d => ({
        time: d.time as Time,
        value: d.kdjK!,
      })) as LineData<Time>[]
    );

    dLine.setData(
      data.filter(d => d.kdjD !== undefined).map(d => ({
        time: d.time as Time,
        value: d.kdjD!,
      })) as LineData<Time>[]
    );

    jLine.setData(
      data.filter(d => d.kdjJ !== undefined).map(d => ({
        time: d.time as Time,
        value: d.kdjJ!,
      })) as LineData<Time>[]
    );

    kdjChart.timeScale().fitContent();
    kdjChartRef.current = kdjChart;

    // 响应窗口大小变化
    const handleResize = () => {
      if (macdContainerRef.current && macdChartRef.current) {
        macdChartRef.current.applyOptions({ width: macdContainerRef.current.clientWidth });
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
      if (kdjContainerRef.current && kdjChartRef.current) {
        kdjChartRef.current.applyOptions({ width: kdjContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      macdChart.remove();
      rsiChart.remove();
      kdjChart.remove();
    };
  }, [data, height]);

  return (
    <div className="bg-background-600 rounded-lg p-4 border border-background-400 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📊 {symbol} 技术指标
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-500"></span>
            <span className="text-gray-400">MACD</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-purple-500"></span>
            <span className="text-gray-400">RSI</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-cyan-500"></span>
            <span className="text-gray-400">KDJ</span>
          </span>
        </div>
      </div>

      {/* MACD */}
      <div>
        <div className="text-sm text-gray-400 mb-1">MACD (12,26,9)</div>
        <div ref={macdContainerRef} className="w-full" />
      </div>

      {/* RSI */}
      <div>
        <div className="text-sm text-gray-400 mb-1">RSI (14) - 超买:70 超卖:30</div>
        <div ref={rsiContainerRef} className="w-full" />
      </div>

      {/* KDJ */}
      <div>
        <div className="text-sm text-gray-400 mb-1">KDJ (9,3,3)</div>
        <div ref={kdjContainerRef} className="w-full" />
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        指标说明: MACD(趋势)、RSI(动量)、KDJ(随机指标)
      </div>
    </div>
  );
}