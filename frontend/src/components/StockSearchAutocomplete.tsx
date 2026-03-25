'use client';

// StockSearchAutocomplete - 带自动补全的股票搜索组件

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StockSearchAutocompleteProps {
  onSearch: (stockCode: string) => void;
  loading: boolean;
}

const RECENT_KEY = 'rho_recent_searches';
const MAX_RECENT = 5;

// 常用股票列表（用于演示自动补全）
const POPULAR_STOCKS = [
  { code: '600519', name: '贵州茅台' },
  { code: '000858', name: '五粮液' },
  { code: '000568', name: '泸州老窖' },
  { code: '600036', name: '招商银行' },
  { code: '601318', name: '中国平安' },
  { code: '000001', name: '平安银行' },
  { code: '600276', name: '恒瑞医药' },
  { code: '300750', name: '宁德时代' },
  { code: '688981', name: '中芯国际' },
  { code: '002475', name: '立讯精密' },
];

export default function StockSearchAutocomplete({ onSearch, loading }: StockSearchAutocompleteProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<typeof POPULAR_STOCKS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<typeof POPULAR_STOCKS>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载最近搜索
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // 选择建议项
  const handleSelect = useCallback((code: string, name?: string) => {
    setInput(code);
    setShowSuggestions(false);
    setSuggestions([]);
    // 保存到最近搜索
    if (name) {
      const item = { code, name };
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.code !== code);
        const updated = [item, ...filtered].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        return updated;
      });
    }
    onSearch(code);
  }, [onSearch]);

  // 提交搜索
  const handleSubmit = useCallback(() => {
    if (input.trim() && !loading) {
      // 保存到最近搜索（尝试从热门股票匹配名称）
      const matched = POPULAR_STOCKS.find(s => s.code === input.trim());
      if (matched) {
        const item = { code: matched.code, name: matched.name };
        setRecentSearches(prev => {
          const filtered = prev.filter(s => s.code !== matched.code);
          const updated = [item, ...filtered].slice(0, MAX_RECENT);
          localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
          return updated;
        });
      }
      onSearch(input.trim());
      setShowSuggestions(false);
    }
  }, [input, loading, onSearch]);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInput(value);

    if (value.length > 0) {
      // 过滤匹配的股票
      const filtered = POPULAR_STOCKS.filter(
        s => s.code.includes(value) || s.name.includes(value)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions(recentSearches);
      setShowSuggestions(recentSearches.length > 0);
    }
  }, [recentSearches]);

  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentSuggestions = input.length > 0 ? suggestions : recentSearches;
    const maxIndex = currentSuggestions.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
        handleSelect(currentSuggestions[selectedIndex].code, currentSuggestions[selectedIndex].name);
      } else if (input.trim()) {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [suggestions, selectedIndex, input, recentSearches, handleSelect, handleSubmit]);

  // 点击外部关闭建议列表
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="flex gap-4"
      >
        <motion.div
          className="flex-1 relative"
          whileFocus={{ scale: 1.01 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onFocus={() => {
              if (input.length > 0) {
                setShowSuggestions(true);
              } else if (recentSearches.length > 0) {
                setSuggestions(recentSearches);
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入股票代码或名称，如：600519"
            disabled={loading}
            className="w-full px-4 py-3 text-lg bg-background-600 border border-background-400
                       rounded-lg text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold
                     rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <>
              <motion.svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </motion.svg>
              <span>分析中...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>开始研究</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-background-600 border border-background-400 rounded-lg shadow-xl overflow-hidden"
          >
            {input.length === 0 && (
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-background-400">
                最近搜索
              </div>
            )}
            {suggestions.map((stock, index) => (
              <button
                key={stock.code}
                onClick={() => handleSelect(stock.code, stock.name)}
                className={`w-full px-4 py-3 text-left hover:bg-background-500 transition-colors flex items-center justify-between ${
                  index === selectedIndex ? 'bg-background-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{stock.code}</span>
                  <span className="text-gray-400">{stock.name}</span>
                </div>
                {index === selectedIndex && (
                  <span className="text-gray-500 text-sm">按Enter选择</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick shortcuts hint */}
      {!loading && (
        <div className="mt-2 text-xs text-gray-500">
          <span>热门股票: </span>
          {POPULAR_STOCKS.slice(0, 4).map((stock, i) => (
            <button
              key={stock.code}
              onClick={() => handleSelect(stock.code, stock.name)}
              className="hover:text-primary-400 mx-1 transition-colors"
            >
              {stock.code}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}