# Rho - News Analyst Agent
# 新闻分析：最新新闻、公司公告、行业动态

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate

from .research_state import AnalystReport
from ..tools.news_search import search_news, search_announcements
from ..prompts import NEWS_ANALYST_PROMPT


def create_news_analyst(llm):
    """创建新闻分析 Agent"""

    def news_analyst_node(state: dict) -> dict:
        """新闻分析节点"""
        stock_code = state.get("company_of_interest", "")
        # company_name 不存在于 state，使用 stock_code 代替
        stock_name = stock_code

        # 获取新闻和公告
        news_data = search_news(stock_code, stock_name, days=14)
        announcements = search_announcements(stock_code)

        # 构建上下文
        context = _build_news_context(stock_code, stock_name, news_data, announcements)

        # 使用模板
        prompt_template = NEWS_ANALYST_PROMPT.format(news_data=context)
        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_template),
            ("human", f"请分析股票 {stock_code} ({stock_name}) 的最新新闻和公告。")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        report_content = result.content if hasattr(result, 'content') else str(result)

        report: AnalystReport = {
            "content": report_content,
            "confidence": 0.7,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        return {
            "messages": [result],
            "news_report": report,
            "current_agent": "News Analyst",
        }

    return news_analyst_node


def _build_news_context(stock_code: str, stock_name: str, news_data: dict, announcements: dict) -> str:
    """构建新闻分析上下文"""
    articles = news_data.get("articles", [])
    news_text = "\n".join([
        f"- [{article.get('published_date', '')}] {article.get('title', '')}"
        for article in articles
    ]) if articles else "暂无新闻数据"

    ann_list = announcements.get("announcements", [])
    ann_text = "\n".join([
        f"- [{ann.get('date', '')}] [{ann.get('type', '')}] {ann.get('title', '')}: {ann.get('summary', '')}"
        for ann in ann_list
    ]) if ann_list else "暂无公告数据"

    context = f"""
=== 股票信息 ===
{stock_code} ({stock_name})

=== 最新新闻 (近14天) ===
{news_text}

=== 公司公告 ===
{ann_text}
"""
    return context
