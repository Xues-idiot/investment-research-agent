'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AllocationChart } from '@/components/charts';

interface Holding {
  code: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice?: number;
}

interface PortfolioSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialHoldings?: Holding[];
}

export default function PortfolioSimulator({
  isOpen,
  onClose,
  initialHoldings = [],
}: PortfolioSimulatorProps) {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [cash, setCash] = useState(1000000); // 初始现金 100万
  const [showAdd, setShowAdd] = useState(false);
  const [newHolding, setNewHolding] = useState({ code: '', name: '', shares: '', avgPrice: '' });
  const [simulationResult, setSimulationResult] = useState<{
    totalValue: number;
    totalCost: number;
    totalReturn: number;
    totalReturnPct: number;
  } | null>(null);

  // Calculate portfolio metrics
  const metrics = useMemo(() => {
    const holdingsWithValue = holdings.map(h => ({
      ...h,
      currentPrice: h.currentPrice || h.avgPrice,
      marketValue: (h.currentPrice || h.avgPrice) * h.shares,
      cost: h.avgPrice * h.shares,
      return: ((h.currentPrice || h.avgPrice) - h.avgPrice) * h.shares,
      returnPct: (((h.currentPrice || h.avgPrice) - h.avgPrice) / h.avgPrice) * 100,
    }));

    const totalMarketValue = holdingsWithValue.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCost = holdingsWithValue.reduce((sum, h) => sum + h.cost, 0);
    const totalReturn = totalMarketValue - totalCost;
    const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    const allocation = holdingsWithValue.map(h => ({
      name: h.name || h.code,
      value: h.marketValue,
      percentage: totalMarketValue > 0 ? (h.marketValue / totalMarketValue) * 100 : 0,
    }));

    return {
      holdings: holdingsWithValue,
      totalValue: totalMarketValue + cash,
      totalMarketValue,
      totalCost,
      cash,
      totalReturn,
      totalReturnPct,
      allocation,
    };
  }, [holdings, cash]);

  const handleAddHolding = () => {
    if (!newHolding.code || !newHolding.shares || !newHolding.avgPrice) return;

    const holding: Holding = {
      code: newHolding.code.toUpperCase(),
      name: newHolding.name,
      shares: parseFloat(newHolding.shares),
      avgPrice: parseFloat(newHolding.avgPrice),
    };

    setHoldings(prev => {
      const existing = prev.findIndex(h => h.code === holding.code);
      if (existing >= 0) {
        // Update existing - recalculate average price
        const old = prev[existing];
        const totalShares = old.shares + holding.shares;
        const newAvgPrice = (old.avgPrice * old.shares + holding.avgPrice * holding.shares) / totalShares;
        const updated = [...prev];
        updated[existing] = { ...old, shares: totalShares, avgPrice: newAvgPrice };
        return updated;
      }
      return [...prev, holding];
    });

    setNewHolding({ code: '', name: '', shares: '', avgPrice: '' });
    setShowAdd(false);
  };

  const handleRemoveHolding = (code: string) => {
    setHoldings(prev => prev.filter(h => h.code !== code));
  };

  const handleSimulateRebalance = (targetAllocation: Record<string, number>) => {
    // Simple rebalancing simulation
    const totalValue = metrics.totalValue;
    const trades: { code: string; action: 'buy' | 'sell'; amount: number }[] = [];

    Object.entries(targetAllocation).forEach(([code, targetPct]) => {
      const holding = metrics.holdings.find(h => h.code === code);
      if (!holding) return;

      const targetValue = (targetPct / 100) * totalValue;
      const currentValue = holding.marketValue;
      const diff = targetValue - currentValue;

      if (Math.abs(diff) > 100) { // 阈值100元
        trades.push({
          code,
          action: diff > 0 ? 'buy' : 'sell',
          amount: Math.abs(diff),
        });
      }
    });

    alert(`需要 ${trades.length} 笔交易来再平衡组合`);
  };

  useCallback(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-background-600 rounded-2xl border border-background-400 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-background-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">组合模拟器</h2>
                    <p className="text-xs text-gray-400">模拟投资组合表现和再平衡</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-background-500 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Holdings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">持仓</h3>
                      <button
                        onClick={() => setShowAdd(true)}
                        className="px-3 py-1.5 bg-primary-500/20 text-primary-400 text-sm rounded hover:bg-primary-500/30"
                      >
                        + 添加持仓
                      </button>
                    </div>

                    {/* Add Form */}
                    <AnimatePresence>
                      {showAdd && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 p-4 bg-background-500 rounded-lg"
                        >
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              value={newHolding.code}
                              onChange={e => setNewHolding(p => ({ ...p, code: e.target.value }))}
                              placeholder="股票代码"
                              className="px-3 py-1.5 bg-background-400 border border-background-300 rounded text-white text-sm"
                            />
                            <input
                              type="text"
                              value={newHolding.name}
                              onChange={e => setNewHolding(p => ({ ...p, name: e.target.value }))}
                              placeholder="股票名称"
                              className="px-3 py-1.5 bg-background-400 border border-background-300 rounded text-white text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="number"
                              value={newHolding.shares}
                              onChange={e => setNewHolding(p => ({ ...p, shares: e.target.value }))}
                              placeholder="股数"
                              className="px-3 py-1.5 bg-background-400 border border-background-300 rounded text-white text-sm"
                            />
                            <input
                              type="number"
                              value={newHolding.avgPrice}
                              onChange={e => setNewHolding(p => ({ ...p, avgPrice: e.target.value }))}
                              placeholder="平均成本"
                              className="px-3 py-1.5 bg-background-400 border border-background-300 rounded text-white text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddHolding}
                              className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded text-sm"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setShowAdd(false)}
                              className="flex-1 px-3 py-1.5 bg-background-400 text-gray-300 rounded text-sm"
                            >
                              取消
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Holdings List */}
                    <div className="space-y-2">
                      {metrics.holdings.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">暂无持仓，点击上方添加</p>
                      ) : (
                        metrics.holdings.map(holding => (
                          <div
                            key={holding.code}
                            className="p-3 bg-background-500/50 rounded-lg flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-white font-medium">{holding.name || holding.code}</p>
                              <p className="text-gray-500 text-xs">{holding.code} · {holding.shares}股 · ¥{holding.avgPrice}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${holding.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {holding.return >= 0 ? '+' : ''}{holding.return.toFixed(0)}元
                              </p>
                              <p className={`text-xs ${holding.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {holding.returnPct >= 0 ? '+' : ''}{holding.returnPct.toFixed(2)}%
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveHolding(holding.code)}
                              className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Charts & Stats */}
                  <div>
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-4 bg-background-500/50 rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">总市值</p>
                        <p className="text-2xl font-bold text-white">¥{metrics.totalMarketValue.toFixed(0)}</p>
                      </div>
                      <div className="p-4 bg-background-500/50 rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">可用现金</p>
                        <p className="text-2xl font-bold text-white">¥{metrics.cash.toFixed(0)}</p>
                      </div>
                      <div className="p-4 bg-background-500/50 rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">总收益</p>
                        <p className={`text-2xl font-bold ${metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.totalReturn >= 0 ? '+' : ''}¥{metrics.totalReturn.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-4 bg-background-500/50 rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">收益率</p>
                        <p className={`text-2xl font-bold ${metrics.totalReturnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.totalReturnPct >= 0 ? '+' : ''}{metrics.totalReturnPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Allocation Chart */}
                    {metrics.holdings.length > 0 && (
                      <div className="p-4 bg-background-500/50 rounded-lg">
                        <h4 className="text-white font-medium mb-4">仓位分布</h4>
                        <div className="h-48">
                          <AllocationChart
                            holdings={metrics.holdings.map(h => ({
                              stockCode: h.code,
                              stockName: h.name,
                              weight: h.marketValue,
                            }))}
                            height={192}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
