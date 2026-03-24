# Rho - Technical Analyst Agent
# 技术分析：价格走势、技术指标、均线系统、趋势判断

from datetime import datetime
from langchain_core.prompts import ChatPromptTemplate

from .research_state import AnalystReport
from ..tools.stock_price import get_stock_price, get_indicators
from ..prompts import TECHNICAL_ANALYST_PROMPT


def create_technical_analyst(llm):
    """创建技术分析 Agent"""

    def technical_analyst_node(state: dict) -> dict:
        """技术分析节点"""
        stock_code = state.get("company_of_interest", "")

        # 获取价格和指标数据
        price_data = get_stock_price(stock_code, period="3mo")
        indicators = get_indicators(stock_code, period="3mo")

        # 构建上下文
        context = _build_technical_context(stock_code, price_data, indicators)

        # 使用模板
        prompt_template = TECHNICAL_ANALYST_PROMPT.format(technical_data=context)
        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_template),
            ("human", f"请分析股票 {stock_code} 的技术面数据。")
        ])

        chain = prompt | llm
        result = chain.invoke({})

        report_content = result.content if hasattr(result, 'content') else str(result)
        confidence = _calculate_technical_confidence(indicators)

        report: AnalystReport = {
            "content": report_content,
            "confidence": confidence,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        return {
            "messages": [result],
            "technical_report": report,
            "current_agent": "Technical Analyst",
        }

    return technical_analyst_node


def _build_technical_context(stock_code: str, price_data: dict, indicators: dict) -> str:
    """构建技术分析上下文"""
    current_price = indicators.get('current_price', price_data.get('current_price', 0))
    sma_5 = indicators.get('sma_5', 0)
    sma_10 = indicators.get('sma_10', 0)
    sma_20 = indicators.get('sma_20', 0)
    sma_60 = indicators.get('sma_60', 0)
    sma_120 = indicators.get('sma_120', 0)
    sma_200 = indicators.get('sma_200', 0)
    rsi = indicators.get('rsi_14', 0)
    kdj_k = indicators.get('kdj_k', 0)
    kdj_d = indicators.get('kdj_d', 0)
    kdj_j = indicators.get('kdj_j', 0)
    macd = indicators.get('macd', 0)
    macd_signal = indicators.get('macd_signal', 0)
    macd_histogram = indicators.get('macd_histogram', 0)
    boll_upper = indicators.get('boll_upper', 0)
    boll_middle = indicators.get('boll_middle', 0)
    boll_lower = indicators.get('boll_lower', 0)
    boll_position = indicators.get('boll_position', 0.5)
    current_volume = indicators.get('current_volume', 0)
    volume_ratio = indicators.get('volume_ratio', 1.0)
    trend = indicators.get('trend', 'unknown')

    # 均线排列判断
    if sma_60 and sma_120 and sma_200:
        if current_price > sma_60 > sma_120 > sma_200:
            ma排列 = "多头排列(强势上升)"
        elif current_price < sma_60 < sma_120 < sma_200:
            ma排列 = "空头排列(强势下降)"
        elif current_price > sma_60:
            ma排列 = "短多中空"
        elif current_price < sma_60:
            ma排列 = "短空中多"
        else:
            ma排列 = "混乱(震荡)"
    else:
        ma排列 = "数据不足"

    # RSI 解读
    rsi解读 = "超买区域(谨慎)" if rsi and rsi > 70 else \
              "超卖区域(关注机会)" if rsi and rsi < 30 else \
              "正常区间(50={})".format(rsi) if rsi else "数据不足"

    # KDJ 解读
    if kdj_k and kdj_d and kdj_j:
        if kdj_j > 80:
            kdj解读 = "超买区域(谨慎)"
        elif kdj_j < 20:
            kdj解读 = "超卖区域(关注机会)"
        elif kdj_k > kdj_d:
            kdj解读 = "金叉(买入信号)"
        else:
            kdj解读 = "死叉(卖出信号)"
    else:
        kdj解读 = "数据不足"

    # MACD 解读
    macd解读 = "金叉(买入信号)" if macd and macd_signal and macd > macd_signal else \
               "死叉(卖出信号)" if macd and macd_signal and macd < macd_signal else \
               "盘整"

    # 布林带位置解读
    if boll_position:
        if boll_position > 0.8:
            boll解读 = "触及上轨(谨慎，可能回调)"
        elif boll_position < 0.2:
            boll解读 = "触及下轨(关注，可能反弹)"
        else:
            boll解读 = "中轨附近(震荡)"
    else:
        boll解读 = "数据不足"

    # 量价关系
    if volume_ratio:
        if volume_ratio > 1.5:
            量价解读 = "放量(活跃)"
        elif volume_ratio > 1.0:
            量价解读 = "小幅放量"
        elif volume_ratio < 0.5:
            量价解读 = "缩量(不活跃)"
        else:
            量价解读 = "量能正常"
    else:
        量价解读 = "数据不足"

    context = f"""
=== 股票代码 ===
{stock_code}

=== 价格数据 ===
当前价格: ¥{current_price}
今日涨跌幅: {price_data.get('price_change_pct', 0):.2f}%
52周最高: {price_data.get('52w_high')}
52周最低: {price_data.get('52w_low')}

=== 均线系统 ===
MA5(5日均线): {sma_5:.2f if sma_5 else 'N/A'}
MA10(10日均线): {sma_10:.2f if sma_10 else 'N/A'}
MA20(20日均线): {sma_20:.2f if sma_20 else 'N/A'}
MA60(60日均线): {sma_60:.2f if sma_60 else 'N/A'}
MA120(120日均线): {sma_120:.2f if sma_120 else 'N/A'}
MA200(200日均线): {sma_200:.2f if sma_200 else 'N/A'}
均线排列: {ma排列}

=== 动量指标 ===
RSI(14日): {rsi:.1f if rsi else 'N/A'} - {rsi解读}
KDJ: K={kdj_k:.1f if kdj_k else 'N/A'} D={kdj_d:.1f if kdj_d else 'N/A'} J={kdj_j:.1f if kdj_j else 'N/A'} - {kdj解读}
MACD: {macd:.2f if macd else 'N/A'}
MACD Signal: {macd_signal:.2f if macd_signal else 'N/A'}
MACD柱状图: {macd_histogram:.2f if macd_histogram else 'N/A'}
MACD状态: {macd解读}

=== 布林带 ===
上轨: {boll_upper:.2f if boll_upper else 'N/A'}
中轨: {boll_middle:.2f if boll_middle else 'N/A'}
下轨: {boll_lower:.2f if boll_lower else 'N/A'}
当前位置: {boll_position:.2%} - {boll解读}

=== 成交量分析 ===
当前成交量: {current_volume:,}手
量比: {volume_ratio:.2f if volume_ratio else 'N/A'}
量价关系: {量价解读}

=== 趋势判断 ===
当前趋势: {trend}
"""
    return context


def _calculate_technical_confidence(indicators: dict) -> float:
    """计算技术分析置信度"""
    confidence = 0.5

    # RSI 置信度
    rsi = indicators.get('rsi_14', 50)
    if rsi and 30 <= rsi <= 70:
        confidence += 0.1  # RSI 在正常范围

    # MACD 置信度
    macd = indicators.get('macd', 0)
    macd_signal = indicators.get('macd_signal', 0)
    if macd and macd_signal and abs(macd - macd_signal) > 5:
        confidence += 0.1  # MACD 趋势明显

    # KDJ 置信度
    kdj_j = indicators.get('kdj_j', 50)
    if kdj_j and (kdj_j < 20 or kdj_j > 80):
        confidence += 0.1  # KDJ 给出明确信号

    # 成交量置信度
    volume_ratio = indicators.get('volume_ratio', 1.0)
    if volume_ratio and volume_ratio > 1.5:
        confidence += 0.1  # 放量确认趋势

    # 均线排列置信度
    trend = indicators.get('trend', 'unknown')
    if trend in ['多头排列(强势上升)', '空头排列(强势下降)']:
        confidence += 0.1  # 明确的趋势

    return min(confidence, 0.9)
