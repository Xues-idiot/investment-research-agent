'use client';

// StreamingProgress - 流式研究进度显示组件

import { motion } from 'framer-motion';

interface StreamingProgressProps {
  currentAgent: string;
  currentMessage: string;
}

const agentSteps = [
  { id: 'init', name: '初始化', icon: '🎯' },
  { id: 'fundamental', name: '基本面', icon: '📈' },
  { id: 'sentiment', name: '情绪', icon: '💭' },
  { id: 'news', name: '新闻', icon: '📰' },
  { id: 'technical', name: '技术', icon: '📉' },
  { id: 'synthesize', name: '综合', icon: '🔬' },
  { id: 'risk', name: '风险', icon: '⚠️' },
  { id: 'report', name: '简报', icon: '📊' },
];

export default function StreamingProgress({ currentAgent, currentMessage }: StreamingProgressProps) {
  const currentIndex = agentSteps.findIndex(a => a.id === currentAgent);

  return (
    <motion.div
      className="bg-background-600 rounded-xl p-6 border border-background-400"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          🔄
        </motion.span>
        研究进度
      </h3>

      {/* Current Message */}
      <motion.div
        className="mb-4 p-3 bg-primary-500/20 rounded-lg border border-primary-500/30"
        key={currentMessage}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <p className="text-primary-300 text-sm">{currentMessage}</p>
      </motion.div>

      {/* Agent Steps */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {agentSteps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`
                flex flex-col items-center p-3 rounded-lg transition-all
                ${isComplete && 'bg-green-500/20 text-green-400'}
                ${isActive && 'bg-primary-500/30 text-primary-300 ring-2 ring-primary-500/50'}
                ${isPending && 'bg-background-500/50 text-gray-500'}
              `}
            >
              <motion.span
                className="text-2xl mb-1"
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
              >
                {step.icon}
              </motion.span>
              <span className="text-xs text-center">{step.name}</span>
              {isActive && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary-400 mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
              {isComplete && (
                <motion.span
                  className="text-xs mt-1 text-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-background-500 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          animate={{ width: `${((currentIndex + 1) / agentSteps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
