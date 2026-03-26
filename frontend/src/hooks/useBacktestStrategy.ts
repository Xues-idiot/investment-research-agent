'use client';

import { useState, useCallback, useEffect } from 'react';

const STRATEGY_PRESETS_KEY = 'rho_backtest_presets';

export interface StrategyPreset {
  id: string;
  name: string;
  strategyType: string;
  params: Record<string, string | number>;
  createdAt: string;
}

interface UseBacktestStrategyReturn {
  presets: StrategyPreset[];
  savePreset: (name: string, strategyType: string, params: Record<string, string | number>) => void;
  loadPreset: (preset: StrategyPreset) => void;
  deletePreset: (id: string) => void;
  updatePreset: (id: string, updates: Partial<Omit<StrategyPreset, 'id' | 'createdAt'>>) => void;
}

export function useBacktestStrategy(): UseBacktestStrategyReturn {
  const [presets, setPresets] = useState<StrategyPreset[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STRATEGY_PRESETS_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load strategy presets:', e);
    }
  }, []);

  const savePreset = useCallback((
    name: string,
    strategyType: string,
    params: Record<string, string | number>
  ) => {
    const newPreset: StrategyPreset = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      strategyType,
      params,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPreset, ...presets.filter(p => p.name !== name)].slice(0, 20);
    setPresets(updated);
    localStorage.setItem(STRATEGY_PRESETS_KEY, JSON.stringify(updated));
  }, [presets]);

  const loadPreset = useCallback((preset: StrategyPreset) => {
    // Returns the preset data - caller should apply it
    return preset;
  }, []);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(STRATEGY_PRESETS_KEY, JSON.stringify(updated));
  }, [presets]);

  const updatePreset = useCallback((
    id: string,
    updates: Partial<Omit<StrategyPreset, 'id' | 'createdAt'>>
  ) => {
    const updated = presets.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    setPresets(updated);
    localStorage.setItem(STRATEGY_PRESETS_KEY, JSON.stringify(updated));
  }, [presets]);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
  };
}

// Get default strategy params
export function getDefaultStrategyParams(strategyType: string): Record<string, string | number> {
  switch (strategyType) {
    case 'ma':
      return {
        shortWindow: '5',
        longWindow: '20',
        initialCapital: '1000000',
      };
    case 'rsi':
      return {
        rsiPeriod: '14',
        oversold: '30',
        overbought: '70',
        initialCapital: '1000000',
      };
    case 'momentum':
      return {
        lookback: '20',
        momentumThreshold: '0.05',
        initialCapital: '1000000',
      };
    default:
      return { initialCapital: '1000000' };
  }
}
