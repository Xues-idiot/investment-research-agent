# Rho - Stock Comparison Tools
# 多股票对比分析工具

import os
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from ..tools.financial_data import get_stock_info, get_financials, get_peer_comparison
from ..tools.stock_price import get_stock_price, get_indicators


def compare_stocks(stock_codes: List[str]) -> dict:
    """对比多只股票

    Args:
        stock_codes: 股票代码列表

    Returns:
        对比结果字典
    """
    if not stock_codes:
        return {"error": "股票代码列表不能为空"}

    if len(stock_codes) < 2:
        return {"error": "至少需要2只股票进行对比"}

    # 收集每只股票的数据
    stock_data = []
    for code in stock_codes:
        data = _collect_stock_data(code)
        if data:
            stock_data.append(data)

    if len(stock_data) < 2:
        return {"error": "有效股票数据不足"}

    # 生成对比表格
    comparison = _generate_comparison(stock_data)

    # 生成分析结论
    conclusions = _generate_conclusions(stock_data)

    return {
        "stocks": stock_data,
        "comparison": comparison,
        "conclusions": conclusions,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


def _collect_stock_data(stock_code: str) -> Optional[dict]:
    """收集单只股票数据"""
    try:
        info = get_stock_info(stock_code)
        price_data = get_stock_price(stock_code, period="1mo")
        indicators = get_indicators(stock_code, period="1mo")
        financials = get_financials(stock_code)

        price_change = price_data.get("price_change_pct", 0)

        return {
            "stockCode": stock_code,
            "name": info.get("name", stock_code),
            "price": info.get("price", 0),
            "change": price_change,
            "changePercent": price_change,
            "peRatio": info.get("pe_ratio"),
            "pbRatio": info.get("pb_ratio"),
            "marketCap": info.get("market_cap", 0),
            "dividendYield": info.get("dividend_yield", 0),
            "week52High": info.get("52w_high", 0),
            "week52Low": info.get("52w_low", 0),
            "volume": info.get("volume", 0),
            "avgVolume": info.get("avg_volume", 0),
            "priceChangePct": price_change,
            "rsi14": indicators.get("rsi_14"),
            "macd": indicators.get("macd"),
            "trend": indicators.get("trend", "unknown"),
            "sma20": indicators.get("sma_20"),
            "sma60": indicators.get("sma_60"),
            "bollPosition": indicators.get("boll_position", 0.5),
            "volumeRatio": indicators.get("volume_ratio", 1.0),
        }
    except Exception as e:
        print(f"Error collecting data for {stock_code}: {e}")
        return None


def _generate_comparison(stock_data: List[dict]) -> dict:
    """生成对比表格"""
    # 估值对比
    valuation_table = _create_valuation_table(stock_data)

    # 技术指标对比
    technical_table = _create_technical_table(stock_data)

    # 市场数据对比
    market_table = _create_market_table(stock_data)

    return {
        "valuation": valuation_table,
        "technical": technical_table,
        "market": market_table,
    }


def _create_valuation_table(stock_data: List[dict]) -> List[dict]:
    """创建估值对比表"""
    headers = ["股票", "代码", "当前价", "PE(TTM)", "PB", "股息率", "市值(亿)"]

    rows = []
    for stock in stock_data:
        market_cap_yi = (stock.get("marketCap", 0) or 0) / 1e8
        dividend = (stock.get("dividendYield", 0) or 0) * 100
        rows.append({
            "stock": stock.get("name", ""),
            "code": stock.get("stockCode", ""),
            "price": f"¥{stock.get('price', 0):.2f}",
            "pe": f"{stock.get('peRatio', 'N/A')}",
            "pb": f"{stock.get('pbRatio', 'N/A')}",
            "dividend": f"{dividend:.2f}%",
            "marketCap": f"{market_cap_yi:.2f}",
        })

    return {"headers": headers, "rows": rows}


def _create_technical_table(stock_data: List[dict]) -> List[dict]:
    """创建技术指标对比表"""
    headers = ["股票", "代码", "RSI(14)", "MACD", "趋势", "MA20", "MA60", "布林位置"]

    rows = []
    for stock in stock_data:
        rsi = stock.get("rsi14")
        rsi_str = f"{rsi:.1f}" if rsi else "N/A"

        macd = stock.get("macd", 0)
        macd_str = f"{macd:.2f}" if macd else "N/A"

        sma20 = stock.get("sma20")
        sma20_str = f"¥{sma20:.2f}" if sma20 else "N/A"

        sma60 = stock.get("sma60")
        sma60_str = f"¥{sma60:.2f}" if sma60 else "N/A"

        boll = stock.get("bollPosition", 0.5)
        boll_str = f"{boll*100:.1f}%"

        rows.append({
            "stock": stock.get("name", ""),
            "code": stock.get("stockCode", ""),
            "rsi": rsi_str,
            "macd": macd_str,
            "trend": stock.get("trend", "unknown"),
            "sma20": sma20_str,
            "sma60": sma60_str,
            "bollPosition": boll_str,
        })

    return {"headers": headers, "rows": rows}


def _create_market_table(stock_data: List[dict]) -> List[dict]:
    """创建市场数据对比表"""
    headers = ["股票", "代码", "涨跌幅", "52周高", "52周低", "成交量", "量比"]

    rows = []
    for stock in stock_data:
        volume_wan = (stock.get("volume", 0) or 0) / 10000
        volume_str = f"{volume_wan:.2f}万"

        price_change = stock.get("priceChangePct", 0)
        change_str = f"{price_change:+.2f}%"

        rows.append({
            "stock": stock.get("name", ""),
            "code": stock.get("stockCode", ""),
            "priceChange": change_str,
            "week52High": f"¥{stock.get('week52High', 0):.2f}",
            "week52Low": f"¥{stock.get('week52Low', 0):.2f}",
            "volume": volume_str,
            "volumeRatio": f"{stock.get('volumeRatio', 1.0):.2f}",
        })

    return {"headers": headers, "rows": rows}


def _generate_conclusions(stock_data: List[dict]) -> List[str]:
    """生成分析结论"""
    conclusions = []

    # PE 最低的股票
    valid_pe = [(s, s.get("peRatio")) for s in stock_data if s.get("peRatio")]
    if valid_pe:
        valid_pe.sort(key=lambda x: x[1])
        cheapest = valid_pe[0]
        conclusions.append(f"**估值最低**: {cheapest[0].get('name')}，PE仅 {cheapest[1]:.2f}")

    # 股息率最高的股票
    valid_div = [(s, s.get("dividendYield", 0)) for s in stock_data]
    if valid_div:
        valid_div.sort(key=lambda x: x[1], reverse=True)
        highest_div = valid_div[0]
        conclusions.append(f"**股息率最高**: {highest_div[0].get('name')}，股息率 {highest_div[1]*100:.2f}%")

    # RSI 超卖/超买
    valid_rsi = [(s, s.get("rsi14")) for s in stock_data if s.get("rsi14")]
    for stock, rsi in valid_rsi:
        if rsi < 30:
            conclusions.append(f"**{stock.get('name')} RSI超卖({rsi:.1f})**，可能存在反弹机会")
        elif rsi > 70:
            conclusions.append(f"**{stock.get('name')} RSI超买({rsi:.1f})**，注意回调风险")

    # 趋势最强的股票
    valid_trend = [(s, s.get("sma20", 0), s.get("sma60", 0), s.get("price", 0)) for s in stock_data]
    bullish = [s for s, ma20, ma60, price in valid_trend if ma20 and ma60 and price > ma20 > ma60]
    if bullish:
        conclusions.append(f"**多头排列**: {', '.join([s.get('name', '') for s in bullish])}")

    bearish = [s for s, ma20, ma60, price in valid_trend if ma20 and ma60 and price < ma20 < ma60]
    if bearish:
        conclusions.append(f"**空头排列**: {', '.join([s.get('name', '') for s in bearish])}")

    # 成交量异常
    valid_vol = [(s, s.get("volumeRatio", 1.0)) for s in stock_data]
    high_vol = [s for s, vr in valid_vol if vr > 2.0]
    if high_vol:
        conclusions.append(f"**成交量放大**: {', '.join([s.get('name', '') for s in high_vol])}")

    if not conclusions:
        conclusions.append("各股票技术指标无明显异常信号")

    return conclusions


def rank_stocks(stock_codes: List[str], criteria: str = "comprehensive") -> List[dict]:
    """股票排名

    Args:
        stock_codes: 股票代码列表
        criteria: 排名标准 (value/growth/technical/comprehensive)

    Returns:
        排名结果
    """
    stock_data = []
    for code in stock_codes:
        data = _collect_stock_data(code)
        if data:
            stock_data.append(data)

    if criteria == "value":
        # 价值投资排名：低PE + 高股息
        for stock in stock_data:
            score = 0
            pe = stock.get("peRatio")
            div = stock.get("dividendYield", 0)
            if pe and pe > 0:
                score += (30 / pe)  # PE越低越好
            score += div * 100  # 股息越高越好
            stock["score"] = score
        stock_data.sort(key=lambda x: x.get("score", 0), reverse=True)

    elif criteria == "growth":
        # 成长股排名：价格趋势 + 成交量
        for stock in stock_data:
            score = 0
            price_change = stock.get("priceChangePct", 0)
            volume_ratio = stock.get("volumeRatio", 1.0)
            score = price_change + (volume_ratio - 1) * 10
            stock["score"] = score
        stock_data.sort(key=lambda x: x.get("score", 0), reverse=True)

    elif criteria == "technical":
        # 技术面排名：RSI + 趋势 + 布林带
        for stock in stock_data:
            score = 50  # 基础分
            rsi = stock.get("rsi14", 50)
            if rsi:
                if 40 <= rsi <= 60:
                    score += 10  # 正常区间
                elif 30 <= rsi < 40 or 60 < rsi <= 70:
                    score += 5
                elif rsi < 30 or rsi > 70:
                    score -= 10  # 超买超卖

            trend = stock.get("trend", "")
            if "多头" in trend:
                score += 20
            elif "空头" in trend:
                score -= 20

            boll = stock.get("bollPosition", 0.5)
            if 0.3 <= boll <= 0.7:
                score += 10  # 布林带正常位置

            stock["score"] = score
        stock_data.sort(key=lambda x: x.get("score", 0), reverse=True)

    else:  # comprehensive
        # 综合排名
        for stock in stock_data:
            score = 0

            # 估值 (30分)
            pe = stock.get("peRatio")
            if pe and pe > 0:
                score += min(30, 30 / pe * 10)

            # 股息 (20分)
            div = stock.get("dividendYield", 0)
            score += min(20, div * 1000)

            # 技术 (30分)
            rsi = stock.get("rsi14", 50)
            if 40 <= rsi <= 60:
                score += 15
            elif 30 <= rsi < 40 or 60 < rsi <= 70:
                score += 10
            else:
                score += 5

            trend = stock.get("trend", "")
            if "多头" in trend:
                score += 15
            elif "空头" in trend:
                score += 5

            # 趋势 (20分)
            price_change = stock.get("priceChangePct", 0)
            score += min(20, max(-10, price_change * 2))

            stock["score"] = round(score, 2)

        stock_data.sort(key=lambda x: x.get("score", 0), reverse=True)

    # 添加排名
    for i, stock in enumerate(stock_data):
        stock["rank"] = i + 1

    return stock_data