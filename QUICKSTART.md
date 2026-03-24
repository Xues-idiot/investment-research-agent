# Rho 快速开始指南

## 1. 克隆项目

```bash
git clone <repository-url>
cd investment-research-agent
```

## 2. 安装依赖

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# 安装后端依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend && npm install && cd ..
```

## 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 API keys
```

必需的配置：
- `MINIMAX_API_KEY` - MiniMax API Key

可选的配置：
- `OPENAI_API_KEY` - OpenAI API Key
- `TAVILY_API_KEY` - Tavily API Key (用于新闻搜索)

## 4. 检查环境

```bash
python -m backend.cli env-status
```

应该显示：
```
=== Rho 环境变量状态 ===

LLM Providers:
  MiniMax:  ✓ 已配置
  OpenAI:   ✗ 未配置
  Anthropic: ✗ 未配置
  Google:   ✗ 未配置

Data Sources:
  Tavily:   ✗ 未配置 (将使用模拟数据)

✓ 环境变量验证通过
```

## 5. 运行后端

```bash
# 方式1: 直接运行
python -m backend.api.research

# 方式2: 使用启动脚本
python start.py api

# 方式3: 使用 CLI 研究股票
python -m backend.cli research 600519
```

后端会在 http://localhost:8001 启动

## 6. 运行前端 (新终端)

```bash
cd frontend
npm run dev
```

前端会在 http://localhost:3444 启动

## 7. 访问应用

- 前端: http://localhost:3444
- API 文档: http://localhost:8001/api/health

## 8. Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## 9. 运行测试

```bash
# 运行所有测试
pytest tests/ -v

# 运行特定测试
pytest tests/test_financial_data.py -v

# 带覆盖率
pytest tests/ -v --cov=backend
```

## 10. 常见问题

### Q: API 连接失败
A: 确保后端在 http://localhost:8001 运行

### Q: 研究返回模拟数据
A: 需要配置真实的 API keys

### Q: 前端样式异常
A: 确保执行了 `npm install`

---

有问题？请查看：
- README.md - 项目文档
- API.md - API 文档
- ARCHITECTURE.md - 架构文档
