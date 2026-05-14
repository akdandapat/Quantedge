import { PortfolioRequest, MetricsResponse, SimulationResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchMetrics(request: PortfolioRequest): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch metrics');
  }

  return response.json();
}

export async function fetchSimulation(request: PortfolioRequest): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch simulation');
  }

  return response.json();
}
