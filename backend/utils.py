# Rho - Logger
# 日志记录模块

import logging
import os
from datetime import datetime
from pathlib import Path


def setup_logger(name: str = "rho", level: int = logging.INFO) -> logging.Logger:
    """设置日志记录器

    Args:
        name: 日志记录器名称
        level: 日志级别

    Returns:
        配置好的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # 避免重复添加 handler
    if logger.handlers:
        return logger

    # 控制台 handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)

    # 格式化
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    # 文件 handler
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    file_handler = logging.FileHandler(
        log_dir / f"rho_{datetime.now().strftime('%Y%m%d')}.log",
        encoding="utf-8"
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger


# 全局日志记录器
logger = setup_logger()


class LogContext:
    """日志上下文管理器"""

    def __init__(self, logger: logging.Logger, context: str):
        self.logger = logger
        self.context = context

    def __enter__(self):
        self.logger.info(f"=== 开始: {self.context} ===")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.logger.error(f"=== 错误: {self.context} ===", exc_info=True)
        else:
            self.logger.info(f"=== 完成: {self.context} ===")
