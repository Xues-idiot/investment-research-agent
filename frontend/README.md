# Rho Frontend

Rho 投研 Agent 的 Next.js 前端

## 技术栈

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Animation**: Framer Motion
- **State**: Zustand
- **API**: REST + SSE (Server-Sent Events)

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 代码检查
npm run lint
```

## 端口

前端开发服务器运行在 http://localhost:3444

## 环境变量

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## 目录结构

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页
│   │   └── globals.css   # 全局样式
│   ├── components/        # React 组件
│   │   ├── StockSearch.tsx
│   │   ├── ReportCard.tsx
│   │   ├── AgentStatus.tsx
│   │   ├── StreamingSearch.tsx
│   │   └── StreamingProgress.tsx
│   ├── lib/              # 工具函数
│   │   ├── api.ts       # API 客户端
│   │   └── utils.ts     # 工具函数
│   ├── store/            # 状态管理
│   └── types/            # TypeScript 类型
└── package.json
```

## 组件

### StockSearch
股票搜索组件，支持批量模式

### StreamingSearch
支持流式输出的股票搜索组件

### ReportCard
投资简报展示卡片

### AgentStatus
Agent 执行状态显示

### StreamingProgress
流式研究进度显示
