# Rho - Financial Data Tools
# 获取股票财务数据：财报、资产负债表、现金流等

import os
import json
from datetime import datetime
from typing import Optional

# 尝试导入 yfinance，如果不可用则使用模拟数据
try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False


def get_stock_info(stock_code: str) -> dict:
    """获取股票基本信息

    Args:
        stock_code: 股票代码，如 "600519" (贵州茅台)

    Returns:
        股票基本信息字典
    """
    if YFINANCE_AVAILABLE:
        # 转换为中国股票代码格式
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        info = stock.info

        return {
            "stock_code": stock_code,
            "name": info.get("longName", info.get("shortName", "")),
            "price": info.get("currentPrice", info.get("regularMarketPrice")),
            "pe_ratio": info.get("trailingPE"),
            "pb_ratio": info.get("priceToBook"),
            "market_cap": info.get("marketCap"),
            "dividend_yield": info.get("dividendYield"),
            "52w_high": info.get("fiftyTwoWeekHigh"),
            "52w_low": info.get("fiftyTwoWeekLow"),
            "volume": info.get("volume"),
            "avg_volume": info.get("averageVolume"),
        }
    else:
        # 模拟数据
        return _get_mock_stock_info(stock_code)


def get_financials(stock_code: str) -> dict:
    """获取财务数据

    Args:
        stock_code: 股票代码

    Returns:
        财务数据字典
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)

        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow

        return {
            "income_statement": financials.to_dict() if financials is not None else {},
            "balance_sheet": balance_sheet.to_dict() if balance_sheet is not None else {},
            "cashflow": cashflow.to_dict() if cashflow is not None else {},
        }
    else:
        return _get_mock_financials(stock_code)


def get_income_statement(stock_code: str) -> dict:
    """获取损益表

    Args:
        stock_code: 股票代码

    Returns:
        损益表数据
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        financials = stock.financials
        return financials.to_dict() if financials is not None else {}
    else:
        return _get_mock_income_statement(stock_code)


def get_balance_sheet(stock_code: str) -> dict:
    """获取资产负债表

    Args:
        stock_code: 股票代码

    Returns:
        资产负债表数据
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        balance_sheet = stock.balance_sheet
        return balance_sheet.to_dict() if balance_sheet is not None else {}
    else:
        return _get_mock_balance_sheet(stock_code)


def get_cashflow(stock_code: str) -> dict:
    """获取现金流量表

    Args:
        stock_code: 股票代码

    Returns:
        现金流量表数据
    """
    if YFINANCE_AVAILABLE:
        ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
        stock = yf.Ticker(ticker)
        cashflow = stock.cashflow
        return cashflow.to_dict() if cashflow is not None else {}
    else:
        return _get_mock_cashflow(stock_code)


def get_fundamentals(stock_code: str) -> dict:
    """获取综合基本面数据

    Args:
        stock_code: 股票代码

    Returns:
        综合基本面数据
    """
    info = get_stock_info(stock_code)
    financials = get_financials(stock_code)

    return {
        "basic_info": info,
        "financials": financials,
        "analysis_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def get_peer_comparison(stock_code: str, peer_codes: list = None) -> dict:
    """获取竞品对比数据

    Args:
        stock_code: 目标股票代码
        peer_codes: 可比公司股票代码列表，默认使用行业龙头

    Returns:
        竞品对比数据
    """
    # 白酒行业默认可比公司
    default_peers = {
        "600519": ["000858", "000568", "002304"],  # 茅台、五粮液、洋河
        "000858": ["600519", "000568", "002304"],
        "000568": ["600519", "000858", "002304"],
        "000001": ["600036", "001848", "600000"],  # 平安银行系
    }

    if peer_codes is None:
        peer_codes = default_peers.get(stock_code, [])

    # 获取目标股票信息
    target_info = get_stock_info(stock_code)
    target_financials = get_financials(stock_code)

    # 获取可比公司信息
    peer_data = []
    for peer in peer_codes:
        peer_info = get_stock_info(peer)
        if peer_info:
            peer_data.append(peer_info)

    return {
        "target": {
            "stock_code": stock_code,
            "name": target_info.get("name", ""),
            "price": target_info.get("price", 0),
            "pe_ratio": target_info.get("pe_ratio"),
            "pb_ratio": target_info.get("pb_ratio"),
            "market_cap": target_info.get("market_cap", 0),
            "dividend_yield": target_info.get("dividend_yield", 0),
        },
        "peers": peer_data,
        "comparison_date": datetime.now().strftime("%Y-%m-%d")
    }


# ============ 模拟数据函数（yfinance 不可用时使用）============

def _get_mock_stock_info(stock_code: str) -> dict:
    """获取模拟股票信息"""
    mock_data = {
        "600519": {
            "stock_code": "600519",
            "name": "贵州茅台",
            "price": 1680.0,
            "pe_ratio": 28.5,
            "pb_ratio": 10.2,
            "market_cap": 2100000000000,
            "dividend_yield": 0.015,
            "52w_high": 1850.0,
            "52w_low": 1350.0,
            "volume": 2500000,
            "avg_volume": 3000000,
        },
        "000858": {
            "stock_code": "000858",
            "name": "五粮液",
            "price": 145.0,
            "pe_ratio": 22.0,
            "pb_ratio": 5.5,
            "market_cap": 560000000000,
            "dividend_yield": 0.025,
            "52w_high": 168.0,
            "52w_low": 120.0,
            "volume": 45000000,
            "avg_volume": 50000000,
        }
    }
    return mock_data.get(stock_code, {
        "stock_code": stock_code,
        "name": f"股票{stock_code}",
        "price": 100.0,
        "pe_ratio": 20.0,
        "pb_ratio": 3.0,
        "market_cap": 100000000000,
        "dividend_yield": 0.02,
        "52w_high": 120.0,
        "52w_low": 80.0,
        "volume": 10000000,
        "avg_volume": 12000000,
    })


def _get_mock_financials(stock_code: str) -> dict:
    """获取模拟财务数据"""
    return {
        "revenue_growth": "12%",
        "profit_growth": "14%",
        "gross_margin": "91%",
        "net_margin": "50%",
        "roe": "30%",
        "debt_ratio": "25%",
        "current_ratio": "3.0",
        "quick_ratio": "2.5",
    }


def _get_mock_income_statement(stock_code: str) -> dict:
    """获取模拟损益表"""
    return {
        "2024": {
            "revenue": 150000000000,
            "cost_of_revenue": 15000000000,
            "gross_profit": 135000000000,
            "operating_expense": 50000000000,
            "net_income": 75000000000,
        },
        "2023": {
            "revenue": 135000000000,
            "cost_of_revenue": 13000000000,
            "gross_profit": 122000000000,
            "operating_expense": 45000000000,
            "net_income": 66000000000,
        }
    }


def _get_mock_balance_sheet(stock_code: str) -> dict:
    """获取模拟资产负债表"""
    return {
        "total_assets": 250000000000,
        "total_liabilities": 60000000000,
        "total_equity": 190000000000,
        "current_assets": 150000000000,
        "non_current_assets": 100000000000,
    }


def _get_mock_cashflow(stock_code: str) -> dict:
    """获取模拟现金流量表"""
    return {
        "operating_cashflow": 80000000000,
        "investing_cashflow": -10000000000,
        "financing_cashflow": -20000000000,
        "free_cashflow": 70000000000,
    }
