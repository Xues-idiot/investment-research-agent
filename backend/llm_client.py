# Rho - LLM Client
# LLM 客户端工厂：根据配置创建不同的 LLM 客户端

import os
from typing import Optional, Any

# 尝试导入各 LLM 客户端
try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_OPENAI_AVAILABLE = True
except ImportError:
    LANGCHAIN_OPENAI_AVAILABLE = False

try:
    from langchain_anthropic import ChatAnthropic
    LANGCHAIN_ANTHROPIC_AVAILABLE = True
except ImportError:
    LANGCHAIN_ANTHROPIC_AVAILABLE = False

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    LANGCHAIN_GOOGLE_AVAILABLE = True
except ImportError:
    LANGCHAIN_GOOGLE_AVAILABLE = False


class LLMClient:
    """LLM 客户端封装"""

    def __init__(self, provider: str, model: str, **kwargs):
        self.provider = provider.lower()
        self.model = model
        self.kwargs = kwargs
        self._llm = None

    def get_llm(self):
        """获取 LLM 实例"""
        if self._llm is not None:
            return self._llm

        if self.provider == "openai":
            self._llm = self._create_openai_llm()
        elif self.provider == "anthropic":
            self._llm = self._create_anthropic_llm()
        elif self.provider == "google":
            self._llm = self._create_google_llm()
        elif self.provider == "minimax":
            self._llm = self._create_minimax_llm()
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

        return self._llm

    def _create_openai_llm(self):
        """创建 OpenAI LLM"""
        if not LANGCHAIN_OPENAI_AVAILABLE:
            raise ImportError("langchain-openai is not installed")

        api_key = self.kwargs.get("api_key") or os.getenv("OPENAI_API_KEY")
        base_url = self.kwargs.get("base_url") or os.getenv("OPENAI_BASE_URL")

        return ChatOpenAI(
            model=self.model,
            api_key=api_key,
            base_url=base_url,
            **self.kwargs
        )

    def _create_anthropic_llm(self):
        """创建 Anthropic LLM"""
        if not LANGCHAIN_ANTHROPIC_AVAILABLE:
            raise ImportError("langchain-anthropic is not installed")

        api_key = self.kwargs.get("api_key") or os.getenv("ANTHROPIC_API_KEY")
        base_url = self.kwargs.get("base_url") or os.getenv("ANTHROPIC_BASE_URL")

        return ChatAnthropic(
            model=self.model,
            api_key=api_key,
            base_url=base_url,
            **self.kwargs
        )

    def _create_google_llm(self):
        """创建 Google LLM"""
        if not LANGCHAIN_GOOGLE_AVAILABLE:
            raise ImportError("langchain-google-genai is not installed")

        api_key = self.kwargs.get("api_key") or os.getenv("GOOGLE_API_KEY")

        return ChatGoogleGenerativeAI(
            model=self.model,
            api_key=api_key,
            **self.kwargs
        )

    def _create_minimax_llm(self):
        """创建 MiniMax LLM (使用 OpenAI 兼容接口)"""
        if not LANGCHAIN_OPENAI_AVAILABLE:
            raise ImportError("langchain-openai is required for MiniMax")

        api_key = self.kwargs.get("api_key") or os.getenv("MINIMAX_API_KEY")
        base_url = self.kwargs.get("base_url") or os.getenv("MINIMAX_BASE_URL", "https://api.minimaxi.com/anthropic")

        # 移除已单独处理的参数，避免重复传递
        kwargs = {k: v for k, v in self.kwargs.items() if k not in ("api_key", "base_url")}

        return ChatOpenAI(
            model=self.model,
            api_key=api_key,
            base_url=base_url,
            **kwargs
        )


def create_llm_client(provider: str, model: str, **kwargs) -> LLMClient:
    """LLM 客户端工厂函数

    Args:
        provider: LLM 提供商 (openai, anthropic, google, minimax)
        model: 模型名称
        **kwargs: 其他参数

    Returns:
        LLMClient 实例
    """
    return LLMClient(provider, model, **kwargs)
