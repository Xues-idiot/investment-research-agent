# Rho (ρ) - 投研 Agent

> 代号 Rho (ρ)，源自"Research" + 多Agent协作
> 一个"傻瓜式"投研助手，帮普通人读懂一家公司

## 项目定位

**核心问题**：普通人想投资股票，但不会分析财报、不会读公告、不知道如何评估一家公司。

**解决方案**：输入股票代码，自动扒财报、新闻、公告，生成普通人能看懂的投资简报。

> 定位：**帮普通人读懂一家公司**（投教工具）
> 扩展性：后续可扩展**量化交易**能力（信号提醒、自动下单等）

## 阶段规划

- **阶段1（当前）**：投教简报生成
- **阶段2（后续）**：量化信号（技术指标、趋势提醒）
- **阶段3（后续）**：实盘对接（模拟交易→真实交易）

## 功能特性

- 📊 **基本面分析**：自动分析财报、盈利能力、成长性
- 💭 **情绪分析**：分析新闻情绪、市场态度
- 📰 **新闻分析**：追踪最新新闻、公告、事件
- 📉 **技术分析**：分析价格走势、技术指标
- ⚠️ **风险评估**：评估投资风险等级
- 📋 **投资简报**：生成通俗易懂的投资简报
- 🚀 **流式输出**：实时显示研究进度

## 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd investment-research-agent

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac

# 安装后端依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend && npm install && cd ..
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 API keys
```

### 3. 运行后端

```bash
# API 服务器 (端口 8001)
python -m backend.api.research

# 或使用流式输出 API
python -m backend.api.streaming
```

### 4. 运行前端 (端口 3444)

```bash
cd frontend
npm run dev
```

### 5. Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## 端口配置

| 服务 | 端口 | URL |
|------|------|-----|
| 后端 API | 8001 | http://localhost:8001 |
| 前端 | 3444 | http://localhost:3444 |
| API 文档 | 8001 | http://localhost:8001/docs |

## API 接口

### 研究股票 (批量)

```bash
POST /api/research
Content-Type: application/json

{
  "stock_code": "600519",
  "company_name": "贵州茅台"
}
```

### 研究股票 (流式)

```bash
POST /api/research/stream
# 返回 text/event-stream
```

### 健康检查

```bash
GET /api/health
```

### 验证股票

```bash
GET /api/stocks/validate/600519
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 编排框架 | LangGraph |
| LLM | OpenAI / Anthropic / Google / MiniMax |
| 数据源 | yFinance, Tavily API |
| 后端 | Flask, Python |
| 前端 | Next.js 15, React 19, TailwindCSS |
| 动画 | Framer Motion |
| 容器化 | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## 前端设计

- **配色方案**：深蓝 + 墨绿 + 金色点缀
- **动画**：Framer Motion
- **主题**：金融/投研专业感

## 项目结构

```
investment-research-agent/
├── backend/
│   ├── agents/                 # Agent 实现
│   ├── graph/                  # LangGraph 编排
│   ├── tools/                  # 数据工具
│   ├── api/                    # REST API
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React 组件
│   │   └── lib/              # 工具函数
│   └── ...
├── tests/                      # 测试
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## 测试

```bash
# 运行所有测试
pytest tests/ -v

# 运行带覆盖率
pytest tests/ -v --cov=backend

# 运行特定测试
pytest tests/test_financial_data.py -v
```

## 开发

```bash
# 代码检查
ruff check backend/

# 代码格式化
ruff format backend/

# 清理
make clean
```

## License

MIT
