'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
    if (!markdownContent) {
      setError('请输入报告内容');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);

    try {
      const endpoint = exportFormat === 'pdf'
        ? 'http://localhost:8001/api/export/pdf'
        : 'http://localhost:8001/api/export/html';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_code: stockCode || 'report',
          markdown_content: markdownContent,
          title: title || `${stockCode || 'Report'} 投资研究报告`,
          author: 'Rho Agent',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`${exportFormat.toUpperCase()} 导出成功！`);
        setDownloadUrl(data.data.download_url);
      } else {
        setError(data.error || '导出失败');
        // Suggest alternative if PDF not available
        if (exportFormat === 'pdf' && data.available_formats) {
          setError(`${data.error}，可使用 ${data.available_formats.join(', ')} 格式`);
        }
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
          <p className="text-gray-400">导出PDF、HTML格式投资报告，分享研究结果</p>
        </motion.div>

        {/* Export Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-600 rounded-xl border border-background-400 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">导出报告</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <label className="block text-gray-300 text-sm font-medium mb-2">报告标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投资研究报告"
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
                    setMarkdownContent(templates[e.target.value as keyof typeof templates].content);
                  }
                }}
                className="w-full px-4 py-3 bg-background-500 border border-background-400 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="blank">空白模板</option>
                <option value="standard">标准投研报告</option>
                <option value="brief">简报模板</option>
              </select>
            </div>
          </div>

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

          <div className="flex gap-4">
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '导出中...' : '导出报告'}
            </button>
            <button
              onClick={() => setMarkdownContent(sampleReport)}
              className="px-6 py-3 bg-background-500 text-gray-300 rounded-lg font-medium hover:bg-background-400 transition-colors"
            >
              填充示例
            </button>
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