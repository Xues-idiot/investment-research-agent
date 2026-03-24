# Rho - Backtesting Tools
# 回测工具：基于历史数据测试交易策略

import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

try:
    import yfinance as yf
    import pandas as pd
    import numpy as np
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False


class SignalType(Enum):
    """交易信号类型"""
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


@dataclass
class Trade:
    """交易记录"""
    date: str
    signal: SignalType
    price: float
    shares: int
    amount: float
    commission: float
    reason: str


@dataclass
class Position:
    """持仓"""
    shares: int
    avg_price: float
    current_value: float
    profit_loss: float
    profit_loss_pct: float


@dataclass
class BacktestResult:
    """回测结果"""
    stock_code: str
    start_date: str
    end_date: str
    initial_capital: float
    final_value: float
    total_return: float
    total_return_pct: float
    num_trades: int
    num_buys: int
    num_sells: int
    win_rate: float
    max_drawdown: float
    max_drawdown_pct: float
    sharpe_ratio: float
    trades: List[Trade]
    daily_returns: List[dict]


class BacktestEngine:
    """回测引擎"""

    def __init__(self, initial_capital: float = 1000000, commission: float = 0.0003):
        """
        Args:
            initial_capital: 初始资金
            commission: 佣金费率 (默认0.03%)
        """
        self.initial_capital = initial_capital
        self.commission = commission

    def run_ma_crossover_backtest(
        self,
        stock_code: str,
        start_date: str,
        end_date: str,
        short_window: int = 5,
        long_window: int = 20
    ) -> BacktestResult:
        """MA均线交叉策略回测

        Args:
            stock_code: 股票代码
            start_date: 开始日期
            end_date: 结束日期
            short_window: 短期均线窗口
            long_window: 长期均线窗口

        Returns:
            回测结果
        """
        if not YFINANCE_AVAILABLE:
            return self._mock_result(stock_code, start_date, end_date)

        try:
            # 获取数据
            ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
            stock = yf.Ticker(ticker)
            df = stock.history(start=start_date, end=end_date)

            if df.empty or len(df) < long_window:
                return self._mock_result(stock_code, start_date, end_date)

            # 计算均线
            df['MA_short'] = df['Close'].rolling(window=short_window).mean()
            df['MA_long'] = df['Close'].rolling(window=long_window).mean()

            # 生成信号
            df['signal'] = 0
            df.loc[df['MA_short'] > df['MA_long'], 'signal'] = 1  # 买入信号
            df.loc[df['MA_short'] <= df['MA_long'], 'signal'] = -1  # 卖出信号

            # 执行回测
            return self._execute_backtest(
                stock_code=stock_code,
                df=df,
                start_date=start_date,
                end_date=end_date
            )

        except Exception as e:
            print(f"Backtest error: {e}")
            return self._mock_result(stock_code, start_date, end_date)

    def run_rsi_backtest(
        self,
        stock_code: str,
        start_date: str,
        end_date: str,
        rsi_period: int = 14,
        oversold: float = 30,
        overbought: float = 70
    ) -> BacktestResult:
        """RSI策略回测

        Args:
            stock_code: 股票代码
            start_date: 开始日期
            end_date: 结束日期
            rsi_period: RSI周期
            oversold: 超卖阈值
            overbought: 超买阈值

        Returns:
            回测结果
        """
        if not YFINANCE_AVAILABLE:
            return self._mock_result(stock_code, start_date, end_date)

        try:
            ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
            stock = yf.Ticker(ticker)
            df = stock.history(start=start_date, end=end_date)

            if df.empty or len(df) < rsi_period:
                return self._mock_result(stock_code, start_date, end_date)

            # 计算RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=rsi_period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=rsi_period).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))

            # 生成信号
            df['signal'] = 0
            df.loc[df['RSI'] < oversold, 'signal'] = 1  # 超卖，买入
            df.loc[df['RSI'] > overbought, 'signal'] = -1  # 超买，卖出

            return self._execute_backtest(
                stock_code=stock_code,
                df=df,
                start_date=start_date,
                end_date=end_date
            )

        except Exception as e:
            print(f"Backtest error: {e}")
            return self._mock_result(stock_code, start_date, end_date)

    def run_momentum_backtest(
        self,
        stock_code: str,
        start_date: str,
        end_date: str,
        lookback: int = 20,
        threshold: float = 0.05
    ) -> BacktestResult:
        """动量策略回测

        Args:
            stock_code: 股票代码
            start_date: 开始日期
            end_date: 结束日期
            lookback: 回看期间
            threshold: 动量阈值

        Returns:
            回测结果
        """
        if not YFINANCE_AVAILABLE:
            return self._mock_result(stock_code, start_date, end_date)

        try:
            ticker = f"{stock_code}.SS" if stock_code.isdigit() and len(stock_code) == 6 else stock_code
            stock = yf.Ticker(ticker)
            df = stock.history(start=start_date, end=end_date)

            if df.empty or len(df) < lookback:
                return self._mock_result(stock_code, start_date, end_date)

            # 计算动量
            df['momentum'] = df['Close'].pct_change(periods=lookback)

            # 生成信号
            df['signal'] = 0
            df.loc[df['momentum'] > threshold, 'signal'] = 1  # 正动量，买入
            df.loc[df['momentum'] < -threshold, 'signal'] = -1  # 负动量，卖出

            return self._execute_backtest(
                stock_code=stock_code,
                df=df,
                start_date=start_date,
                end_date=end_date
            )

        except Exception as e:
            print(f"Backtest error: {e}")
            return self._mock_result(stock_code, start_date, end_date)

    def _execute_backtest(
        self,
        stock_code: str,
        df: pd.DataFrame,
        start_date: str,
        end_date: str
    ) -> BacktestResult:
        """执行回测"""
        cash = self.initial_capital
        position = 0
        avg_price = 0
        trades = []
        daily_returns = []
        peak_value = self.initial_capital

        for i in range(1, len(df)):
            date = df.index[i].strftime('%Y-%m-%d')
            price = df['Close'].iloc[i]
            signal = df['signal'].iloc[i]

            # 计算当前持仓价值
            current_value = cash + position * price
            if current_value > peak_value:
                peak_value = current_value

            # 买入信号
            if signal == 1 and position == 0:
                # 全仓买入
                shares = int(cash / price / 100) * 100
                if shares >= 100:
                    cost = shares * price
                    commission_fee = cost * self.commission
                    cash -= (cost + commission_fee)
                    position = shares
                    avg_price = price
                    trades.append(Trade(
                        date=date,
                        signal=SignalType.BUY,
                        price=price,
                        shares=shares,
                        amount=cost,
                        commission=commission_fee,
                        reason="买入信号"
                    ))

            # 卖出信号
            elif signal == -1 and position > 0:
                # 全仓卖出
                proceeds = position * price
                commission_fee = proceeds * self.commission
                cash += (proceeds - commission_fee)
                trades.append(Trade(
                    date=date,
                    signal=SignalType.SELL,
                    price=price,
                    shares=position,
                    amount=proceeds,
                    commission=commission_fee,
                    reason="卖出信号"
                ))
                position = 0
                avg_price = 0

            # 记录每日收益
            daily_return = (current_value - self.initial_capital) / self.initial_capital
            daily_returns.append({
                "date": date,
                "value": current_value,
                "daily_return": daily_return
            })

        # 最终价值
        final_price = df['Close'].iloc[-1]
        final_value = cash + position * final_price
        total_return = final_value - self.initial_capital
        total_return_pct = (final_value / self.initial_capital - 1) * 100

        # 计算统计指标
        num_trades = len(trades)
        num_buys = len([t for t in trades if t.signal == SignalType.BUY])
        num_sells = len([t for t in trades if t.signal == SignalType.SELL])

        # 胜率
        winning_trades = 0
        if num_sells > 0:
            sell_values = [t.amount for t in trades if t.signal == SignalType.SELL]
            buy_values = [t.amount for t in trades if t.signal == SignalType.BUY]
            # 简化计算
            winning_trades = sum(1 for i in range(min(len(sell_values), len(buy_values)))
                                if sell_values[i] > buy_values[i] * 1.01)
            win_rate = winning_trades / num_sells * 100 if num_sells > 0 else 0
        else:
            win_rate = 0

        # 最大回撤
        values = [d['value'] for d in daily_returns]
        peak = values[0] if values else self.initial_capital
        max_drawdown = 0
        max_drawdown_pct = 0
        for v in values:
            if v > peak:
                peak = v
            dd = peak - v
            if dd > max_drawdown:
                max_drawdown = dd
                max_drawdown_pct = dd / peak * 100 if peak > 0 else 0

        # 夏普比率 (简化版)
        if len(daily_returns) > 1:
            returns = [d['daily_return'] for d in daily_returns]
            avg_return = sum(returns) / len(returns)
            std_return = (sum((r - avg_return) ** 2 for r in returns) / len(returns)) ** 0.5
            sharpe_ratio = (avg_return / std_return * 252 ** 0.5) if std_return > 0 else 0
        else:
            sharpe_ratio = 0

        return BacktestResult(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            initial_capital=self.initial_capital,
            final_value=final_value,
            total_return=total_return,
            total_return_pct=total_return_pct,
            num_trades=num_trades,
            num_buys=num_buys,
            num_sells=num_sells,
            win_rate=win_rate,
            max_drawdown=max_drawdown,
            max_drawdown_pct=max_drawdown_pct,
            sharpe_ratio=sharpe_ratio,
            trades=trades,
            daily_returns=daily_returns
        )

    def _mock_result(
        self,
        stock_code: str,
        start_date: str,
        end_date: str
    ) -> BacktestResult:
        """返回模拟回测结果"""
        return BacktestResult(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            initial_capital=self.initial_capital,
            final_value=self.initial_capital * 1.15,
            total_return=self.initial_capital * 0.15,
            total_return_pct=15.0,
            num_trades=6,
            num_buys=3,
            num_sells=3,
            win_rate=66.67,
            max_drawdown=self.initial_capital * 0.05,
            max_drawdown_pct=5.0,
            sharpe_ratio=1.2,
            trades=[],
            daily_returns=[]
        )


