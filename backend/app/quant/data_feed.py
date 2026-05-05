import yfinance as yf
import pandas as pd
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

def fetch_historical_prices(
    tickers: List[str], 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    period: str = "1y"
) -> pd.DataFrame:
    """
    Fetches historical adjusted close prices for a given list of tickers.
    """
    if not tickers:
        return pd.DataFrame()
        
    try:
        # yf.download handles multiple tickers.
        kwargs = {"progress": False}
        if start_date and end_date:
            kwargs["start"] = start_date
            kwargs["end"] = end_date
        else:
            kwargs["period"] = period
            
        data = yf.download(tickers, **kwargs)
        
        if data.empty:
            logger.warning(f"No data fetched for tickers {tickers}")
            return pd.DataFrame()
            
        # Extract Adjusted Close if available, else Close
        if isinstance(data.columns, pd.MultiIndex):
            if 'Adj Close' in data.columns.levels[0]:
                prices = data['Adj Close']
            else:
                prices = data['Close']
        else:
            if 'Adj Close' in data.columns:
                prices = data['Adj Close']
            else:
                prices = data['Close']
            
        # Ensure it's a DataFrame
        if isinstance(prices, pd.Series):
            prices = prices.to_frame(name=tickers[0])
            
        # Forward fill and drop any remaining NaNs
        prices = prices.ffill().dropna()
        return prices
    except Exception as e:
        logger.error(f"Failed to fetch data from yfinance: {e}")
        return pd.DataFrame()
