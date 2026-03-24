# Rho - Configuration
# 配置管理

import os
from pathlib import Path
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# 加载 .env 文件
project_root = Path(__file__).parent.parent
env_file = project_root / ".env"
if env_file.exists():
    load_dotenv(env_file)


class Config:
    """Rho 配置类"""

    # LLM 配置
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "minimax")
    DEEP_THINK_LLM: str = os.getenv("DEEP_THINK_LLM", "MiniMax-Text-01")
    QUICK_THINK_LLM: str = os.getenv("QUICK_THINK_LLM", "MiniMax-Text-01")

    # API Keys
    MINIMAX_API_KEY: str = os.getenv("MINIMAX_API_KEY", "")
    MINIMAX_BASE_URL: str = os.getenv("MINIMAX_BASE_URL", "https://api.minimaxi.com/anthropic")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    # 数据源
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # 服务器配置 - 端口已更新
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))  # 更新为 8001

    # 前端配置 - 端口已更新为 3444
    FRONTEND_PORT: int = 3444

    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_DIR: Path = project_root / "logs"

    # 缓存配置
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))

    # LangGraph 配置
    MAX_RECURSION_LIMIT: int = int(os.getenv("MAX_RECURSION_LIMIT", "100"))

    # 研究配置
    DEFAULT_STOCK_PERIOD: str = os.getenv("DEFAULT_STOCK_PERIOD", "1y")
    NEWS_DAYS: int = int(os.getenv("NEWS_DAYS", "7"))

    # 配色方案 (投研项目特色)
    COLORS = {
        "primary": "#1E3A5F",      # 深蓝 - 金融、专业感
        "secondary": "#2D5A4A",    # 墨绿 - 沉稳、信任
        "accent": "#C9A227",       # 金色 - 高端、价值
        "background": "#1A1A2E",   # 深灰 - 数据看板感
        "text": "#FFFFFF",         # 白色高对比度
        "text_secondary": "#A0A0A0",  # 浅灰
    }

    @classmethod
    def get_llm_config(cls) -> Dict[str, Any]:
        """获取 LLM 配置"""
        return {
            "provider": cls.LLM_PROVIDER,
            "deep_think_llm": cls.DEEP_THINK_LLM,
            "quick_think_llm": cls.QUICK_THINK_LLM,
        }

    @classmethod
    def validate(cls) -> bool:
        """验证配置是否有效"""
        has_api_key = any([
            cls.MINIMAX_API_KEY,
            cls.OPENAI_API_KEY,
            cls.ANTHROPIC_API_KEY,
        ])
        return has_api_key

    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        """转换为字典"""
        return {
            key: getattr(cls, key)
            for key in dir(cls)
            if key.isupper() and not key.startswith('_')
        }


# 全局配置实例
config = Config()
