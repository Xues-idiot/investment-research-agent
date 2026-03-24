# Rho - Logging Middleware
# Flask 日志中间件

import time
from flask import Flask, request
from functools import wraps
import logging

from .utils import logger


class LoggingMiddleware:
    """Flask 日志中间件"""

    def __init__(self, app: Flask = None):
        self.app = app
        if app:
            self.init_app(app)

    def init_app(self, app: Flask):
        """初始化中间件"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)

    def before_request(self):
        """请求前记录"""
        request.start_time = time.time()
        logger.info(f"→ {request.method} {request.path} - Started")

    def after_request(self, response):
        """请求后记录"""
        if hasattr(request, 'start_time'):
            elapsed = time.time() - request.start_time
            logger.info(
                f"← {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {elapsed:.3f}s"
            )
        return response


def log_function_call(func):
    """日志函数调用装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.debug(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} returned successfully")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} raised {type(e).__name__}: {e}")
            raise
    return wrapper


def setup_middleware(app: Flask):
    """设置所有中间件"""
    LoggingMiddleware(app)
    return app
