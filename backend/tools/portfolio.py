# Rho - Portfolio Management Tools
# 投资组合管理工具：组合建议、仓位管理、风险分散

from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

from ..tools.financial_data import get_stock_info, get_peer_comparison
from ..tools.stock_price import get_indicators, get_stock_price
from ..tools.stock_comparison import rank_stocks


class RiskLevel(Enum):
    """风险等级"""
    CONSERVATIVE = "conservative"  # 保守型
    MODERATE = "moderate"           # 稳健型
    AGGRESSIVE = "aggressive"       # 激进型


class InvestmentStrategy(Enum):
    """投资策略"""
    VALUE = "value"                 # 价值投资
    GROWTH = "growth"               # 成长投资
    BALANCED = "balanced"           # 平衡型
    MOMENTUM = "momentum"           # 动量/趋势


@dataclass
class PortfolioStock:
    """组合中的股票"""
    stock_code: str
    stock_name: str
    weight: float           # 权重 (0-1)
    shares: int              # 股数
    entry_price: float      # 买入价格
    current_price: float     # 当前价格
    market_value: float      # 市值
    profit_loss: float       # 盈亏金额
    profit_loss_pct: float   # 盈亏比例
    risk_score: float        # 风险评分 (1-5)


@dataclass
class Portfolio:
    """投资组合"""
    name: str
    stocks: List[PortfolioStock]
    total_value: float
    total_cost: float
    profit_loss: float
    profit_loss_pct: float
    risk_level: str
    diversification_score: float  # 分散化评分 (0-10)


