# Rho - Environment Validator
# 环境变量验证

import os
from typing import List, Tuple


class EnvValidator:
    """环境变量验证器"""

    REQUIRED_VARS = [
        # LLM API Keys (至少需要一个)
    ]

    OPTIONAL_VARS = [
        "MINIMAX_API_KEY",
        "MINIMAX_BASE_URL",
        "MINIMAX_MODEL",
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GOOGLE_API_KEY",
        "TAVILY_API_KEY",
        "GITHUB_TOKEN",
    ]

    @classmethod
    def validate(cls) -> Tuple[bool, List[str]]:
        """验证环境变量

        Returns:
            (是否有效, 错误信息列表)
        """
        errors = []

        # 检查 LLM API Keys (至少需要一个)
        has_llm_key = any([
            os.getenv("MINIMAX_API_KEY"),
            os.getenv("OPENAI_API_KEY"),
            os.getenv("ANTHROPIC_API_KEY"),
        ])

        if not has_llm_key:
            errors.append("至少需要配置一个 LLM API Key (MINIMAX_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY)")

        # 检查 API Keys 格式
        minimax_key = os.getenv("MINIMAX_API_KEY", "")
        if minimax_key and not minimax_key.startswith("sk-"):
            errors.append("MINIMAX_API_KEY 格式可能不正确")

        openai_key = os.getenv("OPENAI_API_KEY", "")
        if openai_key and not openai_key.startswith("sk-"):
            errors.append("OPENAI_API_KEY 格式可能不正确")

        tavily_key = os.getenv("TAVILY_API_KEY", "")
        if tavily_key and not tavily_key.startswith("tvly-"):
            errors.append("TAVILY_API_KEY 格式可能不正确")

        return len(errors) == 0, errors

    @classmethod
    def print_status(cls):
        """打印环境变量状态"""
        print("\n=== Rho 环境变量状态 ===")

        # LLM Keys
        has_minimax = bool(os.getenv("MINIMAX_API_KEY"))
        has_openai = bool(os.getenv("OPENAI_API_KEY"))
        has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY"))
        has_google = bool(os.getenv("GOOGLE_API_KEY"))

        print(f"\nLLM Providers:")
        print(f"  MiniMax:  {'✓ 已配置' if has_minimax else '✗ 未配置'}")
        print(f"  OpenAI:  {'✓ 已配置' if has_openai else '✗ 未配置'}")
        print(f"  Anthropic: {'✓ 已配置' if has_anthropic else '✗ 未配置'}")
        print(f"  Google:  {'✓ 已配置' if has_google else '✗ 未配置'}")

        # Data Keys
        has_tavily = bool(os.getenv("TAVILY_API_KEY"))
        print(f"\nData Sources:")
        print(f"  Tavily:  {'✓ 已配置' if has_tavily else '✗ 未配置 (将使用模拟数据)'}")

        # 其他配置
        print(f"\nOther Config:")
        print(f"  API Port: {os.getenv('API_PORT', '8001 (default)')}")
        print(f"  Log Level: {os.getenv('LOG_LEVEL', 'INFO (default)')}")

        # 验证
        valid, errors = cls.validate()
        if valid:
            print("\n✓ 环境变量验证通过")
        else:
            print("\n✗ 环境变量验证失败:")
            for error in errors:
                print(f"  - {error}")

        return valid


def check_environment():
    """检查环境配置"""
    valid, errors = EnvValidator.validate()
    if not valid:
        print("Warning: Environment validation failed:")
        for error in errors:
            print(f"  - {error}")
        print("\nHint: Copy .env.example to .env and fill in your API keys.")
    return valid


if __name__ == "__main__":
    EnvValidator.print_status()
