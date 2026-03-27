'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: '打开搜索' },
  { keys: ['Ctrl', 'Enter'], description: '开始研究' },
  { keys: ['Esc'], description: '关闭弹窗' },
];

const features = [
  {
    icon: '📊',
    title: '投资研究',
    description: '输入股票代码，AI多维度分析生成专业投资研究报告',
    link: '/research',
  },
  {
    icon: '📈',
    title: '股票对比',
    description: '最多4只股票横向对比，估值、技术面、市场表现一目了然',
    link: '/compare',
  },
  {
    icon: '🔔',
    title: '监控告警',
    description: '设置价格、RSI、成交量告警，实时推送通知',
    link: '/monitor',
  },
  {
    icon: '💼',
    title: '组合管理',
    description: '输入持仓，获取仓位建议和风险分析',
    link: '/portfolio',
  },
  {
    icon: '🔬',
    title: '策略回测',
    description: '均线、RSI、动量策略历史回测，验证策略有效性',
    link: '/backtest',
  },
  {
    icon: '📤',
    title: '报告导出',
    description: '导出PDF/HTML格式报告，方便分享和存档',
    link: '/exports',
  },
  {
    icon: '⭐',
    title: '我的收藏',
    description: '收藏关注的股票，快速访问和管理',
    link: '/favorites',
  },
];

const faqs = [
  {
    q: '如何开始研究一只股票？',
    a: '在研究页面输入股票代码（如 000001），点击开始研究。AI会进行基本面、情绪、技术面、新闻四个维度的分析。',
  },
  {
    q: '回测结果准确吗？',
    a: '回测基于历史数据计算，不考虑交易费用和滑点。实际交易结果可能与回测有差异，请谨慎参考。',
  },
  {
    q: '如何设置价格告警？',
    a: '在监控页面点击添加告警，设置股票代码、告警类型（价格/RSI/成交量）和阈值。当触发时会收到通知。',
  },
  {
    q: '收藏的股票在哪里查看？',
    a: '点击导航栏的⭐图标，或首页的"我的收藏"卡片，可以查看和管理所有收藏的股票。',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">❓ 帮助中心</h1>
          <p className="text-gray-400">了解Rho投研Agent的所有功能</p>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">⌨️ 快捷键</h2>
          <div className="bg-background-600 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shortcuts.map((s) => (
                <div key={s.description} className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 bg-background-500 rounded text-xs text-white border border-background-400"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">{s.description}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">🚀 功能介绍</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f) => (
              <Link
                key={f.link}
                href={f.link}
                className="bg-background-600 rounded-lg p-4 hover:bg-background-500 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{f.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">💡 常见问题</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-background-600 rounded-lg p-4"
              >
                <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background-600 rounded-lg p-6 text-center"
        >
          <h2 className="text-xl font-semibold text-white mb-2">📈 Rho 投研 Agent</h2>
          <p className="text-gray-400 text-sm mb-4">
            AI驱动的投研分析引擎，输出可直接使用的投资简报
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/research" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              开始使用
            </Link>
            <Link href="/" className="px-4 py-2 bg-background-500 hover:bg-background-400 text-white rounded-lg transition-colors">
              返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
