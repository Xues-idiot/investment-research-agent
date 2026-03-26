'use client';

// StreamingProgress - 流式研究进度显示组件

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface StreamingProgressProps {
  currentAgent: string;
  currentMessage: string;
  startTime?: number;
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

interface StepTiming {
  startTime: number;
  endTime?: number;
}

export default function StreamingProgress({ currentAgent, currentMessage, startTime: propsStartTime }: StreamingProgressProps) {
  const [stepTimings, setStepTimings] = useState<Record<string, StepTiming>>({});
  const [totalElapsed, setTotalElapsed] = useState(0);
  const stepTimingsRef = useRef(stepTimings);
  const lastAgentRef = useRef<string | null>(null);

  const currentIndex = agentSteps.findIndex(a => a.id === currentAgent);

  // Keep ref in sync with state
  useEffect(() => {
    stepTimingsRef.current = stepTimings;
  }, [stepTimings]);

  // Track step timing - 使用ref跟踪上次agent避免循环依赖
  useEffect(() => {
    // 跳过初始化（相同时不会重复设置）
    if (currentAgent === lastAgentRef.current) return;
    lastAgentRef.current = currentAgent;

    if (!currentAgent) return;

    // 如果这个step还没有记录，创建它
    if (!stepTimingsRef.current[currentAgent]) {
      setStepTimings(prev => ({
        ...prev,
        [currentAgent]: { startTime: Date.now() },
      }));
    } else if (!stepTimingsRef.current[currentAgent].endTime) {
      // Step已完成（agent切换了），记录结束时间
      setStepTimings(prev => ({
        ...prev,
        [currentAgent]: { ...prev[currentAgent], endTime: Date.now() },
      }));
    }
  }, [currentAgent]);

  // Update total elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      const start = propsStartTime || stepTimingsRef.current['init']?.startTime || Date.now();
      setTotalElapsed(Date.now() - start);
    }, 100);
    return () => clearInterval(interval);
  }, [propsStartTime]);

  // Calculate current step duration
  const getStepDuration = (stepId: string): string => {
    const timing = stepTimings[stepId];
    if (!timing) return '';
    const end = timing.endTime || Date.now();
    const duration = end - timing.startTime;
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      className="bg-background-600 rounded-xl p-6 border border-background-400"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            🔄
          </motion.span>
          研究进度
        </h3>
        <div className="text-sm text-gray-400">
          已用时: <span className="text-white font-mono">{(totalElapsed / 1000).toFixed(1)}s</span>
        </div>
      </div>

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
          const duration = getStepDuration(step.id);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`
                flex flex-col items-center p-3 rounded-lg transition-all relative
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
              {duration && (
                <span className="text-xs text-gray-400 mt-0.5 font-mono">{duration}</span>
              )}
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
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-background-500 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            animate={{ width: `${((currentIndex + 1) / agentSteps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-gray-400 font-mono w-12 text-right">
          {Math.round(((currentIndex + 1) / agentSteps.length) * 100)}%
        </span>
      </div>
    </motion.div>
  );
}