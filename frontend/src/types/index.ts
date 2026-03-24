// Types for Rho Frontend

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
  research_date: string;
  final_report: string;
  confidence: number;
  risk_assessment: RiskAssessment;
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
    llm_provider: string;
    api_port: number;
    frontend_port: number;
  };
  environment: {
    llm_configured: boolean;
    tavily_configured: boolean;
  };
  system: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
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
