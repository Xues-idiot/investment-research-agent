# Rho - News Search Tools
# 获取股票新闻和公告数据

import os
import json
from datetime import datetime, timedelta
from typing import Optional, List

# Tavily API 配置
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")


def search_news(stock_code: str, stock_name: str = None, days: int = 7) -> dict:
    """搜索股票相关新闻

    Args:
        stock_code: 股票代码
        stock_name: 公司名称（可选）
        days: 搜索最近天数

    Returns:
        新闻数据
    """
    if not stock_name:
        stock_name = stock_code

    query = f"{stock_name} {stock_code} 股票"

    # 如果有 Tavily API Key，使用它
    if TAVILY_API_KEY:
        return _search_with_tavily(query, days)

    # 否则返回模拟数据
    return _get_mock_news(stock_code, stock_name)


def search_announcements(stock_code: str) -> dict:
    """搜索股票公告

    Args:
        stock_code: 股票代码

    Returns:
        公告数据
    """
    # 模拟公告数据
    return _get_mock_announcements(stock_code)


def analyze_sentiment(news_items: List[dict]) -> dict:
    """分析新闻情绪

    Args:
        news_items: 新闻列表

    Returns:
        情绪分析结果
    """
    if not news_items:
        return {
            "overall_sentiment": "neutral",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
            "sentiment_score": 0.5,
        }

    positive = sum(1 for item in news_items if item.get("sentiment", "neutral") == "positive")
    negative = sum(1 for item in news_items if item.get("sentiment", "neutral") == "negative")
    neutral = len(news_items) - positive - negative

    sentiment_score = (positive * 1.0 + neutral * 0.5) / len(news_items) if news_items else 0.5

    return {
        "overall_sentiment": "positive" if sentiment_score > 0.6 else "negative" if sentiment_score < 0.4 else "neutral",
        "positive_count": positive,
        "negative_count": negative,
        "neutral_count": neutral,
        "sentiment_score": sentiment_score,
    }


def _search_with_tavily(query: str, days: int) -> dict:
    """使用 Tavily API 搜索新闻"""
    try:
        import requests

        url = "https://api.tavily.com/search"
        headers = {
            "Authorization": f"Bearer {TAVILY_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "query": query,
            "search_depth": "basic",
            "max_results": 10
        }

        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code == 200:
            results = response.json()
            return {
                "query": query,
                "articles": results.get("results", []),
                "search_time": results.get("search_time", 0),
            }
    except Exception as e:
        print(f"Tavily API error: {e}")

    return _get_mock_news(query, query)


def _get_mock_news(stock_code: str, stock_name: str) -> dict:
    """获取模拟新闻数据"""
    mock_articles = [
        {
            "title": f"{stock_name} 2024年年报营收同比增长12%",
            "url": "https://example.com/news/1",
            "published_date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "sentiment": "positive",
            "summary": f"{stock_name} 发布2024年年报，营业收入和净利润均实现两位数增长。",
        },
        {
            "title": f"{stock_name} 新产品市场反响热烈",
            "url": "https://example.com/news/2",
            "published_date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
            "sentiment": "positive",
            "summary": f"{stock_name} 推出的新产品在市场上表现超预期，获得消费者广泛认可。",
        },
        {
            "title": f"分析师上调 {stock_name} 目标价",
            "url": "https://example.com/news/3",
            "published_date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
            "sentiment": "positive",
            "summary": "多家券商发布研报，上调公司目标价，看好未来发展前景。",
        },
        {
            "title": f"{stock_name} 面临行业竞争加剧挑战",
            "url": "https://example.com/news/4",
            "published_date": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
            "sentiment": "negative",
            "summary": "行业分析报告指出，市场竞争日益激烈，可能对公司盈利能力构成压力。",
        },
    ]

    return {
        "query": f"{stock_name} {stock_code}",
        "articles": mock_articles,
        "search_time": 0.5,
    }


def _get_mock_announcements(stock_code: str) -> dict:
    """获取模拟公告数据"""
    return {
        "stock_code": stock_code,
        "announcements": [
            {
                "title": "2024年年度报告",
                "date": "2025-03-15",
                "type": "annual_report",
                "summary": "公司2024年年度报告，营收同比增长12%，净利润同比增长14%。",
            },
            {
                "title": "关于计提资产减值准备的公告",
                "date": "2025-03-10",
                "type": "other",
                "summary": "公司按照会计准则计提相关资产减值准备，影响当期利润。",
            },
            {
                "title": "2024年度利润分配方案",
                "date": "2025-03-01",
                "type": "dividend",
                "summary": "拟每10股派发现金红利XX元（含税），共计派发XX亿元。",
            },
        ]
    }
