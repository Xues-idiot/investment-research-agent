# Rho - Retry Mechanism
# 重试机制

import time
import functools
from typing import Callable, TypeVar, Any

from .utils import logger

T = TypeVar('T')


def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """重试装饰器

    Args:
        max_attempts: 最大尝试次数
        delay: 初始延迟（秒）
        backoff: 退避倍数
        exceptions: 需要重试的异常类型

    Usage:
        @retry(max_attempts=3, delay=1.0)
        def fetch_data():
            ...
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            current_delay = delay
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == max_attempts:
                        logger.error(
                            f"{func.__name__} failed after {max_attempts} attempts: {e}"
                        )
                        raise

                    logger.warning(
                        f"{func.__name__} attempt {attempt}/{max_attempts} failed: {e}. "
                        f"Retrying in {current_delay}s..."
                    )
                    time.sleep(current_delay)
                    current_delay *= backoff

            raise last_exception

        return wrapper

    return decorator


def retry_on_llm_error(max_attempts: int = 3):
    """LLM 错误重试装饰器"""
    from .exceptions import LLMError

    return retry(
        max_attempts=max_attempts,
        delay=2.0,
        backoff=2.0,
        exceptions=(LLMError, ConnectionError, TimeoutError)
    )


def retry_on_data_fetch(max_attempts: int = 3):
    """数据获取重试装饰器"""
    from .exceptions import DataFetchError

    return retry(
        max_attempts=max_attempts,
        delay=1.0,
        backoff=1.5,
        exceptions=(DataFetchError, ConnectionError, TimeoutError)
    )
