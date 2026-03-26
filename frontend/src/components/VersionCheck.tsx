'use client';

// VersionCheck - 版本更新提示组件

import { useState, useEffect, useRef } from 'react';
import { VERSION } from '@/types';

const VERSION_KEY = 'rho_version_notified';

export default function VersionCheck() {
  const [showUpdate, setShowUpdate] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const notified = localStorage.getItem(VERSION_KEY);
    if (notified !== VERSION) {
      // 延迟显示，避免影响首屏渲染
      timerRef.current = setTimeout(() => {
        setShowUpdate(true);
        localStorage.setItem(VERSION_KEY, VERSION);
      }, 3000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm bg-background-600 border border-primary-500/30 rounded-lg p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🚀</span>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">版本已更新</h4>
          <p className="text-gray-400 text-xs mt-1">
            Rho 投研 Agent 已更新到 v{VERSION}，包含多项新功能和改进。
          </p>
          <button
            onClick={handleDismiss}
            className="mt-3 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}