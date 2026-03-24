# Test Agent Prompts

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.research_state import ResearchState


class TestAgentPrompts:
    """测试 Agent prompts 生成"""

    def test_financial_context_format(self):
        """测试财务上下文格式"""
        from backend.tools.financial_data import _get_mock_stock_info, _get_mock_financials

        info = _get_mock_stock_info("600519")
        financials = _get_mock_financials("600519")

        assert "stock_code" in info
        assert "name" in info
        assert "pe_ratio" in info
        assert "revenue_growth" in financials

    def test_sentiment_context_format(self):
        """测试情绪分析上下文"""
        from backend.tools.news_search import _get_mock_news, analyze_sentiment

        news = _get_mock_news("600519", "贵州茅台")
        sentiment = analyze_sentiment(news["articles"])

        assert news["query"] == "贵州茅台 600519"
        assert sentiment["overall_sentiment"] == "positive"
        assert sentiment["positive_count"] >= sentiment["negative_count"]

    def test_technical_context_format(self):
        """测试技术分析上下文"""
        from backend.tools.stock_price import _get_mock_price, _get_mock_indicators

        price = _get_mock_price("600519")
        indicators = _get_mock_indicators("600519")

        assert price["current_price"] > 0
        assert indicators["rsi_14"] > 0
        assert indicators["trend"] in ["bullish", "bearish", "neutral"]


class TestRiskEvaluator:
    """测试风险评估"""

    def test_risk_level_extraction(self):
        """测试风险等级提取"""
        from backend.agents.risk_evaluator import _extract_risk_level

        assert _extract_risk_level("这是高风险") == "high"
        assert _extract_risk_level("这是低风险") == "low"
        assert _extract_risk_level("这是中等风险") == "medium"
        assert _extract_risk_level("无风险信息") == "medium"

    def test_risk_score_extraction(self):
        """测试风险评分提取"""
        from backend.agents.risk_evaluator import _extract_risk_score

        assert _extract_risk_score("风险评分: 75") == 75
        assert _extract_risk_score("评分为80分") == 80
        assert _extract_risk_score("无评分信息") == 50.0

    def test_risk_factors_extraction(self):
        """测试风险因素提取"""
        from backend.agents.risk_evaluator import _extract_risk_factors

        content = """
        主要风险因素：
        1. 市场波动性大
        2. 行业竞争加剧
        3. 政策风险
        """
        factors = _extract_risk_factors(content)
        assert len(factors) >= 2


class TestConfidenceCalculation:
    """测试置信度计算"""

    def test_fundamental_confidence(self):
        """测试基本面置信度提取"""
        from backend.agents.fundamental import _extract_confidence

        assert _extract_confidence('{"confidence": 0.85}') == 0.85
        assert _extract_confidence("无置信度信息") == 0.7

    def test_technical_confidence(self):
        """测试技术分析置信度"""
        from backend.agents.technical import _calculate_technical_confidence

        # RSI 在正常区间
        indicators1 = {"rsi_14": 50, "macd": 10, "macd_signal": 5}
        conf1 = _calculate_technical_confidence(indicators1)
        assert conf1 >= 0.7

        # RSI 超买
        indicators2 = {"rsi_14": 80, "macd": 1, "macd_signal": 0.5}
        conf2 = _calculate_technical_confidence(indicators2)
        assert conf2 <= conf1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
