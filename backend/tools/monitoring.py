# Rho - Market Monitoring Tools
# 实时行情监控工具：价格告警、涨跌幅告警、成交量告警

import os
import time
import threading
from datetime import datetime
from typing import List, Dict, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import json

from ..tools.stock_price import get_stock_price, get_indicators
from ..tools.financial_data import get_stock_info


class AlertType(Enum):
    """告警类型"""
    PRICE_ABOVE = "price_above"
    PRICE_BELOW = "price_below"
    PRICE_CHANGE = "price_change"
    VOLUME_SPIKE = "volume_spike"
    RSI_OVERBOUGHT = "rsi_overbought"
    RSI_OVERSOLD = "rsi_oversold"


@dataclass
class Alert:
    """告警配置"""
    stock_code: str
    alert_type: AlertType
    threshold: float
    enabled: bool = True
    triggered_at: Optional[str] = None
    message: str = ""


@dataclass
class AlertEvent:
    """触发的告警事件"""
    alert: Alert
    stock_name: str
    current_value: float
    timestamp: str
    message: str


class StockMonitor:
    """股票监控器"""

    def __init__(self):
        self.alerts: List[Alert] = []
        self.watched_stocks: set = set()
        self._callbacks: List[Callable[[AlertEvent], None]] = []
        self._running = False
        self._monitor_thread: Optional[threading.Thread] = None
        self._check_interval = 60  # 默认60秒检查一次

    def add_alert(self, alert: Alert) -> bool:
        """添加告警"""
        self.alerts.append(alert)
        self.watched_stocks.add(alert.stock_code)
        return True

    def remove_alert(self, stock_code: str, alert_type: AlertType = None) -> bool:
        """移除告警"""
        if alert_type:
            self.alerts = [a for a in self.alerts
                          if not (a.stock_code == stock_code and a.alert_type == alert_type)]
        else:
            self.alerts = [a for a in self.alerts if a.stock_code != stock_code]

        # 检查是否还有该股票的告警
        if not any(a.stock_code == stock_code for a in self.alerts):
            self.watched_stocks.discard(stock_code)
        return True

    def get_alerts(self, stock_code: str = None) -> List[Alert]:
        """获取告警列表"""
        if stock_code:
            return [a for a in self.alerts if a.stock_code == stock_code]
        return self.alerts

    def on_alert(self, callback: Callable[[AlertEvent], None]):
        """注册告警回调函数"""
        self._callbacks.append(callback)

    def _notify_alert(self, event: AlertEvent):
        """触发告警回调"""
        for callback in self._callbacks:
            try:
                callback(event)
            except Exception as e:
                print(f"Alert callback error: {e}")

    def start(self, interval: int = 60):
        """启动监控"""
        if self._running:
            return

        self._running = True
        self._check_interval = interval
        self._monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._monitor_thread.start()

    def stop(self):
        """停止监控"""
        self._running = False
        if self._monitor_thread:
            self._monitor_thread.join(timeout=5)

    def _monitor_loop(self):
        """监控循环"""
        while self._running:
            try:
                self.check_alerts()
            except Exception as e:
                print(f"Monitor error: {e}")
            time.sleep(self._check_interval)

    def check_alerts(self) -> List[AlertEvent]:
        """检查所有告警"""
        triggered = []

        for alert in self.alerts:
            if not alert.enabled:
                continue

            event = self._check_single_alert(alert)
            if event:
                triggered.append(event)
                self._notify_alert(event)

        return triggered

    def _check_single_alert(self, alert: Alert) -> Optional[AlertEvent]:
        """检查单个告警"""
        try:
            stock_info = get_stock_info(alert.stock_code)
            stock_name = stock_info.get("name", alert.stock_code)
            current_price = stock_info.get("price", 0)

            if current_price <= 0:
                return None

            price_data = get_stock_price(alert.stock_code, period="1d")
            indicators = get_indicators(alert.stock_code, period="5d")

            current_volume = price_data.get("volume", 0)
            price_change_pct = price_data.get("price_change_pct", 0)
            avg_volume = stock_info.get("avg_volume", current_volume)
            rsi = indicators.get("rsi_14")

            triggered = False
            current_value = 0.0
            message = ""

            if alert.alert_type == AlertType.PRICE_ABOVE and current_price >= alert.threshold:
                triggered = True
                current_value = current_price
                message = f"{stock_name} 股价 ¥{current_price:.2f} 超过设定价格 ¥{alert.threshold:.2f}"

            elif alert.alert_type == AlertType.PRICE_BELOW and current_price <= alert.threshold:
                triggered = True
                current_value = current_price
                message = f"{stock_name} 股价 ¥{current_price:.2f} 跌破设定价格 ¥{alert.threshold:.2f}"

            elif alert.alert_type == AlertType.PRICE_CHANGE and abs(price_change_pct) >= alert.threshold:
                triggered = True
                current_value = price_change_pct
                message = f"{stock_name} 涨跌幅 {price_change_pct:+.2f}% 超过设定阈值 {alert.threshold:+.2f}%"

            elif alert.alert_type == AlertType.VOLUME_SPIKE and avg_volume > 0:
                volume_ratio = current_volume / avg_volume
                if volume_ratio >= alert.threshold:
                    triggered = True
                    current_value = volume_ratio
                    message = f"{stock_name} 成交量放大 {volume_ratio:.2f}倍 (量比超过 {alert.threshold:.2f}倍)"

            elif alert.alert_type == AlertType.RSI_OVERBOUGHT and rsi and rsi >= alert.threshold:
                triggered = True
                current_value = rsi
                message = f"{stock_name} RSI {rsi:.1f} 进入超买区域 (阈值 {alert.threshold:.1f})"

            elif alert.alert_type == AlertType.RSI_OVERSOLD and rsi and rsi <= alert.threshold:
                triggered = True
                current_value = rsi
                message = f"{stock_name} RSI {rsi:.1f} 进入超卖区域 (阈值 {alert.threshold:.1f})"

            if triggered:
                alert.triggered_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                alert.message = message

                return AlertEvent(
                    alert=alert,
                    stock_name=stock_name,
                    current_value=current_value,
                    timestamp=alert.triggered_at,
                    message=message
                )

        except Exception as e:
            print(f"Error checking alert for {alert.stock_code}: {e}")

        return None

    def get_status(self) -> dict:
        """获取监控状态"""
        return {
            "running": self._running,
            "watched_stocks": list(self.watched_stocks),
            "total_alerts": len(self.alerts),
            "enabled_alerts": len([a for a in self.alerts if a.enabled]),
            "triggered_alerts": len([a for a in self.alerts if a.triggered_at]),
        }


