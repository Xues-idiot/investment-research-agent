# Test Integration - API Integration Tests

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestAPIClient:
    """测试 API 客户端"""

    def test_research_endpoint_format(self):
        """测试研究端点格式"""
        from backend.api.research import app

        with app.test_client() as client:
            # 测试缺少 stock_code
            response = client.post(
                '/api/research',
                json={}
            )
            assert response.status_code == 400
            data = response.get_json()
            assert data['success'] == False
            assert 'stock_code is required' in data['error']

    def test_health_endpoint(self):
        """测试健康检查端点"""
        from backend.api.research import app

        with app.test_client() as client:
            response = client.get('/api/health')
            assert response.status_code == 200
            data = response.get_json()
            assert data['status'] == 'ok'
            assert 'version' in data
            assert 'endpoints' in data

    def test_validate_endpoint(self):
        """测试股票验证端点"""
        from backend.api.research import app

        with app.test_client() as client:
            # 有效股票
            response = client.get('/api/stocks/validate/600519')
            assert response.status_code == 200
            data = response.get_json()
            assert data['valid'] == True
            assert data['market'] == 'A'

            # 无效股票
            response = client.get('/api/stocks/validate/INVALID')
            assert response.status_code == 200
            data = response.get_json()
            assert data['valid'] == False

    def test_config_endpoint(self):
        """测试配置端点"""
        from backend.api.research import app

        with app.test_client() as client:
            response = client.get('/api/config')
            assert response.status_code == 200
            data = response.get_json()
            assert 'api_port' in data
            assert 'frontend_port' in data
            assert 'colors' in data


class TestResearchFlow:
    """测试研究流程"""

    def test_stock_validation(self):
        """测试股票验证"""
        from backend.validator import StockValidator

        # A股
        valid, market = StockValidator.validate("600519")
        assert valid == True
        assert market == "A"

        # 港股
        valid, market = StockValidator.validate("00700")
        assert valid == True
        assert market == "HK"

        # 美股
        valid, market = StockValidator.validate("AAPL")
        assert valid == True
        assert market == "US"

    def test_stock_name_lookup(self):
        """测试股票名称查询"""
        from backend.validator import StockValidator

        name = StockValidator.get_stock_name("600519")
        assert name == "贵州茅台"

        name = StockValidator.get_stock_name("000858")
        assert name == "五粮液"

        name = StockValidator.get_stock_name("UNKNOWN")
        assert name is None


class TestErrorHandling:
    """测试错误处理"""

    def test_invalid_stock_code_error(self):
        """测试无效股票代码错误"""
        from backend.exceptions import InvalidStockCodeError
        from backend.errors import ErrorHandler

        error = InvalidStockCodeError("INVALID")
        handler = ErrorHandler()
        result = handler.handle_error(error)

        assert result['success'] == False
        assert result['error_type'] == 'invalid_stock_code'

    def test_data_fetch_error(self):
        """测试数据获取错误"""
        from backend.exceptions import DataFetchError
        from backend.errors import ErrorHandler

        error = DataFetchError("Network timeout")
        handler = ErrorHandler()
        result = handler.handle_error(error)

        assert result['success'] == False
        assert result['error_type'] == 'data_fetch_error'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
