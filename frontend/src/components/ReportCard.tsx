'use client';

// ReportCard - 投资简报卡片组件 (with motion animations)

import { motion } from 'framer-motion';
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

export default function ReportCard({ report }: ReportCardProps) {
  const riskColor = getRiskColor(report.riskAssessment.level);

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

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fundamentals */}
        <motion.div
          className="bg-background-600 rounded-lg p-6 border border-background-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            📈 基本面分析
          </h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {report.reports.fundamentals || '暂无数据'}
          </p>
        </motion.div>

        {/* Sentiment */}
        <motion.div
          className="bg-background-600 rounded-lg p-6 border border-background-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            💭 情绪分析
          </h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {report.reports.sentiment || '暂无数据'}
          </p>
        </motion.div>

        {/* News */}
        <motion.div
          className="bg-background-600 rounded-lg p-6 border border-background-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            📰 新闻分析
          </h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {report.reports.news || '暂无数据'}
          </p>
        </motion.div>

        {/* Technical */}
        <motion.div
          className="bg-background-600 rounded-lg p-6 border border-background-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            📉 技术分析
          </h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">
            {report.reports.technical || '暂无数据'}
          </p>
        </motion.div>
      </div>

      {/* Synthesis */}
      <motion.div
        className="bg-background-600 rounded-lg p-6 border border-background-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          🔬 综合研判
        </h3>
        <p className="text-gray-300 whitespace-pre-wrap">
          {report.reports.synthesis || '暂无数据'}
        </p>
      </motion.div>

      {/* Risk Factors */}
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
