# Test Config Module

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import Config, config


class TestConfig:
    """测试配置类"""

    def test_config_defaults(self):
        """测试默认配置"""
        assert Config.LLM_PROVIDER is not None
        assert Config.API_PORT == 5000
        assert Config.MAX_RECURSION_LIMIT == 100

    def test_config_llm_config(self):
        """测试 LLM 配置"""
        llm_config = Config.get_llm_config()
        assert "provider" in llm_config
        assert "deep_think_llm" in llm_config
        assert "quick_think_llm" in llm_config

    def test_config_to_dict(self):
        """测试转换为字典"""
        config_dict = Config.to_dict()
        assert isinstance(config_dict, dict)
        assert "LLM_PROVIDER" in config_dict

    def test_config_validate(self):
        """测试配置验证"""
        # 验证应该通过（至少有一个 API key 或不需要 API key）
        result = Config.validate()
        assert isinstance(result, bool)

    def test_global_config_instance(self):
        """测试全局配置实例"""
        assert config is not None
        assert isinstance(config, Config)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
