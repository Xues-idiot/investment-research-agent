'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
