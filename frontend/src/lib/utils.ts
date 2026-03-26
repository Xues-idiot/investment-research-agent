'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 将 snake_case 字符串转换为 camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 深度转换对象中的 snake_case 键为 camelCase
 */
export function convertKeysToCamelCase<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item)) as T;
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = convertKeysToCamelCase(obj[key]);
    }
    return result as T;
  }

  return obj;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}万亿`;
  } else if (value >= 1e8) {
    return `${(value / 1e8).toFixed(2)}亿`;
  } else if (value >= 1e4) {
    return `${(value / 1e4).toFixed(2)}万`;
  }
  return value.toString();
}

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'high':
    case '高':
      return 'text-red-400 bg-red-400/10';
    case 'medium':
    case '中':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'low':
    case '低':
      return 'text-green-400 bg-green-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}

export function getRiskIcon(level: string): string {
  switch (level.toLowerCase()) {
    case 'high':
    case '高':
      return '🔴';
    case 'medium':
    case '中':
      return '🟡';
    case 'low':
    case '低':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * 净化HTML内容，防止XSS攻击
 * 移除script标签和危险的事件处理器
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    // 移除script标签
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 移除on事件处理器 (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')
    // 移除javascript:协议
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    // 移除data:协议 (可能用于mime类型攻击)
    .replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
    // 移除eval和相关危险函数
    .replace(/\beval\s*\([^)]*\)/gi, '')
    // 移除innerHTML赋值
    .replace(/\binnerHTML\s*=/gi, 'data-unsafe-html=')
    // 移除outerHTML赋值
    .replace(/\bouterHTML\s*=/gi, 'data-unsafe-html=');
}

/**
 * 将数据导出为CSV格式
 */
export function exportToCSV(data: Record<string, any>[], filename: string = 'export'): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // 如果值包含逗号、引号或换行，需要用双引号包裹
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8');
  return csvContent;
}

/**
 * 将数据导出为JSON格式
 */
export function exportToJSON(data: any, filename: string = 'export'): string {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
  return jsonContent;
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 转换研究结果为表格数据
 */
export function researchToTableData(results: any[]): Record<string, any>[] {
  return results.map(r => ({
    股票代码: r.stockCode,
    公司名称: r.companyName,
    置信度: `${(r.confidence * 100).toFixed(1)}%`,
    风险等级: r.riskAssessment?.level || 'N/A',
    风险评分: r.riskAssessment?.score || 'N/A',
    研究时间: new Date().toLocaleString('zh-CN'),
  }));
}
