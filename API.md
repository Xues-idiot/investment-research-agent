# Rho API Documentation

## Base URL

```
http://localhost:8001
```

## Endpoints

### 1. Research Stock (Batch)

Research a stock and generate a comprehensive investment report.

**Endpoint:** `POST /api/research`

**Request Body:**

```json
{
  "stock_code": "600519",
  "company_name": "贵州茅台"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stock_code` | string | Yes | Stock code (e.g., "600519") |
| `company_name` | string | No | Company name |

**Response:**

```json
{
  "success": true,
  "data": {
    "stock_code": "600519",
    "company_name": "贵州茅台",
    "research_date": "2026-03-24",
    "final_report": "📊 贵州茅台 (600519) 投资简报...",
    "confidence": 0.75,
    "risk_assessment": {
      "level": "medium",
      "score": 45,
      "factors": ["市场风险", "行业竞争"]
    },
    "reports": {
      "fundamentals": "...",
      "sentiment": "...",
      "news": "...",
      "technical": "...",
      "synthesis": "..."
    }
  }
}
```

---

### 2. Research Stock (Stream)

Research a stock with streaming progress updates.

**Endpoint:** `POST /api/research/stream`

**Request:** Same as batch, but returns `text/event-stream`

**Events:**

```
event: agent
data: {"agent": "fundamental", "message": "基本面分析中..."}

event: complete
data: {"event": "complete", "data": {...}}

event: error
data: {"event": "error", "data": "错误信息"}
```

---

### 3. Get Report

Retrieve an existing research report.

**Endpoint:** `GET /api/research/report`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stock_code` | string | Yes | Stock code |
| `date` | string | No | Research date (YYYY-MM-DD) |

---

### 4. Health Check

Check API health status.

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "healthy",
  "service": "rho-research-agent",
  "version": "0.1.0",
  "timestamp": "2026-03-24T10:00:00",
  "config": {
    "llm_provider": "minimax",
    "api_port": 8001,
    "frontend_port": 3444
  },
  "environment": {
    "llm_configured": true,
    "tavily_configured": false
  },
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "disk_percent": 60.1
  }
}
```

---

### 5. Validate Stock Code

Validate a stock code and get market information.

**Endpoint:** `GET /api/stocks/validate/{stock_code}`

**Response:**

```json
{
  "valid": true,
  "market": "A",
  "name": "贵州茅台"
}
```

---

### 6. Get Config

Get service configuration.

**Endpoint:** `GET /api/config`

**Response:**

```json
{
  "api_port": 8001,
  "frontend_port": 3444,
  "colors": {
    "primary": "#1E3A5F",
    "secondary": "#2D5A4A",
    "accent": "#C9A227"
  },
  "llm_provider": "minimax"
}
```

---

### 7. Export Report to PDF

Export a research report as PDF.

**Endpoint:** `POST /api/export/pdf`

**Request Body:**

```json
{
  "stock_code": "600519",
  "markdown_content": "# 报告内容...",
  "title": "投资研究报告",
  "author": "Rho Agent"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "output_path": "exports/report_600519_20260324.pdf",
    "format": "pdf",
    "file_size": 123456,
    "download_url": "/api/export/download?path=report_600519_20260324.pdf"
  }
}
```

---

### 8. Export Report to HTML

Export a research report as HTML.

**Endpoint:** `POST /api/export/html`

**Request Body:**

```json
{
  "stock_code": "600519",
  "markdown_content": "# 报告内容...",
  "title": "投资研究报告"
}
```

---

### 9. Download Exported File

Download an exported report file.

**Endpoint:** `GET /api/export/download?path={filename}`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Filename to download |

---

### 10. Send Notification

Send research report notification via DingTalk/Lark/Email.

**Endpoint:** `POST /api/notify`

**Request Body:**

```json
{
  "stock_code": "600519",
  "stock_name": "贵州茅台",
  "report_summary": "报告摘要...",
  "risk_level": "R2",
  "notification_type": "dingtalk"
}
```

---

### 11. Get Notification Config

Get notification channel configuration status.

**Endpoint:** `GET /api/notify/config`

**Response:**

```json
{
  "success": true,
  "data": {
    "dingtalk": {"configured": true, "has_secret": true},
    "lark": {"configured": false},
    "email": {"configured": true, "smtp_server": "smtp.gmail.com"}
  }
}
```

---

### 12. Compare Stocks

Compare multiple stocks side by side.

**Endpoint:** `POST /api/compare`

**Request Body:**

