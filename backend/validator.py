# Rho - Stock Validator
# 股票代码验证

import re
from typing import Optional, Tuple

from .exceptions import InvalidStockCodeError, StockNotFoundError


class StockValidator:
    """股票代码验证器"""

    # A股股票代码模式 (6位数字)
    A_STOCK_PATTERN = re.compile(r'^\d{6}$')

    # 港股股票代码模式 (5位数字)
    HK_STOCK_PATTERN = re.compile(r'^\d{5}$')

    # 美股股票代码模式 (1-5个字母)
    US_STOCK_PATTERN = re.compile(r'^[A-Za-z]{1,5}$')

    @classmethod
    def validate(cls, stock_code: str) -> Tuple[bool, str]:
        """验证股票代码

        Args:
            stock_code: 股票代码

        Returns:
            (是否有效, 市场类型)
            市场类型: "A", "HK", "US", "unknown"
        """
        if not stock_code:
            return False, "unknown"

        stock_code = stock_code.strip().upper()

        # A股
        if cls.A_STOCK_PATTERN.match(stock_code):
            return True, "A"

        # 港股
        if cls.HK_STOCK_PATTERN.match(stock_code):
            return True, "HK"

        # 美股
        if cls.US_STOCK_PATTERN.match(stock_code):
            return True, "US"

        return False, "unknown"

    @classmethod
    def get_market_prefix(cls, stock_code: str, market: str) -> str:
        """获取股票市场的后缀

        Args:
            stock_code: 股票代码
            market: 市场类型

        Returns:
            带后缀的股票代码 (如 600519.SS)
        """
        if market == "A":
            # 上交所 .SS, 深交所 .SZ
            if stock_code.startswith(('6', '9')):
                return f"{stock_code}.SS"
            else:
                return f"{stock_code}.SZ"
        elif market == "HK":
            return f"{stock_code}.HK"
        elif market == "US":
            return stock_code.upper()
        return stock_code

    @classmethod
    def get_stock_name(cls, stock_code: str) -> Optional[str]:
        """获取股票名称（简单映射）

        Args:
            stock_code: 股票代码

        Returns:
            股票名称或 None
        """
        # 常用股票映射
        stocks = {
            "600519": "贵州茅台",
            "000858": "五粮液",
            "000333": "美的集团",
            "600036": "招商银行",
            "601318": "中国平安",
            "000002": "万科A",
            "600276": "恒瑞医药",
            "300750": "宁德时代",
            "002475": "立讯精密",
            "600030": "中信证券",
        }

        return stocks.get(stock_code)

    @classmethod
    def is_valid(cls, stock_code: str) -> bool:
        """快速验证股票代码是否有效"""
        valid, _ = cls.validate(stock_code)
        return valid


def validate_stock(stock_code: str) -> str:
    """验证并返回市场类型

    Args:
        stock_code: 股票代码

    Returns:
        市场类型

    Raises:
        InvalidStockCodeError: 股票代码无效
    """
    valid, market = StockValidator.validate(stock_code)

    if not valid:
        raise InvalidStockCodeError(
            f"无效的股票代码: {stock_code}。"
            "请输入6位A股代码、5位港股代码或1-5位美股代码。"
        )

    return market
