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
