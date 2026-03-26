'use client';

// SkeletonLoader - 骨架屏加载组件

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-background-500 rounded animate-pulse ${className}`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    />
  );
}

// 生成随机高度的辅助函数（仅在组件挂载时调用一次）
const generateRandomHeights = (count: number, min: number, max: number): number[] => {
  return Array.from({ length: count }, () => min + Math.random() * (max - min));
};

export function CardSkeleton() {
  return (
    <div className="bg-background-600 rounded-xl border border-background-400 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-20 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  // 在组件顶层使用 useMemo（而不是在 JSX 中调用）
  const randomHeights = useMemo(() => generateRandomHeights(30, 20, 80), []);

  return (
    <div className="bg-background-600 rounded-xl border border-background-400 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>
      {/* K-line placeholder */}
      <div className="rounded bg-background-500/50 flex items-end justify-around gap-1 p-4" style={{ height: `${height}px` }}>
        {randomHeights.map((h, i) => (
          <Skeleton
            key={i}
            className="w-3 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-background-600 rounded-xl border border-background-400 p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResearchSkeleton() {
  return (
    <div className="space-y-6">
      {/* Report Card */}
      <div className="bg-background-600 rounded-xl border border-background-400 overflow-hidden">
        <div className="bg-primary-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      {/* Charts */}
      <ChartSkeleton height={400} />
      <ChartSkeleton height={350} />
    </div>
  );
}

// Page Loading Skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background-500 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        {/* Table */}
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

// Content Block Skeleton
export function ContentBlockSkeleton() {
  return (
    <div className="bg-background-600 rounded-xl border border-background-400 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// Inline Loading Spinner
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <motion.div
      className={`${sizeClass} border-2 border-primary-500/30 border-t-primary-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    />
  );
}

// Progress Bar Skeleton
export function ProgressSkeleton({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="h-2 bg-background-500 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
