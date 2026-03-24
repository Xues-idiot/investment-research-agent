# Rho - Synthesizer Agent
# 综合报告 Agent：汇总各分析师报告，生成综合研究报告

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated

from .research_state import ResearchState


def create_synthesizer(llm):
    """创建综合报告 Agent

    Args:
        llm: LLM 客户端

    Returns:
        综合节点函数
    """

    def synthesizer_node(state: dict) -> dict:
        """综合分析节点"""
        stock_code = state.get("company_of_interest", "")

        # 获取各分析师报告
        fundamentals = state.get("fundamentals_report", {})
        sentiment = state.get("sentiment_report", {})
        news = state.get("news_report", {})
        technical = state.get("technical_report", {})

        # 构建综合上下文
        context = f"""
=== 股票代码 ===
{stock_code}

=== 基本面分析报告 ===
{fundamentals.get('content', '暂无数据')}

=== 情绪分析报告 ===
{sentiment.get('content', '暂无数据')}

=== 新闻分析报告 ===
{news.get('content', '暂无数据')}

=== 技术分析报告 ===
{technical.get('content', '暂无数据')}
"""

        # 构建 prompt
        system_message = """你是一位资深的投资研究总监。你的任务是将多位分析师的研究报告综合成一份简明扼要的综合研究报告。

请综合以下分析师报告，生成一份综合研究报告：

输出格式：
## 综合研判
（给出整体投资观点，简明扼要）

## 核心逻辑
（支持你观点的主要理由，3-5条）

## 投资亮点
（这只股票的亮点和优势）

## 风险提示
（需要注意的风险因素）

## 综合置信度
（0-1，表示你对这个综合判断的确信程度）

请用通俗易懂的语言，让普通投资者也能看懂。
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", f"""请综合以下分析师报告，生成综合研究报告：

{context}

请给出你的综合研究报告。""")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        synthesis_content = result.content if hasattr(result, 'content') else str(result)

        # 计算综合置信度（取各报告置信度的加权平均）
        weights = [0.4, 0.2, 0.2, 0.2]  # 基本面权重最高
        confidences = [
            fundamentals.get('confidence', 0.5),
            sentiment.get('confidence', 0.5),
            news.get('confidence', 0.5),
            technical.get('confidence', 0.5),
        ]
        overall_confidence = sum(w * c for w, c in zip(weights, confidences)) / sum(weights)

        return {
            "messages": [result],
            "synthesis_report": synthesis_content,
            "confidence": overall_confidence,
            "current_agent": "Synthesizer",
        }

    return synthesizer_node
