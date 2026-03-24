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
