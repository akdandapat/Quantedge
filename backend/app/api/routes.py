from fastapi import APIRouter, HTTPException
import numpy as np
from typing import List, Optional

from app.api.schemas import PortfolioRequest, MetricsResponse, SimulationResponse
from app.quant.data_feed import fetch_historical_prices
from app.quant.engine import (
    get_portfolio_metrics, 
    calculate_daily_returns, 
    calculate_covariance_matrix, 
    calculate_portfolio_variance
)
from app.quant.monte_carlo import run_gbm_simulation

router = APIRouter()

def normalize_weights(weights: Optional[List[float]], num_tickers: int) -> np.ndarray:
    """Helper to ensure weights sum to 1 and match the number of valid tickers."""
    if not weights or len(weights) != num_tickers:
        weight_array = np.array([1.0 / num_tickers] * num_tickers)
    else:
        weight_array = np.array(weights)
        
    return weight_array / np.sum(weight_array)

@router.post("/metrics", response_model=MetricsResponse)
async def get_metrics(request: PortfolioRequest):
    if not request.tickers:
        raise HTTPException(status_code=400, detail="Tickers list cannot be empty")
        
    prices = fetch_historical_prices(request.tickers, period=request.timeframe)
    if prices.empty:
        raise HTTPException(status_code=404, detail="Failed to fetch data for the requested tickers.")
        
    valid_tickers = prices.columns.tolist()
    weights = normalize_weights(request.weights, len(valid_tickers))
    
    try:
        metrics = get_portfolio_metrics(prices, weights)
        return MetricsResponse(
            value_at_risk=metrics["value_at_risk"],
            sharpe_ratio=metrics["sharpe_ratio"],
            expected_return=metrics["expected_return"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")

@router.post("/simulation", response_model=SimulationResponse)
async def run_simulation(request: PortfolioRequest):
    if not request.tickers:
        raise HTTPException(status_code=400, detail="Tickers list cannot be empty")
        
    prices = fetch_historical_prices(request.tickers, period=request.timeframe)
    if prices.empty:
        raise HTTPException(status_code=404, detail="Failed to fetch data for the requested tickers.")
        
    valid_tickers = prices.columns.tolist()
    weights = normalize_weights(request.weights, len(valid_tickers))
    
    try:
        metrics = get_portfolio_metrics(prices, weights)
        annualized_expected_return = metrics["expected_return"]
        
        # We need daily volatility specifically for the GBM simulation steps
        ret_df = calculate_daily_returns(prices)
        cov_matrix_daily = calculate_covariance_matrix(ret_df, annualized=False)
        daily_variance = calculate_portfolio_variance(weights, cov_matrix_daily)
        daily_volatility = float(np.sqrt(daily_variance))
        
        daily_drift = annualized_expected_return / 252.0
        
        initial_price = 100.0
        time_horizon = 252
        num_sims = 1000
        
        paths = run_gbm_simulation(
            initial_price=initial_price,
            drift=daily_drift,
            volatility=daily_volatility,
            time_horizon_days=time_horizon,
            num_simulations=num_sims
        )
        
        return SimulationResponse(
            paths=paths.tolist(),
            metadata={
                "num_simulations": num_sims,
                "time_horizon_days": time_horizon,
                "initial_value": initial_price
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running simulation: {str(e)}")
