'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { exportPdf, exportHtml } from '@/lib/api';
import { exportToCSV, exportToJSON, researchToTableData, downloadFile } from '@/lib/utils';

const HISTORY_KEY = 'rho_research_history';

interface ResearchResult {
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
}

export default function ExportsPage() {
  const [stockCode, setStockCode] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [title, setTitle] = useState('');
  const [exportFormat, setExportFormat] = useState('html');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [latestResearch, setLatestResearch] = useState<ResearchResult | null>(null);
  const [exportMode, setExportMode] = useState<'report' | 'data'>('report');
  const [historyForExport, setHistoryForExport] = useState<ResearchResult[]>([]);

  // 从 localStorage 加载最新的研究报告
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        if (history && history.length > 0) {
          setLatestResearch(history[0]);
          setHistoryForExport(history);
          // 如果有最新研究，自动填充股票代码
          setStockCode(history[0].stockCode);
        }
      }
    } catch (e) {
      console.error('Failed to load research history:', e);
    }
  }, []);

  // 填充模板变量的函数
  const fillTemplate = (templateContent: string, data: ResearchResult | null): string => {
    if (!data) return templateContent;

    return templateContent
      .replace(/\{\{stockCode\}\}/g, `${data.stockCode} ${data.companyName}`)
      .replace(/\{\{confidence\}\}/g, `${(data.confidence * 100).toFixed(0)}%`)
      .replace(/\{\{riskLevel\}\}/g, `${data.riskAssessment.level} (${data.riskAssessment.score}/100)`)
      .replace(/\{\{summary\}\}/g, data.finalReport.slice(0, 500) + (data.finalReport.length > 500 ? '...' : ''));
  };

  const sampleReport = `# 贵州茅台（600519）投资研究报告

## 基本面分析

**公司概况**
贵州茅台是中国白酒行业的龙头企业，主要从事茅台酒及系列酒的生产和销售。

**财务数据**
- 营业收入：2023年约1476亿元
- 净利润：2023年约747亿元
- 毛利率：约92%
- ROE：约30%

**估值分析**
- PE ratio: 约28倍
- PB ratio: 约10倍
- 股息率: 约2.5%

## 技术面分析

**趋势分析**
- MA5: ¥1750.00
- MA20: ¥1720.00
- MA60: ¥1680.00
- 当前趋势：多头排列

**技术指标**
- RSI(14): 58.5
- MACD: 金叉状态
- KDJ: 中性偏多

## 投资建议

**综合评级**: ⭐⭐⭐⭐ ☆ (4/5)

**风险等级**: R2 (中低风险)

**结论**: 贵州茅台作为白酒龙头，具有较强的品牌护城河和稳定的现金流。估值处于合理区间，适合长期持有。

---
*报告由 Rho 投研 Agent 自动生成，仅供参考，不构成投资建议。*`;

  const templates = {
    blank: { name: '空白模板', content: '' },
    standard: { name: '标准投研报告', content: sampleReport },
    brief: { name: '简报模板', content: `# {{stockCode}} 投资简报\n\n## 核心观点\n\n- 置信度: {{confidence}}\n- 风险等级: {{riskLevel}}\n\n## 投资建议\n\n{{summary}}` },
  };

  const handleExport = async () => {
    // 数据导出模式
    if (exportMode === 'data') {
      if (historyForExport.length === 0) {
        setError('没有可导出的研究数据');
        return;
      }
      setLoading(true);
      try {
        const tableData = researchToTableData(historyForExport);
        if (exportFormat === 'csv') {
          exportToCSV(tableData, `research_data_${Date.now()}`);
        } else if (exportFormat === 'json') {
          exportToJSON(historyForExport, `research_data_${Date.now()}`);
        }
        setSuccess(`${exportFormat.toUpperCase()} 数据导出成功！`);
      } catch (err) {
        setError('导出失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 报告导出模式
    if (!markdownContent) {
      setError('请输入报告内容');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);

    try {
      const baseParams = {
        stock_code: stockCode || 'report',
        markdown_content: markdownContent,
        title: title || `${stockCode || 'Report'} 投资研究报告`,
        author: 'Rho Agent',
      };

      const data = exportFormat === 'pdf'
        ? await exportPdf(baseParams)
        : await exportHtml(baseParams);

      if (data.success && data.data) {
        setSuccess(`${exportFormat.toUpperCase()} 导出成功！`);
        setDownloadUrl(data.data.download_url || null);
      } else {
        setError(data.error || '导出失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-500 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">📤 报告导出</h1>
          <p className="text-gray-400">导出PDF、HTML、CSV、JSON格式投资报告和数据</p>
        </motion.div>

        {/* Export Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">导出报告</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Export Mode Toggle */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">导出模式</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setExportMode('report')}
                  className={`flex-1 px-3 py-3 rounded-lg text-sm transition-colors ${
                    exportMode === 'report'
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-500 text-gray-400 hover:text-white'
                  }`}
                >
                  📄 报告
                </button>
                <button
                  onClick={() => setExportMode('data')}
                  className={`flex-1 px-3 py-3 rounded-lg text-sm transition-colors ${
                    exportMode === 'data'
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-500 text-gray-400 hover:text-white'
                  }`}
                >
                  📊 数据
                </button>
              </div>
            </div>

            {exportMode === 'report' ? (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">股票代码</label>
                  <input
                    type="text"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    placeholder="600519"
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">导出格式</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="html">HTML</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">模板</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value !== 'blank') {
                        const templateContent = templates[e.target.value as keyof typeof templates].content;
                        const filledContent = fillTemplate(templateContent, latestResearch);
                        setMarkdownContent(filledContent);
                      }
                    }}
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="blank">空白模板</option>
                    <option value="standard">标准投研报告</option>
                    <option value="brief">简报模板</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">数据格式</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="csv">CSV (Excel兼容)</option>
                    <option value="json">JSON (结构化数据)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">可用数据</label>
                  <div className="px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-gray-300">
                    {historyForExport.length > 0 ? (
                      <span>共 {historyForExport.length} 条研究记录</span>
                    ) : (
                      <span className="text-gray-500">暂无研究数据</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {exportMode === 'report' && (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Markdown 内容
              </label>
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="输入报告的Markdown内容..."
                rows={12}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 font-mono text-sm resize-y"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '导出中...' : exportMode === 'report' ? '导出报告' : '导出数据'}
            </button>
            {exportMode === 'report' && (
              <button
                onClick={() => setMarkdownContent(sampleReport)}
                className="px-6 py-3 bg-background-500 text-gray-300 rounded-lg font-medium hover:bg-background-400 transition-colors"
              >
                填充示例
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-primary-400 hover:text-primary-300 text-sm"
                >
                  点击下载 →
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* Export History / Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">导出说明</h2>
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-primary-400 text-lg">📄</span>
              <div>
                <p className="font-medium text-white">HTML 格式</p>
                <p className="text-gray-400">直接导出为HTML文件，可在任何浏览器中打开，适合快速查看和分享</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 text-lg">📕</span>
              <div>
                <p className="font-medium text-white">PDF 格式</p>
                <p className="text-gray-400">导出为PDF文件，适合打印和正式存档。注意：需要安装 WeasyPrint 依赖</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 text-lg">💡</span>
              <div>
                <p className="font-medium text-white">使用提示</p>
                <p className="text-gray-400">支持标准 Markdown 语法，包括标题、列表、表格、代码块等</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}