'use client';

// API Client for Rho Backend
// 类型安全的 API 调用

import {
  ApiResponse,
  ResearchReport,
  HealthStatus,
  StockValidation,
  ResearchRequest
} from '@/types';

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

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || `HTTP error ${response.status}`,
      response.status,
      data.error_type
    );
  }

  return data;
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
              onComplete(data.data);
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

export { ApiError };
