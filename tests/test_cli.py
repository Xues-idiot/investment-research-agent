# Test CLI

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestCLI:
    """测试命令行界面"""

    def test_cli_imports(self):
        """测试 CLI 模块可导入"""
        from backend import cli
        assert hasattr(cli, 'main')
        assert hasattr(cli, 'research_stock')
        assert hasattr(cli, 'get_report')

    def test_cli_research_function(self):
        """测试 research_stock 函数存在"""
        from backend.cli import research_stock
        assert callable(research_stock)

    def test_cli_report_function(self):
        """测试 get_report 函数存在"""
        from backend.cli import get_report
        assert callable(get_report)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
