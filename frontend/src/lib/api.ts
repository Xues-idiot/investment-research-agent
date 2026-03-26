'use client';

// API Client for Rho Backend
// 类型安全的 API 调用

import {
  ApiResponse,
  ResearchReport,
  HealthStatus,
  StockValidation,
  ResearchRequest,
  ChartData,
  BacktestResult,
  PortfolioSuggestion,
  RiskAnalysis,
  Alert,
  AlertEvent,
  ComparisonResult,
  RankResult,
  CompareChartData,
} from '@/types';
import { convertKeysToCamelCase } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorType?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    // 响应不是JSON格式，或者JSON解析失败
    const text = await response.text().catch(() => 'Unknown error');
    throw new ApiError(
      `Invalid JSON response: ${text.slice(0, 200)}`,
      response.status,
      'ParseError'
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || `HTTP error ${response.status}`,
      response.status,
      data.error_type
    );
  }

  // 转换响应数据中的 snake_case 键为 camelCase
  return convertKeysToCamelCase<T>(data);
}

export async function researchStock(
  request: ResearchRequest
): Promise<ApiResponse<ResearchReport>> {
  return fetchApi<ApiResponse<ResearchReport>>('/api/research', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function researchStockStream(
  stockCode: string,
  onAgent: (agent: string, message: string) => void,
  onComplete: (data: ResearchReport) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/research/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stock_code: stockCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.event === 'agent') {
              onAgent(data.agent, data.message);
            } else if (data.event === 'complete') {
              onComplete(convertKeysToCamelCase(data.data));
              return;
            } else if (data.event === 'error') {
              onError(data.data);
              return;
            }
          } catch (err) {
            console.error('Failed to parse SSE data:', err);
          }
        }
      }
    }

    // 流结束但没有收到完成事件
    onError('连接意外关闭');
  } catch (err: any) {
    onError(err.message || '连接失败，请检查服务器是否运行');
  }
}

export async function getReport(
  stockCode: string,
  date?: string
): Promise<ApiResponse<{ report: string }>> {
  const params = new URLSearchParams({ stock_code: stockCode });
  if (date) {
    params.append('date', date);
  }

  return fetchApi<ApiResponse<{ report: string }>>(
    `/api/research/report?${params}`
  );
}

export async function healthCheck(): Promise<HealthStatus> {
  return fetchApi<HealthStatus>('/api/health');
}

export async function validateStock(
  stockCode: string
): Promise<StockValidation> {
  return fetchApi<StockValidation>(`/api/stocks/validate/${stockCode}`);
}

export async function getConfig(): Promise<Record<string, unknown>> {
  return fetchApi<Record<string, unknown>>('/api/config');
}

// ============ Stock Chart API ============

export async function getStockChartData(stockCode: string): Promise<ApiResponse<ChartData>> {
  return fetchApi<ApiResponse<ChartData>>(`/api/stock/chart/${stockCode}`);
}

// ============ Compare API ============

export async function compareStocks(stockCodes: string[]): Promise<ApiResponse<ComparisonResult>> {
  return fetchApi<ApiResponse<ComparisonResult>>('/api/compare', {
    method: 'POST',
    body: JSON.stringify({ stock_codes: stockCodes }),
  });
}

export async function rankStocks(stockCodes: string[], criteria: string = 'comprehensive'): Promise<ApiResponse<RankResult>> {
  return fetchApi<ApiResponse<RankResult>>('/api/compare/rank', {
    method: 'POST',
    body: JSON.stringify({ stock_codes: stockCodes, criteria }),
  });
}

export async function getCompareCharts(stockCodes: string[]): Promise<ApiResponse<{ charts: CompareChartData[]; count: number }>> {
  return fetchApi<ApiResponse<{ charts: CompareChartData[]; count: number }>>('/api/compare/charts', {
    method: 'POST',
    body: JSON.stringify({ stock_codes: stockCodes }),
  });
}

// ============ Backtest API ============

