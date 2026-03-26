'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onRefresh: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

interface UseAutoRefreshReturn {
  isEnabled: boolean;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  refresh: () => Promise<void>;
  setInterval: (ms: number) => void;
  interval: number;
}

export function useAutoRefresh({
  enabled: initialEnabled = false,
  interval: initialInterval = 30000, // 30 seconds default
  onRefresh,
  onError,
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const [intervalMs, setIntervalMs] = useState(initialInterval);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const onRefreshRef = useRef(onRefresh);

  // Keep onRefresh ref up to date
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefreshRef.current();
      setLastRefresh(new Date());
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onError]);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    setNextRefresh(null);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const setIntervalMsCallback = useCallback((ms: number) => {
    setIntervalMs(ms);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (isEnabled) {
      // Set next refresh time
      setNextRefresh(new Date(Date.now() + intervalMs));

      intervalIdRef.current = setInterval(() => {
        refresh();
        setNextRefresh(new Date(Date.now() + intervalMs));
      }, intervalMs);

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }
  }, [isEnabled, intervalMs, refresh]);

  return {
    isEnabled,
    isRefreshing,
    lastRefresh,
    nextRefresh,
    enable,
    disable,
    toggle,
    refresh,
    setInterval: setIntervalMsCallback,
    interval: intervalMs,
  };
}

// Format time remaining
export function formatTimeRemaining(nextRefresh: Date | null): string {
  if (!nextRefresh) return '';

  const diff = nextRefresh.getTime() - Date.now();
  if (diff <= 0) return '即将刷新';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒后刷新`;
  }
  return `${seconds}秒后刷新`;
}