# 全局监控器实例
_monitor: Optional[StockMonitor] = None


def get_monitor() -> StockMonitor:
    """获取全局监控器"""
    global _monitor
    if _monitor is None:
        _monitor = StockMonitor()
    return _monitor


def create_price_alert(
    stock_code: str,
    price: float,
    alert_type: AlertType = AlertType.PRICE_ABOVE
) -> Alert:
    """创建价格告警

    Args:
        stock_code: 股票代码
        price: 目标价格
        alert_type: PRICE_ABOVE 或 PRICE_BELOW

    Returns:
        告警对象
    """
    return Alert(
        stock_code=stock_code,
        alert_type=alert_type,
        threshold=price,
        enabled=True
    )


def create_change_alert(stock_code: str, change_pct: float) -> Alert:
    """创建涨跌幅告警

    Args:
        stock_code: 股票代码
        change_pct: 涨跌幅阈值 (百分比)

    Returns:
        告警对象
    """
    return Alert(
        stock_code=stock_code,
        alert_type=AlertType.PRICE_CHANGE,
        threshold=change_pct,
        enabled=True
    )


def create_volume_alert(stock_code: str, volume_ratio: float = 2.0) -> Alert:
    """创建成交量告警

    Args:
        stock_code: 股票代码
        volume_ratio: 量比阈值

    Returns:
        告警对象
    """
    return Alert(
        stock_code=stock_code,
        alert_type=AlertType.VOLUME_SPIKE,
        threshold=volume_ratio,
        enabled=True
    )


def create_rsi_alert(
    stock_code: str,
    rsi_threshold: float,
    alert_type: AlertType = AlertType.RSI_OVERBOUGHT
) -> Alert:
    """创建RSI告警

    Args:
        stock_code: 股票代码
        rsi_threshold: RSI阈值
        alert_type: RSI_OVERBOUGHT 或 RSI_OVERSOLD

    Returns:
        告警对象
    """
    return Alert(
        stock_code=stock_code,
        alert_type=alert_type,
        threshold=rsi_threshold,
        enabled=True
    )


def save_alerts_to_file(filepath: str = "alerts.json"):
    """保存告警配置到文件"""
    monitor = get_monitor()
    alerts_data = [
        {
            "stock_code": a.stock_code,
            "alert_type": a.alert_type.value,
            "threshold": a.threshold,
            "enabled": a.enabled
        }
        for a in monitor.alerts
    ]

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"alerts": alerts_data, "saved_at": datetime.now().isoformat()}, f, indent=2)


def load_alerts_from_file(filepath: str = "alerts.json") -> bool:
    """从文件加载告警配置"""
    if not os.path.exists(filepath):
        return False

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        monitor = get_monitor()
        monitor.alerts.clear()
        monitor.watched_stocks.clear()

        for a_data in data.get("alerts", []):
            alert = Alert(
                stock_code=a_data["stock_code"],
                alert_type=AlertType(a_data["alert_type"]),
                threshold=a_data["threshold"],
                enabled=a_data.get("enabled", True)
            )
            monitor.add_alert(alert)

        return True
    except Exception as e:
        print(f"Error loading alerts: {e}")
        return False