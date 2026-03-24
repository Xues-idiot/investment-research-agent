# Rho - Report Exporter
# 投资报告导出工具：支持 PDF、Markdown、HTML 格式

import os
import markdown
from datetime import datetime
from typing import Optional
from pathlib import Path

# 尝试导入 PDF 相关库
try:
    from weasyprint import HTML
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False

try:
    import pdfkit
    PDFKIT_AVAILABLE = True
except ImportError:
    PDFKIT_AVAILABLE = False


def export_report_to_pdf(
    markdown_content: str,
    output_path: str,
    title: str = "投资研究报告",
    author: str = "Rho Agent"
) -> dict:
    """导出报告为 PDF 格式

    Args:
        markdown_content: Markdown 格式的报告内容
        output_path: 输出文件路径
        title: 报告标题
        author: 作者

    Returns:
        导出结果字典
    """
    if not WEASYPRINT_AVAILABLE and not PDFKIT_AVAILABLE:
        return {
            "success": False,
            "error": "PDF导出库不可用，请安装 weasyprint 或 pdfkit",
            "output_path": None,
        }

    try:
        # 生成 HTML
        html_content = _markdown_to_html(markdown_content, title, author)

        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        if WEASYPRINT_AVAILABLE:
            # 使用 WeasyPrint
            HTML(string=html_content).write_pdf(output_path)
        elif PDFKIT_AVAILABLE:
            # 使用 pdfkit
            pdfkit.from_string(html_content, output_path)

        return {
            "success": True,
            "output_path": output_path,
            "format": "pdf",
            "file_size": os.path.getsize(output_path) if os.path.exists(output_path) else 0,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output_path": output_path,
        }


def export_report_to_html(
    markdown_content: str,
    output_path: str,
    title: str = "投资研究报告"
) -> dict:
    """导出报告为 HTML 格式

    Args:
        markdown_content: Markdown 格式的报告内容
        output_path: 输出文件路径
        title: 报告标题

    Returns:
        导出结果字典
    """
    try:
        html_content = _markdown_to_html(markdown_content, title)

        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return {
            "success": True,
            "output_path": output_path,
            "format": "html",
            "file_size": os.path.getsize(output_path),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output_path": output_path,
        }


def export_report_to_markdown(
    markdown_content: str,
    output_path: str
) -> dict:
    """导出报告为 Markdown 格式

    Args:
        markdown_content: Markdown 格式的报告内容
        output_path: 输出文件路径

    Returns:
        导出结果字典
    """
    try:
        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)

        return {
            "success": True,
            "output_path": output_path,
            "format": "markdown",
            "file_size": os.path.getsize(output_path),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "output_path": output_path,
        }


def _markdown_to_html(markdown_content: str, title: str, author: str = "Rho Agent") -> str:
    """将 Markdown 转换为 HTML"""

    # 转换 Markdown 为 HTML
    body_html = markdown.markdown(
        markdown_content,
        extensions=['tables', 'fenced_code', 'codehilite']
    )

    # 构建完整 HTML 文档
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 40px;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }}
        .header {{
            border-bottom: 3px solid #1E3A5F;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }}
        .header h1 {{
            color: #1E3A5F;
            font-size: 2.2em;
            margin-bottom: 10px;
        }}
        .meta {{
            color: #666;
            font-size: 0.9em;
        }}
        .content {{
            line-height: 1.8;
        }}
        .content h1, .content h2, .content h3 {{
            color: #1E3A5F;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }}
        .content h1 {{ font-size: 1.8em; }}
        .content h2 {{ font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 10px; }}
        .content h3 {{ font-size: 1.2em; }}
        .content p {{
            margin-bottom: 1em;
            text-align: justify;
        }}
        .content table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
        }}
        .content th, .content td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        .content th {{
            background: #1E3A5F;
            color: white;
        }}
        .content tr:nth-child(even) {{
            background: #f9f9f9;
        }}
        .content code {{
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: "SF Mono", Consolas, monospace;
        }}
        .content pre {{
            background: #f4f4f4;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 1.5em 0;
        }}
        .content pre code {{
            background: none;
            padding: 0;
        }}
        .content ul, .content ol {{
            margin: 1em 0;
            padding-left: 2em;
        }}
        .content li {{
            margin-bottom: 0.5em;
        }}
        .content blockquote {{
            border-left: 4px solid #1E3A5F;
            padding-left: 20px;
            margin: 1.5em 0;
            color: #666;
            font-style: italic;
        }}
        .risk-high {{ color: #dc2626; font-weight: bold; }}
        .risk-medium {{ color: #f59e0b; font-weight: bold; }}
        .risk-low {{ color: #10b981; font-weight: bold; }}
        .footer {{
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 0.8em;
            text-align: center;
        }}
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            .container {{
                box-shadow: none;
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{title}</h1>
            <div class="meta">
                <span>作者: {author}</span> |
                <span>生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M")}</span>
            </div>
        </div>
        <div class="content">
            {body_html}
        </div>
        <div class="footer">
            <p>由 Rho 投研 Agent 自动生成 | 仅供参考，不构成投资建议</p>
        </div>
    </div>
</body>
</html>"""

    return html


def get_default_filename(stock_code: str, format: str = "pdf") -> str:
    """获取默认文件名

    Args:
        stock_code: 股票代码
        format: 文件格式

    Returns:
        默认文件名
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    return f"report_{stock_code}_{timestamp}.{format}"