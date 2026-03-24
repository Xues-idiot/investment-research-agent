# Rho - Stock Price Tools
# 获取股票价格和技术指标数据

import os
from datetime import datetime, timedelta
from typing import Optional

try:
    import yfinance as yf
    import pandas as pd
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False


def get_stock_price(stock_code: str, period: str = "1y") -> dict:
    """获取股票价格数据

    Args:
        stock_code: 股票代码
        period: 时间范围 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)

    Returns:
        股票价格数据
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        history = stock.history(period=period)

        if history is not None and not history.empty:
            return {
                "stock_code": stock_code,
                "current_price": float(history['Close'].iloc[-1]),
                "open": float(history['Open'].iloc[-1]),
                "high": float(history['High'].iloc[-1]),
                "low": float(history['Low'].iloc[-1]),
                "volume": int(history['Volume'].iloc[-1]),
                "price_change": float(history['Close'].iloc[-1] - history['Open'].iloc[-1]),
                "price_change_pct": float((history['Close'].iloc[-1] - history['Open'].iloc[-1]) / history['Open'].iloc[-1] * 100),
                "history": history.to_dict(),
            }
    return _get_mock_price(stock_code)


def get_indicators(stock_code: str, period: str = "1y") -> dict:
    """获取技术指标

    Args:
        stock_code: 股票代码
        period: 时间范围

    Returns:
        技术指标数据
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        history = stock.history(period=period)

        if history is not None and not history.empty:
            close_prices = history['Close']
            volumes = history['Volume']

            # 计算简单移动平均
            sma_5 = close_prices.rolling(window=5).mean().iloc[-1] if len(close_prices) >= 5 else None
            sma_10 = close_prices.rolling(window=10).mean().iloc[-1] if len(close_prices) >= 10 else None
            sma_20 = close_prices.rolling(window=20).mean().iloc[-1] if len(close_prices) >= 20 else None
            sma_60 = close_prices.rolling(window=60).mean().iloc[-1] if len(close_prices) >= 60 else None
            sma_120 = close_prices.rolling(window=120).mean().iloc[-1] if len(close_prices) >= 120 else None
            sma_200 = close_prices.rolling(window=200).mean().iloc[-1] if len(close_prices) >= 200 else None

            # 计算 RSI (14天)
            delta = close_prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs)).iloc[-1] if len(close_prices) >= 14 else None

            # 计算 KDJ
            low_min = close_prices.rolling(window=9).min()
            high_max = close_prices.rolling(window=9).max()
            k = 50 * (close_prices - low_min) / (high_max - low_min + 1e-9)
            d = k.rolling(window=3).mean()
            j = 3 * k - 2 * d

            # MACD
            exp12 = close_prices.ewm(span=12, adjust=False).mean()
            exp26 = close_prices.ewm(span=26, adjust=False).mean()
            macd = exp12 - exp26
            signal = macd.ewm(span=9, adjust=False).mean()
            macd_histogram = macd - signal

            # 布林带 (20日, 2倍标准差)
            sma_20_for_boll = close_prices.rolling(window=20).mean()
            std_20 = close_prices.rolling(window=20).std()
            boll_upper = sma_20_for_boll + 2 * std_20
            boll_lower = sma_20_for_boll - 2 * std_20
            boll_position = (close_prices.iloc[-1] - boll_lower.iloc[-1]) / (boll_upper.iloc[-1] - boll_lower.iloc[-1] + 1e-9) if boll_upper.iloc[-1] != boll_lower.iloc[-1] else 0.5

            # 成交量分析
            avg_volume_5 = volumes.rolling(window=5).mean().iloc[-1] if len(volumes) >= 5 else None
            avg_volume_20 = volumes.rolling(window=20).mean().iloc[-1] if len(volumes) >= 20 else None
            volume_ratio = volumes.iloc[-1] / avg_volume_20 if avg_volume_20 else 1.0

            current_price = float(close_prices.iloc[-1])
            current_volume = int(volumes.iloc[-1])

            # 趋势判断
            if sma_60 and sma_120 and sma_200:
                if current_price > sma_60 > sma_120 > sma_200:
                    trend = "多头排列(强势上升)"
                elif current_price < sma_60 < sma_120 < sma_200:
                    trend = "空头排列(强势下降)"
                elif current_price > sma_60 and sma_120 > sma_200:
                    trend = "短多中空"
                elif current_price < sma_60 and sma_120 < sma_200:
                    trend = "短空中多"
                else:
                    trend = "混乱(震荡)"
            else:
                trend = "震荡"

            return {
                "stock_code": stock_code,
                "current_price": current_price,
                "sma_5": float(sma_5) if sma_5 else None,
                "sma_10": float(sma_10) if sma_10 else None,
                "sma_20": float(sma_20) if sma_20 else None,
                "sma_60": float(sma_60) if sma_60 else None,
                "sma_120": float(sma_120) if sma_120 else None,
                "sma_200": float(sma_200) if sma_200 else None,
                "rsi_14": float(rsi) if rsi else None,
                "kdj_k": float(k.iloc[-1]) if not pd.isna(k.iloc[-1]) else None,
                "kdj_d": float(d.iloc[-1]) if not pd.isna(d.iloc[-1]) else None,
                "kdj_j": float(j.iloc[-1]) if not pd.isna(j.iloc[-1]) else None,
                "macd": float(macd.iloc[-1]),
                "macd_signal": float(signal.iloc[-1]),
                "macd_histogram": float(macd_histogram.iloc[-1]),
                "boll_upper": float(boll_upper.iloc[-1]) if not pd.isna(boll_upper.iloc[-1]) else None,
                "boll_middle": float(sma_20_for_boll.iloc[-1]) if not pd.isna(sma_20_for_boll.iloc[-1]) else None,
                "boll_lower": float(boll_lower.iloc[-1]) if not pd.isna(boll_lower.iloc[-1]) else None,
                "boll_position": float(boll_position),
                "current_volume": current_volume,
                "volume_ratio": float(volume_ratio),
                "avg_volume_5": float(avg_volume_5) if avg_volume_5 else None,
                "avg_volume_20": float(avg_volume_20) if avg_volume_20 else None,
                "trend": trend,
            }
    return _get_mock_indicators(stock_code)


def _get_mock_price(stock_code: str) -> dict:
    """获取模拟价格数据"""
    return {
        "stock_code": stock_code,
        "current_price": 1680.0,
        "open": 1675.0,
        "high": 1690.0,
        "low": 1665.0,
        "volume": 2500000,
        "price_change": 5.0,
        "price_change_pct": 0.30,
    }


def _get_mock_indicators(stock_code: str) -> dict:
    """获取模拟技术指标"""
    return {
        "stock_code": stock_code,
        "current_price": 1680.0,
        "sma_20": 1650.0,
        "sma_50": 1620.0,
        "sma_200": 1550.0,
        "rsi_14": 58.5,
        "macd": 25.0,
        "macd_signal": 20.0,
        "macd_histogram": 5.0,
        "trend": "bullish",
    }
