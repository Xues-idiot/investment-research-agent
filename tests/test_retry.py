# Test Retry Mechanism

import pytest
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.retry import retry, retry_on_llm_error, retry_on_data_fetch
from backend.exceptions import LLMError, DataFetchError


class TestRetry:
    """测试重试装饰器"""

    def test_retry_success_first_attempt(self):
        """测试首次成功"""
        call_count = 0

        @retry(max_attempts=3, delay=0.1)
        def success_func():
            nonlocal call_count
            call_count += 1
            return "success"

        result = success_func()
        assert result == "success"
        assert call_count == 1

    def test_retry_success_after_failures(self):
        """测试失败后成功"""
        call_count = 0

        @retry(max_attempts=3, delay=0.1, backoff=1.0)
        def fail_then_success_func():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise ValueError("Temporary error")
            return "success"

        result = fail_then_success_func()
        assert result == "success"
        assert call_count == 3

    def test_retry_all_failures(self):
        """测试全部失败"""
        call_count = 0

        @retry(max_attempts=3, delay=0.1, exceptions=(ValueError,))
        def always_fail_func():
            nonlocal call_count
            call_count += 1
            raise ValueError("Always fails")

        with pytest.raises(ValueError):
            always_fail_func()
        assert call_count == 3

    def test_retry_specific_exception(self):
        """测试特定异常重试"""
        call_count = 0

        @retry(max_attempts=2, delay=0.1, exceptions=(LLMError,))
        def llm_fail_func():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise LLMError("LLM error")
            return "recovered"

        result = llm_fail_func()
        assert result == "recovered"
        assert call_count == 2

    def test_retry_non_retryable_exception(self):
        """测试非重试异常"""
        call_count = 0

        @retry(max_attempts=3, delay=0.1, exceptions=(ValueError,))
        def other_error_func():
            nonlocal call_count
            call_count += 1
            raise TypeError("Not a retryable error")

        with pytest.raises(TypeError):
            other_error_func()
        assert call_count == 1  # No retries


class TestRetryDecorators:
    """测试便捷重试装饰器"""

    def test_retry_on_llm_error(self):
        """测试 LLM 错误重试"""
        call_count = 0

        @retry_on_llm_error(max_attempts=2)
        def llm_func():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise LLMError("Temporary LLM error")
            return "done"

        result = llm_func()
        assert result == "done"
        assert call_count == 2

    def test_retry_on_data_fetch(self):
        """测试数据获取重试"""
        call_count = 0

        @retry_on_data_fetch(max_attempts=2)
        def data_func():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise DataFetchError("Temporary data error")
            return "data"

        result = data_func()
        assert result == "data"
        assert call_count == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
