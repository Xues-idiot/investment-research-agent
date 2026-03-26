'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ComparisonBarChart, ComparisonKLineChart } from '@/components/charts';
import { useFavorites } from '@/hooks/useFavorites';
import { compareStocks, rankStocks, getCompareCharts } from '@/lib/api';
import { sanitizeHtml } from '@/lib/utils';
import { ComparisonResult, RankResult } from '@/types';

interface ChartData {
  charts: Array<{
    code: string;
    name: string;
    kline: Array<{
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
    }>;
    currentPrice: number;
  }>;
  count: number;
}

// Unified result type for both compare and rank
type CompareResponse = ComparisonResult | RankResult;

export default function ComparePage() {
  const [stockCodes, setStockCodes] = useState('600519,000858,000568');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | RankResult | null>(null);
  const [isRankResult, setIsRankResult] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rankCriteria, setRankCriteria] = useState('comprehensive');
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCompare = async () => {
    const codes = stockCodes.split(',').map(s => s.trim()).filter(Boolean);
    if (codes.length < 2) {
      setError('请输入至少2个股票代码');
      return;
    }

    setLoading(true);
    setError(null);
    setIsRankResult(false);

    try {
      // 并行请求对比数据和图表数据
      const [compareData, chartResponse] = await Promise.all([
        compareStocks(codes),
        getCompareCharts(codes),
      ]);

      if (compareData.success && compareData.data) {
        setResult(compareData.data);
      } else {
        setError(compareData.error || '对比失败');
      }

      if (chartResponse.success && chartResponse.data) {
        setChartData(chartResponse.data);
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleRank = async () => {
    const codes = stockCodes.split(',').map(s => s.trim()).filter(Boolean);
    if (codes.length < 2) {
      setError('请输入至少2个股票代码');
      return;
    }

    setLoading(true);
    setError(null);
    setIsRankResult(true);

    try {
      const data = await rankStocks(codes, rankCriteria);
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || '排名失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-500 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">📈 股票对比</h1>
          <p className="text-gray-400">多股票横向对比，分析估值、技术面、市场表现</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              股票代码（逗号分隔）
            </label>
            <input
              type="text"
              value={stockCodes}
              onChange={(e) => setStockCodes(e.target.value)}
              placeholder="600519,000858,000568"
              className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              排名标准
            </label>
            <select
              value={rankCriteria}
              onChange={(e) => setRankCriteria(e.target.value)}
              className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="value">估值优先</option>
              <option value="growth">成长性优先</option>
              <option value="technical">技术面优先</option>
              <option value="comprehensive">综合评分</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '对比中...' : '开始对比'}
            </button>
            <button
              onClick={handleRank}
              disabled={loading}
              className="px-6 py-3 bg-secondary-500 text-white rounded-lg font-medium hover:bg-secondary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '排名中...' : '综合排名'}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </motion.div>

        {/* Results */}
        {result && !isRankResult && 'stocks' in result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stock Summary */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">股票概览</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.stocks.map((stock) => (
                  <div key={stock.stockCode} className="bg-background-500 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{stock.name}</p>
                        <p className="text-gray-400 text-sm">{stock.stockCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(stock.stockCode, stock.name)}
                          className="text-xl hover:scale-110 transition-transform"
                          title={isFavorite(stock.stockCode) ? '取消收藏' : '添加收藏'}
                        >
                          {isFavorite(stock.stockCode) ? '⭐' : '☆'}
                        </button>
                        <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">¥{stock.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* K-line Comparison Chart */}
            {chartData && chartData.charts && chartData.charts.length >= 2 && (
              <ComparisonKLineChart data={chartData.charts} height={350} />
            )}

            {/* Price Comparison Chart */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">价格对比</h2>
              <ComparisonBarChart
                labels={result.stocks.map(s => s.name)}
                values={result.stocks.map(s => s.price)}
                formatValue={(v) => `¥${v.toFixed(2)}`}
              />
            </div>

            {/* Valuation Metrics Comparison */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">涨跌幅对比</h2>
              <ComparisonBarChart
                labels={result.stocks.map(s => s.name)}
                values={result.stocks.map(s => s.changePercent)}
                formatValue={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
              />
            </div>

            {/* Comparison Tables */}
            {result.comparison && result.comparison.valuation && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">估值对比</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-background-400">
                        {result.comparison.valuation.headers.map((h, i) => (
                          <th key={i} className="text-left py-3 px-4 text-gray-400 text-sm font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.comparison.valuation.rows.map((row, i) => (
                        <tr key={i} className="border-b border-background-500">
                          {Object.values(row).map((cell, j) => (
                            <td key={j} className="py-3 px-4 text-white text-sm">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Conclusions */}
            {result.conclusions && result.conclusions.length > 0 && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">分析结论</h2>
                <ul className="space-y-2">
                  {result.conclusions.map((conclusion, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(conclusion) }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Rank Results */}
        {result && isRankResult && 'ranks' in result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Rank Summary */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                股票排名 - {result.criteria === 'value' ? '估值优先' : result.criteria === 'growth' ? '成长性优先' : result.criteria === 'technical' ? '技术面优先' : '综合评分'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-background-400">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">排名</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">股票</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">代码</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">当前价</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">综合评分</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ranks.map((stock) => (
                      <tr key={stock.rank} className="border-b border-background-500">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            stock.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            stock.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                            stock.rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                            'bg-background-500 text-gray-400'
                          }`}>
                            {stock.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{stock.name}</td>
                        <td className="py-3 px-4 text-gray-400 text-right">{stock.stockCode}</td>
                        <td className="py-3 px-4 text-white text-right">¥{stock.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-primary-400 text-right font-bold">{stock.score.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toggleFavorite(stock.stockCode, stock.name)}
                            className="text-xl hover:scale-110 transition-transform"
                            title={isFavorite(stock.stockCode) ? '取消收藏' : '添加收藏'}
                          >
                            {isFavorite(stock.stockCode) ? '⭐' : '☆'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}