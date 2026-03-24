# Rho (投研Agent) - 架构文档

## module-name 模块名

### 类型
- `StockQuery` - 股票查询输入
- `ResearchReport` - 研究报告输出
- `AgentState` - Agent状态
- `ResearchState` - 研究状态（LangGraph共享状态）
- `AnalystReport` - 分析师报告结构
- `RiskAssessment` - 风险评估结构

### 技术指标类型
- `TechnicalIndicators` - 技术指标（MA5/10/20/60/120/200, RSI, KDJ, MACD, 布林带, 量比）

### 函数
- `ResearchGraph.propagate(ticker: str, date: str) -> ResearchReport` 主流程
- `FundamentalAgent.analyze(stock_code: str) -> AnalystReport` 基本面分析
- `SentimentAgent.analyze(news: list) -> AnalystReport` 情绪分析
- `NewsAgent.analyze(stock_code: str) -> AnalystReport` 新闻分析
- `TechnicalAgent.analyze(stock_code: str) -> AnalystReport` 技术分析
- `SynthesizerAgent.synthesize(results: list) -> Summary` 综合汇总
- `RiskEvaluator.evaluate(report: ResearchReport) -> RiskAssessment` 风险评估
- `ReportGenerator.generate(summary: Summary, risks: Risks) -> ResearchReport` 简报生成

### 测试
- should analyze stock fundamental data correctly
- should handle invalid stock code
- should generate report with all sections
- should calculate risk score accurately

---

## 实现状态

### 后端 (backend/)

```
backend/
├── __init__.py
├── main.py                 # 主入口
├── cli.py                  # 命令行界面
├── llm_client.py           # LLM 客户端工厂
├── agents/
│   ├── __init__.py
│   ├── research_state.py   # ResearchState 状态定义
│   ├── supervisor.py       # 调度 Agent
│   ├── fundamental.py      # 基本面分析 Agent
│   ├── sentiment.py        # 情绪分析 Agent
│   ├── news.py             # 新闻分析 Agent
│   ├── technical.py        # 技术分析 Agent
│   ├── synthesizer.py      # 综合报告 Agent
│   ├── risk_evaluator.py   # 风险评估 Agent
│   └── report_generator.py # 简报生成 Agent
├── graph/
│   ├── __init__.py
│   └── research_graph.py   # LangGraph 编排
├── tools/
│   ├── __init__.py
│   ├── financial_data.py   # 财报数据工具
│   ├── news_search.py      # 新闻搜索工具
│   └── stock_price.py      # 股价数据工具
└── api/
    ├── __init__.py
    └── research.py         # REST API
```

### 前端 (frontend/)

```
frontend/
├── src/
│   ├── app/
│   │   └── research/
│   │       └── page.tsx    # 研究页面
│   ├── components/
│   │   ├── StockSearch.tsx # 股票搜索
│   │   ├── ReportCard.tsx  # 简报卡片
│   │   └── AgentStatus.tsx # Agent状态
│   └── store/
│       └── research-store.ts # 状态管理
```

---

## LangGraph 流程

```
START → Supervisor → [Fundamental Analyst] ─┐
              ↓                              │
              ├→ [Sentiment Analyst] ─┤      │
              ↓                    ↓      ↓
              ├→ [News Analyst] ────┼──────┤
              ↓                    ↓      ↓
              └→ [Technical Analyst] ────┘
                                  ↓
                           [Synthesizer]
                                  ↓
                        [Risk Evaluator]
                                  ↓
                        [Report Generator]
                                  ↓
                                END
```

---

## 数据流

1. **输入**: 股票代码 (如 `600519`)
2. **并行分析**: 4个 Agent 同时分析基本面、情绪、新闻、技术
3. **综合**: Synthesizer 汇总各方分析
4. **风险评估**: RiskEvaluator 评估风险
5. **简报生成**: ReportGenerator 生成最终简报
6. **输出**: Markdown 格式投资简报

---

*更新: 2026-03-24*
