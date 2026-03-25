# Rho - Streaming API
# 支持 SSE 流式输出的 API

from flask import Flask, request, jsonify, Response
from datetime import datetime
import json
import asyncio

from ..graph.research_graph import ResearchGraph
from ..errors import ErrorHandler, validate_stock_code
from ..validator import StockValidator

app = Flask(__name__)


def generate_events(stock_code: str, company_name: str = None):
    """生成 SSE 事件流

    Args:
        stock_code: 股票代码
        company_name: 公司名称
    """
    try:
        # 验证股票代码
        try:
            market = validate_stock_code(stock_code)
        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"
            return

        # 如果没有提供公司名称，尝试获取
        if not company_name or company_name == stock_code:
            company_name = StockValidator.get_stock_name(stock_code) or stock_code

        # 初始化研究图
        graph = ResearchGraph(debug=False)

        # 模拟各 Agent 的执行进度
        agents = [
            ('init', '初始化研究任务...'),
            ('fundamental', '基本面分析 Agent 分析中...'),
            ('sentiment', '情绪分析 Agent 分析中...'),
            ('news', '新闻分析 Agent 分析中...'),
            ('technical', '技术分析 Agent 分析中...'),
            ('synthesize', '综合报告生成中...'),
            ('risk', '风险评估中...'),
            ('report', '投资简报生成中...'),
        ]

        for agent_id, message in agents:
            yield f"data: {json.dumps({'event': 'agent', 'agent': agent_id, 'message': message})}\n\n"
            # 模拟处理时间
            import time
            time.sleep(0.5)

        # 执行实际研究
        try:
            result = graph.propagate(stock_code, datetime.now().strftime("%Y-%m-%d"))

            # 返回最终结果
            complete_data = {
                'event': 'complete',
                'data': {
                    'stock_code': stock_code,
                    'company_name': company_name,
                    'research_date': datetime.now().strftime("%Y-%m-%d"),
                    'final_report': result.get('final_report', ''),
                    'confidence': result.get('confidence', 0.0),
                    'risk_assessment': result.get('risk_assessment', {}),
                    'reports': {
                        'fundamentals': result.get('fundamentals_report', {}).get('content', ''),
                        'sentiment': result.get('sentiment_report', {}).get('content', ''),
                        'news': result.get('news_report', {}).get('content', ''),
                        'technical': result.get('technical_report', {}).get('content', ''),
                        'synthesis': result.get('synthesis_report', ''),
                    }
                }
            }
            yield f"data: {json.dumps(complete_data)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"


@app.route("/api/research/stream", methods=["POST"])
def research_stock_stream():
    """
    流式研究股票 API - 支持 SSE

    返回类型: text/event-stream
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        company_name = data.get("company_name", stock_code)

        if not stock_code:
            return jsonify({
                "success": False,
                "error": "stock_code is required"
            }), 400

        return Response(
            generate_events(stock_code, company_name),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            }
        )

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


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
