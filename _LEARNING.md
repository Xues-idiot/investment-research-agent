# Rho 学习记录

## 第1轮学习

### TradingAgents 架构研究

#### 核心发现

**LangGraph 多Agent编排模式**：
- 使用 `StateGraph(AgentState)` 构建工作流
- `setup_graph()` 定义节点和边
- `Propagator.create_initial_state()` 初始化状态
- `graph.invoke()` 或 `graph.stream()` 执行

**AgentState 结构**：
```python
class AgentState(MessagesState):
    company_of_interest: str
    trade_date: str
    # 各分析师报告
    market_report, sentiment_report, news_report, fundamentals_report
    # 辩论状态
    investment_debate_state: InvestDebateState
    risk_debate_state: RiskDebateState
    # 最终决策
    final_trade_decision: str
```

**分析师创建模式**：
```python
def create_fundamentals_analyst(llm):
    def fundamentals_analyst_node(state):
        return {"messages": [result], "fundamentals_report": report}
    return fundamentals_analyst_node
```

**边定义模式**：
```python
workflow.add_conditional_edges(
    "Bull Researcher",
    self.conditional_logic.should_continue_debate,
    {"Bear Researcher": "Bear Researcher", "Research Manager": "Research Manager"}
)
```

---

## 第2轮学习 (2026-03-24) - WORKFLOW.md 更新

### WORKFLOW.md 重要更新

#### 新增步骤
1. **步骤5: 测试验证** - 运行 build/pytest 确保功能正常
2. **步骤6: 更新文档** - ARCHITECTURE.md, _LEARNING.md, PROGRESS.md
3. **步骤7: 自我审计** - 代码质量、功能完整性、文档完整性
4. **步骤8: 版本管理** - git add/commit/push

#### 新增第4节: 动态跟踪

**4.1 Sigma Skills/Agents 动态发现**
- 每轮扫描 `pm-agent-forge/skills/` 和 `pm-agent-forge/agents/`
- 相关领域：`finance/`, `data-analytics/`, `common/`

**4.2 其他项目动态跟踪**
```
D:/PM-AI-Workstation/01-ai-agents/
├── pm-assistant/              # Pi - PM助理
├── private-operation-agent/    # Nu - 私域运营
├── podcast-research-agent/     # Echo - 播客研究
├── content-gen-agent/          # Vox - 内容生成
├── vertical-browser-agent/     # Spider - 垂直浏览器
```

**4.3 GitHub 趋势跟踪**
- 搜索关键词：stock analysis AI, financial research agent, investment analysis LLM
- 发现好的项目 clone 到 `_reference/`

**4.4 本项目已用 Skills**
- (待更新)

#### 新增第7节: 与其他项目的协调
- 发现可复用模块，考虑抽取到 Sigma
- 各项目从 Sigma 获取 Skills

#### 循环终止条件
1. 用户说"满意了"或"可以了"
2. 循环 10 次后自动暂停
3. 遇到无法解决的技术难题

---

## 第3轮学习 (2026-03-24) - INSTRUCTIONS.md 更新

### INSTRUCTIONS.md 重要更新

#### 前端设计规范 (重要)
1. **动画优先** - 必须使用 `motion` (Framer Motion)
2. **配色方案** - 禁止 AI 蓝/紫色，用 `zinc`/`neutral` 主题
3. **字体选择** - 使用 Inter 或成熟无衬线字体
4. **技术栈** - Next.js 15 + React 19 + TypeScript + TailwindCSS v4 + shadcn/ui + Zustand + SSE

#### 配色方案 (投研项目特色)
- 主色: `#1E3A5F` (深蓝)
- 辅色: `#2D5A4A` (墨绿)
- 点缀: `#C9A227` (金色)
- 背景: `#1A1A2E` (深灰)

#### 端口配置
- 前端: 3444
- 后端 API: 8001

#### 阶段规划
- 阶段1: 投教简报生成 (当前)
- 阶段2: 量化信号
- 阶段3: 实盘对接

---

*学习日期: 2026-03-24*

---

## 第4轮学习 (2026-03-24) - 第51轮迭代

### pm-agent-forge Skills 研究

#### 发现的相关Skills

