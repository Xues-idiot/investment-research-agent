# Rho - Fundamental Analyst Agent
# 基本面分析：财报、盈利能力、成长性、资产负债表、竞品对比等

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate

from .research_state import AnalystReport
from ..tools.financial_data import get_stock_info, get_financials, get_income_statement, get_balance_sheet, get_cashflow, get_peer_comparison
from ..prompts import FUNDAMENTAL_ANALYST_PROMPT


def create_fundamental_analyst(llm):
    """创建基本面分析 Agent"""

    def fundamental_analyst_node(state: dict) -> dict:
        """基本面分析节点"""
        stock_code = state.get("company_of_interest", "")
        current_date = state.get("trade_date", datetime.now().strftime("%Y-%m-%d"))

        # 获取财务数据
        stock_info = get_stock_info(stock_code)
        financials = get_financials(stock_code)
        income_stmt = get_income_statement(stock_code)
        balance = get_balance_sheet(stock_code)
        cashflow = get_cashflow(stock_code)
        peer_comparison = get_peer_comparison(stock_code)

        # 构建分析上下文
        context = _build_financial_context(stock_info, financials, income_stmt, balance, cashflow, peer_comparison)

        # 使用模板
        prompt_template = FUNDAMENTAL_ANALYST_PROMPT.format(financial_data=context)
        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_template),
            ("human", f"请分析股票 {stock_code} ({stock_info.get('name', '')}) 的基本面数据。")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        report_content = result.content if hasattr(result, 'content') else str(result)
        confidence = _extract_confidence(report_content)

        report: AnalystReport = {
            "content": report_content,
            "confidence": confidence,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        return {
            "messages": [result],
            "fundamentals_report": report,
            "current_agent": "Fundamental Analyst",
        }

    return fundamental_analyst_node


def _build_financial_context(stock_info: dict, financials: dict, income_stmt: dict, balance: dict, cashflow: dict, peer_comparison: dict = None) -> str:
    """构建财务分析上下文"""
    context = f"""
=== 股票信息 ===
代码: {stock_info.get('stock_code')}
名称: {stock_info.get('name')}
当前股价: ¥{stock_info.get('price')}
市盈率(PE): {stock_info.get('pe_ratio')}
市净率(PB): {stock_info.get('pb_ratio')}
总市值: {stock_info.get('market_cap', 0) / 1e8:.2f}亿元
股息率: {stock_info.get('dividend_yield', 0) * 100:.2f}%
52周最高: {stock_info.get('52w_high')}
52周最低: {stock_info.get('52w_low')}

=== 财务指标 ===
{financials}

=== 损益表 ===
{income_stmt}

=== 资产负债表 ===
{balance}

=== 现金流量表 ===
{cashflow}
"""

    # 添加竞品对比数据
    if peer_comparison and peer_comparison.get("peers"):
        context += _build_peer_comparison_context(peer_comparison)

    return context


def _build_peer_comparison_context(peer_comparison: dict) -> str:
    """构建竞品对比上下文"""
    target = peer_comparison.get("target", {})
    peers = peer_comparison.get("peers", [])

    context = """

=== 竞品对比分析 ===

## 对比公司
| 股票代码 | 股票名称 | 股价 | 市盈率(PE) | 市净率(PB) | 市值(亿) | 股息率 |
|----------|----------|------|------------|------------|----------|--------|
| {target_code} | {target_name} | ¥{target_price} | {target_pe} | {target_pb} | {target_mcap} | {target_div}% |
""".format(
        target_code=target.get("stock_code", ""),
        target_name=target.get("name", ""),
        target_price=target.get("price", 0),
        target_pe=target.get("pe_ratio", "N/A"),
        target_pb=target.get("pb_ratio", "N/A"),
        target_mcap=target.get("market_cap", 0) / 1e8 if target.get("market_cap") else 0,
        target_div=(target.get("dividend_yield", 0) or 0) * 100,
    )

    for peer in peers:
        context += "| {code} | {name} | ¥{price} | {pe} | {pb} | {mcap} | {div}% |\n".format(
            code=peer.get("stock_code", ""),
            name=peer.get("name", ""),
            price=peer.get("price", 0),
            pe=peer.get("pe_ratio", "N/A"),
            pb=peer.get("pb_ratio", "N/A"),
            mcap=peer.get("market_cap", 0) / 1e8 if peer.get("market_cap") else 0,
            div=(peer.get("dividend_yield", 0) or 0) * 100,
        )

    context += """
## 对比分析要点
1. **估值对比**：比较PE、PB在行业中的位置
2. **市值对比**：了解公司在行业中的规模定位
3. **股息率对比**：评估股东回报水平
"""
    return context


def _extract_confidence(content: str) -> float:
    """从分析内容中提取置信度"""
    import re
    match = re.search(r'置信度["\s:]+([0-9.]+)', content, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return 0.7
