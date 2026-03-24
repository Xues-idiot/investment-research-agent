# Rho - Report Generator Agent
# 简报生成 Agent：生成普通人能看懂的投资简报

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated

from .research_state import ResearchState


def create_report_generator(llm):
    """创建简报生成 Agent

    Args:
        llm: LLM 客户端

    Returns:
        简报生成节点函数
    """

    def report_generator_node(state: dict) -> dict:
        """简报生成节点"""
        stock_code = state.get("company_of_interest", "")
        trade_date = state.get("trade_date", datetime.now().strftime("%Y-%m-%d"))

        # 获取所有数据
        fundamentals = state.get("fundamentals_report", {})
        sentiment = state.get("sentiment_report", {})
        news = state.get("news_report", {})
        technical = state.get("technical_report", {})
        synthesis = state.get("synthesis_report", "")
        risk = state.get("risk_assessment", {})
        confidence = state.get("confidence", 0.5)

        # 获取股票基本信息用于简报
        from ..tools.financial_data import get_stock_info
        stock_info = get_stock_info(stock_code)

        # 构建完整简报上下文
        context = f"""
=== 股票信息 ===
代码: {stock_code}
名称: {stock_info.get('name', '未知')}
当前股价: {stock_info.get('price', 'N/A')}
市盈率: {stock_info.get('pe_ratio', 'N/A')}
市净率: {stock_info.get('pb_ratio', 'N/A')}
总市值: {stock_info.get('market_cap', 0) / 1e8:.2f}亿元

=== 综合研究结论 ===
{synthesis}

=== 风险评估 ===
风险等级: {risk.get('level', 'medium').upper()}
风险评分: {risk.get('score', 50)}/100
风险因素: {', '.join(risk.get('factors', [])[:3])}

=== 整体置信度 ===
{confidence:.0%}
"""

        # 构建 prompt
        system_message = """你是一位贴心的投资顾问。你的任务是将专业的研究报告转化普通投资者也能轻松看懂的投资简报。

请根据以下研究结论，生成一份通俗易懂的投资简报：

简报格式：
┌─────────────────────────────────────────────┐
│  📊 {股票名称} ({股票代码}) 投资简报           │
│  生成时间: {日期}                            │
├─────────────────────────────────────────────┤
│  💰 股价信息                                 │
│  当前价: ¥{价格} | 市盈率: {PE} | 估值: {估值} │
├─────────────────────────────────────────────┤
│  📋 核心亮点                                  │
│  • {亮点1}                                  │
│  • {亮点2}                                  │
│  • {亮点3}                                  │
├─────────────────────────────────────────────┤
│  ⚠️ 风险提示                                  │
│  • {风险1}                                  │
│  • {风险2}                                  │
├─────────────────────────────────────────────┤
│  📰 最新动态                                  │
│  • {最新新闻1}                               │
│  • {最新新闻2}                               │
├─────────────────────────────────────────────┤
│  💡 投资建议: {建议}                         │
│  置信度: {置信度}%                            │
└─────────────────────────────────────────────┘

请用最简洁易懂的语言，让普通投资者一眼就能看懂这只股票是否值得关注。

建议类型：
- 强烈推荐：各项指标优秀，风险低，置信度>75%
- 推荐：整体正面，风险可控，置信度>60%
- 谨慎推荐：有机会但也有风险，置信度>50%
- 观望：不确定性较大，建议等待更多信息
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"""请为股票 {stock_code} 生成投资简报：

{context}

请生成最终的投资简报。""")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        report_content = result.content if hasattr(result, 'content') else str(result)

        return {
            "messages": [result],
            "final_report": report_content,
            "is_complete": True,
            "current_agent": "Report Generator",
        }

    return report_generator_node


def format_report_markdown(state: dict) -> str:
    """格式化简报为 Markdown

    Args:
        state: 研究状态

    Returns:
        Markdown 格式的简报
    """
    stock_code = state.get("company_of_interest", "")
    # company_name 不存在于 state，使用 stock_code 代替
    stock_name = stock_code
    report = state.get("final_report", "")
    risk = state.get("risk_assessment", {})
    confidence = state.get("confidence", 0.5)

    # 如果已经有完整简报，直接返回
    if report and len(report) > 100:
        return report

    # 否则生成简单简报
    from ..tools.financial_data import get_stock_info
    stock_info = get_stock_info(stock_code)

    return f"""# 📊 {stock_name} ({stock_code}) 投资简报

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## 💰 核心指标

| 指标 | 数值 |
|------|------|
| 当前股价 | ¥{stock_info.get('price', 'N/A')} |
| 市盈率 (PE) | {stock_info.get('pe_ratio', 'N/A')} |
| 市净率 (PB) | {stock_info.get('pb_ratio', 'N/A')} |
| 总市值 | {stock_info.get('market_cap', 0) / 1e8:.2f}亿元 |

---

## 📋 投资简报

{report or '暂无报告数据'}

---

## ⚠️ 风险提示

- **风险等级**: {risk.get('level', 'medium').upper()}
- **风险评分**: {risk.get('score', 50)}/100
- **主要风险**: {', '.join(risk.get('factors', ['暂无数据'])[:3])}

---

## 💡 投资建议

**置信度**: {confidence:.0%}

---

*本简报仅供参考，不构成投资建议。投资有风险，入市需谨慎。*
"""
