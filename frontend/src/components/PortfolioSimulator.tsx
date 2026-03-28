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
  const [cash, setCash] = useState(1000000);
  const [showAdd, setShowAdd] = useState(false);
  const [newHolding, setNewHolding] = useState({ code: '', name: '', shares: '', avgPrice: '' });

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
            className="fixed inset-0 z-50 bg-terminal-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-terminal-800 rounded-3xl border border-border-subtle shadow-card max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-content-primary">组合模拟器</h2>
                    <p className="text-content-muted text-sm">模拟投资组合表现和再平衡</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-terminal-600 transition-all border border-transparent hover:border-border-subtle"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Holdings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-content-primary font-display font-medium">持仓</h3>
                      <button
                        onClick={() => setShowAdd(true)}
                        className="btn btn-secondary text-sm py-1.5 px-3"
                      >
                        <span>+</span>
                        <span>添加持仓</span>
                      </button>
                    </div>

                    {/* Add Form */}
                    <AnimatePresence>
                      {showAdd && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 p-4 bg-terminal-700 rounded-xl border border-border-subtle"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                              type="text"
                              value={newHolding.code}
                              onChange={e => setNewHolding(p => ({ ...p, code: e.target.value }))}
                              placeholder="股票代码"
                              className="input"
                            />
                            <input
                              type="text"
                              value={newHolding.name}
                              onChange={e => setNewHolding(p => ({ ...p, name: e.target.value }))}
                              placeholder="股票名称"
                              className="input"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input
                              type="number"
                              value={newHolding.shares}
                              onChange={e => setNewHolding(p => ({ ...p, shares: e.target.value }))}
                              placeholder="股数"
                              className="input"
                            />
                            <input
                              type="number"
                              value={newHolding.avgPrice}
                              onChange={e => setNewHolding(p => ({ ...p, avgPrice: e.target.value }))}
                              placeholder="平均成本"
                              className="input"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddHolding}
                              className="btn btn-primary flex-1 py-2"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setShowAdd(false)}
                              className="btn btn-secondary flex-1 py-2"
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
                        <div className="card p-8 text-center">
                          <div className="text-4xl mb-3">📊</div>
                          <p className="text-content-muted text-sm">暂无持仓，点击上方添加</p>
                        </div>
                      ) : (
                        metrics.holdings.map(holding => (
                          <div
                            key={holding.code}
                            className="card p-4 flex items-center justify-between group hover:border-border-default transition-colors"
                          >
                            <div>
                              <p className="text-content-primary font-medium">{holding.name || holding.code}</p>
                              <p className="text-content-muted text-xs font-mono tabular-nums">
                                {holding.code} · {holding.shares}股 · ¥{holding.avgPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-mono font-medium tabular-nums ${holding.return >= 0 ? 'text-gain' : 'text-loss'}`}>
                                {holding.return >= 0 ? '+' : ''}¥{holding.return.toFixed(0)}
                              </p>
                              <p className={`text-xs font-mono tabular-nums ${holding.returnPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                                {holding.returnPct >= 0 ? '+' : ''}{holding.returnPct.toFixed(2)}%
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveHolding(holding.code)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-loss hover:bg-loss/10 opacity-0 group-hover:opacity-100 transition-all ml-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                      <div className="card p-4 text-center">
                        <p className="text-content-muted text-xs mb-1">总市值</p>
                        <p className="text-2xl font-display font-bold text-content-primary tabular-nums">
                          ¥{metrics.totalMarketValue.toFixed(0)}
                        </p>
                      </div>
                      <div className="card p-4 text-center">
                        <p className="text-content-muted text-xs mb-1">可用现金</p>
                        <p className="text-2xl font-display font-bold text-content-primary tabular-nums">
                          ¥{metrics.cash.toFixed(0)}
                        </p>
                      </div>
                      <div className="card p-4 text-center">
                        <p className="text-content-muted text-xs mb-1">总收益</p>
                        <p className={`text-2xl font-display font-bold tabular-nums ${metrics.totalReturn >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {metrics.totalReturn >= 0 ? '+' : ''}¥{metrics.totalReturn.toFixed(0)}
                        </p>
                      </div>
                      <div className="card p-4 text-center">
                        <p className="text-content-muted text-xs mb-1">收益率</p>
                        <p className={`text-2xl font-display font-bold tabular-nums ${metrics.totalReturnPct >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {metrics.totalReturnPct >= 0 ? '+' : ''}{metrics.totalReturnPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Allocation Chart */}
                    {metrics.holdings.length > 0 && (
                      <div className="card p-4">
                        <h4 className="text-content-primary font-display font-medium mb-4">仓位分布</h4>
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
