'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EquityCurveChart, DrawdownChart } from '@/components/charts';
import { runBacktestMA, runBacktestRSI, runBacktestMomentum } from '@/lib/api';

interface BacktestResult {
  stockCode: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  numTrades: number;
  numBuys: number;
  numSells: number;
  winRate: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  trades: Array<{
    date: string;
    signal: string;
    price: number;
    shares: number;
    amount: number;
    commission: number;
    reason: string;
  }>;
  dailyReturns: Array<{
    date: string;
    value: number;
    dailyReturn: number;
  }>;
}

export default function BacktestPage() {
  const [stockCode, setStockCode] = useState('600519');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [strategyType, setStrategyType] = useState('ma');
  const [initialCapital, setInitialCapital] = useState('1000000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);

  // MA strategy params
  const [shortWindow, setShortWindow] = useState('5');
  const [longWindow, setLongWindow] = useState('20');

  // RSI strategy params
  const [rsiPeriod, setRsiPeriod] = useState('14');
  const [oversold, setOversold] = useState('30');
  const [overbought, setOverbought] = useState('70');

  // Momentum strategy params
  const [lookback, setLookback] = useState('20');
  const [momentumThreshold, setMomentumThreshold] = useState('0.05');

  const handleRunBacktest = async () => {
    if (!stockCode || !startDate || !endDate) {
      setError('请填写所有必填字段');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseParams = {
        stock_code: stockCode,
        start_date: startDate,
        end_date: endDate,
        initial_capital: parseFloat(initialCapital),
      };

      let data;
      if (strategyType === 'ma') {
        data = await runBacktestMA({
          ...baseParams,
          short_window: parseInt(shortWindow),
          long_window: parseInt(longWindow),
        });
      } else if (strategyType === 'rsi') {
        data = await runBacktestRSI({
          ...baseParams,
          rsi_period: parseInt(rsiPeriod),
          oversold: parseInt(oversold),
          overbought: parseInt(overbought),
        });
      } else {
        data = await runBacktestMomentum({
          ...baseParams,
          lookback: parseInt(lookback),
          threshold: parseFloat(momentumThreshold),
        });
      }

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || '回测失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const strategyLabels: Record<string, string> = {
    ma: '均线交叉',
    rsi: 'RSI',
    momentum: '动量',
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
          <h1 className="text-3xl font-bold text-white mb-2">🔬 策略回测</h1>
          <p className="text-gray-400">均线、RSI、动量策略历史回测，验证策略有效性</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">回测参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">股票代码</label>
              <input
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                placeholder="600519"
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">初始资金</label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                placeholder="1000000"
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">策略类型</label>
              <select
                value={strategyType}
                onChange={(e) => setStrategyType(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="ma">均线交叉</option>
                <option value="rsi">RSI</option>
                <option value="momentum">动量</option>
              </select>
            </div>

            {strategyType === 'ma' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">短期均线</label>
                  <input
                    type="number"
                    value={shortWindow}
                    onChange={(e) => setShortWindow(e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">长期均线</label>
                  <input
                    type="number"
                    value={longWindow}
                    onChange={(e) => setLongWindow(e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            )}

            {strategyType === 'rsi' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">RSI周期</label>
                  <input
                    type="number"
                    value={rsiPeriod}
                    onChange={(e) => setRsiPeriod(e.target.value)}
                    placeholder="14"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">超卖阈值</label>
                  <input
                    type="number"
                    value={oversold}
                    onChange={(e) => setOversold(e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">超买阈值</label>
                  <input
                    type="number"
                    value={overbought}
                    onChange={(e) => setOverbought(e.target.value)}
                    placeholder="70"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            )}

            {strategyType === 'momentum' && (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">回看期间</label>
                  <input
                    type="number"
                    value={lookback}
                    onChange={(e) => setLookback(e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">动量阈值</label>
                  <input
                    type="number"
                    step="0.01"
                    value={momentumThreshold}
                    onChange={(e) => setMomentumThreshold(e.target.value)}
                    placeholder="0.05"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? '回测中...' : '运行回测'}
          </button>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-background-600 rounded-xl border border-background-400 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">回测结果</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">总收益率</p>
                  <p className={`text-xl font-bold ${result.totalReturnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.totalReturnPct >= 0 ? '+' : ''}{result.totalReturnPct.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">最终市值</p>
                  <p className="text-white text-xl font-bold">¥{result.finalValue.toLocaleString()}</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">总收益</p>
                  <p className={`text-xl font-bold ${result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.totalReturn >= 0 ? '+' : ''}¥{result.totalReturn.toLocaleString()}
                  </p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">夏普比率</p>
                  <p className="text-white text-xl font-bold">{result.sharpeRatio.toFixed(2)}</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">最大回撤</p>
                  <p className="text-red-400 text-xl font-bold">{result.maxDrawdownPct.toFixed(2)}%</p>
                </div>
                <div className="bg-background-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">胜率</p>
                  <p className="text-white text-xl font-bold">{result.winRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="mt-4 flex gap-6 text-sm">
                <span className="text-gray-400">
                  股票: <span className="text-white">{result.stockCode}</span>
                </span>
                <span className="text-gray-400">
                  策略: <span className="text-white">{strategyLabels[strategyType]}</span>
                </span>
                <span className="text-gray-400">
                  期间: <span className="text-white">{result.startDate} ~ {result.endDate}</span>
                </span>
                <span className="text-gray-400">
                  交易次数: <span className="text-white">{result.numTrades}</span> (买入{result.numBuys}/卖出{result.numSells})
                </span>
              </div>
            </div>

            {/* Equity Curve Chart */}
            {result.dailyReturns && result.dailyReturns.length > 0 && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">权益曲线</h2>
                <EquityCurveChart
                  dailyReturns={result.dailyReturns}
                  initialCapital={result.initialCapital}
                  height={300}
                />
              </div>
            )}

            {/* Drawdown Chart */}
            {result.dailyReturns && result.dailyReturns.length > 0 && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">回撤分析</h2>
                <DrawdownChart
                  dailyReturns={result.dailyReturns}
                  height={200}
                />
              </div>
            )}

            {/* Trades */}
            {result.trades && result.trades.length > 0 && (
              <div className="bg-background-600 rounded-xl border border-background-400 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">交易记录</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-background-400">
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">日期</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">信号</th>
                        <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">价格</th>
                        <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">股数</th>
                        <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">金额</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">原因</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.map((trade, index) => (
                        <tr key={index} className="border-b border-background-500">
                          <td className="py-3 px-4 text-white text-sm">{trade.date}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-medium ${
                              trade.signal === 'buy' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.signal === 'buy' ? '买入' : '卖出'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white text-sm text-right">¥{trade.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-white text-sm text-right">{trade.shares}</td>
                          <td className="py-3 px-4 text-white text-sm text-right">¥{trade.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{trade.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}