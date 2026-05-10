from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PortfolioRequest(BaseModel):
    tickers: List[str] = Field(..., description="List of stock tickers in the portfolio")
    weights: Optional[List[float]] = Field(None, description="Optional weights for each ticker. Must sum to 1 if provided.")
    timeframe: str = Field(default="1y", description="Historical timeframe for analysis (e.g., '1mo', '1y', '5y')")

class MetricsResponse(BaseModel):
    value_at_risk: float = Field(..., description="Value at Risk (VaR) of the portfolio")
    sharpe_ratio: float = Field(..., description="Sharpe Ratio of the portfolio")
    expected_return: float = Field(..., description="Expected return of the portfolio")

class SimulationResponse(BaseModel):
    paths: List[List[float]] = Field(..., description="2D array representing Monte Carlo price paths [simulation_index][time_step]")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the simulation (e.g., num_simulations, time_horizon)")
