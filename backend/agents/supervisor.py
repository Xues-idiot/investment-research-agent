# Rho - Supervisor Agent
# 调度Agent：负责意图识别、任务分发、结果汇总

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate
from typing import List, Annotated

from .research_state import ResearchState


def create_supervisor(llm):
    """创建调度 Agent

    Args:
        llm: LLM 客户端

    Returns:
        调度节点函数
    """

    def supervisor_node(state: dict) -> dict:
        """调度节点 - 初始化研究任务"""
        company = state.get("company_of_interest", "")
        trade_date = state.get("trade_date", datetime.now().strftime("%Y-%m-%d"))

        # 构建初始化消息
        init_message = f"""开始对股票 {company} 进行投资研究，研究日期: {trade_date}

研究任务：
1. 基本面分析：分析公司财务状况、盈利能力、成长性
2. 情绪分析：分析市场新闻情绪、分析师评级
3. 新闻分析：分析最新新闻、公告、事件
4. 技术分析：分析价格走势、技术指标

请并行执行以上分析任务。"""

        return {
            "messages": [("human", init_message)],
            "current_agent": "Supervisor",
            "is_complete": False,
        }

    return supervisor_node


def create_supervisor_router(llm):
    """创建调度路由 Agent - 决定下一步任务

    Args:
        llm: LLM 客户端

    Returns:
        路由节点函数
    """

    def router_node(state: dict) -> dict:
        """路由节点 - 判断研究是否完成"""
        # 检查是否所有报告都已生成
        fundamentals = state.get("fundamentals_report")
        sentiment = state.get("sentiment_report")
        news = state.get("news_report")
        technical = state.get("technical_report")

        all_complete = all([
            fundamentals and fundamentals.get("content"),
            sentiment and sentiment.get("content"),
            news and news.get("content"),
            technical and technical.get("content"),
        ])

        if all_complete:
            return {"next_step": "synthesize"}
        else:
            return {"next_step": "continue"}

    return router_node
