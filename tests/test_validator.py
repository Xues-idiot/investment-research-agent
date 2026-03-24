# Test Stock Validator

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.validator import StockValidator, validate_stock
from backend.exceptions import InvalidStockCodeError


class TestStockValidator:
    """测试股票验证器"""

    def test_validate_a_stock(self):
        """测试A股验证"""
        valid, market = StockValidator.validate("600519")
        assert valid == True
        assert market == "A"

    def test_validate_shenzhen_stock(self):
        """测试深交所股票"""
        valid, market = StockValidator.validate("000858")
        assert valid == True
        assert market == "A"

    def test_validate_hk_stock(self):
        """测试港股验证"""
        valid, market = StockValidator.validate("00700")
        assert valid == True
        assert market == "HK"

    def test_validate_us_stock(self):
        """测试美股验证"""
        valid, market = StockValidator.validate("AAPL")
        assert valid == True
        assert market == "US"

    def test_validate_invalid(self):
        """测试无效代码"""
        valid, market = StockValidator.validate("INVALID")
        assert valid == False
        assert market == "unknown"

    def test_validate_empty(self):
        """测试空字符串"""
        valid, market = StockValidator.validate("")
        assert valid == False

    def test_get_market_prefix_shanghai(self):
        """测试上交所前缀"""
        prefix = StockValidator.get_market_prefix("600519", "A")
        assert prefix == "600519.SS"

    def test_get_market_prefix_shenzhen(self):
        """测试深交所前缀"""
        prefix = StockValidator.get_market_prefix("000858", "A")
        assert prefix == "000858.SZ"

    def test_get_market_prefix_hk(self):
        """测试港交所前缀"""
        prefix = StockValidator.get_market_prefix("00700", "HK")
        assert prefix == "00700.HK"

    def test_get_market_prefix_us(self):
        """测试美交所前缀"""
        prefix = StockValidator.get_market_prefix("AAPL", "US")
        assert prefix == "AAPL"

    def test_get_stock_name(self):
        """测试获取股票名称"""
        name = StockValidator.get_stock_name("600519")
        assert name == "贵州茅台"

    def test_get_stock_name_unknown(self):
        """测试未知股票"""
        name = StockValidator.get_stock_name("999999")
        assert name is None

    def test_is_valid(self):
        """测试快速验证"""
        assert StockValidator.is_valid("600519") == True
        assert StockValidator.is_valid("AAPL") == True
        assert StockValidator.is_valid("INVALID") == False


class TestValidateStock:
    """测试 validate_stock 函数"""

    def test_validate_stock_success(self):
        """测试验证成功"""
        market = validate_stock("600519")
        assert market == "A"

    def test_validate_stock_invalid(self):
        """测试验证失败"""
        with pytest.raises(InvalidStockCodeError):
            validate_stock("INVALID")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
