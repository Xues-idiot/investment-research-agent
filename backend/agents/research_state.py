# Rho - Research State Definition
# 参考 TradingAgents/agents/utils/agent_states.py

from typing import Annotated, TypedDict
from langgraph.graph import MessagesState


class AnalystReport(TypedDict):
    """分析师报告结构"""
    content: str
    confidence: float
    timestamp: str


class RiskAssessment(TypedDict):
    """风险评估结构"""
    level: str  # high, medium, low
    factors: list[str]
    score: float


class ResearchState(MessagesState):
    """Rho 投研 Agent 的共享状态"""

    # 基础信息
    company_of_interest: Annotated[str, "股票代码或公司名称"]
    trade_date: Annotated[str, "研究日期"]

    # 分析师报告
    fundamentals_report: Annotated[AnalystReport, "基本面分析报告"]
    sentiment_report: Annotated[AnalystReport, "情绪分析报告"]
    news_report: Annotated[AnalystReport, "新闻分析报告"]
    technical_report: Annotated[AnalystReport, "技术分析报告"]

    # 综合报告
    synthesis_report: Annotated[str, "综合研究报告"]

    # 风险评估
    risk_assessment: Annotated[RiskAssessment, "风险评估结果"]

    # 最终简报
    final_report: Annotated[str, "最终投资简报"]

    # 置信度
    confidence: Annotated[float, "整体置信度 0-1"]

    # 状态追踪
    current_agent: Annotated[str, "当前执行的Agent"]
    is_complete: Annotated[bool, "是否完成"]
