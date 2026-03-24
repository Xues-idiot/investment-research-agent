# Rho - Sentiment Analyst Agent
# 情绪分析：新闻情绪、社交媒体情绪、分析师评级等

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate

from .research_state import AnalystReport
from ..tools.news_search import search_news, analyze_sentiment
from ..prompts import SENTIMENT_ANALYST_PROMPT


def create_sentiment_analyst(llm):
    """创建情绪分析 Agent"""

    def sentiment_analyst_node(state: dict) -> dict:
        """情绪分析节点"""
        stock_code = state.get("company_of_interest", "")
        stock_name = state.get("company_name", stock_code)

        # 获取新闻数据
        news_data = search_news(stock_code, stock_name, days=7)
        articles = news_data.get("articles", [])

        # 分析情绪
        sentiment_analysis = analyze_sentiment(articles)

        # 构建上下文
        context = _build_sentiment_context(stock_code, articles, sentiment_analysis)

        # 使用模板
        prompt_template = SENTIMENT_ANALYST_PROMPT.format(sentiment_data=context)
        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_template),
            ("human", f"请分析股票 {stock_code} 的市场情绪数据。")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        report_content = result.content if hasattr(result, 'content') else str(result)

        report: AnalystReport = {
            "content": report_content,
            "confidence": sentiment_analysis.get("sentiment_score", 0.5),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        return {
            "messages": [result],
            "sentiment_report": report,
            "current_agent": "Sentiment Analyst",
        }

    return sentiment_analyst_node


def _build_sentiment_context(stock_code: str, articles: list, sentiment_analysis: dict) -> str:
    """构建情绪分析上下文"""
    # 分类整理新闻
    positive_articles = [a for a in articles if a.get('sentiment') == 'positive']
    negative_articles = [a for a in articles if a.get('sentiment') == 'negative']
    neutral_articles = [a for a in articles if a.get('sentiment') == 'neutral']

    positive_text = "\n".join([
        f"- {article.get('title', '')} ({article.get('published_date', '')})"
        for article in positive_articles[:5]
    ]) if positive_articles else "无"

    negative_text = "\n".join([
        f"- {article.get('title', '')} ({article.get('published_date', '')})"
        for article in negative_articles[:5]
    ]) if negative_articles else "无"

    context = f"""
=== 股票代码 ===
{stock_code}

=== 新闻统计 ===
正面新闻: {len(positive_articles)} 篇
负面新闻: {len(negative_articles)} 篇
中性新闻: {len(neutral_articles)} 篇
情绪得分: {sentiment_analysis.get('sentiment_score', 0):.2f} (0=极度负面, 1=极度正面)
总体情绪: {sentiment_analysis.get('overall_sentiment', 'unknown')}

=== 重点正面舆情 ===
{positive_text}

=== 重点负面舆情 ===
{negative_text}

=== 新闻详情 ===
{chr(10).join([
    f"- [{article.get('sentiment', 'neutral')}] {article.get('title', '')} - {article.get('source', 'unknown')}"
    for article in articles[:10]
]) if articles else "暂无新闻数据"}
"""
    return context
