'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AllocationChart } from '@/components/charts';
import { suggestPortfolio, analyzePortfolioRisk } from '@/lib/api';

interface Holding {
  stockCode: string;
  stockName: string;
  weight: number;
  shares: number;
  entryPrice: number;
  allocation: number;
  allocationPct: number;
}

interface PortfolioSuggestion {
  totalCapital: number;
  totalInvested: number;
  cashReserve: number;
  cashReservePct: number;
  holdings: Holding[];
  numPositions: number;
  strategy: string;
  riskLevel: string;
  timestamp: string;
}

interface RiskAnalysis {
  riskScore: number;
  riskLevel: string;
  concentrationRisk: string;
  diversificationScore: number;
  correlationRisk: string;
  maxWeight: number;
  numPositions: number;
  suggestions: string[];
}

export default function PortfolioPage() {
  const [stockCodes, setStockCodes] = useState('600519,000858,000568');
  const [totalCapital, setTotalCapital] = useState('1000000');
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [strategy, setStrategy] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<PortfolioSuggestion | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);

  const handleSuggest = async () => {
    const codes = stockCodes.split(',').map(s => s.trim()).filter(Boolean);
    if (codes.length < 1) {
      setError('请输入至少1个股票代码');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await suggestPortfolio({
        stock_codes: codes,
        total_capital: parseFloat(totalCapital),
        risk_level: riskLevel,
        strategy: strategy,
      });
      if (data.success && data.data) {
        setSuggestion(data.data);
        // Auto analyze risk
        handleAnalyzeRisk(data.data);
      } else {
        setError(data.error || '生成建议失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRisk = async (portfolioData?: PortfolioSuggestion) => {
    const dataToAnalyze = portfolioData || suggestion;
    if (!dataToAnalyze) return;

    try {
      const data = await analyzePortfolioRisk(dataToAnalyze);
      if (data.success && data.data) {
        setRiskAnalysis(data.data);
      }
    } catch (err) {
      console.error('Failed to analyze risk:', err);
    }
  };

  const riskLevelLabels: Record<string, string> = {
    conservative: '保守型',
    moderate: '稳健型',
    aggressive: '激进型',
  };

  const strategyLabels: Record<string, string> = {
    value: '价值投资',
    growth: '成长投资',
    balanced: '平衡型',
    momentum: '动量策略',
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
          <h1 className="text-3xl font-bold text-white mb-2">💼 组合管理</h1>
          <p className="text-gray-400">投资组合建议、风险分析、调仓建议</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">生成组合建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                候选股票（逗号分隔）
              </label>
              <input
                type="text"
                value={stockCodes}
                onChange={(e) => setStockCodes(e.target.value)}
                placeholder="600519,000858,000568"
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                总资金（元）
              </label>
              <input
                type="number"
                value={totalCapital}
                onChange={(e) => setTotalCapital(e.target.value)}
                placeholder="1000000"
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">风险偏好</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="conservative">保守型（3-5只）</option>
                <option value="moderate">稳健型（5-8只）</option>
                <option value="aggressive">激进型（8-15只）</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">投资策略</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="value">价值投资</option>
                <option value="growth">成长投资</option>
                <option value="balanced">平衡型</option>
                <option value="momentum">动量策略</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSuggest}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '生成中...' : '生成组合建议'}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </motion.div>

        {/* Results */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Portfolio Summary */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">组合概览</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">总资金</p>
                  <p className="text-white text-xl font-bold">¥{parseFloat(suggestion.totalCapital as any).toLocaleString()}</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">配置市值</p>
                  <p className="text-primary-400 text-xl font-bold">¥{parseFloat(suggestion.totalInvested as any).toLocaleString()}</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">现金保留</p>
                  <p className="text-green-400 text-xl font-bold">¥{parseFloat(suggestion.cashReserve as any).toLocaleString()}</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">持仓数量</p>
                  <p className="text-white text-xl font-bold">{suggestion.numPositions} 只</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-400">
                  风险偏好: <span className="text-white">{riskLevelLabels[suggestion.riskLevel]}</span>
                </span>
                <span className="text-gray-400">
                  策略: <span className="text-white">{strategyLabels[suggestion.strategy]}</span>
                </span>
              </div>
            </div>

            {/* Allocation Chart */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">配置分布</h2>
              <AllocationChart
                holdings={suggestion.holdings}
                cashReservePct={suggestion.cashReservePct}
                height={280}
              />
            </div>

            {/* Holdings */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">持仓建议</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-background-400">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">股票代码</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">股票名称</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">配置权重</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">建议股数</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">买入价格</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">预计金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestion.holdings.map((holding) => (
                      <tr key={holding.stockCode} className="border-b border-background-500">
                        <td className="py-3 px-4 text-white text-sm">{holding.stockCode}</td>
                        <td className="py-3 px-4 text-white text-sm">{holding.stockName}</td>
                        <td className="py-3 px-4 text-primary-400 text-sm text-right">{(holding.weight * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4 text-white text-sm text-right">{holding.shares}</td>
                        <td className="py-3 px-4 text-white text-sm text-right">¥{holding.entryPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-white text-sm text-right">¥{holding.allocation.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Analysis */}
            {riskAnalysis && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">风险分析</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-background-500 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">风险评分</p>
                    <p className={`text-xl font-bold ${
                      riskAnalysis.riskLevel === '高' ? 'text-red-400' :
                      riskAnalysis.riskLevel === '中' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{riskAnalysis.riskScore} ({riskAnalysis.riskLevel})</p>
                  </div>
                  <div className="bg-background-500 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">集中度风险</p>
                    <p className={`text-xl font-bold ${
                      riskAnalysis.concentrationRisk === '高' ? 'text-red-400' :
                      riskAnalysis.concentrationRisk === '中' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{riskAnalysis.concentrationRisk}</p>
                  </div>
                  <div className="bg-background-500 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">分散度评分</p>
                    <p className="text-xl font-bold text-white">{riskAnalysis.diversificationScore}/10</p>
                  </div>
                  <div className="bg-background-500 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">相关性风险</p>
                    <p className={`text-xl font-bold ${
                      riskAnalysis.correlationRisk === '高' ? 'text-red-400' :
                      riskAnalysis.correlationRisk === '中' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{riskAnalysis.correlationRisk}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">风险建议</p>
                  <ul className="space-y-1">
                    {riskAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-primary-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}