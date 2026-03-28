'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { VERSION } from '@/types';

const HISTORY_KEY = 'rho_research_history';
const ALERTS_KEY = 'rho_monitor_alerts';
const FAVORITES_KEY = 'rho_favorites';

interface QuickStats {
  researchCount: number;
  alertsCount: number;
  favoritesCount: number;
}

const features = [
  {
    href: '/research',
    icon: '📊',
    title: '投资研究',
    description: '多维度分析股票，生成专业投资研究报告',
    gradient: 'from-brand-500/20 to-brand-600/20',
    border: 'hover:border-brand-500/40',
    iconBg: 'bg-brand-500/20',
    iconColor: 'text-brand-400',
  },
  {
    href: '/compare',
    icon: '📈',
    title: '股票对比',
    description: '多股票横向对比，分析估值、技术面、市场表现',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
    border: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    href: '/monitor',
    icon: '🔔',
    title: '监控告警',
    description: '设置价格、成交量、RSI告警，实时监控股票',
    gradient: 'from-orange-500/20 to-orange-600/20',
    border: 'hover:border-orange-500/40',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  {
    href: '/portfolio',
    icon: '💼',
    title: '组合管理',
    description: '投资组合建议、风险分析、调仓建议',
    gradient: 'from-purple-500/20 to-purple-600/20',
    border: 'hover:border-purple-500/40',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    href: '/backtest',
    icon: '🔬',
    title: '策略回测',
    description: '均线、RSI、动量策略历史回测，验证策略有效性',
    gradient: 'from-rose-500/20 to-rose-600/20',
    border: 'hover:border-rose-500/40',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
  },
  {
    href: '/exports',
    icon: '📤',
    title: '报告导出',
    description: '导出PDF、HTML格式投资报告，分享研究结果',
    gradient: 'from-indigo-500/20 to-indigo-600/20',
    border: 'hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    href: '/favorites',
    icon: '⭐',
    title: '我的收藏',
    description: '管理关注的股票，快速访问研究页面',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'hover:border-yellow-500/40',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    href: '/help',
    icon: '❓',
    title: '使用帮助',
    description: '快捷键、功能介绍、常见问题',
    gradient: 'from-slate-500/20 to-slate-600/20',
    border: 'hover:border-slate-500/40',
    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-400',
  },
  {
    href: '/changelog',
    icon: '📝',
    title: '更新日志',
    description: '版本更新记录，新功能一览',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<QuickStats>({ researchCount: 0, alertsCount: 0, favoritesCount: 0 });

  useEffect(() => {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      const alerts = localStorage.getItem(ALERTS_KEY);
      const favorites = localStorage.getItem(FAVORITES_KEY);
      setStats({
        researchCount: history ? JSON.parse(history).length : 0,
        alertsCount: alerts ? JSON.parse(alerts).length : 0,
        favoritesCount: favorites ? JSON.parse(favorites).length : 0,
      });
    } catch (e) {
      // Silent fail for stats loading
    }
  }, []);

  return (
    <div className="min-h-screen bg-terminal-900">
      {/* Background effects */}
      <div className="fixed inset-0 bg-mesh pointer-events-none"></div>
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span>智能投研助手</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-content-primary mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-content-primary to-content-secondary bg-clip-text text-transparent">
              Rho
            </span>
            <span className="text-4xl sm:text-5xl text-content-secondary ml-2">投研 Agent</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-content-muted max-w-2xl mx-auto mb-8">
            智能股票投资研究助手 | 多Agent协作 | K线可视化 | 策略回测
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/research"
              className="btn btn-primary px-6 py-3 text-base shadow-glow"
            >
              <span>开始研究</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/help"
              className="btn btn-secondary px-6 py-3 text-base"
            >
              了解更多
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-12 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-5 text-center group hover:border-brand-500/30"
          >
            <div className="text-3xl font-display font-bold text-brand-400 mb-1 tabular-nums">
              {stats.researchCount}
            </div>
            <div className="text-content-muted text-sm">研究记录</div>
            <div className="mt-2 h-1 w-12 mx-auto bg-gradient-to-r from-brand-500/50 to-brand-500/0 rounded-full group-hover:w-full transition-all"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="card p-5 text-center group hover:border-emerald-500/30"
          >
            <div className="text-3xl font-display font-bold text-emerald-400 mb-1 tabular-nums">
              {stats.alertsCount}
            </div>
            <div className="text-content-muted text-sm">监控告警</div>
            <div className="mt-2 h-1 w-12 mx-auto bg-gradient-to-r from-emerald-500/50 to-emerald-500/0 rounded-full group-hover:w-full transition-all"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-5 text-center group hover:border-yellow-500/30"
          >
            <div className="text-3xl font-display font-bold text-yellow-400 mb-1 tabular-nums">
              {stats.favoritesCount}
            </div>
            <div className="text-content-muted text-sm">我的收藏</div>
            <div className="mt-2 h-1 w-12 mx-auto bg-gradient-to-r from-yellow-500/50 to-yellow-500/0 rounded-full group-hover:w-full transition-all"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="card p-5 text-center group hover:border-brand-500/30"
          >
            <div className="text-3xl font-display font-bold text-brand-400 mb-1">
              v{VERSION}
            </div>
            <div className="text-content-muted text-sm">当前版本</div>
            <div className="mt-2 h-1 w-12 mx-auto bg-gradient-to-r from-brand-500/50 to-brand-500/0 rounded-full group-hover:w-full transition-all"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link href={feature.href}>
                <div className={`card p-6 h-full bg-gradient-to-br ${feature.gradient} ${feature.border} hover:scale-[1.02] transition-all duration-200 group`}>
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-200`}>
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-display font-semibold text-content-primary mb-2 group-hover:text-white transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-content-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border-subtle py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <span className="text-sm">📈</span>
            </div>
            <span className="font-display font-semibold text-content-primary">Rho</span>
          </div>
          <p className="text-content-muted text-sm mb-2">投资有风险，入市需谨慎</p>
          <p className="text-content-subtle text-xs">基于 LangGraph + MiniMax 构建</p>
        </div>
      </footer>
    </div>
  );
}
