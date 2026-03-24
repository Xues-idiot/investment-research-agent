# Test Research State

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.research_state import (
    ResearchState,
    AnalystReport,
    RiskAssessment,
)


class TestResearchState:
    """测试研究状态"""

    def test_analyst_report_structure(self):
        """测试分析师报告结构"""
        report: AnalystReport = {
            "content": "测试内容",
            "confidence": 0.75,
            "timestamp": "2026-03-24 10:00:00",
        }
        assert report["content"] == "测试内容"
        assert report["confidence"] == 0.75
        assert report["timestamp"] == "2026-03-24 10:00:00"

    def test_risk_assessment_structure(self):
        """测试风险评估结构"""
        risk: RiskAssessment = {
            "level": "medium",
            "factors": ["市场风险", "行业风险"],
            "score": 50.0,
        }
        assert risk["level"] == "medium"
        assert risk["score"] == 50.0
        assert len(risk["factors"]) == 2

    def test_research_state_default_values(self):
        """测试研究状态默认值"""
        state: ResearchState = {
            "messages": [],
            "company_of_interest": "600519",
            "trade_date": "2026-03-24",
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
        assert state["company_of_interest"] == "600519"
        assert state["is_complete"] == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
