# Rho 使用说明

> AI驱动的投资研究助手

---

## 快速开始

### 1. 环境配置

复制 `.env.example` 为 `.env` 并填写以下配置：

```bash
# MiniMax API (用于LLM推理)
MINIMAX_API_KEY=your_minimax_api_key_here
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic
MINIMAX_MODEL=MiniMax-M2.7

# Tavily API (用于网络搜索)
TAVILY_API_KEY=your_tavily_api_key_here

# GitHub Token (用于AI工具)
GITHUB_TOKEN=your_github_token_here
```

### 2. 运行后端

```bash
cd backend
pip install -r requirements.txt
python main.py
```

后端运行在 http://localhost:8001

### 3. 运行前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:3000

### 4. 使用Docker

```bash
docker-compose up --build
```

---

## 功能模块

| 模块 | 说明 |
|-----|------|
| 研究 | 输入股票代码，生成投资研究报告 |
| 对比 | 多股票横向对比分析 |
| 监控 | 实时行情监控与告警 |
| 组合 | 持仓管理与风险分析 |
| 回测 | 策略回测与性能评估 |
| 导出 | 报告导出功能 |

---

## 项目结构

```
├── backend/           # Flask后端
│   ├── agents/        # LangGraph Agent
│   ├── tools/         # 工具函数
│   └── main.py        # 入口
├── frontend/          # Next.js前端
│   ├── src/
│   │   ├── app/       # 页面
│   │   └── components/# 组件
│   └── package.json
└── docs/              # 文档
```

---

## 技术栈

- **后端**: Python, Flask, LangGraph, yfinance
- **前端**: Next.js 15, TypeScript, TailwindCSS
- **图表**: TradingView lightweight-charts
- **动画**: Framer Motion

---

## License

MIT
