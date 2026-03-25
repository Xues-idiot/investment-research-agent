'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'rho_monitor_alerts';

interface Alert {
  stock_code: string;
  alert_type: string;
  threshold: number;
  enabled: boolean;
  triggered_at: string | null;
  message: string;
  id?: string; // localStorage用
}

interface MonitorStatus {
  running: boolean;
  watched_stocks: string[];
  total_alerts: number;
  enabled_alerts: number;
  triggered_alerts: number;
}

// localStorage工具函数
const loadAlertsFromStorage = (): Alert[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAlertsToStorage = (alerts: Alert[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to localStorage:', e);
  }
};

export default function MonitorPage() {
  const [stockCode, setStockCode] = useState('');
  const [alertType, setAlertType] = useState('price_above');
  const [threshold, setThreshold] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/monitor/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/monitor/alerts');
      const data = await response.json();
      if (data.success) {
        const backendAlerts = data.data.alerts.map((a: Alert) => ({
          ...a,
          id: `${a.stock_code}_${a.alert_type}_${Date.now()}`
        }));
        setAlerts(backendAlerts);
        saveAlertsToStorage(backendAlerts);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      // 如果后端失败，从localStorage加载
      const stored = loadAlertsFromStorage();
      if (stored.length > 0) {
        setAlerts(stored);
      }
    }
  };

  useEffect(() => {
    // 优先从localStorage加载（快速显示）
    const stored = loadAlertsFromStorage();
    if (stored.length > 0) {
      setAlerts(stored);
    }
    // 然后从后端同步
    fetchStatus();
    fetchAlerts();
  }, []);

  // 自动刷新逻辑
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }
    autoRefreshRef.current = setInterval(() => {
      fetchStatus();
      fetchAlerts();
    }, refreshInterval * 1000);
  }, [refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [autoRefresh, refreshInterval, startAutoRefresh, stopAutoRefresh]);

  const handleAddAlert = async () => {
    if (!stockCode || !threshold) {
      setError('请填写股票代码和阈值');
      return;
    }

    setLoading(true);
    setError(null);

    // 乐观更新：先添加到本地存储
    const newAlert: Alert = {
      stock_code: stockCode,
      alert_type: alertType,
      threshold: parseFloat(threshold),
      enabled: true,
      triggered_at: null,
      message: '',
      id: `${stockCode}_${alertType}_${Date.now()}`,
    };
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);

    try {
      const response = await fetch('http://localhost:8001/api/monitor/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_code: stockCode,
          alert_type: alertType,
          threshold: parseFloat(threshold),
          enabled: true,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('告警添加成功');
        fetchAlerts(); // 重新同步
        fetchStatus();
        setStockCode('');
        setThreshold('');
      } else {
        setError(data.error || '添加告警失败');
        // 后端失败，回滚本地更新
        setAlerts(alerts);
        saveAlertsToStorage(alerts);
      }
    } catch (err) {
      // 网络错误，但仍保留本地存储的告警
      setSuccess('告警已保存（后端离线）');
      fetchStatus();
      setStockCode('');
      setThreshold('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (stockCode: string, alertType?: string) => {
    // 乐观更新：先从本地存储删除
    const updatedAlerts = alerts.filter(
      (a) => !(a.stock_code === stockCode && (!alertType || a.alert_type === alertType))
    );
    setAlerts(updatedAlerts);
    saveAlertsToStorage(updatedAlerts);

    try {
      let url = `http://localhost:8001/api/monitor/alerts/${stockCode}`;
      if (alertType) {
        url += `?alert_type=${alertType}`;
      }
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSuccess('告警已删除');
        fetchAlerts(); // 重新同步
        fetchStatus();
      } else {
        setError(data.error || '删除告警失败');
        // 回滚
        fetchAlerts();
      }
    } catch (err) {
      // 网络错误，但本地已删除
      setSuccess('告警已删除（后端离线）');
      fetchStatus();
    }
  };

  const handleCheckAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8001/api/monitor/check', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        const count = data.data.triggered_count;
        if (count > 0) {
          setSuccess(`检测到 ${count} 个告警触发！`);
        } else {
          setSuccess('暂无告警触发');
        }
        fetchAlerts();
      } else {
        setError(data.error || '检查告警失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitor = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/monitor/start?interval=60', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('监控已启动');
        fetchStatus();
      } else {
        setError(data.error || '启动监控失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const handleStopMonitor = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/monitor/stop', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('监控已停止');
        fetchStatus();
      } else {
        setError(data.error || '停止监控失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const alertTypeLabels: Record<string, string> = {
    price_above: '价格高于',
    price_below: '价格低于',
    price_change: '涨跌幅超过',
    volume_spike: '成交量放大',
    rsi_overbought: 'RSI超买',
    rsi_oversold: 'RSI超卖',
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
          <h1 className="text-3xl font-bold text-white mb-2">🔔 监控告警</h1>
          <p className="text-gray-400">设置价格、成交量、RSI告警，实时监控股票</p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">监控状态</h2>
              {status && (
                <div className="flex gap-6 text-sm flex-wrap">
                  <span className="text-gray-400">
                    状态: <span className={status.running ? 'text-green-400' : 'text-gray-500'}>{status.running ? '运行中' : '已停止'}</span>
                  </span>
                  <span className="text-gray-400">监控股票: {status.watched_stocks.length} 只</span>
                  <span className="text-gray-400">告警数: {status.total_alerts}</span>
                  <span className="text-gray-400">已触发: {status.triggered_alerts}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Auto Refresh Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    autoRefresh
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-background-500 text-gray-400 border border-background-400'
                  }`}
                >
                  🔄 自动刷新 {autoRefresh ? 'ON' : 'OFF'}
                </button>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2 py-1 bg-background-500 border border-background-400 rounded text-white text-sm"
                  >
                    <option value={10}>10秒</option>
                    <option value={30}>30秒</option>
                    <option value={60}>1分钟</option>
                    <option value={300}>5分钟</option>
                  </select>
                )}
              </div>

              {!status?.running ? (
                <button
                  onClick={handleStartMonitor}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  启动监控
                </button>
              ) : (
                <button
                  onClick={handleStopMonitor}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  停止监控
                </button>
              )}
              <button
                onClick={handleCheckAlerts}
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '检查中...' : '手动检查'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add Alert Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">添加告警</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-gray-300 text-sm font-medium mb-2">告警类型</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="price_above">价格高于</option>
                <option value="price_below">价格低于</option>
                <option value="price_change">涨跌幅超过</option>
                <option value="volume_spike">成交量放大(量比)</option>
                <option value="rsi_overbought">RSI超买</option>
                <option value="rsi_oversold">RSI超卖</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {alertType === 'volume_spike' ? '量比倍数' : '阈值'}
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={alertType === 'price_change' ? '5.0' : alertType === 'volume_spike' ? '2.0' : '1800.00'}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddAlert}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '添加中...' : '添加告警'}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          {success && <p className="mt-4 text-green-400 text-sm">{success}</p>}
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">告警列表</h2>
            <button
              onClick={fetchAlerts}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              刷新
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无告警配置</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.triggered_at
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-background-500 border-background-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{alert.stock_code}</span>
                        <span className="text-gray-400 text-sm">
                          {alertTypeLabels[alert.alert_type] || alert.alert_type}
                        </span>
                        <span className="text-primary-400 font-medium">
                          {alert.alert_type === 'volume_spike'
                            ? `${alert.threshold}倍`
                            : alert.alert_type === 'price_change'
                            ? `${alert.threshold}%`
                            : `¥${alert.threshold}`}
                        </span>
                        {alert.triggered_at && (
                          <span className="text-red-400 text-sm">已触发</span>
                        )}
                      </div>
                      {alert.message && (
                        <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                      )}
                      {alert.triggered_at && (
                        <p className="text-gray-500 text-xs mt-1">触发时间: {alert.triggered_at}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.stock_code, alert.alert_type)}
                      className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}