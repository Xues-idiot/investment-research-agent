# Test Cache Module

import pytest
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.cache import SimpleCache, get_cache, cache_result


class TestSimpleCache:
    """测试简单缓存"""

    def test_cache_set_and_get(self):
        """测试设置和获取"""
        cache = SimpleCache(default_ttl=60)
        cache.set("key1", "value1")
        assert cache.get("key1") == "value1"

    def test_cache_expire(self):
        """测试过期"""
        cache = SimpleCache(default_ttl=1)
        cache.set("key1", "value1")
        time.sleep(1.1)
        assert cache.get("key1") is None

    def test_cache_delete(self):
        """测试删除"""
        cache = SimpleCache()
        cache.set("key1", "value1")
        cache.delete("key1")
        assert cache.get("key1") is None

    def test_cache_clear(self):
        """测试清空"""
        cache = SimpleCache()
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.clear()
        assert cache.get("key1") is None
        assert cache.get("key2") is None

    def test_cache_cleanup(self):
        """测试清理过期"""
        cache = SimpleCache(default_ttl=1)
        cache.set("key1", "value1")
        time.sleep(0.5)
        cache.set("key2", "value2")
        time.sleep(0.6)
        count = cache.cleanup()
        assert count == 1
        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"


class TestCacheDecorator:
    """测试缓存装饰器"""

    def test_cache_decorator(self):
        """测试装饰器"""
        call_count = 0

        @cache_result("test", ttl=60)
        def expensive_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        # First call
        result1 = expensive_function(5)
        assert result1 == 10
        assert call_count == 1

        # Second call should use cache
        result2 = expensive_function(5)
        assert result2 == 10
        assert call_count == 1  # Not incremented

        # Different argument
        result3 = expensive_function(6)
        assert result3 == 12
        assert call_count == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
