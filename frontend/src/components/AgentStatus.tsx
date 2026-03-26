'use client';

// AgentStatus - Agent 状态显示组件 (with motion animations)

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AgentStatusProps {
  currentAgent: string;
}

const agents = [
  { name: '调度', icon: '🎯', description: '初始化任务' },
  { name: '基本面', icon: '📈', description: '分析财务数据' },
  { name: '情绪', icon: '💭', description: '分析市场情绪' },
  { name: '新闻', icon: '📰', description: '分析新闻动态' },
  { name: '技术', icon: '📉', description: '分析价格走势' },
  { name: '综合', icon: '🔬', description: '汇总各方分析' },
  { name: '风险', icon: '⚠️', description: '评估风险因素' },
  { name: '简报', icon: '📊', description: '生成投资简报' },
];

export default function AgentStatus({ currentAgent }: AgentStatusProps) {
  const currentIndex = agents.findIndex(a => a.name.includes(currentAgent)) ?? 0;

  return (
    <div className="bg-background-600 rounded-xl p-6 border border-background-400">
      <h3 className="text-lg font-semibold text-white mb-4">
        🔄 研究进度
      </h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {agents.map((agent, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg transition-all',
                isComplete && 'bg-green-500/20 text-green-400',
                isActive && 'bg-primary-500/30 text-primary-300 ring-2 ring-primary-500/50',
                !isComplete && !isActive && 'bg-background-500/50 text-gray-500'
              )}
            >
              <motion.span
                className="text-2xl mb-1"
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
              >
                {agent.icon}
              </motion.span>
              <span className="text-xs text-center">{agent.name}</span>
              {isActive && (
                <motion.span
                  className="text-xs mt-1 text-primary-300"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  分析中...
                </motion.span>
              )}
              {isComplete && (
                <span className="text-xs mt-1 text-green-400">✓</span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 h-2 bg-background-500 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / agents.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
