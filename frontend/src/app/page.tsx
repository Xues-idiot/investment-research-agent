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
    color: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/compare',
    icon: '📈',
    title: '股票对比',
    description: '多股票横向对比，分析估值、技术面、市场表现',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/monitor',
    icon: '🔔',
    title: '监控告警',
    description: '设置价格、成交量、RSI告警，实时监控股票',
    color: 'from-orange-500 to-amber-500',
  },
  {
    href: '/portfolio',
    icon: '💼',
    title: '组合管理',
    description: '投资组合建议、风险分析、调仓建议',
    color: 'from-purple-500 to-violet-500',
  },
  {
    href: '/backtest',
    icon: '🔬',
    title: '策略回测',
    description: '均线、RSI、动量策略历史回测，验证策略有效性',
    color: 'from-rose-500 to-pink-500',
  },
  {
    href: '/exports',
    icon: '📤',
    title: '报告导出',
    description: '导出PDF、HTML格式投资报告，分享研究结果',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    href: '/favorites',
    icon: '⭐',
    title: '我的收藏',
    description: '管理关注的股票，快速访问研究页面',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    href: '/help',
    icon: '❓',
    title: '使用帮助',
    description: '快捷键、功能介绍、常见问题',
    color: 'from-gray-500 to-slate-500',
  },
  {
    href: '/changelog',
    icon: '📝',
    title: '更新日志',
    description: '版本更新记录，新功能一览',
    color: 'from-cyan-500 to-blue-500',
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
      console.error('Failed to load stats:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background-500">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            📈 Rho 投研 Agent
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            智能股票投资研究助手 | 多Agent协作 | K线可视化 | 策略回测
          </p>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 pb-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-background-600 rounded-xl border border-background-400 p-4 text-center"
          >
            <div className="text-3xl font-bold text-primary-400">{stats.researchCount}</div>
            <div className="text-gray-400 text-sm">研究记录</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-background-600 rounded-xl border border-background-400 p-4 text-center"
          >
            <div className="text-3xl font-bold text-green-400">{stats.alertsCount}</div>
            <div className="text-gray-400 text-sm">监控告警</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-background-600 rounded-xl border border-background-400 p-4 text-center"
          >
            <div className="text-3xl font-bold text-yellow-400">{stats.favoritesCount}</div>
            <div className="text-gray-400 text-sm">我的收藏</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-background-600 rounded-xl border border-background-400 p-4 text-center"
          >
            <div className="text-3xl font-bold text-yellow-400">v{VERSION}</div>
            <div className="text-gray-400 text-sm">当前版本</div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link href={feature.href}>
                <div className="group h-full bg-background-600 rounded-xl border border-background-400 p-6 hover:border-primary-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-500/10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-background-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Rho 投研 Agent | 投资有风险，入市需谨慎</p>
          <p className="mt-2">基于 LangGraph + MiniMax 构建</p>
        </div>
      </footer>
    </div>
  );
}
