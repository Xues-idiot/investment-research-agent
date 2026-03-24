# Rho CLI - 命令行界面

import argparse
import sys
from datetime import datetime

from .graph.research_graph import ResearchGraph, get_investment_report
from .env import EnvValidator


def main():
    parser = argparse.ArgumentParser(
        description="Rho (投研Agent) - 股票投资研究助手",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python -m backend.cli research 600519
  python -m backend.cli report 000858
  python -m backend.cli env-status
  python -m backend.cli --debug research 600519
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="命令")

    # research 命令
    research_parser = subparsers.add_parser("research", help="研究股票")
    research_parser.add_argument("stock_code", help="股票代码")
    research_parser.add_argument("--name", "-n", help="公司名称（可选）")
    research_parser.add_argument("--date", "-d", help="研究日期（可选）")
    research_parser.add_argument("--debug", action="store_true", help="调试模式")

    # report 命令
    report_parser = subparsers.add_parser("report", help="获取投资简报")
    report_parser.add_argument("stock_code", help="股票代码")
    report_parser.add_argument("--date", "-d", help="研究日期（可选）")
    report_parser.add_argument("--format", "-f", choices=["markdown", "json"],
                               default="markdown", help="输出格式")

    # env-status 命令
    subparsers.add_parser("env-status", help="显示环境变量状态")

    # version
    subparsers.add_parser("version", help="显示版本")

    args = parser.parse_args()

    if args.command == "research":
        research_stock(args.stock_code, args.name, args.date, args.debug)
    elif args.command == "report":
        get_report(args.stock_code, args.date, args.format)
    elif args.command == "env-status":
        EnvValidator.print_status()
    elif args.command == "version":
        print("Rho (投研Agent) v0.1.0")
    else:
        parser.print_help()


def research_stock(stock_code: str, name: str = None, date: str = None, debug: bool = False):
    """研究股票"""
    print(f"\n{'='*50}")
    print(f"  Rho 投研 Agent")
    print(f"{'='*50}")
    print(f"\n正在研究股票: {stock_code} {f'({name})' if name else ''}")
    print(f"研究日期: {date or datetime.now().strftime('%Y-%m-%d')}")
    print(f"调试模式: {'开启' if debug else '关闭'}")
    print(f"\n{'='*50}")
    print("\n开始分析...\n")

    try:
        graph = ResearchGraph(debug=debug)
        result = graph.propagate(stock_code, date)

        print("\n" + "="*50)
        print("  研究报告")
        print("="*50 + "\n")

        # 打印各分析师报告摘要
        print("【基本面分析】")
        print(result.get("fundamentals_report", {}).get("content", "暂无数据")[:500] + "...\n")

        print("【情绪分析】")
        print(result.get("sentiment_report", {}).get("content", "暂无数据")[:300] + "...\n")

        print("【新闻分析】")
        print(result.get("news_report", {}).get("content", "暂无数据")[:300] + "...\n")

        print("【技术分析】")
        print(result.get("technical_report", {}).get("content", "暂无数据")[:300] + "...\n")

        print("\n" + "="*50)
        print("  最终简报")
        print("="*50 + "\n")
        print(result.get("final_report", "暂无数据"))

        print(f"\n置信度: {result.get('confidence', 0):.0%}")
        risk = result.get("risk_assessment", {})
        print(f"风险等级: {risk.get('level', 'unknown').upper()} ({risk.get('score', 0)}/100)")

        print("\n" + "="*50)

    except Exception as e:
        print(f"\n错误: {e}")
        if debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def get_report(stock_code: str, date: str = None, format: str = "markdown"):
    """获取投资简报"""
    try:
        if format == "markdown":
            report = get_investment_report(stock_code, date)
            print(report)
        else:
            # JSON 格式
            import json
            from .graph.research_graph import research_stock
            result = research_stock(stock_code, date)
            print(json.dumps({
                "stock_code": stock_code,
                "date": date,
                "report": result.get("final_report", ""),
                "confidence": result.get("confidence", 0),
                "risk": result.get("risk_assessment", {})
            }, ensure_ascii=False, indent=2))

    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
