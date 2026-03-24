# Rho - Risk Evaluator Agent
# 风险评估 Agent：评估投资风险，生成风险评估报告

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated

from .research_state import ResearchState, RiskAssessment


def create_risk_evaluator(llm):
    """创建风险评估 Agent

    Args:
        llm: LLM 客户端

    Returns:
        风险评估节点函数
    """

    def risk_evaluator_node(state: dict) -> dict:
        """风险评估节点"""
        stock_code = state.get("company_of_interest", "")

        # 获取各分析师报告
        fundamentals = state.get("fundamentals_report", {})
        sentiment = state.get("sentiment_report", {})
        news = state.get("news_report", {})
        technical = state.get("technical_report", {})
        synthesis = state.get("synthesis_report", "")

        # 构建风险分析上下文
        context = f"""
=== 股票代码 ===
{stock_code}

=== 基本面风险 ===
{fundamentals.get('content', '暂无数据')}

=== 情绪风险 ===
{sentiment.get('content', '暂无数据')}

=== 新闻风险 ===
{news.get('content', '暂无数据')}

=== 技术风险 ===
{technical.get('content', '暂无数据')}

=== 综合研判 ===
{synthesis}
"""

        # 构建 prompt
        system_message = """你是一位专业的风险管理专家。你的任务是评估投资标的风险，帮助投资者了解可能面临的风险。

请分析以下信息，评估投资风险：

风险评估维度：
1. 财务风险：公司财务状况是否健康，负债水平
2. 经营风险：公司经营是否稳定，盈利能力是否可持续
3. 市场风险：估值是否过高，股价波动性
4. 行业风险：行业竞争格局，政策影响
5. 流动性风险：股票是否容易买卖
6. 情绪风险：市场情绪是否过度乐观或悲观

输出格式：
## 风险等级
（高风险 / 中风险 / 低风险）

## 主要风险因素
（列出2-5个主要风险）

## 风险详情
（对每个风险的详细解释）

## 风险评分
（0-100分，100分表示极高风险，0分表示几乎没有风险）

## 风险管理建议
（投资者应注意什么，如何控制风险）

请用通俗易懂的语言，让普通投资者也能理解风险。
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"""请评估股票 {stock_code} 的投资风险：

{context}

请给出你的风险评估报告。""")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        risk_content = result.content if hasattr(result, 'content') else str(result)

        # 解析风险等级
        risk_level = _extract_risk_level(risk_content)
        risk_score = _extract_risk_score(risk_content)
        risk_factors = _extract_risk_factors(risk_content)

        risk_assessment: RiskAssessment = {
            "level": risk_level,
            "factors": risk_factors,
            "score": risk_score,
        }

        return {
            "messages": [result],
            "risk_assessment": risk_assessment,
            "current_agent": "Risk Evaluator",
        }

    return risk_evaluator_node


def _extract_risk_level(content: str) -> str:
    """从内容中提取风险等级"""
    content_lower = content.lower()
    if "高风险" in content or "极高风险" in content or "high risk" in content_lower:
        return "high"
    elif "低风险" in content or "风险较低" in content or "low risk" in content_lower:
        return "low"
    else:
        return "medium"


def _extract_risk_score(content: str) -> float:
    """从内容中提取风险评分"""
    import re
    match = re.search(r'风险评分[：:]*\s*(\d+)', content)
    if match:
        return int(match.group(1))
    return 50.0  # 默认中等风险


def _extract_risk_factors(content: str) -> list:
    """提取主要风险因素"""
    factors = []
    lines = content.split('\n')
    capture = False
    for line in lines:
        if '主要风险' in line or '风险因素' in line:
            capture = True
            continue
        if capture and line.strip().startswith(('1.', '2.', '3.', '4.', '5.', '•', '-')):
            factor = line.strip().lstrip('123456789.•- ').strip()
            if factor:
                factors.append(factor)
            if len(factors) >= 5:
                break
    return factors if factors else ["市场整体波动", "行业竞争加剧", "估值调整"]
