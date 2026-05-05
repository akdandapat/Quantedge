import numpy as np

def run_gbm_simulation(
    initial_price: float,
    drift: float,
    volatility: float,
    time_horizon_days: int = 252,
    num_simulations: int = 10000,
    seed: int = 42
) -> np.ndarray:
    """
    Runs a Geometric Brownian Motion (GBM) Monte Carlo simulation.
    
    Args:
        initial_price: The starting price (e.g., current portfolio value).
        drift: The expected daily return (drift).
        volatility: The daily volatility (standard deviation of returns).
        time_horizon_days: Number of future days to simulate (T).
        num_simulations: Number of paths to simulate (N).
        seed: Random seed for reproducibility.
        
    Returns:
        np.ndarray: A 2D array of shape (num_simulations, time_horizon_days + 1)
                    representing the simulated price paths.
    """
    # Set seed for reproducible paths
    np.random.seed(seed)
    
    # Pre-allocate array for paths. Shape: (N paths, T days + 1)
    paths = np.zeros((num_simulations, time_horizon_days + 1))
    paths[:, 0] = initial_price
    
    # Generate standard normal random variables for the entire simulation
    # Shape: (N paths, T days)
    Z = np.random.standard_normal((num_simulations, time_horizon_days))
    
    # GBM daily growth factor: exp((mu - 0.5 * sigma^2) + sigma * Z)
    # Using daily drift and volatility directly
    daily_returns = np.exp((drift - 0.5 * volatility**2) + volatility * Z)
    
    # Calculate cumulative product to get price paths and assign to array
    paths[:, 1:] = initial_price * np.cumprod(daily_returns, axis=1)
    
    return paths
