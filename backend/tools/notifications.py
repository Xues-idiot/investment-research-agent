# Rho - Notification Tools
# 消息推送工具：支持邮件、钉钉webhook、企业微信等

import os
import json
import requests
from datetime import datetime
from typing import Optional, List
from enum import Enum


class NotificationType(Enum):
    """通知类型枚举"""
    EMAIL = "email"
    DINGTALK = "dingtalk"
    WECHAT_WORK = "wechat_work"
    Lark = "lark"


class NotificationTool:
    """消息推送工具"""

    def __init__(self):
        self.dingtalk_webhook = os.getenv("DINGTALK_WEBHOOK", "")
        self.dingtalk_secret = os.getenv("DINGTALK_SECRET", "")
        self.lark_webhook = os.getenv("LARK_WEBHOOK", "")
        self.smtp_server = os.getenv("SMTP_SERVER", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "")

    def send_dingtalk_message(
        self,
        content: str,
        title: str = "Rho 投研报告",
        at_mobiles: List[str] = None,
        is_at_all: bool = False
    ) -> dict:
        """发送钉钉消息

        Args:
            content: 消息内容
            title: 消息标题
            at_mobiles: @指定人的手机号列表
            is_at_all: 是否@所有人

        Returns:
            发送结果
        """
        if not self.dingtalk_webhook:
            return {
                "success": False,
                "error": "钉钉 webhook 未配置，请设置 DINGTALK_WEBHOOK 环境变量"
            }

        try:
            # 钉钉 markdown 格式消息
            message = {
                "msgtype": "markdown",
                "markdown": {
                    "title": title,
                    "text": f"### {title}\n\n{content}\n\n---\n> 由 Rho 投研 Agent 于 {datetime.now().strftime('%Y-%m-%d %H:%M')} 自动发送"
                },
                "at": {
                    "atMobiles": at_mobiles or [],
                    "isAtAll": is_at_all
                }
            }

            headers = {"Content-Type": "application/json"}
            response = requests.post(
                self.dingtalk_webhook,
                headers=headers,
                data=json.dumps(message),
                timeout=10
            )

            result = response.json()
            if result.get("errcode") == 0:
                return {"success": True, "message": "钉钉消息发送成功"}
            else:
                return {"success": False, "error": result.get("errmsg", "发送失败")}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_lark_message(
        self,
        content: str,
        title: str = "Rho 投研报告"
    ) -> dict:
        """发送飞书消息

        Args:
            content: 消息内容 (支持 Markdown)
            title: 消息标题

        Returns:
            发送结果
        """
        if not self.lark_webhook:
            return {
                "success": False,
                "error": "飞书 webhook 未配置，请设置 LARK_WEBHOOK 环境变量"
            }

        try:
            message = {
                "msg_type": "interactive",
                "card": {
                    "header": {
                        "title": {
                            "tag": "plain_text",
                            "content": title
                        },
                        "template": "blue"
                    },
                    "elements": [
                        {
                            "tag": "markdown",
                            "content": content
                        },
                        {
                            "tag": "note",
                            "elements": [
                                {
                                    "tag": "plain_text",
                                    "content": f"由 Rho 投研 Agent 于 {datetime.now().strftime('%Y-%m-%d %H:%M')} 自动发送"
                                }
                            ]
                        }
                    ]
                }
            }

            headers = {"Content-Type": "application/json"}
            response = requests.post(
                self.lark_webhook,
                headers=headers,
                data=json.dumps(message),
                timeout=10
            )

            result = response.json()
            if result.get("code") == 0 or result.get("StatusCode") == 0:
                return {"success": True, "message": "飞书消息发送成功"}
            else:
                return {"success": False, "error": result.get("msg", "发送失败")}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = True
    ) -> dict:
        """发送邮件

        Args:
            to_email: 收件人邮箱
            subject: 邮件主题
            body: 邮件正文
            is_html: 是否为 HTML 格式

        Returns:
            发送结果
        """
        if not self.smtp_server or not self.smtp_user:
            return {
                "success": False,
                "error": "邮件服务未配置，请设置 SMTP_SERVER, SMTP_USER, SMTP_PASSWORD 环境变量"
            }

        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email or self.smtp_user
            msg["To"] = to_email

            if is_html:
                msg.attach(MIMEText(body, "html", "utf-8"))
            else:
                msg.attach(MIMEText(body, "plain", "utf-8"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return {"success": True, "message": "邮件发送成功"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_research_report(
        self,
        stock_code: str,
        stock_name: str,
        report_summary: str,
        risk_level: str,
        notification_type: NotificationType = NotificationType.DINGTALK
    ) -> dict:
        """发送研究报告通知

        Args:
            stock_code: 股票代码
            stock_name: 股票名称
            report_summary: 报告摘要
            risk_level: 风险等级
            notification_type: 通知类型

        Returns:
            发送结果
        """
        # 风险等级对应的颜色
        risk_colors = {
            "R1": ("🟢", "green"),
            "R2": ("🟡", "yellow"),
            "R3": ("🟠", "orange"),
            "R4": ("🔴", "red"),
            "R5": ("⚫", "black"),
        }
        risk_icon, risk_color = risk_colors.get(risk_level.upper(), ("⚪", "grey"))

        title = f"📊 {stock_name} ({stock_code}) 投研报告"

        if notification_type == NotificationType.DINGTALK:
            content = f"""
**股票**: {stock_name} ({stock_code})

**风险等级**: {risk_icon} {risk_level}

**报告摘要**:

{report_summary[:500]}...

---
💡 点击查看完整报告
"""
            return self.send_dingtalk_message(content, title)

        elif notification_type == NotificationType.LARK:
            content = f"""
**股票**: {stock_name} ({stock_code})

**风险等级**: {risk_icon} {risk_level}

**报告摘要**:

{report_summary[:500]}...

---
💡 点击查看完整报告
"""
            return self.send_lark_message(content, title)

        elif notification_type == NotificationType.EMAIL:
            html_body = f"""
<html>
<body>
<h2>{title}</h2>
<p><strong>股票:</strong> {stock_name} ({stock_code})</p>
<p><strong>风险等级:</strong> {risk_icon} {risk_level}</p>
<hr>
<h3>报告摘要</h3>
<p>{report_summary[:500]}...</p>
<hr>
<small>由 Rho 投研 Agent 于 {datetime.now().strftime('%Y-%m-%d %H:%M')} 自动发送</small>
</body>
</html>
"""
            return self.send_email(
                to_email=self.from_email,
                subject=title,
                body=html_body,
                is_html=True
            )

        return {"success": False, "error": "不支持的通知类型"}


# 全局通知工具实例
_notification_tool = None


def get_notification_tool() -> NotificationTool:
    """获取通知工具单例"""
    global _notification_tool
    if _notification_tool is None:
        _notification_tool = NotificationTool()
    return _notification_tool


def send_report_notification(
    stock_code: str,
    stock_name: str,
    report_summary: str,
    risk_level: str,
    notification_type: str = "dingtalk"
) -> dict:
    """发送报告通知的便捷函数

    Args:
        stock_code: 股票代码
        stock_name: 股票名称
        report_summary: 报告摘要
        risk_level: 风险等级
        notification_type: 通知类型 (dingtalk/lark/email)

    Returns:
        发送结果
    """
    notify_type = NotificationType(notification_type) if notification_type else NotificationType.DINGTALK
    tool = get_notification_tool()

    return tool.send_research_report(
        stock_code=stock_code,
        stock_name=stock_name,
        report_summary=report_summary,
        risk_level=risk_level,
        notification_type=notify_type
    )