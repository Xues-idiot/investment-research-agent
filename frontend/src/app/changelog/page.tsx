'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const updates = [
  {
    version: 'v0.3.0',
    date: '2026-03-28',
    type: 'feature',
    changes: [
      '新增收藏夹页面 - 管理关注的股票',
      '新增帮助中心 - 快捷键、FAQ',
      '新增更新日志页面',
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-03-27',
    type: 'feature',
    changes: [
      '持续迭代优化100轮',
      '代码清理19个死文件',
      '收藏夹功能完善',
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-03-26',
    type: 'feature',
    changes: [
      '投资研究核心流程',
      '多维度股票分析',
      'K线图表可视化',
      '流式输出进度展示',
    ],
  },
];

const typeConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
  feature: { label: '新功能', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  fix: { label: '修复', bg: 'bg-brand-500/15', border: 'border-brand-500/30', text: 'text-brand-400' },
  improve: { label: '优化', bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400' },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-terminal-900">
      <div className="fixed inset-0 bg-mesh pointer-events-none"></div>

      <div className="relative max-w-3xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-4">
            <span>📝</span>
            <span>更新日志</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-content-primary mb-3">更新日志</h1>
          <p className="text-content-muted text-lg">追踪Rho投研Agent的版本变化</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border-subtle" />

          {/* Updates */}
          <div className="space-y-8">
            {updates.map((update, index) => {
              const config = typeConfig[update.type] || typeConfig.feature;
              return (
                <motion.div
                  key={update.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[1.625rem] w-3.5 h-3.5 rounded-full bg-brand-500 border-4 border-terminal-900 shadow-glow-sm" />

                  {/* Card */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-display font-bold text-content-primary">
                          {update.version}
                        </h2>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.border} ${config.text} border`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-content-muted text-sm font-mono tabular-nums">{update.date}</span>
                    </div>
                    <ul className="space-y-2.5">
                      {update.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-3 text-content-secondary text-sm">
                          <span className={`mt-0.5 ${config.text}`}>•</span>
                          <span className="leading-relaxed">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>查看帮助文档</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
