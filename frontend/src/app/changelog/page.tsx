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

const typeLabels: Record<string, { label: string; color: string }> = {
  feature: { label: '新功能', color: 'bg-green-600' },
  fix: { label: '修复', color: 'bg-blue-600' },
  improve: { label: '优化', color: 'bg-purple-600' },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background-500">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">📝 更新日志</h1>
          <p className="text-gray-400">追踪Rho投研Agent的版本变化</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-background-400" />

          {/* Updates */}
          <div className="space-y-8">
            {updates.map((update, index) => (
              <motion.div
                key={update.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 rounded-full bg-primary-500 border-4 border-background-500" />

                {/* Card */}
                <div className="bg-background-600 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">
                        {update.version}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${typeLabels[update.type]?.color || 'bg-gray-600'}`}>
                        {typeLabels[update.type]?.label || update.type}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{update.date}</span>
                  </div>
                  <ul className="space-y-2">
                    {update.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-primary-400 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
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
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← 查看帮助文档
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
