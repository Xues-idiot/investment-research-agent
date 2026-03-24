# Rho - Research API
# REST API 接口

from flask import Flask, request, jsonify
from datetime import datetime
import os

from ..graph.research_graph import ResearchGraph
from ..errors import ErrorHandler, validate_stock_code
from ..validator import StockValidator
from ..middleware import setup_middleware
from ..utils import logger

app = Flask(__name__)

# 设置中间件
setup_middleware(app)

# 全局图实例
research_graph = None


def get_research_graph() -> ResearchGraph:
    """获取或创建 ResearchGraph 实例"""
    global research_graph
    if research_graph is None:
        research_graph = ResearchGraph(debug=False)
    return research_graph


@app.route("/api/research", methods=["POST"])
def research_stock():
    """研究股票 API (批量模式)"""
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        company_name = data.get("company_name", stock_code)

        if not stock_code:
            return jsonify({
                "success": False,
                "error": "stock_code is required"
            }), 400

        # 验证股票代码
        try:
            validate_stock_code(stock_code)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 400

        # 如果没有提供公司名称，尝试获取
        if not company_name or company_name == stock_code:
            company_name = StockValidator.get_stock_name(stock_code) or stock_code

        # 执行研究
        graph = get_research_graph()
        result = graph.propagate(stock_code, datetime.now().strftime("%Y-%m-%d"))

        # 构建响应
        response = {
            "success": True,
            "data": {
                "stock_code": stock_code,
                "company_name": company_name,
                "research_date": datetime.now().strftime("%Y-%m-%d"),
                "final_report": result.get("final_report", ""),
                "confidence": result.get("confidence", 0.0),
                "risk_assessment": result.get("risk_assessment", {}),
                "reports": {
                    "fundamentals": result.get("fundamentals_report", {}).get("content", ""),
                    "sentiment": result.get("sentiment_report", {}).get("content", ""),
                    "news": result.get("news_report", {}).get("content", ""),
                    "technical": result.get("technical_report", {}).get("content", ""),
                    "synthesis": result.get("synthesis_report", ""),
                }
            }
        }

        return jsonify(response)

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/research/report", methods=["GET"])
def get_report():
    """获取投资简报"""
    try:
        stock_code = request.args.get("stock_code")
        date = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))

        if not stock_code:
            return jsonify({
                "success": False,
                "error": "stock_code is required"
            }), 400

        graph = get_research_graph()
        report = graph.get_report(stock_code, date)

        return jsonify({
            "success": True,
            "data": {
                "stock_code": stock_code,
                "date": date,
                "report": report
            }
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    """健康检查"""
    try:
        from ..health import get_health_status
        status = get_health_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({
            "status": "error",
            "service": "rho-research-agent",
            "version": "0.1.0",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }), 500


@app.route("/api/stocks/validate/<stock_code>", methods=["GET"])
def validate_stock(stock_code: str):
    """验证股票代码"""
    valid, market = StockValidator.validate(stock_code)
    name = StockValidator.get_stock_name(stock_code) if valid else None

    return jsonify({
        "valid": valid,
        "market": market,
        "name": name
    })


@app.route("/api/config", methods=["GET"])
def get_config():
    """获取服务配置"""
    from ..config import config

    return jsonify({
        "api_port": config.API_PORT,
        "frontend_port": config.FRONTEND_PORT,
        "colors": config.COLORS,
        "llm_provider": config.LLM_PROVIDER,
    })


def run_server(host: str = "0.0.0.0", port: int = 8001, debug: bool = False):
    """运行 API 服务器 - 默认端口 8001"""
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    run_server(debug=True)
