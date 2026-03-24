# Rho - Health Check
# 健康检查模块

import os
import psutil
from datetime import datetime
from typing import Dict, Any

from .config import config


class HealthCheck:
    """健康检查"""

    @staticmethod
    def get_system_info() -> Dict[str, Any]:
        """获取系统信息"""
        return {
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
        }

    @staticmethod
    def get_status() -> Dict[str, Any]:
        """获取完整状态"""
        system_info = HealthCheck.get_system_info()

        return {
            "status": "healthy",
            "service": "rho-research-agent",
            "version": "0.1.0",
            "timestamp": datetime.now().isoformat(),
            "config": {
                "llm_provider": config.LLM_PROVIDER,
                "api_port": config.API_PORT,
                "frontend_port": config.FRONTEND_PORT,
            },
            "environment": {
                "llm_configured": bool(config.MINIMAX_API_KEY or config.OPENAI_API_KEY),
                "tavily_configured": bool(config.TAVILY_API_KEY),
            },
            "system": system_info,
        }

    @classmethod
    def is_healthy(cls) -> bool:
        """检查是否健康"""
        try:
            system_info = cls.get_system_info()

            # 检查 CPU 使用率
            if system_info["cpu_percent"] > 90:
                return False

            # 检查内存使用率
            if system_info["memory_percent"] > 90:
                return False

            return True
        except Exception:
            return False


def get_health_status() -> Dict[str, Any]:
    """获取健康状态"""
    return HealthCheck.get_status()
