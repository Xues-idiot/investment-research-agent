# Rho - Error Handler
# 全局错误处理

import traceback
from functools import wraps
from typing import Callable, Any

from .exceptions import (
    RhoError,
    StockNotFoundError,
    DataFetchError,
    LLMError,
    ResearchTimeoutError,
    InvalidStockCodeError,
)
from .utils import logger


class ErrorHandler:
    """错误处理器"""

    @staticmethod
    def handle_error(error: Exception, context: str = "") -> dict:
        """处理错误并返回标准化响应"""
        error_type = type(error).__name__
        error_message = str(error)

        if context:
            logger.error(f"[{context}] {error_type}: {error_message}")
        else:
            logger.error(f"{error_type}: {error_message}")

        # 根据错误类型返回不同的处理结果
        if isinstance(error, StockNotFoundError):
            return {
                "success": False,
                "error_type": "stock_not_found",
                "message": f"股票不存在: {error_message}",
            }
        elif isinstance(error, InvalidStockCodeError):
            return {
                "success": False,
                "error_type": "invalid_stock_code",
                "message": f"无效的股票代码: {error_message}",
            }
        elif isinstance(error, DataFetchError):
            return {
                "success": False,
                "error_type": "data_fetch_error",
                "message": f"数据获取失败: {error_message}",
            }
        elif isinstance(error, LLMError):
            return {
                "success": False,
                "error_type": "llm_error",
                "message": f"LLM 调用失败: {error_message}",
            }
        elif isinstance(error, ResearchTimeoutError):
            return {
                "success": False,
                "error_type": "timeout",
                "message": f"研究超时: {error_message}",
            }
        else:
            logger.error(traceback.format_exc())
            return {
                "success": False,
                "error_type": "internal_error",
                "message": f"内部错误: {error_message}",
            }


def with_error_handling(func: Callable) -> Callable:
    """错误处理装饰器"""

    @wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        try:
            return func(*args, **kwargs)
        except Exception as e:
            handler = ErrorHandler()
            return handler.handle_error(e, context=func.__name__)

    return wrapper


def validate_stock_code(stock_code: str) -> bool:
    """验证股票代码格式

    Args:
        stock_code: 股票代码

    Returns:
        是否有效
    """
    if not stock_code:
        return False

    # A股股票代码: 6位数字
    if stock_code.isdigit() and len(stock_code) == 6:
        return True

    # 港股股票代码: 5位数字
    if stock_code.isdigit() and len(stock_code) == 5:
        return True

    # 美股股票代码: 字母
    if stock_code.isalpha() and len(stock_code) <= 5:
        return True

    return False
