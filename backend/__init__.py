# Rho Backend Package
# 投研 Agent 后端

from .config import config, Config
from .exceptions import (
    RhoError,
    StockNotFoundError,
    DataFetchError,
    LLMError,
    ResearchTimeoutError,
    InvalidStockCodeError,
)
from .utils import logger, setup_logger, LogContext
from .cache import SimpleCache, get_cache, cache_result
from .retry import retry, retry_on_llm_error, retry_on_data_fetch
from .errors import ErrorHandler, validate_stock_code
from .health import HealthCheck, get_health_status
from .env import EnvValidator, check_environment

__version__ = "0.1.0"

__all__ = [
    # Config
    "config",
    "Config",
    # Exceptions
    "RhoError",
    "StockNotFoundError",
    "DataFetchError",
    "LLMError",
    "ResearchTimeoutError",
    "InvalidStockCodeError",
    # Utils
    "logger",
    "setup_logger",
    "LogContext",
    # Cache
    "SimpleCache",
    "get_cache",
    "cache_result",
    # Retry
    "retry",
    "retry_on_llm_error",
    "retry_on_data_fetch",
    # Errors
    "ErrorHandler",
    "validate_stock_code",
    # Health
    "HealthCheck",
    "get_health_status",
    # Env
    "EnvValidator",
    "check_environment",
]
