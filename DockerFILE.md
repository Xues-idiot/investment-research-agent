# Rho Docker 部署

## 前端 Dockerfile

```dockerfile
# Rho Frontend Dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci

# 开发模式
FROM base AS development
WORKDIR /app
COPY . .
EXPOSE 3444
CMD ["npm", "run", "dev"]

# 生产模式
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3444
CMD ["npm", "start"]
```

## 后端 Dockerfile

```dockerfile
# Rho Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY backend/ ./backend/

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# 端口
EXPOSE 8001

# 启动
CMD ["python", "-m", "backend.api.research"]
```

## Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8001:8001"
    environment:
      - MINIMAX_API_KEY=${MINIMAX_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
    volumes:
      - ./logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3444:3444"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 部署命令

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止
docker-compose down

# 重新构建
docker-compose build --no-cache
```

## 环境变量

在部署前，确保设置以下环境变量：

```bash
export MINIMAX_API_KEY=your-api-key
export TAVILY_API_KEY=your-tavily-key
```