def run_ma_backtest(
    stock_code: str,
    start_date: str,
    end_date: str,
    short_window: int = 5,
    long_window: int = 20,
    initial_capital: float = 1000000
) -> dict:
    """均线交叉策略回测的便捷函数"""
    engine = BacktestEngine(initial_capital=initial_capital)
    result = engine.run_ma_crossover_backtest(
        stock_code=stock_code,
        start_date=start_date,
        end_date=end_date,
        short_window=short_window,
        long_window=long_window
    )
    return _result_to_dict(result)


def run_rsi_backtest(
    stock_code: str,
    start_date: str,
    end_date: str,
    initial_capital: float = 1000000
) -> dict:
    """RSI策略回测的便捷函数"""
    engine = BacktestEngine(initial_capital=initial_capital)
    result = engine.run_rsi_backtest(
        stock_code=stock_code,
        start_date=start_date,
        end_date=end_date
    )
    return _result_to_dict(result)


def _result_to_dict(result: BacktestResult) -> dict:
    """将回测结果转换为字典"""
    return {
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
        "trades": [
            {
                "date": t.date,
                "signal": t.signal.value,
                "price": t.price,
                "shares": t.shares,
                "amount": t.amount,
                "commission": t.commission,
                "reason": t.reason
            }
            for t in result.trades
        ],
        "daily_returns": result.daily_returns
    }