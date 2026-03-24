'use client';

// Research Page - 投资研究页面 (支持流式输出+K线图表)

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StockSearch from '@/components/StockSearch';
import StreamingSearch from '@/components/StreamingSearch';
import ReportCard from '@/components/ReportCard';
import AgentStatus from '@/components/AgentStatus';
import StreamingProgress from '@/components/StreamingProgress';
import { KLineChart, TechnicalChart } from '@/components/charts';

interface ResearchResult {
  stockCode: string;
  companyName: string;
  finalReport: string;
  confidence: number;
  riskAssessment: {
    level: string;
    score: number;
    factors: string[];
  };
  reports: {
    fundamentals: string;
    sentiment: string;
    news: string;
    technical: string;
    synthesis: string;
  };
}

interface ChartData {
  kline: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  technical: {
    time: string;
    macd: number;
    macdSignal: number;
    macdHistogram: number;
    rsi: number;
    kdjK: number;
    kdjD: number;
    kdjJ: number;
  }[];
}

export default function ResearchPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  // 非流式处理
  const handleResearch = async (stockCode: string) => {
    setLoading(true);
    setError(null);
    setCurrentAgent('调度');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8001/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_code: stockCode }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || '研究失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
      setCurrentAgent('');
    }
  };

  // 流式进度回调
  const handleProgress = useCallback((agent: string, message: string) => {
    setCurrentAgent(agent);
    setCurrentMessage(message);
  }, []);

  // 流式完成回调
  const handleComplete = useCallback((data: ResearchResult) => {
    setResult(data);
    setLoading(false);
    setCurrentAgent('');
    setCurrentMessage('');
    // 获取图表数据
    fetchChartData(data.stockCode);
  }, []);

  // 获取图表数据
  const fetchChartData = async (stockCode: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/stock/chart/${stockCode}`);
      const data = await response.json();
      if (data.success) {
        setChartData(data.data);
        setShowCharts(true);
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  };

  // 流式错误回调
  const handleStreamError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setLoading(false);
    setCurrentAgent('');
    setCurrentMessage('');
  }, []);

  return (
    <div className="min-h-screen bg-background-500">
      {/* Header */}
      <motion.header
        className="bg-background-600 border-b border-background-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            📊 Rho 投研 Agent
          </motion.h1>
          <motion.p
            className="mt-2 text-gray-400"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            智能股票投资研究助手
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mode Toggle */}
        <motion.div
          className="mb-4 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <span className="text-gray-400 text-sm">模式:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setUseStreaming(true)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                useStreaming
                  ? 'bg-primary-500 text-white'
                  : 'bg-background-600 text-gray-400 hover:text-white'
              }`}
            >
              🚀 流式
            </button>
            <button
              onClick={() => setUseStreaming(false)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                !useStreaming
                  ? 'bg-primary-500 text-white'
                  : 'bg-background-600 text-gray-400 hover:text-white'
              }`}
            >
              📦 批量
            </button>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {useStreaming ? (
            <StreamingSearch
              onProgress={handleProgress}
              onComplete={handleComplete}
              onError={handleStreamError}
            />
          ) : (
            <StockSearch onSearch={handleResearch} loading={loading} />
          )}
        </motion.div>

        {/* Streaming Progress */}
        <AnimatePresence>
          {loading && useStreaming && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StreamingProgress
                currentAgent={currentAgent}
                currentMessage={currentMessage}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Traditional Agent Status (for non-streaming mode) */}
        <AnimatePresence>
          {loading && !useStreaming && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AgentStatus currentAgent={currentAgent} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Research Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ReportCard report={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts Section */}
        <AnimatePresence>
          {showCharts && chartData && result && (
            <motion.div
              className="mt-8 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* K Line Chart */}
              <KLineChart
                data={chartData.kline}
                symbol={result.stockCode}
                height={400}
              />

              {/* Technical Indicators Chart */}
              <TechnicalChart
                data={chartData.technical}
                symbol={result.stockCode}
                height={350}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {!result && !loading && !error && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🔍
              </motion.div>
              <motion.h2
                className="text-2xl font-semibold text-gray-300 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                开始您的投资研究
              </motion.h2>
              <motion.p
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                输入股票代码，我们将为您生成详细的投资研究报告
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-background-600 border-t border-background-400 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 text-sm">
            Rho 投研 Agent | 投资有风险，入市需谨慎
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
