# Test Error Handler

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.errors import ErrorHandler, validate_stock_code
from backend.exceptions import (
    RhoError,
    StockNotFoundError,
    DataFetchError,
    LLMError,
    ResearchTimeoutError,
    InvalidStockCodeError,
)


class TestErrorHandler:
    """测试错误处理器"""

    def test_handle_rho_error(self):
        """测试 Rho 错误处理"""
        handler = ErrorHandler()
        error = RhoError("Test error")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert "message" in result

    def test_handle_stock_not_found(self):
        """测试股票不存在错误"""
        handler = ErrorHandler()
        error = StockNotFoundError("600999")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "stock_not_found"
        assert "600999" in result["message"]

    def test_handle_invalid_stock_code(self):
        """测试无效股票代码错误"""
        handler = ErrorHandler()
        error = InvalidStockCodeError("INVALID")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "invalid_stock_code"

    def test_handle_data_fetch_error(self):
        """测试数据获取错误"""
        handler = ErrorHandler()
        error = DataFetchError("Network error")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "data_fetch_error"

    def test_handle_llm_error(self):
        """测试 LLM 错误"""
        handler = ErrorHandler()
        error = LLMError("API error")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "llm_error"

    def test_handle_timeout_error(self):
        """测试超时错误"""
        handler = ErrorHandler()
        error = ResearchTimeoutError("Timeout")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "timeout"

    def test_handle_unknown_error(self):
        """测试未知错误"""
        handler = ErrorHandler()
        error = RuntimeError("Unknown error")
        result = handler.handle_error(error)

        assert result["success"] == False
        assert result["error_type"] == "internal_error"


class TestValidateStockCode:
    """测试股票代码验证函数"""

    def test_validate_a_stock_code(self):
        """测试 A 股股票代码"""
        assert validate_stock_code("600519") == True
        assert validate_stock_code("000858") == True

    def test_validate_hk_stock_code(self):
        """测试港股股票代码"""
        assert validate_stock_code("00700") == True
        assert validate_stock_code("09988") == True

    def test_validate_us_stock_code(self):
        """测试美股股票代码"""
        assert validate_stock_code("AAPL") == True
        assert validate_stock_code("GOOGL") == True

    def test_validate_invalid_codes(self):
        """测试无效股票代码"""
        assert validate_stock_code("") == False
        assert validate_stock_code("123") == False  # 太短
        assert validate_stock_code("1234567") == False  # 太长
        assert validate_stock_code("INVALID") == False
        assert validate_stock_code("60051") == False  # A股5位


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
