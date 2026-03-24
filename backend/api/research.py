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


@app.route("/api/export/pdf", methods=["POST"])
def export_pdf():
    """导出报告为 PDF

    Request Body:
    {
        "stock_code": "600519",
        "markdown_content": "# 报告内容...",
        "title": "投资研究报告",
        "author": "Rho Agent"
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code", "unknown")
        markdown_content = data.get("markdown_content", "")
        title = data.get("title", f"{stock_code} 投资研究报告")
        author = data.get("author", "Rho Agent")

        if not markdown_content:
            return jsonify({
                "success": False,
                "error": "markdown_content is required"
            }), 400

        # 导入导出工具
        from ..tools.report_exporter import export_report_to_pdf, get_default_filename

        # 生成文件名
        filename = get_default_filename(stock_code, "pdf")
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "exports")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, filename)

        # 导出 PDF
        result = export_report_to_pdf(
            markdown_content=markdown_content,
            output_path=output_path,
            title=title,
            author=author
        )

        if result.get("success"):
            return jsonify({
                "success": True,
                "data": {
                    "output_path": result["output_path"],
                    "format": "pdf",
                    "file_size": result.get("file_size", 0),
                    "download_url": f"/api/export/download?path={filename}"
                }
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Export failed"),
                "available_formats": ["html", "markdown"] if not result.get("error", "").startswith("PDF") else None
            }), 500

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/export/html", methods=["POST"])
def export_html():
    """导出报告为 HTML

    Request Body:
    {
        "stock_code": "600519",
        "markdown_content": "# 报告内容...",
        "title": "投资研究报告"
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code", "unknown")
        markdown_content = data.get("markdown_content", "")
        title = data.get("title", f"{stock_code} 投资研究报告")

        if not markdown_content:
            return jsonify({
                "success": False,
                "error": "markdown_content is required"
            }), 400

        from ..tools.report_exporter import export_report_to_html, get_default_filename

        filename = get_default_filename(stock_code, "html")
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "exports")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, filename)

        result = export_report_to_html(
            markdown_content=markdown_content,
            output_path=output_path,
            title=title
        )

        return jsonify({
            "success": result.get("success", False),
            "data": {
                "output_path": result.get("output_path"),
                "format": "html",
                "file_size": result.get("file_size", 0),
                "download_url": f"/api/export/download?path={filename}" if result.get("success") else None
            },
            "error": result.get("error")
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/export/download", methods=["GET"])
def download_file():
    """下载导出的文件"""
    from flask import send_from_directory, abort

    path = request.args.get("path", "")
    if not path:
        abort(400)

    # 安全检查：只允许下载 exports 目录下的文件
    # 防止路径穿越攻击
    normalized_path = os.path.normpath(path)
    if ".." in normalized_path or normalized_path.startswith("/") or normalized_path.startswith("\\"):
        abort(403)

    # 检查文件扩展名，只允许下载特定类型
    allowed_extensions = {'.pdf', '.html', '.md', '.txt', '.json'}
    _, ext = os.path.splitext(normalized_path)
    if ext.lower() not in allowed_extensions:
        abort(403)

    export_dir = os.path.join(os.path.dirname(__file__), "..", "..", "exports")
    return send_from_directory(export_dir, normalized_path)


@app.route("/api/notify", methods=["POST"])
def send_notification():
    """发送研究报告通知

    Request Body:
    {
        "stock_code": "600519",
        "stock_name": "贵州茅台",
        "report_summary": "报告摘要...",
        "risk_level": "R2",
        "notification_type": "dingtalk"  // dingtalk, lark, email
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        stock_name = data.get("stock_name", stock_code)
        report_summary = data.get("report_summary", "")
        risk_level = data.get("risk_level", "R3")
        notification_type = data.get("notification_type", "dingtalk")

        if not stock_code:
            return jsonify({
                "success": False,
                "error": "stock_code is required"
            }), 400

        from ..tools.notifications import send_report_notification, NotificationType

        notify_type = NotificationType(notification_type) if notification_type else NotificationType.DINGTALK

        result = send_report_notification(
            stock_code=stock_code,
            stock_name=stock_name,
            report_summary=report_summary,
            risk_level=risk_level,
            notification_type=notification_type
        )

        return jsonify({
            "success": result.get("success", False),
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/notify/config", methods=["GET"])
def get_notification_config():
    """获取通知渠道配置状态

    Returns:
        各通知渠道的配置状态
    """
    import os

    return jsonify({
        "success": True,
        "data": {
            "dingtalk": {
                "configured": bool(os.getenv("DINGTALK_WEBHOOK")),
                "has_secret": bool(os.getenv("DINGTALK_SECRET"))
            },
            "lark": {
                "configured": bool(os.getenv("LARK_WEBHOOK"))
            },
            "email": {
                "configured": bool(os.getenv("SMTP_SERVER")),
                "smtp_server": os.getenv("SMTP_SERVER", ""),
                "from_email": os.getenv("FROM_EMAIL", "")
            }
        }
    })


@app.route("/api/compare", methods=["POST"])
def compare_stocks():
    """多股票对比分析

    Request Body:
    {
        "stock_codes": ["600519", "000858", "000568"]
    }
    """
    try:
        data = request.get_json()
        stock_codes = data.get("stock_codes", [])

        if not stock_codes or len(stock_codes) < 2:
            return jsonify({
                "success": False,
                "error": "至少需要2只股票进行对比"
            }), 400

        from ..tools.stock_comparison import compare_stocks

        result = compare_stocks(stock_codes)

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/compare/rank", methods=["POST"])
def rank_stocks():
    """股票排名

    Request Body:
    {
        "stock_codes": ["600519", "000858", "000568"],
        "criteria": "comprehensive"  // value, growth, technical, comprehensive
    }
    """
    try:
        data = request.get_json()
        stock_codes = data.get("stock_codes", [])
        criteria = data.get("criteria", "comprehensive")

        if not stock_codes or len(stock_codes) < 2:
            return jsonify({
                "success": False,
                "error": "至少需要2只股票进行排名"
            }), 400

        from ..tools.stock_comparison import rank_stocks

        result = rank_stocks(stock_codes, criteria)

        return jsonify({
            "success": True,
            "data": {
                "ranks": result,
                "criteria": criteria,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/status", methods=["GET"])
def get_monitor_status():
    """获取监控状态"""
    try:
        from ..tools.monitoring import get_monitor
        monitor = get_monitor()
        return jsonify({
            "success": True,
            "data": monitor.get_status()
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/alerts", methods=["GET"])
def get_alerts():
    """获取告警列表

    Query Params:
        stock_code: 可选，筛选特定股票
    """
    try:
        from ..tools.monitoring import get_monitor
        stock_code = request.args.get("stock_code")
        monitor = get_monitor()
        alerts = monitor.get_alerts(stock_code)

        return jsonify({
            "success": True,
            "data": {
                "alerts": [
                    {
                        "stock_code": a.stock_code,
                        "alert_type": a.alert_type.value,
                        "threshold": a.threshold,
                        "enabled": a.enabled,
                        "triggered_at": a.triggered_at,
                        "message": a.message
                    }
                    for a in alerts
                ]
            }
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/alerts", methods=["POST"])
def add_alert():
    """添加告警

    Request Body:
    {
        "stock_code": "600519",
        "alert_type": "price_above",  // price_above, price_below, price_change, volume_spike, rsi_overbought, rsi_oversold
        "threshold": 1800.0,
        "enabled": true
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        alert_type_str = data.get("alert_type", "price_above")
        threshold = data.get("threshold")
        enabled = data.get("enabled", True)

        if not stock_code or threshold is None:
            return jsonify({
                "success": False,
                "error": "stock_code and threshold are required"
            }), 400

        from ..tools.monitoring import get_monitor, Alert, AlertType

        alert_type = AlertType(alert_type_str)
        alert = Alert(
            stock_code=stock_code,
            alert_type=alert_type,
            threshold=float(threshold),
            enabled=enabled
        )

        monitor = get_monitor()
        monitor.add_alert(alert)

        return jsonify({
            "success": True,
            "data": {
                "message": "告警已添加",
                "alert": {
                    "stock_code": stock_code,
                    "alert_type": alert_type.value,
                    "threshold": threshold
                }
            }
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/alerts/<stock_code>", methods=["DELETE"])
def remove_alert(stock_code: str):
    """删除股票的告警

    Query Params:
        alert_type: 可选，删除特定类型的告警
    """
    try:
        from ..tools.monitoring import get_monitor, AlertType

        alert_type_str = request.args.get("alert_type")
        alert_type = AlertType(alert_type_str) if alert_type_str else None

        monitor = get_monitor()
        monitor.remove_alert(stock_code, alert_type)

        return jsonify({
            "success": True,
            "data": {"message": f"已删除 {stock_code} 的告警"}
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/check", methods=["POST"])
def check_alerts():
    """手动检查告警

    Returns:
        触发的告警列表
    """
    try:
        from ..tools.monitoring import get_monitor, AlertEvent

        monitor = get_monitor()
        triggered = monitor.check_alerts()

        return jsonify({
            "success": True,
            "data": {
                "triggered_count": len(triggered),
                "alerts": [
                    {
                        "stock_code": a.stock_code,
                        "stock_name": a.stock_name,
                        "alert_type": a.alert.alert_type.value,
                        "current_value": a.current_value,
                        "threshold": a.alert.threshold,
                        "timestamp": a.timestamp,
                        "message": a.message
                    }
                    for a in triggered
                ]
            }
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/start", methods=["POST"])
def start_monitor():
    """启动监控服务

    Query Params:
        interval: 检查间隔秒数，默认60
    """
    try:
        from ..tools.monitoring import get_monitor

        interval = int(request.args.get("interval", 60))
        monitor = get_monitor()
        monitor.start(interval)

        return jsonify({
            "success": True,
            "data": {
                "message": f"监控已启动，每 {interval} 秒检查一次",
                "status": monitor.get_status()
            }
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/monitor/stop", methods=["POST"])
def stop_monitor():
    """停止监控服务"""
    try:
        from ..tools.monitoring import get_monitor

        monitor = get_monitor()
        monitor.stop()

        return jsonify({
            "success": True,
            "data": {"message": "监控已停止"}
        })
    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/portfolio/suggest", methods=["POST"])
def suggest_portfolio():
    """生成投资组合建议

    Request Body:
    {
        "stock_codes": ["600519", "000858", "000568"],
        "total_capital": 1000000,
        "risk_level": "moderate",    // conservative, moderate, aggressive
        "strategy": "balanced"         // value, growth, balanced, momentum
    }
    """
    try:
        data = request.get_json()
        stock_codes = data.get("stock_codes", [])
        total_capital = float(data.get("total_capital", 1000000))
        risk_level = data.get("risk_level", "moderate")
        strategy = data.get("strategy", "balanced")

        if not stock_codes or len(stock_codes) < 1:
            return jsonify({
                "success": False,
                "error": "至少需要1只股票"
            }), 400

        from ..tools.portfolio import suggest_portfolio

        result = suggest_portfolio(
            stock_codes=stock_codes,
            total_capital=total_capital,
            risk_level=risk_level,
            strategy=strategy
        )

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/portfolio/analyze", methods=["POST"])
def analyze_portfolio():
    """分析投资组合风险

    Request Body:
    {
        "holdings": [
            {"stock_code": "600519", "stock_name": "贵州茅台", "weight": 0.4, "shares": 100, "price": 1680},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        portfolio = data.get("portfolio", {})

        if not portfolio:
            return jsonify({
                "success": False,
                "error": "portfolio data is required"
            }), 400

        from ..tools.portfolio import analyze_portfolio_risk

        result = analyze_portfolio_risk(portfolio)

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/portfolio/rebalance", methods=["POST"])
def rebalance_portfolio():
    """生成调仓建议

    Request Body:
    {
        "current_portfolio": { ... },
        "target_risk": "moderate"
    }
    """
    try:
        data = request.get_json()
        current_portfolio = data.get("current_portfolio", {})
        target_risk = data.get("target_risk", "moderate")

        from ..tools.portfolio import PortfolioOptimizer

        optimizer = PortfolioOptimizer(target_risk)
        suggestions = optimizer.rebalance_suggestions(current_portfolio, target_risk)

        return jsonify({
            "success": True,
            "data": {
                "suggestions": suggestions,
                "target_risk": target_risk,
                "num_changes": len([s for s in suggestions if s.get("action") != "持有"])
            }
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/backtest/ma", methods=["POST"])
def backtest_ma():
    """均线交叉策略回测

    Request Body:
    {
        "stock_code": "600519",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "short_window": 5,
        "long_window": 20,
        "initial_capital": 1000000
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        short_window = data.get("short_window", 5)
        long_window = data.get("long_window", 20)
        initial_capital = float(data.get("initial_capital", 1000000))

        if not stock_code or not start_date or not end_date:
            return jsonify({
                "success": False,
                "error": "stock_code, start_date, end_date are required"
            }), 400

        from ..tools.backtesting import run_ma_backtest

        result = run_ma_backtest(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            short_window=short_window,
            long_window=long_window,
            initial_capital=initial_capital
        )

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/backtest/rsi", methods=["POST"])
def backtest_rsi():
    """RSI策略回测

    Request Body:
    {
        "stock_code": "600519",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "initial_capital": 1000000
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        initial_capital = float(data.get("initial_capital", 1000000))

        if not stock_code or not start_date or not end_date:
            return jsonify({
                "success": False,
                "error": "stock_code, start_date, end_date are required"
            }), 400

        from ..tools.backtesting import run_rsi_backtest

        result = run_rsi_backtest(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital
        )

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


@app.route("/api/backtest/momentum", methods=["POST"])
def backtest_momentum():
    """动量策略回测

    Request Body:
    {
        "stock_code": "600519",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "lookback": 20,
        "threshold": 0.05,
        "initial_capital": 1000000
    }
    """
    try:
        data = request.get_json()
        stock_code = data.get("stock_code")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        lookback = data.get("lookback", 20)
        threshold = data.get("threshold", 0.05)
        initial_capital = float(data.get("initial_capital", 1000000))

        if not stock_code or not start_date or not end_date:
            return jsonify({
                "success": False,
                "error": "stock_code, start_date, end_date are required"
            }), 400

        from ..tools.backtesting import BacktestEngine

        engine = BacktestEngine(initial_capital=initial_capital)
        result = engine.run_momentum_backtest(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            lookback=lookback,
            threshold=threshold
        )

        result_dict = {
            "stock_code": result.stock_code,
            "start_date": result.start_date,
            "end_date": result.end_date,
            "initial_capital": result.initial_capital,
            "final_value": result.final_value,
            "total_return": result.total_return,
            "total_return_pct": result.total_return_pct,
            "num_trades": result.num_trades,
            "num_buys": result.num_buys,
            "num_sells": result.num_sells,
            "win_rate": result.win_rate,
            "max_drawdown": result.max_drawdown,
            "max_drawdown_pct": result.max_drawdown_pct,
            "sharpe_ratio": result.sharpe_ratio,
        }

        return jsonify({
            "success": True,
            "data": result_dict
        })

    except Exception as e:
        handler = ErrorHandler()
        return jsonify(handler.handle_error(e)), 500


def run_server(host: str = "0.0.0.0", port: int = 8001, debug: bool = False):
    """运行 API 服务器 - 默认端口 8001"""
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    run_server(debug=True)
