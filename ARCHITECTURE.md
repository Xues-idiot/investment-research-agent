# Rho (投研Agent) - 架构文档

> **产品文档**: [PRODUCT.md](./PRODUCT.md) - 产品定位、核心竞争力、用户体验设计
>
> **核心定位**: 投资研究助手，不是交易机器人。帮用户理解一家公司，而不是给出交易信号。

## 模块类型

### 类型
- `StockQuery` - 股票查询输入
- `ResearchReport` - 研究报告输出
- `AgentState` - Agent状态
- `ResearchState` - 研究状态（LangGraph共享状态）
- `AnalystReport` - 分析师报告结构
- `RiskAssessment` - 风险评估结构
- `ChartData` - 图表数据结构
  - `kline`: K线数据 (time, open, high, low, close, volume)
  - `technical`: 技术指标数据 (time, macd, macdSignal, macdHistogram, rsi, kdjK, kdjD, kdjJ)

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
- `get_stock_chart_data(stock_code: str) -> ChartData` 获取K线图表数据

### 测试
- should analyze stock fundamental data correctly
- should handle invalid stock code
- should generate report with all sections
- should calculate risk score accurately
- should generate K-line chart data correctly

---

## 实现状态

### 后端 (backend/)

```
backend/
├── __init__.py
├── main.py                 # 主入口
├── cli.py                  # 命令行界面
├── llm_client.py           # LLM 客户端工厂
├── config.py               # 配置管理
├── cache.py                # 缓存模块
├── validator.py            # 股票代码验证
├── errors.py               # 错误处理
├── exceptions.py            # 自定义异常
├── retry.py                # 重试机制
├── middleware.py           # 日志中间件
├── health.py               # 健康检查
├── utils.py                # 日志工具
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
    ├── research.py          # REST API
    ├── streaming.py         # SSE流式API
    └── stock_chart.py      # K线图表API
```

### 前端 (frontend/)

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css     # 全局样式 (Tailwind v4)
│   │   ├── layout.tsx      # 布局组件
│   │   └── research/
│   │       └── page.tsx    # 研究页面 (含图表)
│   ├── components/
│   │   ├── StockSearch.tsx       # 股票搜索
│   │   ├── StreamingSearch.tsx   # 流式搜索
│   │   ├── StreamingProgress.tsx  # 流式进度
│   │   ├── ReportCard.tsx        # 简报卡片
│   │   ├── AgentStatus.tsx      # Agent状态
│   │   └── charts/
│   │       ├── index.ts         # 图表组件导出
│   │       ├── KLineChart.tsx    # K线图表 (lightweight-charts v5)
│   │       └── TechnicalChart.tsx # 技术指标图表
│   └── lib/
│       └── utils.ts        # 工具函数
├── package.json
├── tsconfig.json           # TypeScript配置
├── next.config.js          # Next.js配置
└── postcss.config.js       # PostCSS配置 (Tailwind v4)
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
7. **图表**: K线图和技术指标图 (研究完成后展示)

---

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/research` | POST | 批量研究股票 |
| `/api/research/stream` | GET | SSE流式研究 |
| `/api/stock/chart/<code>` | GET | 获取K线图表数据 |
| `/api/health` | GET | 健康检查 |

---

## 前端依赖

| 包 | 版本 | 用途 |
|-----|------|------|
| next | ^15.0.0 | React框架 |
| react | ^19.0.0 | UI库 |
| framer-motion | ^11.0.0 | 动画 |
| lightweight-charts | ^5.1.0 | K线图表 (TradingView) |
| zustand | ^5.0.0 | 状态管理 |

---

*更新: 2026-03-24*