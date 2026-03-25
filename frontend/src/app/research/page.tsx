'use client';

// Research Page - 投资研究页面 (支持流式输出+K线图表)

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StockSearch from '@/components/StockSearch';
import StockSearchAutocomplete from '@/components/StockSearchAutocomplete';
import StreamingSearch from '@/components/StreamingSearch';
import { ResearchSkeleton } from '@/components/SkeletonLoader';
import { useKeyboardShortcuts, ShortcutHint } from '@/hooks/useKeyboardShortcuts';
import ReportCard from '@/components/ReportCard';
import AgentStatus from '@/components/AgentStatus';
import StreamingProgress from '@/components/StreamingProgress';
import { KLineChart, TechnicalChart } from '@/components/charts';
import { useFavorites } from '@/hooks/useFavorites';
import BatchResearch from '@/components/BatchResearch';
import Toast, { toast, useToast } from '@/components/Toast';

const HISTORY_KEY = 'rho_research_history';
const MAX_HISTORY = 10;

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

interface HistoryItem {
  stockCode: string;
  companyName: string;
  riskLevel: string;
  riskScore: number;
  timestamp: string;
}

export default function ResearchPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [showBatch, setShowBatch] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState('');
  const [researchStartTime, setResearchStartTime] = useState<number>(0);
  const { favorites, removeFavorite } = useFavorites();
  const { toasts, removeToast } = useToast();

  // 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // 保存到历史记录
  const saveToHistory = useCallback((res: ResearchResult) => {
    const item: HistoryItem = {
      stockCode: res.stockCode,
      companyName: res.companyName,
      riskLevel: res.riskAssessment.level,
      riskScore: res.riskAssessment.score,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => {
      // 去重：新记录在前
      const filtered = prev.filter(h => h.stockCode !== item.stockCode);
      const updated = [item, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // 过滤后的历史记录
  const filteredHistory = historyFilter.trim()
    ? history.filter(h =>
        h.stockCode.includes(historyFilter.toUpperCase()) ||
        h.companyName.includes(historyFilter)
      )
    : history;

  // 从历史恢复
  const loadFromHistory = useCallback((item: HistoryItem) => {
    setResult(null);
    setChartData(null);
    setShowCharts(false);
    // 重新研究该股票
    if (useStreaming) {
      // 流式模式会在提交时自动开始
    }
  }, [useStreaming]);

  // 快捷键
  const shortcuts = [
    { key: 'r', action: () => document.querySelector<HTMLInputElement>('input[placeholder*="股票"]')?.focus(), description: '聚焦搜索' },
    { key: 'c', action: () => setUseStreaming(!useStreaming), description: '切换模式' },
    { key: 'Escape', action: () => { setLoading(false); setCurrentAgent(''); }, description: '取消' },
  ];

  useKeyboardShortcuts(shortcuts);

  // 非流式处理
  const handleResearch = async (stockCode: string) => {
    setLoading(true);
    setError(null);
    setCurrentAgent('调度');
    setResult(null);
    setResearchStartTime(Date.now());

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
        saveToHistory(data.data);
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
    saveToHistory(data);
    // 获取图表数据
    fetchChartData(data.stockCode);
    // 显示完成通知
    toast({
      type: 'success',
      title: '研究完成',
      message: `${data.companyName} (${data.stockCode}) 研究报告已生成`,
    });
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">📊 投资研究</h1>
        <p className="text-gray-400">多维度分析股票，生成专业投资研究报告</p>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
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
            <div className="h-4 w-px bg-background-400 mx-2" />
            <button
              onClick={() => setShowBatch(!showBatch)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showBatch
                  ? 'bg-secondary-500 text-white'
                  : 'bg-background-600 text-gray-400 hover:text-white'
              }`}
            >
              📚 批量研究
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
            <StockSearchAutocomplete onSearch={handleResearch} loading={loading} />
          )}
        </motion.div>

        {/* Batch Research Section */}
        <AnimatePresence>
          {showBatch && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BatchResearch
                onResearch={(codes) => {
                  // For batch, we just research the first one for now
                  // The backend would need batch support
                  if (codes.length > 0) {
                    handleResearch(codes[0]);
                  }
                }}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
                startTime={researchStartTime}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Hint */}
        {!loading && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ShortcutHint shortcuts={shortcuts} />
          </motion.div>
        )}

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

        {/* Loading Skeleton */}
        <AnimatePresence>
          {loading && !useStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResearchSkeleton />
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
              className="space-y-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Empty state message */}
              <div className="text-center py-8">
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
              </div>

              {/* Research History */}
              {(history.length > 0 || historyFilter) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-background-600 rounded-xl border border-background-400 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      📜 最近研究
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        placeholder="搜索..."
                        className="px-3 py-1 text-sm bg-background-500 border border-background-400 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={clearHistory}
                        className="px-3 py-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredHistory.length === 0 && historyFilter && (
                      <p className="text-gray-500 text-sm col-span-full text-center py-4">
                        没有找到匹配的历史记录
                      </p>
                    )}
                    {filteredHistory.map((item, index) => (
                      <motion.button
                        key={item.stockCode}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => {
                          // 触发重新研究
                          setResult(null);
                          setShowCharts(false);
                        }}
                        className="p-3 bg-background-500 hover:bg-background-400 rounded-lg text-left transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{item.companyName}</p>
                            <p className="text-gray-400 text-sm">{item.stockCode}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                              item.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {item.riskLevel}
                            </span>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(item.timestamp).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Favorites */}
              {favorites.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-background-600 rounded-xl border border-background-400 p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    ⭐ 我的收藏
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favorites.map((item, index) => (
                      <motion.div
                        key={item.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-3 bg-background-500 rounded-lg flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeFavorite(item.code)}
                            className="text-yellow-400 hover:scale-110 transition-transform"
                            title="取消收藏"
                          >
                            ⭐
                          </button>
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-400 text-sm">{item.code}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setResult(null);
                            setShowCharts(false);
                          }}
                          className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs rounded hover:bg-primary-500/30 transition-colors"
                        >
                          研究
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