export async function runBacktestMA(params: {
  stock_code: string;
  start_date: string;
  end_date: string;
  short_window?: number;
  long_window?: number;
  initial_capital?: number;
}): Promise<ApiResponse<BacktestResult>> {
  return fetchApi<ApiResponse<BacktestResult>>('/api/backtest/ma', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function runBacktestRSI(params: {
  stock_code: string;
  start_date: string;
  end_date: string;
  rsi_period?: number;
  oversold?: number;
  overbought?: number;
  initial_capital?: number;
}): Promise<ApiResponse<BacktestResult>> {
  return fetchApi<ApiResponse<BacktestResult>>('/api/backtest/rsi', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function runBacktestMomentum(params: {
  stock_code: string;
  start_date: string;
  end_date: string;
  lookback?: number;
  threshold?: number;
  initial_capital?: number;
}): Promise<ApiResponse<BacktestResult>> {
  return fetchApi<ApiResponse<BacktestResult>>('/api/backtest/momentum', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ============ Portfolio API ============

export async function suggestPortfolio(params: {
  stock_codes: string[];
  total_capital: number;
  risk_level: string;
  strategy: string;
}): Promise<ApiResponse<PortfolioSuggestion>> {
  return fetchApi<ApiResponse<PortfolioSuggestion>>('/api/portfolio/suggest', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function analyzePortfolioRisk(portfolio: PortfolioSuggestion): Promise<ApiResponse<RiskAnalysis>> {
  return fetchApi<ApiResponse<RiskAnalysis>>('/api/portfolio/analyze', {
    method: 'POST',
    body: JSON.stringify({ portfolio }),
  });
}

export async function rebalancePortfolio(params: {
  current_portfolio: PortfolioSuggestion;
  target_risk: string;
}): Promise<ApiResponse<{ suggestions: Array<{ stockCode: string; action: string }> }>> {
  return fetchApi<ApiResponse<{ suggestions: Array<{ stockCode: string; action: string }> }>>('/api/portfolio/rebalance', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ============ Monitor API ============

export async function getMonitorStatus(): Promise<ApiResponse<{ running: boolean; watched_stocks: string[]; total_alerts: number; enabled_alerts: number; triggered_alerts: number }>> {
  return fetchApi<ApiResponse<{ running: boolean; watched_stocks: string[]; total_alerts: number; enabled_alerts: number; triggered_alerts: number }>>('/api/monitor/status');
}

export async function getAlerts(stockCode?: string): Promise<ApiResponse<{ alerts: Alert[] }>> {
  const params = stockCode ? `?stock_code=${stockCode}` : '';
  return fetchApi<ApiResponse<{ alerts: Alert[] }>>(`/api/monitor/alerts${params}`);
}

export async function addAlert(params: {
  stock_code: string;
  alert_type: string;
  threshold: number;
  enabled?: boolean;
}): Promise<ApiResponse<{ message: string; alert: Alert }>> {
  return fetchApi<ApiResponse<{ message: string; alert: Alert }>>('/api/monitor/alerts', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function removeAlert(stockCode: string, alertType?: string): Promise<ApiResponse<{ message: string }>> {
  const params = alertType ? `?alert_type=${alertType}` : '';
  return fetchApi<ApiResponse<{ message: string }>>(`/api/monitor/alerts/${stockCode}${params}`, {
    method: 'DELETE',
  });
}

export async function checkAlerts(): Promise<ApiResponse<{ triggered_count: number; alerts: AlertEvent[] }>> {
  return fetchApi<ApiResponse<{ triggered_count: number; alerts: AlertEvent[] }>>('/api/monitor/check', {
    method: 'POST',
  });
}

export async function startMonitor(interval: number = 60): Promise<ApiResponse<{ message: string; status: object }>> {
  return fetchApi<ApiResponse<{ message: string; status: object }>>(`/api/monitor/start?interval=${interval}`, {
    method: 'POST',
  });
}

export async function stopMonitor(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<ApiResponse<{ message: string }>>('/api/monitor/stop', {
    method: 'POST',
  });
}

// ============ Export API ============

export async function exportPdf(params: {
  stock_code: string;
  markdown_content: string;
  title?: string;
  author?: string;
}): Promise<ApiResponse<{ output_path: string; format: string; file_size: number; download_url?: string }>> {
  return fetchApi<ApiResponse<{ output_path: string; format: string; file_size: number; download_url?: string }>>('/api/export/pdf', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function exportHtml(params: {
  stock_code: string;
  markdown_content: string;
  title?: string;
}): Promise<ApiResponse<{ output_path: string; format: string; file_size: number; download_url?: string }>> {
  return fetchApi<ApiResponse<{ output_path: string; format: string; file_size: number; download_url?: string }>>('/api/export/html', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// 导出 API_BASE_URL 供其他组件使用
export { API_BASE_URL };
export { ApiError };
