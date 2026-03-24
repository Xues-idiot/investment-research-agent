'use client';

// StockSearch - 股票搜索组件 (with motion animations)

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StockSearchProps {
  onSearch: (stockCode: string) => void;
  loading: boolean;
}

export default function StockSearch({ onSearch, loading }: StockSearchProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSearch(input.trim());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex-1 relative"
        whileFocusWithin={{ scale: 1.01 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入股票代码，如：600519"
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
    </motion.form>
  );
}
