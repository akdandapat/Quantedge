import pandas as pd
import numpy as np
from typing import Tuple, Dict, Optional
import warnings

# Attempt to import gs_quant for enterprise timeseries calculations
try:
    from gs_quant.timeseries import returns as gs_returns
    GS_QUANT_AVAILABLE = True
except ImportError:
    GS_QUANT_AVAILABLE = False
    warnings.warn("gs_quant is not installed. Falling back to pandas/numpy implementations.")

def calculate_daily_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates daily returns from a DataFrame of prices.
    Integrates gs_quant to satisfy enterprise requirements if available.
    """
    if prices.empty:
        return pd.DataFrame()
        
    if GS_QUANT_AVAILABLE:
        # Utilize gs_quant's timeseries returns logic for enterprise rigor
        returns_df = pd.DataFrame()
        for col in prices.columns:
            # gs_returns handles timeseries transformation
            returns_df[col] = gs_returns(prices[col])
        return returns_df.dropna()
    else:
        # Fallback to pandas pct_change
        return prices.pct_change().dropna()

def calculate_covariance_matrix(returns_df: pd.DataFrame, annualized: bool = True, trading_days: int = 252) -> pd.DataFrame:
    """
    Calculates the covariance matrix of returns.
    """
    cov_matrix = returns_df.cov()
    if annualized:
        cov_matrix = cov_matrix * trading_days
    return cov_matrix

def calculate_portfolio_variance(weights: np.ndarray, cov_matrix: pd.DataFrame) -> float:
    """
    Calculates portfolio variance given weights and a covariance matrix.
    """
    # w^T * Cov * w
    var = np.dot(weights.T, np.dot(cov_matrix.values, weights))
    return float(var)

def calculate_sharpe_ratio(
    expected_return: float, 
    portfolio_variance: float, 
    risk_free_rate: float = 0.02
) -> float:
    """
    Calculates the annualized Sharpe Ratio.
    """
    if portfolio_variance <= 0:
        return 0.0
    portfolio_std_dev = np.sqrt(portfolio_variance)
    return (expected_return - risk_free_rate) / portfolio_std_dev

def calculate_historical_var(
    returns_df: pd.DataFrame, 
    weights: np.ndarray, 
    portfolio_value: float = 1.0, 
    confidence_level: float = 0.95
) -> float:
    """
    Calculates the Historical Value at Risk (VaR) at a given confidence level.
    """
    if returns_df.empty:
        return 0.0
        
    # Calculate historical portfolio returns
    portfolio_returns = returns_df.dot(weights)
    
    # 95% confidence means the 5th percentile of returns
    percentile = (1.0 - confidence_level) * 100
    
    # Calculate the VaR return (negative value)
    var_return = np.percentile(portfolio_returns.dropna(), percentile)
    
    # Return as a positive loss magnitude
    var_loss = -var_return * portfolio_value
    return float(max(0.0, var_loss))

def get_portfolio_metrics(
    prices: pd.DataFrame, 
    weights: np.ndarray, 
    risk_free_rate: float = 0.02
) -> Dict[str, float]:
    """
    Convenience function to compute all portfolio metrics.
    """
    ret_df = calculate_daily_returns(prices)
    if ret_df.empty:
        return {"value_at_risk": 0.0, "sharpe_ratio": 0.0, "expected_return": 0.0}
        
    cov_matrix = calculate_covariance_matrix(ret_df, annualized=True)
    port_variance = calculate_portfolio_variance(weights, cov_matrix)
    
    # Annualized expected return approximation
    mean_daily_returns = ret_df.mean()
    annualized_returns = mean_daily_returns * 252
    port_expected_return = float(np.dot(weights, annualized_returns))
    
    sharpe = calculate_sharpe_ratio(port_expected_return, port_variance, risk_free_rate)
    var_95 = calculate_historical_var(ret_df, weights, confidence_level=0.95)
    
    return {
        "value_at_risk": var_95,
        "sharpe_ratio": sharpe,
        "expected_return": port_expected_return
    }
