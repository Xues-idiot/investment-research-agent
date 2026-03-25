'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ComparisonBarChart, ComparisonKLineChart } from '@/components/charts';

interface CompareResult {
  stocks: Array<{
    code: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
  comparison: {
    valuation: { headers: string[]; rows: string[][] };
    technical: { headers: string[]; rows: string[][] };
    market: { headers: string[]; rows: string[][] };
  };
  conclusions: string[];
}

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
    current_price: number;
  }>;
  count: number;
}

export default function ComparePage() {
  const [stockCodes, setStockCodes] = useState('600519,000858,000568');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rankCriteria, setRankCriteria] = useState('comprehensive');

  const handleCompare = async () => {
    const codes = stockCodes.split(',').map(s => s.trim()).filter(Boolean);
    if (codes.length < 2) {
      setError('请输入至少2个股票代码');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 并行请求对比数据和图表数据
      const [compareRes, chartRes] = await Promise.all([
        fetch('http://localhost:8001/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_codes: codes }),
        }),
        fetch('http://localhost:8001/api/compare/charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_codes: codes }),
        }),
      ]);

      const compareData = await compareRes.json();
      const chartResponse = await chartRes.json();

      if (compareData.success) {
        setResult(compareData.data);
      } else {
        setError(compareData.error || '对比失败');
      }

      if (chartResponse.success) {
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

    try {
      const response = await fetch('http://localhost:8001/api/compare/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_codes: codes, criteria: rankCriteria }),
      });
      const data = await response.json();
      if (data.success) {
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
        {result && (
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
                  <div key={stock.code} className="bg-background-500 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{stock.name}</p>
                        <p className="text-gray-400 text-sm">{stock.code}</p>
                      </div>
                      <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">¥{stock.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* K-line Comparison Chart */}
            {chartData && chartData.charts.length >= 2 && (
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
                        {row.map((cell, j) => (
                          <td key={j} className="py-3 px-4 text-white text-sm">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Conclusions */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">分析结论</h2>
              <ul className="space-y-2">
                {result.conclusions.map((conclusion, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-primary-400">•</span>
                    <span dangerouslySetInnerHTML={{ __html: conclusion }} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