**investment-research/ 目录**:
- `research-report-generation` - 完整的投资研究报告模板
- `technical-analysis` - 技术分析框架和模板
- `financial-statement-analysis` - 财务报表分析指南
- `peer-comparison` - 同业比较方法
- `industry-research` - 行业研究方法
- `stock-data-collection` - 股票数据收集

**finance/ 目录**:
- `financial-analysis` - 详细财务分析框架
- `investment-analysis` - 投资分析方法
- `risk-assessment` - 风险评估框架

#### 关键发现

1. **技术分析Skill**提供了完整的模板：
   - 趋势分析（短/中/长期）
   - 支撑压力位
   - KDJ/RSI/MACD指标
   - 量价关系
   - 操作建议

2. **财务分析Skill**提供了专业框架：
   - 盈利能力指标（毛利率、净利率、ROE、ROA）
   - 偿债能力指标
   - 运营能力指标
   - 现金流分析模式（妖精/老母鸡/蛮牛/奶牛模式）
   - 估值方法（P/E、P/B、P/S、DCF）

3. **研究报告Skill**提供了标准模板：
   - 报告摘要（评级、目标价、潜在涨幅）
   - 公司概况和投资亮点
   - 行业分析
   - 业务分析
   - 财务预测
   - 风险提示
   - 投资建议

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - TECHNICAL_ANALYST_PROMPT: 增加完整技术分析框架
   - FUNDAMENTAL_ANALYST_PROMPT: 增加财务分析模板
   - RISK_EVALUATOR_PROMPT: 增加详细风险评估维度
   - SYNTHESIZER_PROMPT: 增加投资评级体系
   - REPORT_GENERATOR_PROMPT: 增强简报输出格式

2. **stock_price.py 增强**:
   - 增加KDJ指标计算
   - 增加布林带计算
   - 增加更完整的均线系统（MA5/10/20/60/120/200）
   - 增加成交量分析（量比、5日/20日均量）

3. **technical.py 增强**:
   - 更新_build_technical_context使用新指标
   - 改进_confidence计算逻辑

---

## 第5轮学习 (2026-03-24) - 第52轮迭代

### pm-agent-forge Skills 继续研究

#### 新发现的相关Skills

