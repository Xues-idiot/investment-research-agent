# Rho - Cache Module
# 简单的内存缓存

import time
from typing import Any, Optional, Dict, Tuple
from threading import Lock


class SimpleCache:
    """简单的内存缓存，带过期时间"""

    def __init__(self, default_ttl: int = 3600):
        """初始化缓存

        Args:
            default_ttl: 默认过期时间（秒）
        """
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._lock = Lock()
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """获取缓存值

        Args:
            key: 缓存键

        Returns:
            缓存值或 None
        """
        with self._lock:
            if key not in self._cache:
                return None

            value, expire_time = self._cache[key]

            if time.time() > expire_time:
                del self._cache[key]
                return None

            return value

    def set(self, key: str, value: Any, ttl: int = None) -> None:
        """设置缓存值

        Args:
            key: 缓存键
            value: 缓存值
            ttl: 过期时间（秒）
        """
        if ttl is None:
            ttl = self.default_ttl

        with self._lock:
            expire_time = time.time() + ttl
            self._cache[key] = (value, expire_time)

    def delete(self, key: str) -> None:
        """删除缓存值"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]

    def clear(self) -> None:
        """清空所有缓存"""
        with self._lock:
            self._cache.clear()

    def cleanup(self) -> int:
        """清理过期缓存，返回清理数量"""
        count = 0
        current_time = time.time()

        with self._lock:
            expired_keys = [
                key for key, (_, expire_time) in self._cache.items()
                if current_time > expire_time
            ]
            for key in expired_keys:
                del self._cache[key]
                count += 1

        return count


# 全局缓存实例
_cache = SimpleCache()


def get_cache() -> SimpleCache:
    """获取全局缓存实例"""
    return _cache


def cache_result(key_prefix: str, ttl: int = 3600):
    """缓存装饰器

    Args:
        key_prefix: 缓存键前缀
        ttl: 过期时间（秒）
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = f"{key_prefix}:{args}:{kwargs}"

            # 尝试获取缓存
            cache = get_cache()
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value

            # 调用原函数
            result = func(*args, **kwargs)

            # 设置缓存
            cache.set(cache_key, result, ttl)

            return result
        return wrapper
    return decorator