```json
{
  "stock_codes": ["600519", "000858", "000568"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stocks": [...],
    "comparison": {
      "valuation": {"headers": [...], "rows": [...]},
      "technical": {"headers": [...], "rows": [...]},
      "market": {"headers": [...], "rows": [...]}
    },
    "conclusions": ["**估值最低**: 贵州茅台，PE仅 28.50", "**RSI超卖**: 五粮液 RSI(42.3)，可能存在反弹机会"]
  }
}
```

---

### 13. Rank Stocks

Rank stocks by various criteria.

**Endpoint:** `POST /api/compare/rank`

**Request Body:**

```json
{
  "stock_codes": ["600519", "000858", "000568"],
  "criteria": "comprehensive"
}
```

**Criteria Options:** `value`, `growth`, `technical`, `comprehensive`

---

### 14. Get Monitor Status

Get stock monitoring status.

**Endpoint:** `GET /api/monitor/status`

**Response:**

```json
{
  "success": true,
  "data": {
    "running": true,
    "watched_stocks": ["600519", "000858"],
    "total_alerts": 5,
    "enabled_alerts": 4,
    "triggered_alerts": 1
  }
}
```

---

### 15. Get Alerts

Get alert list for a stock.

**Endpoint:** `GET /api/monitor/alerts?stock_code={code}`

---

### 16. Add Alert

Add a price/volume/RSI alert.

**Endpoint:** `POST /api/monitor/alerts`

**Request Body:**

```json
{
  "stock_code": "600519",
  "alert_type": "price_above",
  "threshold": 1800.0,
  "enabled": true
}
```

**Alert Types:** `price_above`, `price_below`, `price_change`, `volume_spike`, `rsi_overbought`, `rsi_oversold`

---

### 17. Check Alerts

Manually trigger alert checking.

**Endpoint:** `POST /api/monitor/check`

---

### 18. Start Monitor

Start background monitoring service.

**Endpoint:** `POST /api/monitor/start?interval={seconds}`

---

### 19. Stop Monitor

Stop background monitoring service.

**Endpoint:** `POST /api/monitor/stop`

---

### 20. Portfolio Suggest

Generate portfolio allocation suggestions.

**Endpoint:** `POST /api/portfolio/suggest`

**Request Body:**

```json
{
  "stock_codes": ["600519", "000858", "000568"],
  "total_capital": 1000000,
  "risk_level": "moderate",
  "strategy": "balanced"
}
```

**Risk Levels:** `conservative`, `moderate`, `aggressive`

**Strategies:** `value`, `growth`, `balanced`, `momentum`

---

### 21. Analyze Portfolio Risk

Analyze portfolio risk metrics.

**Endpoint:** `POST /api/portfolio/analyze`

---

### 22. Rebalance Portfolio

Generate rebalancing suggestions.

**Endpoint:** `POST /api/portfolio/rebalance`

---

### 23. Backtest MA Strategy

Backtest moving average crossover strategy.

**Endpoint:** `POST /api/backtest/ma`

**Request Body:**

```json
{
  "stock_code": "600519",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "short_window": 5,
  "long_window": 20,
  "initial_capital": 1000000
}
```

---

### 24. Backtest RSI Strategy

Backtest RSI mean reversion strategy.

**Endpoint:** `POST /api/backtest/rsi`

---

### 25. Backtest Momentum Strategy

Backtest momentum strategy.

**Endpoint:** `POST /api/backtest/momentum`

---

### 26. Get Stock Chart Data

Get K-line chart data for visualization.

**Endpoint:** `GET /api/stock/chart/{stock_code}`

---

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "error_type": "error_type"
}
```

**Error Types:**

| Type | Description |
|------|-------------|
| `stock_not_found` | Stock code not found |
| `invalid_stock_code` | Invalid stock code format |
| `data_fetch_error` | Failed to fetch data |
| `llm_error` | LLM API error |
| `timeout` | Request timeout |
| `internal_error` | Internal server error |

---

## CLI Commands

```bash
# 研究股票
python -m backend.cli research 600519

# 获取简报
python -m backend.cli report 000858

# 检查环境
python -m backend.cli env-status

# 版本
python -m backend.cli version
```

---

## Examples

### cURL

```bash
# Research stock
curl -X POST http://localhost:8001/api/research \
  -H "Content-Type: application/json" \
  -d '{"stock_code": "600519"}'

# Health check
curl http://localhost:8001/api/health
```

### JavaScript

```javascript
const response = await fetch('http://localhost:8001/api/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ stock_code: '600519' })
});
const data = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:8001/api/research',
    json={'stock_code': '600519'}
)
print(response.json())
```
