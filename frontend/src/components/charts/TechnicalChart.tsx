'use client';

// TechnicalChart - 技术分析图表组件
// 显示MACD、RSI、KDJ等技术指标 (lightweight-charts v5)
// 支持折叠展开各指标面板

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, LineSeries, HistogramSeries, Time, LineData, HistogramData } from 'lightweight-charts';
import { motion, AnimatePresence } from 'framer-motion';

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

function CollapsibleIndicator({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-terminal-600 hover:bg-terminal-500 flex items-center justify-between transition-colors"
      >
        <span className="text-sm text-content-secondary flex items-center gap-2">
          {icon} {title}
        </span>
        <motion.svg
          className="w-4 h-4 text-content-muted"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-terminal-700">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TechnicalChart({ data, symbol = 'Stock', height = 300 }: TechnicalChartProps) {
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const kdjContainerRef = useRef<HTMLDivElement>(null);

  const macdChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const kdjChartRef = useRef<IChartApi | null>(null);

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!macdContainerRef.current || !rsiContainerRef.current || !kdjContainerRef.current) return;

    const macdChart = createChart(macdContainerRef.current, {
      width: macdContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1F28' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D3648' },
        horzLines: { color: '#2D3648' },
      },
      timeScale: { borderColor: '#2D3648', timeVisible: true },
      rightPriceScale: { borderColor: '#2D3648' },
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

    const rsiChart = createChart(rsiContainerRef.current, {
      width: rsiContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1F28' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D3648' },
        horzLines: { color: '#2D3648' },
      },
      timeScale: { borderColor: '#2D3648', timeVisible: true },
      rightPriceScale: { borderColor: '#2D3648' },
    });

    const rsiLine = rsiChart.addSeries(LineSeries, { color: '#8B5CF6', lineWidth: 2 });

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

    const kdjChart = createChart(kdjContainerRef.current, {
      width: kdjContainerRef.current.clientWidth,
      height: height / 3,
      layout: {
        background: { color: '#1A1F28' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2D3648' },
        horzLines: { color: '#2D3648' },
      },
      timeScale: { borderColor: '#2D3648', timeVisible: true },
      rightPriceScale: { borderColor: '#2D3648' },
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
    <div className="bg-terminal-700 rounded-xl p-4 border border-border-subtle space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-content-primary flex items-center gap-2">
          📊 {symbol} 技术指标
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1.5 text-xs bg-terminal-600 hover:bg-terminal-500 text-content-muted hover:text-content-primary rounded-lg transition-colors border border-transparent hover:border-border-subtle"
        >
          {showAll ? '收起全部' : '展开全部'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-terminal-600 rounded-xl p-2.5">
          <div className="text-xs text-content-muted mb-1">MACD</div>
          <div className={`text-sm font-mono font-medium tabular-nums ${(data[data.length-1]?.macd ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
            {data[data.length-1]?.macd?.toFixed(2) ?? '-'}
          </div>
        </div>
        <div className="bg-terminal-600 rounded-xl p-2.5">
          <div className="text-xs text-content-muted mb-1">RSI</div>
          <div className={`text-sm font-mono font-medium tabular-nums ${
            (() => {
              const rsi = data[data.length-1]?.rsi;
              if (rsi === undefined) return 'text-content-primary';
              return rsi > 70 ? 'text-loss' : rsi < 30 ? 'text-gain' : 'text-content-primary';
            })()
          }`}>
            {data[data.length-1]?.rsi?.toFixed(1) ?? '-'}
          </div>
        </div>
        <div className="bg-terminal-600 rounded-xl p-2.5">
          <div className="text-xs text-content-muted mb-1">KDJ.K</div>
          <div className="text-sm font-mono font-medium text-content-primary tabular-nums">
            {data[data.length-1]?.kdjK?.toFixed(1) ?? '-'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <CollapsibleIndicator title="MACD (12,26,9)" icon="📈" defaultOpen={showAll}>
          <div ref={macdContainerRef} className="w-full" style={{ height: `${height / 3}px` }} />
        </CollapsibleIndicator>

        <CollapsibleIndicator title="RSI (14) - 超买:70 超卖:30" icon="💜" defaultOpen={showAll}>
          <div ref={rsiContainerRef} className="w-full" style={{ height: `${height / 3}px` }} />
        </CollapsibleIndicator>

        <CollapsibleIndicator title="KDJ (9,3,3)" icon="📉" defaultOpen={showAll}>
          <div ref={kdjContainerRef} className="w-full" style={{ height: `${height / 3}px` }} />
        </CollapsibleIndicator>
      </div>

      <div className="mt-2 text-xs text-content-subtle text-center">
        指标说明: MACD(趋势)、RSI(动量)、KDJ(随机指标) | 点击标题展开/折叠
      </div>
    </div>
  );
}
