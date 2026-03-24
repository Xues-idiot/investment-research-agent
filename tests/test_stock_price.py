# Test Stock Price Tools

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.tools.stock_price import (
    get_stock_price,
    get_indicators,
    _get_mock_price,
    _get_mock_indicators,
)


class TestStockPrice:
    """测试股价数据获取"""

    def test_get_stock_price(self):
        """测试获取股价数据"""
        price = get_stock_price("600519")
        assert price is not None
        assert "stock_code" in price
        assert "current_price" in price
        assert "open" in price
        assert "high" in price
        assert "low" in price
        assert "volume" in price

    def test_get_indicators(self):
        """测试获取技术指标"""
        indicators = get_indicators("600519")
        assert indicators is not None
        assert "stock_code" in indicators
        assert "current_price" in indicators
        assert "sma_20" in indicators
        assert "sma_50" in indicators
        assert "rsi_14" in indicators
        assert "macd" in indicators

    def test_mock_price(self):
        """测试模拟价格数据"""
        price = _get_mock_price("600519")
        assert price["stock_code"] == "600519"
        assert price["current_price"] == 1680.0
        assert price["price_change_pct"] == 0.30

    def test_mock_indicators(self):
        """测试模拟技术指标"""
        indicators = _get_mock_indicators("600519")
        assert indicators["sma_20"] == 1650.0
        assert indicators["sma_50"] == 1620.0
        assert indicators["rsi_14"] == 58.5
        assert indicators["trend"] == "bullish"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
