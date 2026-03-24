#!/usr/bin/env python
# Rho - 启动脚本
# 统一启动入口

import sys
import argparse


def main():
    parser = argparse.ArgumentParser(
        description="Rho (投研Agent) - 股票投资研究助手"
    )
    parser.add_argument(
        "command",
        choices=["api", "cli", "env-check", "version"],
        help="命令"
    )
    parser.add_argument("args", nargs="*", help="命令参数")

    args = parser.parse_args()

    if args.command == "api":
        # 启动 API 服务器
        from backend.api.research import run_server
        port = int(args.args[0]) if args.args else 8001
        print(f"Starting API server on port {port}...")
        run_server(port=port, debug=True)

    elif args.command == "cli":
        # 运行 CLI 命令
        from backend.cli import main as cli_main
        sys.argv = ["rho"] + args.args
        cli_main()

    elif args.command == "env-check":
        # 检查环境
        from backend.env import EnvValidator
        EnvValidator.print_status()

    elif args.command == "version":
        print("Rho (投研Agent) v0.1.0")


if __name__ == "__main__":
    main()
