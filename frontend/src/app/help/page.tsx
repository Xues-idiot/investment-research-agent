'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const shortcuts = [
  { keys: ['R'], description: '聚焦搜索框' },
  { keys: ['C'], description: '切换流式/传统模式' },
  { keys: ['Esc'], description: '取消当前操作' },
];

const features = [
  {
    icon: '📊',
    title: '投资研究',
    description: '输入股票代码，AI多维度分析生成专业投资研究报告',
    link: '/research',
    color: 'brand',
  },
  {
    icon: '📈',
    title: '股票对比',
    description: '最多4只股票横向对比，估值、技术面、市场表现一目了然',
    link: '/compare',
    color: 'emerald',
  },
  {
    icon: '🔔',
    title: '监控告警',
    description: '设置价格、RSI、成交量告警，实时推送通知',
    link: '/monitor',
    color: 'orange',
  },
  {
    icon: '💼',
    title: '组合管理',
    description: '输入持仓，获取仓位建议和风险分析',
    link: '/portfolio',
    color: 'purple',
  },
  {
    icon: '🔬',
    title: '策略回测',
    description: '均线、RSI、动量策略历史回测，验证策略有效性',
    link: '/backtest',
    color: 'rose',
  },
  {
    icon: '📤',
    title: '报告导出',
    description: '导出PDF/HTML格式报告，方便分享和存档',
    link: '/exports',
    color: 'indigo',
  },
  {
    icon: '⭐',
    title: '我的收藏',
    description: '收藏关注的股票，快速访问和管理',
    link: '/favorites',
    color: 'yellow',
  },
  {
    icon: '📝',
    title: '更新日志',
    description: '查看最新版本更新和新功能',
    link: '/changelog',
    color: 'cyan',
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

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  brand: { bg: 'bg-brand-500/10', border: 'border-brand-500/30', text: 'text-brand-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-terminal-900">
      <div className="fixed inset-0 bg-mesh pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-4">
            <span>❓</span>
            <span>帮助中心</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-content-primary mb-3">Rho 帮助中心</h1>
          <p className="text-content-muted text-lg">了解Rho投研Agent的所有功能</p>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-display font-semibold text-content-primary mb-4 flex items-center gap-2">
            <span>⌨️</span>
            <span>快捷键</span>
          </h2>
          <div className="card p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shortcuts.map((s) => (
                <div key={s.description} className="flex items-center gap-3 p-3 rounded-xl bg-terminal-700/50">
                  <div className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2.5 py-1 bg-terminal-600 rounded-lg text-xs text-content-primary font-mono border border-border-subtle shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-content-muted text-sm">{s.description}</span>
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
          className="mb-10"
        >
          <h2 className="text-xl font-display font-semibold text-content-primary mb-4 flex items-center gap-2">
            <span>🚀</span>
            <span>功能介绍</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f) => {
              const colors = colorMap[f.color] || colorMap.brand;
              return (
                <Link
                  key={f.link}
                  href={f.link}
                  className={`card p-5 hover:border-${f.color === 'brand' ? 'brand' : f.color}-500/40 transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {f.icon}
                    </div>
                    <div>
                      <h3 className={`font-display font-medium ${colors.text} mb-1 group-hover:underline underline-offset-2`}>
                        {f.title}
                      </h3>
                      <p className="text-content-muted text-sm leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-display font-semibold text-content-primary mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>常见问题</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="card p-5"
              >
                <h3 className="text-content-primary font-medium mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                  {faq.q}
                </h3>
                <p className="text-content-muted text-sm leading-relaxed pl-3.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow-sm">
            📈
          </div>
          <h2 className="text-2xl font-display font-semibold text-content-primary mb-2">Rho 投研 Agent</h2>
          <p className="text-content-muted mb-6 max-w-md mx-auto">
            AI驱动的投研分析引擎，输出可直接使用的投资简报
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/research" className="btn btn-primary px-6 py-2.5 shadow-glow">
              开始使用
            </Link>
            <Link href="/" className="btn btn-secondary px-6 py-2.5">
              返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
