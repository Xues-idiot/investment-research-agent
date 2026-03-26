// Types for Rho Frontend

// 统一版本号
export const VERSION = '1.4.0';

export interface StockInfo {
  stock_code: string;
  name: string;
  price: number;
  pe_ratio: number;
  pb_ratio: number;
  market_cap: number;
  dividend_yield: number;
  '52w_high': number;
  '52w_low': number;
}

export interface AnalystReport {
  content: string;
  confidence: number;
  timestamp: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  score: number;
}

export interface ResearchReport {
  stockCode: string;
  companyName: string;
  researchDate: string;
  finalReport: string;
  confidence: number;
  riskAssessment: RiskAssessment;
  reports: {
    fundamentals: string;
    sentiment: string;
    news: string;
    technical: string;
    synthesis: string;
  };
}

export interface ResearchRequest {
  stock_code: string;
  company_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  error_type?: string;
}

export type AgentName =
  | 'init'
  | 'Supervisor'
  | 'Fundamental Analyst'
  | 'Sentiment Analyst'
  | 'News Analyst'
  | 'Technical Analyst'
  | 'Synthesizer'
  | 'Risk Evaluator'
  | 'Report Generator';

export interface AgentProgress {
  name: AgentName;
  icon: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  config: {
    llmProvider: string;
    apiPort: number;
    frontendPort: number;
  };
  environment: {
    llmConfigured: boolean;
    tavilyConfigured: boolean;
  };
  system: {
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
  };
}

export interface StockValidation {
  valid: boolean;
  market: 'A' | 'HK' | 'US' | 'unknown';
  name: string | null;
}

export interface StreamEvent {
  event: 'agent' | 'complete' | 'error';
  agent?: string;
  message?: string;
  data?: ResearchReport | string;
}

// ============ Chart Types ============

export interface KLineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalData {
  time: string;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  rsi: number;
  kdjK: number;
  kdjD: number;
  kdjJ: number;
}

export interface ChartData {
  stockCode: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
  kline: KLineData[];
  technical: TechnicalData[];
}

// ============ Backtest Types ============

export interface BacktestTrade {
  date: string;
  signal: string;
  price: number;
  shares: number;
  amount: number;
  commission: number;
  reason: string;
}

export interface DailyReturn {
  date: string;
  value: number;
  dailyReturn: number;
}

export interface BacktestResult {
  stockCode: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  numTrades: number;
  numBuys: number;
  numSells: number;
  winRate: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
  dailyReturns: DailyReturn[];
}

// ============ Portfolio Types ============

export interface PortfolioHolding {
  stockCode: string;
  stockName: string;
  weight: number;
  shares: number;
  entryPrice: number;
  allocation: number;
  allocationPct: number;
}

export interface PortfolioSuggestion {
  totalCapital: number;
  totalInvested: number;
  cashReserve: number;
  cashReservePct: number;
  holdings: PortfolioHolding[];
  numPositions: number;
  strategy: string;
  riskLevel: string;
  timestamp: string;
}

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: string;
  concentrationRisk: string;
  diversificationScore: number;
  correlationRisk: string;
  maxWeight: number;
  numPositions: number;
  suggestions: string[];
}

// ============ Monitor Types ============

export interface Alert {
  stockCode: string;
  alertType: string;
  threshold: number;
  enabled: boolean;
  triggeredAt?: string;
  message?: string;
}

export interface AlertEvent {
  stockCode: string;
  stockName: string;
  alertType: string;
  currentValue: number;
  threshold: number;
  timestamp: string;
  message: string;
}

// ============ Compare Types ============

export interface ComparisonStock {
  stockCode: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  peRatio?: number;
  pbRatio?: number;
  marketCap: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  volume: number;
  avgVolume: number;
  rsi14?: number;
  macd?: number;
  trend: string;
  sma20?: number;
  sma60?: number;
  bollPosition: number;
  volumeRatio: number;
}

export interface ComparisonResult {
  stocks: ComparisonStock[];
  comparison: {
    valuation: { headers: string[]; rows: string[][] };
    technical: { headers: string[]; rows: string[][] };
    market: { headers: string[]; rows: string[][] };
  };
  conclusions: string[];
  timestamp: string;
}

export interface RankResult {
  ranks: (ComparisonStock & { rank: number; score: number })[];
  criteria: string;
  timestamp: string;
}

export interface CompareChartData {
  code: string;
  name: string;
  kline: KLineData[];
  currentPrice: number;
}