class PortfolioOptimizer:
    """组合优化器"""

    def __init__(self, risk_level: str = "moderate"):
        self.risk_level = risk_level

    def suggest_allocation(
        self,
        stock_codes: List[str],
        total_capital: float,
        strategy: str = "balanced"
    ) -> dict:
        """生成仓位建议

        Args:
            stock_codes: 候选股票列表
            total_capital: 总资金
            strategy: 投资策略

        Returns:
            仓位建议
        """
        # 获取股票排名
        ranked = rank_stocks(stock_codes, strategy)

        if not ranked:
            return {"error": "没有有效的股票数据"}

        # 根据风险等级决定持仓数量
        num_positions = self._get_position_count()

        # 取前N只股票
        selected = ranked[:num_positions]

        # 计算权重
        weights = self._calculate_weights(selected, strategy)

        # 生成持仓建议
        holdings = []
        total_invested = 0

        for i, stock in enumerate(selected):
            weight = weights[i]
            allocation = total_capital * weight

            # 获取当前价格
            price = stock.get("price", 0)
            if price <= 0:
                continue

            # 计算股数 (100股为最小单位)
            shares = int(allocation / price / 100) * 100
            if shares < 100:
                shares = 100

            invested = shares * price
            total_invested += invested

            holdings.append({
                "stock_code": stock.get("stockCode"),
                "stock_name": stock.get("name"),
                "weight": weight,
                "shares": shares,
                "entry_price": price,
                "allocation": invested,
                "allocation_pct": invested / total_capital * 100,
            })

        # 计算现金保留
        cash_reserve = total_capital - total_invested

        return {
            "total_capital": total_capital,
            "total_invested": total_invested,
            "cash_reserve": cash_reserve,
            "cash_reserve_pct": cash_reserve / total_capital * 100,
            "holdings": holdings,
            "num_positions": len(holdings),
            "strategy": strategy,
            "risk_level": self.risk_level,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    def _get_position_count(self) -> int:
        """根据风险等级确定持仓数量"""
        if self.risk_level == "conservative":
            return 3  # 3-5只
        elif self.risk_level == "moderate":
            return 5  # 5-8只
        else:  # aggressive
            return 8  # 8-15只

    def _calculate_weights(self, stocks: List[dict], strategy: str) -> List[float]:
        """计算权重分配"""
        n = len(stocks)

        if strategy == "value":
            # 价值投资：低估值权重更高
            # 简单用排名倒数作为权重
            weights = [1 / (n - i) for i in range(n)]
        elif strategy == "growth":
            # 成长投资：动量强的权重更高
            weights = [1 / (n - i) for i in range(n)]
        elif strategy == "momentum":
            # 动量策略：强者恒强
            weights = [1 / (n - i) for i in range(n)]
        else:  # balanced
            # 平衡策略：等权重或小幅调整
            weights = [1.0 / n for _ in range(n)]

        # 归一化
        total = sum(weights)
        return [w / total for w in weights]

    def rebalance_suggestions(
        self,
        current_portfolio: dict,
        target_risk: str = None
    ) -> List[dict]:
        """生成调仓建议

        Args:
            current_portfolio: 当前持仓
            target_risk: 目标风险等级

        Returns:
            调仓建议列表
        """
        suggestions = []

        holdings = current_portfolio.get("holdings", [])
        for holding in holdings:
            current_weight = holding.get("current_weight", 0)
            target_weight = holding.get("target_weight", current_weight)

            diff = target_weight - current_weight
            action = "买入" if diff > 0.01 else ("卖出" if diff < -0.01 else "持有")

            if action != "持有":
                suggestions.append({
                    "stock_code": holding.get("stock_code"),
                    "stock_name": holding.get("stock_name"),
                    "action": action,
                    "current_weight": current_weight,
                    "target_weight": target_weight,
                    "weight_diff": diff,
                    "shares_to_trade": holding.get("shares_to_trade", 0),
                    "reason": self._get_rebalance_reason(diff, holding)
                })

        return suggestions

    def _get_rebalance_reason(self, diff: float, holding: dict) -> str:
        """获取调仓原因"""
        if abs(diff) < 0.05:
            return "小幅调整"

        rsi = holding.get("rsi", 50)
        trend = holding.get("trend", "")

        if diff > 0:
            if rsi and rsi < 40:
                return "RSI超卖，增加仓位"
            elif "多头" in trend:
                return "趋势向好，增配"
            else:
                return "逢低加仓"
        else:
            if rsi and rsi > 70:
                return "RSI超买，减仓"
            elif "空头" in trend:
                return "趋势走弱，减配"
            else:
                return "风险控制，减仓"


class RiskAnalyzer:
    """风险分析器"""

    def analyze_portfolio_risk(self, portfolio: dict) -> dict:
        """分析组合风险

        Args:
            portfolio: 投资组合数据

        Returns:
            风险分析结果
        """
        holdings = portfolio.get("holdings", [])

        if not holdings:
            return {"error": "组合为空"}

        # 1. 集中度风险
        weights = [h.get("weight", 0) for h in holdings]
        max_weight = max(weights) if weights else 0
        concentration_risk = "高" if max_weight > 0.4 else ("中" if max_weight > 0.25 else "低")

        # 2. 行业分散度
        # (简化版，实际应该根据行业分类)
        diversification_score = min(10, len(holdings) * 1.5)

        # 3. 相关性风险 (简化版)
        correlation_risk = "低" if len(holdings) >= 5 else ("中" if len(holdings) >= 3 else "高")

        # 4. 整体风险评分
        risk_score = 0
        if max_weight > 0.4:
            risk_score += 3
        elif max_weight > 0.25:
            risk_score += 2
        else:
            risk_score += 1

        if len(holdings) < 3:
            risk_score += 3
        elif len(holdings) < 5:
            risk_score += 1

        risk_level = "高" if risk_score >= 5 else ("中" if risk_score >= 3 else "低")

        # 5. 风险建议
        suggestions = []
        if max_weight > 0.4:
            suggestions.append(f"单一股票权重过高 ({max_weight:.1%})，建议分散")
        if len(holdings) < 3:
            suggestions.append("持仓过于集中，建议增加股票数量")
        if correlation_risk == "高":
            suggestions.append("持仓相关性较高，建议增加行业分散度")

        if not suggestions:
            suggestions.append("组合风险可控")

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "concentration_risk": concentration_risk,
            "diversification_score": diversification_score,
            "correlation_risk": correlation_risk,
            "max_weight": max_weight,
            "num_positions": len(holdings),
            "suggestions": suggestions,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }


def suggest_portfolio(
    stock_codes: List[str],
    total_capital: float,
    risk_level: str = "moderate",
    strategy: str = "balanced"
) -> dict:
    """生成投资组合建议的便捷函数

    Args:
        stock_codes: 候选股票列表
        total_capital: 总资金
        risk_level: 风险偏好 (conservative/moderate/aggressive)
        strategy: 投资策略 (value/growth/balanced/momentum)

    Returns:
        组合建议
    """
    optimizer = PortfolioOptimizer(risk_level)
    return optimizer.suggest_allocation(stock_codes, total_capital, strategy)


def analyze_portfolio_risk(portfolio: dict) -> dict:
    """分析组合风险的便捷函数

    Args:
        portfolio: 投资组合数据

    Returns:
        风险分析结果
    """
    analyzer = RiskAnalyzer()
    return analyzer.analyze_portfolio_risk(portfolio)