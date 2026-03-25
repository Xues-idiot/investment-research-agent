'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-500">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
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

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
