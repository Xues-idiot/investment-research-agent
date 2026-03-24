# Rho - Data Factory
# 数据工厂：根据配置选择不同的数据源

import os
from typing import Optional

from .financial_data import (
    get_stock_info,
    get_financials,
    get_income_statement,
    get_balance_sheet,
    get_cashflow,
    get_fundamentals,
)
from .stock_price import get_stock_price, get_indicators
from .news_search import search_news, search_announcements, analyze_sentiment


class DataFactory:
    """数据工厂类"""

    def __init__(self, use_real_data: bool = False):
        """初始化数据工厂

        Args:
            use_real_data: 是否使用真实数据（需要 API keys）
        """
        self.use_real_data = use_real_data
        self._check_api_keys()

    def _check_api_keys(self) -> None:
        """检查 API keys 是否可用"""
        self._yfinance_available = self._check_yfinance()
        self._tavily_available = bool(os.getenv("TAVILY_API_KEY"))

    def _check_yfinance(self) -> bool:
        """检查 yfinance 是否可用"""
        try:
            import yfinance
            return True
        except ImportError:
            return False

    def get_stock_info(self, stock_code: str) -> dict:
        """获取股票信息"""
        return get_stock_info(stock_code)

    def get_financials(self, stock_code: str) -> dict:
        """获取财务数据"""
        return get_financials(stock_code)

    def get_fundamentals(self, stock_code: str) -> dict:
        """获取综合基本面"""
        return get_fundamentals(stock_code)

    def get_stock_price(self, stock_code: str, period: str = "1y") -> dict:
        """获取股价"""
        return get_stock_price(stock_code, period)

    def get_indicators(self, stock_code: str, period: str = "1y") -> dict:
        """获取技术指标"""
        return get_indicators(stock_code, period)

    def search_news(self, stock_code: str, stock_name: str = None, days: int = 7) -> dict:
        """搜索新闻"""
        return search_news(stock_code, stock_name, days)

    def search_announcements(self, stock_code: str) -> dict:
        """搜索公告"""
        return search_announcements(stock_code)

    def analyze_sentiment(self, news_items: list) -> dict:
        """分析情绪"""
        return analyze_sentiment(news_items)


# 全局数据工厂实例
_data_factory: Optional[DataFactory] = None


def get_data_factory() -> DataFactory:
    """获取全局数据工厂实例"""
    global _data_factory
    if _data_factory is None:
        _data_factory = DataFactory()
    return _data_factory