**investment-research/**:
- `peer-comparison` - 竞品对比分析完整模板

**data-analytics/**:
- `data-visualization` - 数据可视化指南和图表选择决策树

#### peer-comparison Skill 关键内容

1. **竞品对比维度**:
   - 业务对比（营收、增速、毛利率、净利率）
   - 财务对比（ROE、资产负债率、现金流）
   - 估值对比（PE、PB、PS、EV/EBITDA）
   - 成长性对比（营收增速、净利润增速、预期增速）

2. **综合评分体系**:
   - 业务(30%) + 财务(30%) + 估值(20%) + 成长(20%)
   - 总分排序给出投资建议

3. **竞品分析模板**:
   - 对比公司表格
   - 多维度对比表格
   - 综合评分表格
   - 投资建议

### 应用到Rho项目的改进

1. **financial_data.py 增强**:
   - 新增 `get_peer_comparison()` 函数
   - 支持默认可比公司（白酒行业：茅台、五粮液、洋河）
   - 返回目标股票和可比公司的关键指标

2. **fundamental.py 增强**:
   - 更新fundamental agent使用peer comparison
   - 新增 `_build_peer_comparison_context()` 函数
   - 生成竞品对比表格

---

## 第7轮学习 (2026-03-24) - 第54轮迭代

### 新学习的Skills

#### risk-assessment Skill
- 完整的风险量化指标体系
- VaR、Beta、波动率等市场风险指标
- 风险矩阵（R1-R5等级体系）
- 财务风险量化指标（资产负债率、流动比率、利息保障倍数）

#### announcement-analysis Skill
- 公告解读框架
- 公告分类（业绩/并购/股权/合同/其他）
- 关键条款提取
- 历史类比分析

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 融入更全面的风险量化指标
     - 市场风险量化（Beta、波动率、VaR）
     - 风险矩阵（R1-R5等级体系）
     - 更详细的量化指标和安全范围

---

*学习日期: 2026-03-24 第54轮*

---

## 第8轮学习 (2026-03-24) - 第55轮迭代

### 新学习的Skills

#### industry-research Skill
- 行业研究框架和模板
- 产业链分析
- 竞争格局分析
- 行业发展趋势和景气度判断

#### data-sources Skill (stock-data-api)
- A股数据源集成（akshare/tushare/东方财富）
- 统一数据接口设计
- 缓存策略和监控告警

### 应用到Rho项目的改进

1. **fundamental.py 增强**:
   - _build_peer_comparison_context: 增加行业地位评估和驱动因素

---

*学习日期: 2026-03-24 第55轮*

---

## 第9轮学习 (2026-03-24) - 第56轮迭代

### 新学习的Skills

#### yfinance-integration Skill
- yfinance获取美股/港股数据
- 获取分析师推荐和目标价
- 数据缓存和增量更新

#### macro-analysis Skill
- 宏观分析框架（经济增长、通胀、货币政策、财政政策、汇率）
- 宏观分析报告模板
- 资产配置建议

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加宏观环境分析部分
     - 宏观环境（经济增长、政策取向、流动性、汇率影响）
     - 宏观环境影响分析

---

*学习日期: 2026-03-24 第56轮*

---

## 第10轮学习 (2026-03-24) - 第57轮迭代

### 新学习的Skills

#### company-valuation Skill
- 完整估值分析框架
- PE/PB/PEG估值方法
- 估值对比（历史分位、行业、竞品）
- 业绩预测模板
- 综合判断和投资建议

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - FUNDAMENTAL_ANALYST_PROMPT: 增加完整估值分析
     - PE/PB/PEG估值方法
     - 历史分位和行业对比
     - 潜在涨幅空间分析

---

*学习日期: 2026-03-24 第57轮*

---

## 第11轮学习 (2026-03-24) - 第58轮迭代

### 新学习的Skills

#### a-share-market-analysis Skill
- A股市场分析框架
- 宏观分析、资金流向、市场情绪、板块轮动
- 市场分析报告模板
- 配置建议

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加市场环境参考和板块影响
     - 大盘趋势、市场情绪、资金流向
     - 北向资金、主力资金
     - 板块走势和轮动

---

*学习日期: 2026-03-24 第58轮*

---

## 第12轮学习 (2026-03-24) - 第59轮迭代

### 新学习的Skills

#### financial-statement-analysis Skill
- 财务报表分析框架
- 三表分析（利润表、资产负债表、现金流量表）
- 财务风险信号检查清单
- 多年趋势分析

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - FUNDAMENTAL_ANALYST_PROMPT: 增加财务风险信号检查清单
     - 应收账款异常增长检查
     - 存货积压检查
     - 现金流与利润背离检查
     - 商誉减值风险检查

---

*学习日期: 2026-03-24 第59轮*

---

## 第13轮学习 (2026-03-24) - 第60轮迭代

### 新学习的Skills

#### value-investment Skill
- 价值投资分析框架
- 护城河分析（品牌/技术/规模/网络效应）
- 安全边际计算
- 价值陷阱识别

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加价值投资评估
     - 护城河分析
     - 安全边际计算
     - 内在价值对比

---

*学习日期: 2026-03-24 第60轮*

---

## 第14轮学习 (2026-03-24) - 第61轮迭代

### 新学习的Skills

#### growth-investment Skill
- 成长投资分析框架
- 赛道评估（行业空间、增速、渗透率）
- 增速分析（CAGR、增长质量）
- 增长持续性判断

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加成长投资评估
     - 赛道评估
     - 增速分析
     - 增长持续性

---

*学习日期: 2026-03-24 第61轮*

---

## 第15轮学习 (2026-03-24) - 第62轮迭代

### 新学习的Skills

#### sec-filing-analysis Skill
- SEC Filing分析框架
- MD&A分析
- 重大变更检测
- 时间线分析

#### pharma-analysis Skill
- 制药行业分析框架
- 管线分析
- 政策影响（带量采购）

### 应用到Rho项目的改进

- 研究announcement-analysis Skill增强公告分析
- 继续完善prompt模板

---

*学习日期: 2026-03-24 第62轮*

---

## 第16轮学习 (2026-03-24) - 第63轮迭代

### 新学习的Skills

#### portfolio-construction Skill
- 投资组合构建框架
- 仓位管理（单股仓位限制、行业配置）
- 止损机制
- 再平衡规则
- 组合评估指标（夏普比率、最大回撤、卡玛比率）

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加投资组合参考
     - 仓位限制建议
     - 止损机制
     - 分散投资建议

---

*学习日期: 2026-03-24 第63轮*

---

## 第17轮学习 (2026-03-24) - 第64轮迭代

### 新学习的Skills

#### quantitative-screening Skill
- 量化筛选框架
- 筛选维度设计（估值、成长、质量、流动性）
- 阈值设定
- 回测验证

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加量化筛选参考
     - 筛选维度表格
     - 必选条件清单

---

*学习日期: 2026-03-24 第64轮*

---

## 第18轮学习 (2026-03-24) - 第65轮迭代

### 新学习的Skills

#### event-driven-investment Skill
- 事件驱动投资框架
- 事件类型分类
- 市场预期分析
- 历史类比分析

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - NEWS_ANALYST_PROMPT: 增加事件驱动机会分析
     - 事件类型分类
     - 市场预期分析
     - 历史类比分析

---

*学习日期: 2026-03-24 第65轮*

### 新学习的Skills

#### sentiment-monitoring Skill
- 舆情监控完整框架和模板
- 情绪分类（乐观/悲观/中性/恐慌/狂热）
- 舆情异动识别
- 投资建议生成

#### investment-analysis Skill
- 完整的投资分析流程
- DCF估值模板
- 相对估值模板
- 风险量化指标（VaR、夏普比率、最大回撤）
- 投资建议模板

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SENTIMENT_ANALYST_PROMPT: 融入舆情监控框架
   - NEWS_ANALYST_PROMPT: 融入新闻分析分级和可靠性判断

2. **sentiment.py 增强**:
   - _build_sentiment_context: 分类整理正负面舆情
   - 增加新闻来源信息

---

*学习日期: 2026-03-24 第53轮*

---

## 第19轮学习 (2026-03-24) - 第67轮迭代

### 新学习的Skills

#### backtesting Skill
- 回测验证框架
- 回测报告模板（策略概述、回测参数、收益指标、风险指标、交易统计）
- 回测检查清单
- 回测红牌警告

#### factor-investing Skill
- 因子投资分析框架
- 多因子模型（价值、动量、质量、规模、波动率）
- IC分析（IC均值、IC标准差、IC_IR比率）
- 因子有效性判断

#### alternative-data Skill
- 另类数据分析框架
- 数据源选择和获取
- 特征工程和信号生成
- 合规审查清单

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加回测验证框架
     - 回测报告模板
     - 回测检查清单
     - 回测红牌警告
   - SYNTHESIZER_PROMPT: 增加因子投资评估
     - 因子暴露分析（价值/动量/质量/规模/波动率）
     - IC分析
     - 因子有效性判断
   - NEWS_ANALYST_PROMPT: 增加另类数据参考

---

## 第20轮学习 (2026-03-24) - 第68轮迭代

### 新学习的Skills

#### bull-bear-analysis Skill
- 多空分析框架
- Bull/Bear/Base Case情景分析
- 概率加权预期
- 风险回报比计算

#### earnings-call-analysis Skill
- 业绩电话会议分析框架
- 管理层语气分析
- 前瞻指引对比
- 变化检测

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加多空情景分析
     - Bull Case乐观情景
     - Bear Case悲观情景
     - Base Case基准情景
     - 概率加权预期
   - FUNDAMENTAL_ANALYST_PROMPT: 增加业绩电话会议参考
     - 管理层表态
     - 前瞻指引对比
     - 变化检测

---

## 第21轮学习 (2026-03-24) - 第69轮迭代

### 新学习的Skills

#### esg-analysis Skill
- ESG分析框架
- 环境(E)、社会(S)、治理(G)三个维度
- ESG评级体系
- 争议事件检测

#### options-analysis Skill
- 期权分析框架
- Black-Scholes定价模型
- Greeks（Delta、Gamma、Theta、Vega）
- 隐含波动率分析

#### langgraph-workflow/multi-agent-coordination Skill
- 多Agent协调机制
- 状态机设计
- 路由逻辑
- 错误处理

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加ESG评估
     - 环境/社会/治理三个维度
     - ESG评级和争议事件
   - RISK_EVALUATOR_PROMPT: 增加期权分析框架
     - Greeks参考表格
     - 隐含波动率分析
     - 风险评估

---

## 第22轮学习 (2026-03-24) - 第70轮迭代

### 新学习的Skills

#### research-report-reading Skill
- 研报阅读与提炼
- 研报筛选和快速浏览
- 核心观点提取
- 研报质量评估

#### portfolio-tracking Skill
- 组合跟踪框架
- 持仓同步和盈亏计算
- 风险指标计算
- 收益归因分析

#### continuous-improvement Skill
- 持续优化机制
- 反馈收集和问题分类
- 根因定位和优化方案
- 效果验证

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - FUNDAMENTAL_ANALYST_PROMPT: 增加券商研报参考
     - 目标价和评级
     - 核心观点提取
     - 研报质量评估
   - RISK_EVALUATOR_PROMPT: 增加组合跟踪框架
     - 组合概览和持仓明细
     - 风险指标
     - 收益归因和预警事项

---

## 第23轮学习 (2026-03-24) - 第71轮迭代

### 新学习的Skills

#### rebalancing Skill
- 组合再平衡框架
- 再平衡触发规则（定期/阈值/动态）
- 目标仓位和偏离度
- 交易成本估算

#### trading-integration Skill
- 交易通道集成框架
- 统一交易接口设计
- 订单和成交管理
- 风控检查

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加组合再平衡框架
     - 再平衡触发规则
     - 目标仓位参考
     - 交易成本估算
   - RISK_EVALUATOR_PROMPT: 增加交易通道集成参考
     - 交易接口信息
     - 交易记录

---

## 第24轮学习 (2026-03-24) - 第72轮迭代

### 新学习的Skills

#### yield-curve-analysis Skill
- 收益率曲线分析框架
- 曲线形态分析（正常/平坦/倒挂）
- 利差分析和期限结构
- 经济预测和市场影响

#### time-series-analysis Skill
- 时间序列分析框架
- 趋势预测（ARIMA/Prophet/LSTM）
- 季节性分析和异常检测
- 周期识别

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 宏观环境部分增加收益率曲线分析
     - 曲线形态和利差
     - 经济预测和市场影响
   - TECHNICAL_ANALYST_PROMPT: 增加时间序列参考
     - 趋势预测
     - 季节性分析和异常检测
     - 周期识别

---

## 第25轮学习 (2026-03-24) - 第73轮迭代

### 新学习的Skills

#### vader-sentiment Skill
- VADER情感分析框架
- 情感量化指标（compound/pos/neg/neu）
- 时间序列聚合分析
- 异常检测和信号生成

#### knowledge-graph-rag Skill
- 知识图谱RAG框架
- 图谱Schema设计
- Neo4j查询示例
- 关系推理和可视化

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SENTIMENT_ANALYST_PROMPT: 增加VADER情感量化
     - 情感得分表格
     - 情感时间序列分析
   - NEWS_ANALYST_PROMPT: 增加知识图谱关联
     - 关联公司/人物/行业
     - 事件关系

---

## 第26轮学习 (2026-03-24) - 第74轮迭代

### 新学习的Skills

#### self-critique Skill
- Agent自批评机制
- 多阶段推理循环
- 审查维度（事实准确性、逻辑严密性、风险揭示、投资建议、一致性）
- 问题识别和修订流程

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加自我审查部分
     - 审查维度清单
     - 问题识别
     - 审查结论

---

## 第27轮学习 (2026-03-24) - 第75轮迭代

### 新学习的Skills

#### monitoring-alerting Skill
- 监控告警框架
- 价格/涨跌幅/成交量告警
- 新闻舆情告警
- 告警配置模板

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加监控告警框架
     - 价格告警表格
     - 涨跌幅告警表格
     - 成交量告警表格
     - 新闻舆情告警表格

---

## 第28轮学习 (2026-03-24) - 第76轮迭代

### 新学习的Skills

#### ai-hedge-fund Skill
- AI对冲基金完整架构
- 数据层、模型层、执行层、风控层、监控层
- 技术栈参考（Pandas, XGBoost, LangGraph等）

#### strategy-macro Skill
- 宏观策略配置框架
- 经济周期判断
- 大类资产配置
- 风格配置

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 宏观环境增加宏观策略配置
     - 经济周期（产出缺口、通胀压力、库存周期）
     - 政策取向（货币政策、财政政策、监管政策）
     - 流动性环境
     - 大类资产配置表格
     - 风格配置

---

## 第29轮学习 (2026-03-24) - 第77轮迭代

### 新学习的Skills

#### due-diligence Skill
- 尽职调查框架
- 业务尽职调查
- 财务尽职调查
- 法律尽职调查

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - FUNDAMENTAL_ANALYST_PROMPT: 增加尽职调查参考
     - 业务尽职调查（商业模式、市场规模、竞争优势）
     - 财务尽职调查（真实性、关联交易、债务）
     - 法律尽职调查（资质、诉讼、合同、知识产权）

---

## 第30轮学习 (2026-03-24) - 第78轮迭代

### 新学习的Skills

#### report-generation Skill
- 数据分析报告生成框架
- 报告结构模板（日报、周报、月报）
- 报告审查清单
- 交付格式规范

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - REPORT_GENERATOR_PROMPT: 增强报告生成框架
     - 报告基本信息
     - 数据来源
     - 分析要求
     - 报告审查清单

---

## 第31轮学习 (2026-03-24) - 第79轮迭代

### 新学习的Skills

#### swot-analysis Skill
- SWOT分析框架
- 优势、劣势、机会、威胁分析
- SO、WO、ST、WT策略组合

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加SWOT分析
     - 优势、劣势、机会、威胁
     - 策略组合（SO、WO、ST、WT）

---

## 第32轮学习 (2026-03-24) - 第80轮迭代

### 新学习的Skills

#### critical-thinking Skill
- 批判性思维框架
- 论证结构分析
- 隐含假设检验
- 逻辑谬误识别

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增强自我审查为批判性思维分析
     - 论证结构分析
     - 隐含假设检验
     - 逻辑结构分析
     - 常见谬误检查

---

## 第33轮学习 (2026-03-24) - 第81轮迭代

### 新学习的Skills

#### decision-making Skill
- 决策方法论框架
- 问题定义和方案分析
- 评估标准和加权得分
- 决策结论和风险预案

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增加投资决策框架
     - 决策背景（目标、约束、持仓状态）
     - 方案对比（买入/持有/卖出）
     - 评估标准和加权得分
     - 决策结论和风险预案

---

## 第34轮学习 (2026-03-24) - 第82轮迭代

### 新学习的Skills

#### risk-management Skill
- 投资风险管理框架
- 风险识别（市场风险、个股风险）
- 风险评估（持仓VaR、组合VaR）
- 风险控制措施和应急预案

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - RISK_EVALUATOR_PROMPT: 增加投资风险管理框架
     - 风险识别（市场风险、个股风险）
     - 风险评估（VaR、最大回撤）
     - 风险控制措施
     - 应急预案

---

## 第35轮学习 (2026-03-24) - 第83轮迭代

### 新学习的Skills

#### data-storytelling Skill
- 数据讲故事框架
- 核心信息和故事框架
- 数据呈现和可视化建议
- 呈现技巧

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - REPORT_GENERATOR_PROMPT: 增加数据讲故事框架
     - 核心信息（一句话总结）
     - 故事框架（开篇-发展-高潮-结尾）
     - 数据呈现技巧
     - 呈现技巧

---

## 第36轮学习 (2026-03-24) - 第84轮迭代

### 新学习的Skills

#### industry-consumer Skill
- 消费行业分析框架
- 细分行业对比
- 关键成功因素
- 行业财务特征和风险因素

### 应用到Rho项目的改进

1. **prompts.py 增强**:
   - SYNTHESIZER_PROMPT: 增强板块影响为行业分析框架
     - 行业概览（规模、增速、周期、驱动因素）
     - 细分行业对比表格
     - 关键成功因素
     - 行业财务特征
     - 行业风险因素

---

*学习日期: 2026-03-24 第84轮*
