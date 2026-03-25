'use client';

// BatchResearch - 批量研究组件

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';

interface BatchResearchProps {
  onResearch: (stockCodes: string[]) => void;
  loading: boolean;
}

export default function BatchResearch({ onResearch, loading }: BatchResearchProps) {
  const [input, setInput] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const { favorites } = useFavorites();

  const handleAdd = useCallback(() => {
    const codes = input.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const uniqueCodes = [...new Set([...selectedCodes, ...codes])].slice(0, 10);
    setSelectedCodes(uniqueCodes);
    setInput('');
  }, [input, selectedCodes]);

  const handleRemove = useCallback((code: string) => {
    setSelectedCodes(prev => prev.filter(c => c !== code));
  }, []);

  const handleAddFavorite = useCallback((code: string, name: string) => {
    if (!selectedCodes.includes(code)) {
      setSelectedCodes(prev => [...prev, code].slice(0, 10));
    }
  }, [selectedCodes]);

  const handleSubmit = useCallback(() => {
    if (selectedCodes.length > 0 && !loading) {
      onResearch(selectedCodes);
    }
  }, [selectedCodes, loading, onResearch]);

  return (
    <motion.div
      className="bg-background-600 rounded-xl border border-background-400 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📚 批量研究 (最多10个)
      </h3>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="输入股票代码，多个用逗号分隔，如：600519,000858"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 disabled:opacity-50"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          添加
        </button>
      </div>

      {/* Selected Codes */}
      {selectedCodes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">已选择 ({selectedCodes.length}/10)</span>
            <button
              onClick={() => setSelectedCodes([])}
              className="text-xs text-red-400 hover:text-red-300"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCodes.map((code) => (
              <span
                key={code}
                className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-1"
              >
                {code}
                <button
                  onClick={() => handleRemove(code)}
                  className="hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add from Favorites */}
      {favorites.length > 0 && (
        <div className="mb-4">
          <span className="text-sm text-gray-400 block mb-2">快速添加收藏:</span>
          <div className="flex flex-wrap gap-2">
            {favorites.slice(0, 6).map((fav) => (
              <button
                key={fav.code}
                onClick={() => handleAddFavorite(fav.code, fav.name)}
                disabled={selectedCodes.includes(fav.code) || selectedCodes.length >= 10}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⭐ {fav.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || selectedCodes.length === 0}
        className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <motion.svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </motion.svg>
            <span>批量分析中...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>开始批量研究 ({selectedCodes.length}个)</span>
          </>
        )}
      </button>
    </motion.div>
  );
}