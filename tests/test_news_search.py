# Test News Search Tools

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.tools.news_search import (
    search_news,
    search_announcements,
    analyze_sentiment,
    _get_mock_news,
    _get_mock_announcements,
)


class TestNewsSearch:
    """测试新闻搜索"""

    def test_search_news(self):
        """测试搜索新闻"""
        news = search_news("600519", "贵州茅台")
        assert news is not None
        assert "articles" in news
        assert len(news["articles"]) > 0

    def test_search_announcements(self):
        """测试搜索公告"""
        ann = search_announcements("600519")
        assert ann is not None
        assert "announcements" in ann

    def test_analyze_sentiment(self):
        """测试情绪分析"""
        articles = [
            {"sentiment": "positive"},
            {"sentiment": "positive"},
            {"sentiment": "neutral"},
            {"sentiment": "negative"},
        ]
        result = analyze_sentiment(articles)
        assert result["overall_sentiment"] == "positive"
        assert result["positive_count"] == 2
        assert result["neutral_count"] == 1
        assert result["negative_count"] == 1

    def test_analyze_sentiment_empty(self):
        """测试空情绪分析"""
        result = analyze_sentiment([])
        assert result["overall_sentiment"] == "neutral"
        assert result["sentiment_score"] == 0.5

    def test_mock_news(self):
        """测试模拟新闻"""
        news = _get_mock_news("600519", "贵州茅台")
        assert len(news["articles"]) == 4
        assert news["query"] == "贵州茅台 600519"

    def test_mock_announcements(self):
        """测试模拟公告"""
        ann = _get_mock_announcements("600519")
        assert len(ann["announcements"]) == 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
