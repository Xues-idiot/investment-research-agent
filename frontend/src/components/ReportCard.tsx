'use client';

// ReportCard - 投资简报卡片组件 (with motion animations)

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getRiskColor } from '@/lib/utils';

interface ReportCardProps {
  report: {
    stockCode: string;
    companyName: string;
    finalReport: string;
    confidence: number;
    riskAssessment: {
      level: string;
      score: number;
      factors: string[];
    };
    reports: {
      fundamentals: string;
      sentiment: string;
      news: string;
      technical: string;
      synthesis: string;
    };
  };
}

// 可折叠报告卡片
function CollapsibleCard({
  title,
  icon,
  content,
  defaultOpen = false,
  delay = 0.6,
}: {
  title: string;
  icon: string;
  content: string;
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="bg-background-600 rounded-lg border border-background-400 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-background-500/50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {icon} {title}
        </h3>
        <motion.svg
          className="w-5 h-5 text-gray-400"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-gray-400 text-sm whitespace-pre-wrap">
              {content || '暂无数据'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const riskColor = getRiskColor(report.riskAssessment.level);

  // 复制股票代码
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(report.stockCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report.stockCode]);

  // 分享报告
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${report.companyName} (${report.stockCode}) 投资简报`,
          text: `置信度: ${(report.confidence * 100).toFixed(0)}%, 风险等级: ${report.riskAssessment.level}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: 复制链接
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  // 导出JSON
  const handleExportJSON = useCallback(() => {
    const data = {
      stockCode: report.stockCode,
      companyName: report.companyName,
      confidence: report.confidence,
      riskAssessment: report.riskAssessment,
      reports: report.reports,
      finalReport: report.finalReport,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.stockCode}_${report.companyName}_研究报告.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  // 导出Markdown
  const handleExportMarkdown = useCallback(() => {
    const md = `# ${report.companyName} (${report.stockCode}) 投资研究报告

## 基本信息
- **股票代码**: ${report.stockCode}
- **公司名称**: ${report.companyName}
- **置信度**: ${(report.confidence * 100).toFixed(0)}%
- **风险等级**: ${report.riskAssessment.level}
- **风险评分**: ${report.riskAssessment.score}/100
- **生成时间**: ${new Date().toLocaleString('zh-CN')}

## 风险因素
${report.riskAssessment.factors.map(f => `- ${f}`).join('\n')}

## 基本面分析
${report.reports.fundamentals}

## 情绪分析
${report.reports.sentiment}

## 新闻分析
${report.reports.news}

## 技术分析
${report.reports.technical}

## 综合分析
${report.reports.synthesis}

## 投资总结
${report.finalReport}

---
*本报告由 Rho 投研Agent自动生成*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.stockCode}_${report.companyName}_研究报告.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  // 复制股票代码用于对比
  const handleCompare = useCallback(() => {
    navigator.clipboard.writeText(report.stockCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report.stockCode]);

  return (
    <div className="space-y-6">
      {/* Main Report Card */}
      <motion.div
        className="bg-background-600 rounded-xl overflow-hidden border border-background-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h2
                className="text-xl font-bold text-white"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                📊 {report.companyName} ({report.stockCode}) 投资简报
              </motion.h2>
              <motion.p
                className="text-primary-200 text-sm mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                生成时间: {new Date().toLocaleDateString('zh-CN')}
              </motion.p>
            </div>
            <motion.div
              className="text-right"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-2xl font-bold text-white">
                置信度 {(report.confidence * 100).toFixed(0)}%
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors flex items-center gap-1"
            >
              {copied ? '✓ 已复制' : '📋 复制代码'}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors flex items-center gap-1"
            >
              🔗 分享
            </button>
            <div className="h-4 w-px bg-white/30 mx-1" />
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors flex items-center gap-1"
            >
              📥 JSON
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm text-white transition-colors flex items-center gap-1"
            >
              📥 MD
            </button>
            <div className="h-4 w-px bg-white/30 mx-1" />
            <button
              onClick={handleCompare}
              className="px-3 py-1.5 bg-secondary-500/80 hover:bg-secondary-500 rounded text-sm text-white transition-colors flex items-center gap-1"
            >
              📈 对比
            </button>
          </div>
        </motion.div>

        {/* Risk Badge */}
        <motion.div
          className={cn('px-6 py-3', riskColor)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="font-semibold">
            ⚠️ 风险等级: {report.riskAssessment.level.toUpperCase()} ({report.riskAssessment.score}/100)
          </span>
        </motion.div>

        {/* Main Report Content */}
        <motion.div
          className="p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="prose prose-sm max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: report.finalReport }}
          />
        </motion.div>
      </motion.div>

      {/* Toggle Detailed Reports */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-4 py-3 bg-background-600 hover:bg-background-500 rounded-lg border border-background-400 text-gray-300 text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <span>{showDetails ? '收起' : '展开'}详细分析</span>
        <motion.svg
          className="w-4 h-4"
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Detailed Reports - Collapsible */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CollapsibleCard
                title="基本面分析"
                icon="📈"
                content={report.reports.fundamentals}
                delay={0}
              />
              <CollapsibleCard
                title="情绪分析"
                icon="💭"
                content={report.reports.sentiment}
                delay={0.1}
              />
              <CollapsibleCard
                title="新闻分析"
                icon="📰"
                content={report.reports.news}
                delay={0.2}
              />
              <CollapsibleCard
                title="技术分析"
                icon="📉"
                content={report.reports.technical}
                delay={0.3}
              />
            </div>

            {/* Synthesis */}
            <CollapsibleCard
              title="综合研判"
              icon="🔬"
              content={report.reports.synthesis}
              defaultOpen={true}
              delay={0.4}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Factors - Always visible */}
      <motion.div
        className="bg-background-600 rounded-lg p-6 border border-background-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          ⚠️ 主要风险因素
        </h3>
        <ul className="list-disc list-inside text-gray-400">
          {report.riskAssessment.factors.map((factor, index) => (
            <motion.li
              key={index}
              className="mb-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              {factor}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="text-center text-sm text-gray-500 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p>⚠️ 本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。</p>
      </motion.div>
    </div>
  );
}
