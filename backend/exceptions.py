# Rho - Exceptions
# 自定义异常

class RhoError(Exception):
    """Rho 基础异常"""
    pass


class StockNotFoundError(RhoError):
    """股票代码不存在"""
    pass


class DataFetchError(RhoError):
    """数据获取失败"""
    pass


class LLMError(RhoError):
    """LLM 调用失败"""
    pass


class ResearchTimeoutError(RhoError):
    """研究超时"""
    pass


class InvalidStockCodeError(RhoError):
    """无效的股票代码"""
    pass
