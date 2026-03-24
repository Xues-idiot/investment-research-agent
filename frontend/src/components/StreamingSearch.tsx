'use client';

// StreamingSearch - 支持流式输出的股票搜索组件

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingSearchProps {
  onProgress: (agent: string, message: string) => void;
  onComplete: (data: any) => void;
  onError: (error: string) => void;
}

export default function StreamingSearch({ onProgress, onComplete, onError }: StreamingSearchProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    onProgress('init', '连接服务器...');

    // 创建 EventSource 连接
    const eventSource = new EventSource(
      `http://localhost:8001/api/research/stream?stock_code=${encodeURIComponent(input.trim())}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'agent') {
          onProgress(data.agent, data.message);
        } else if (data.event === 'complete') {
          onComplete(data.data);
          setLoading(false);
          eventSource.close();
        } else if (data.event === 'error') {
          onError(data.data);
          setLoading(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('Failed to parse event data:', err);
      }
    };

    eventSource.onerror = () => {
      onError('连接失败，请检查服务器是否运行');
      setLoading(false);
      eventSource.close();
    };
  }, [input, loading, onProgress, onComplete, onError]);

  const handleCancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setLoading(false);
  }, []);

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
        whileFocus={{ scale: 1.01 }}
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
            <span>研究中...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>开始研究</span>
          </>
        )}
      </motion.button>

      {loading && (
        <motion.button
          type="button"
          onClick={handleCancel}
          className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400
                     rounded-lg transition-colors"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          取消
        </motion.button>
      )}
    </motion.form>
  );
}
