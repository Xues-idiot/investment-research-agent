# Test Financial Data Tools

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.tools.financial_data import (
    get_stock_info,
    get_financials,
    get_income_statement,
    get_balance_sheet,
    get_cashflow,
    get_fundamentals,
    _get_mock_stock_info,
    _get_mock_financials,
)


class TestFinancialData:
    """测试财务数据获取"""

    def test_get_stock_info_valid_code(self):
        """测试获取有效股票代码的信息"""
        info = get_stock_info("600519")
        assert info is not None
        assert "stock_code" in info
        assert info["stock_code"] == "600519"
        assert "name" in info
        assert "price" in info
        assert "pe_ratio" in info

    def test_get_stock_info_invalid_code(self):
        """测试获取无效股票代码"""
        info = get_stock_info("INVALID")
        assert info is not None
        assert info.get("stock_code") == "INVALID"

    def test_get_mock_stock_info(self):
        """测试模拟数据"""
        info = _get_mock_stock_info("600519")
        assert info["name"] == "贵州茅台"
        assert info["price"] == 1680.0
        assert info["pe_ratio"] == 28.5

    def test_get_financials(self):
        """测试获取财务数据"""
        financials = get_financials("600519")
        assert financials is not None
        # 验证结构
        assert "income_statement" in financials or "revenue_growth" in financials

    def test_get_fundamentals(self):
        """测试获取综合基本面数据"""
        fundamentals = get_fundamentals("600519")
        assert fundamentals is not None
        assert "basic_info" in fundamentals
        assert "analysis_date" in fundamentals

    def test_income_statement(self):
        """测试损益表"""
        stmt = get_income_statement("600519")
        assert stmt is not None

    def test_balance_sheet(self):
        """测试资产负债表"""
        sheet = get_balance_sheet("600519")
        assert sheet is not None

    def test_cashflow(self):
        """测试现金流量表"""
        cashflow = get_cashflow("600519")
        assert cashflow is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
