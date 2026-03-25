# Rho - Research Graph
# LangGraph 多Agent编排：调度 → 并行分析 → 综合 → 风险评估 → 简报生成

import os
from datetime import datetime
from typing import Dict, Any, Optional, List

from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode

from ..agents.research_state import ResearchState
from ..agents.supervisor import create_supervisor, create_supervisor_router
from ..agents.fundamental import create_fundamental_analyst
from ..agents.sentiment import create_sentiment_analyst
from ..agents.news import create_news_analyst
from ..agents.technical import create_technical_analyst
from ..agents.synthesizer import create_synthesizer
from ..agents.risk_evaluator import create_risk_evaluator
from ..agents.report_generator import create_report_generator, format_report_markdown

# LLM 客户端创建
from ..llm_client import create_llm_client
from ..config import config as app_config


class ResearchGraph:
    """Rho 投研 Agent 主图

    编排流程：
    START → Supervisor → [并行执行 4个 Analyst]
                          ↓
                    Synthesizer → Risk Evaluator → Report Generator → END
    """

    def __init__(
        self,
        llm_provider: str = None,
        deep_think_llm: str = None,
        quick_think_llm: str = None,
        debug: bool = False,
        extra_config: Dict[str, Any] = None,
    ):
        """初始化投研图

        Args:
            llm_provider: LLM 提供商 (openai, anthropic, google 等)
            deep_think_llm: 深度思考模型
            quick_think_llm: 快速思考模型
            debug: 是否调试模式
            extra_config: 额外配置字典
        """
        self.debug = debug
        self.extra_config = extra_config or {}

        # 设置默认值 (使用 app_config.py 配置)
        self.llm_provider = llm_provider or app_config.LLM_PROVIDER
        self.deep_think_llm = deep_think_llm or app_config.DEEP_THINK_LLM
        self.quick_think_llm = quick_think_llm or app_config.QUICK_THINK_LLM

        # 创建 LLM 客户端
        self._setup_llms()

        # 创建 Agent 节点
        self._setup_agents()

        # 构建图
        self.graph = self._build_graph()

    def _setup_llms(self):
        """设置 LLM 客户端"""
        try:
            # MiniMax 需要传递 API key 和 base_url
            llm_kwargs = {}
            if self.llm_provider == "minimax":
                llm_kwargs = {
                    "api_key": app_config.MINIMAX_API_KEY,
                    "base_url": app_config.MINIMAX_BASE_URL,
                }

            self.deep_client = create_llm_client(
                provider=self.llm_provider,
                model=self.deep_think_llm,
                **llm_kwargs
            )
            self.deep_thinking_llm = self.deep_client.get_llm()

            self.quick_client = create_llm_client(
                provider=self.llm_provider,
                model=self.quick_think_llm,
                **llm_kwargs
            )
            self.quick_thinking_llm = self.quick_client.get_llm()
        except Exception as e:
            print(f"Warning: LLM setup failed: {e}. Using mock mode.")
            self.deep_thinking_llm = None
            self.quick_thinking_llm = None

    def _setup_agents(self):
        """设置所有 Agent"""
        if self.quick_thinking_llm:
            self.supervisor = create_supervisor(self.quick_thinking_llm)
            self.fundamental_analyst = create_fundamental_analyst(self.quick_thinking_llm)
            self.sentiment_analyst = create_sentiment_analyst(self.quick_thinking_llm)
            self.news_analyst = create_news_analyst(self.quick_thinking_llm)
            self.technical_analyst = create_technical_analyst(self.quick_thinking_llm)
            self.synthesizer = create_synthesizer(self.quick_thinking_llm)
            self.risk_evaluator = create_risk_evaluator(self.quick_thinking_llm)
            self.report_generator = create_report_generator(self.quick_thinking_llm)
        else:
            # Mock 模式
            self.supervisor = self._mock_agent("Supervisor")
            self.fundamental_analyst = self._mock_agent("Fundamental Analyst")
            self.sentiment_analyst = self._mock_agent("Sentiment Analyst")
            self.news_analyst = self._mock_agent("News Analyst")
            self.technical_analyst = self._mock_agent("Technical Analyst")
            self.synthesizer = self._mock_agent("Synthesizer")
            self.risk_evaluator = self._mock_agent("Risk Evaluator")
            self.report_generator = self._mock_agent("Report Generator")

    def _mock_agent(self, name: str):
        """创建 Mock Agent"""
        def mock_node(state: dict) -> dict:
            return {
                "messages": [(f"assistant", f"[Mock {name}] 已完成分析")],
                "current_agent": name,
            }
        return mock_node

    def _build_graph(self) -> StateGraph:
        """构建 LangGraph - 并行执行版本 (TradingAgents风格)

        流程:
        START → Supervisor → [4个 Analyst 并行执行]
                               ↓
                         Synthesizer → Risk Evaluator → Report Generator → END
        """
        workflow = StateGraph(ResearchState)

        # 添加节点
        workflow.add_node("Supervisor", self.supervisor)
        workflow.add_node("Fundamental Analyst", self.fundamental_analyst)
        workflow.add_node("Sentiment Analyst", self.sentiment_analyst)
        workflow.add_node("News Analyst", self.news_analyst)
        workflow.add_node("Technical Analyst", self.technical_analyst)
        workflow.add_node("Synthesizer", self.synthesizer)
        workflow.add_node("Risk Evaluator", self.risk_evaluator)
        workflow.add_node("Report Generator", self.report_generator)

        # 定义边 - 并行执行模式
        # 1. START → Supervisor
        workflow.add_edge(START, "Supervisor")

        # 2. Supervisor → 4个 Analyst (并行触发)
        # 添加4条边，LangGraph会并行执行这4个节点
        workflow.add_edge("Supervisor", "Fundamental Analyst")
        workflow.add_edge("Supervisor", "Sentiment Analyst")
        workflow.add_edge("Supervisor", "News Analyst")
        workflow.add_edge("Supervisor", "Technical Analyst")

        # 3. 4个 Analyst → Synthesizer (等待所有Analyst完成)
        # LangGraph的fan-in机制会自动等待所有Analyst完成
        workflow.add_edge("Fundamental Analyst", "Synthesizer")
        workflow.add_edge("Sentiment Analyst", "Synthesizer")
        workflow.add_edge("News Analyst", "Synthesizer")
        workflow.add_edge("Technical Analyst", "Synthesizer")

        # 4. Synthesizer → Risk Evaluator
        workflow.add_edge("Synthesizer", "Risk Evaluator")

        # 5. Risk Evaluator → Report Generator
        workflow.add_edge("Risk Evaluator", "Report Generator")

        # 6. Report Generator → END
        workflow.add_edge("Report Generator", END)

        return workflow.compile()

    def propagate(self, company: str, date: str = None) -> Dict[str, Any]:
        """执行投研分析

        Args:
            company: 股票代码或公司名称
            date: 研究日期（默认今天）

        Returns:
            研究结果包含 final_report
        """
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        # 初始化状态
        init_state = {
            "messages": [("human", f"分析股票: {company}")],
            "company_of_interest": company,
            "trade_date": date,
            "fundamentals_report": {"content": "", "confidence": 0.0, "timestamp": ""},
            "sentiment_report": {"content": "", "confidence": 0.0, "timestamp": ""},
            "news_report": {"content": "", "confidence": 0.0, "timestamp": ""},
            "technical_report": {"content": "", "confidence": 0.0, "timestamp": ""},
            "synthesis_report": "",
            "risk_assessment": {"level": "unknown", "factors": [], "score": 50.0},
            "final_report": "",
            "confidence": 0.0,
            "current_agent": "",
            "is_complete": False,
        }

        # 执行图
        if self.debug:
            # 调试模式：打印每步输出
            for chunk in self.graph.stream(init_state, stream_mode="values"):
                if chunk.get("messages"):
                    last_msg = chunk["messages"][-1]
                    print(f"[{chunk.get('current_agent', 'Unknown')}] {last_msg}")
        else:
            final_state = self.graph.invoke(init_state)

        return final_state

    def get_report(self, company: str, date: str = None) -> str:
        """获取投资简报

        Args:
            company: 股票代码
            date: 研究日期

        Returns:
            Markdown 格式的投资简报
        """
        state = self.propagate(company, date)
        return state.get("final_report", "")


# 便捷函数
def research_stock(company: str, date: str = None) -> Dict[str, Any]:
    """研究股票的便捷函数

    Args:
        company: 股票代码
        date: 研究日期

    Returns:
        研究结果
    """
    graph = ResearchGraph()
    return graph.propagate(company, date)


def get_investment_report(company: str, date: str = None) -> str:
    """获取投资简报的便捷函数

    Args:
        company: 股票代码
        date: 研究日期

    Returns:
        Markdown 格式的投资简报
    """
    graph = ResearchGraph()
    return graph.get_report(company, date)
