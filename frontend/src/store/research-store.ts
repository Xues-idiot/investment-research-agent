// Research Store - 研究状态管理

export interface ResearchReport {
  stockCode: string;
  companyName: string;
  finalReport: string;
  confidence: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  };
  reports: {
    fundamentals: string;
    sentiment: string;
    news: string;
    technical: string;
    synthesis: string;
  };
  timestamp: string;
}

export interface ResearchState {
  currentStock: string | null;
  reports: Map<string, ResearchReport>;
  loading: boolean;
  error: string | null;
  currentAgent: string;
}

export const initialState: ResearchState = {
  currentStock: null,
  reports: new Map(),
  loading: false,
  error: null,
  currentAgent: '',
};

export type ResearchAction =
  | { type: 'START_RESEARCH'; payload: string }
  | { type: 'SET_AGENT'; payload: string }
  | { type: 'SET_REPORT'; payload: ResearchReport }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

export function researchReducer(state: ResearchState, action: ResearchAction): ResearchState {
  switch (action.type) {
    case 'START_RESEARCH':
      return {
        ...state,
        currentStock: action.payload,
        loading: true,
        error: null,
        currentAgent: '初始化',
      };
    case 'SET_AGENT':
      return {
        ...state,
        currentAgent: action.payload,
      };
    case 'SET_REPORT': {
      const newReports = new Map(state.reports);
      newReports.set(action.payload.stockCode, action.payload);
      return {
        ...state,
        reports: newReports,
        loading: false,
        currentAgent: '',
      };
    }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        currentAgent: '',
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
