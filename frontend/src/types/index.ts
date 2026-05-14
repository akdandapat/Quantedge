export interface PortfolioRequest {
  tickers: string[];
  weights?: number[];
  timeframe?: string;
}

export interface MetricsResponse {
  value_at_risk: number;
  sharpe_ratio: number;
  expected_return: number;
}

export interface SimulationResponse {
  paths: number[][];
  metadata?: Record<string, any>;
}
