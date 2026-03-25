'use client';

// Footer - 页脚组件

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-600 border-t border-background-400 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              Rho 投研 Agent - 智能股票投资研究助手
            </p>
            <p className="text-gray-500 text-xs mt-1">
              免责声明：本工具仅供研究参考，不构成投资建议。投资有风险，决策需谨慎。
            </p>
          </div>
          <div className="text-gray-500 text-xs">
            <p>© {currentYear} Rho Research Agent</p>
            <p className="text-center md:text-right mt-1">
              数据来源: Yahoo Finance | 技术分析指标
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}