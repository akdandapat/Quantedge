'use client';

import React, { useState } from 'react';
import ControlPanel from '@/components/ControlPanel';
import RiskSurface from '@/components/visualization/RiskSurface';
import { fetchMetrics, fetchSimulation } from '@/lib/api';
import { MetricsResponse } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [simulationPaths, setSimulationPaths] = useState<number[][]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleRunAnalytics = async (tickers: string[], weights?: number[]) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch metrics
      const metricsData = await fetchMetrics({ tickers, weights, timeframe: '1y' });
      setMetrics(metricsData);
      
      // Kick off simulation fetch and update paths
      fetchSimulation({ tickers, weights, timeframe: '1y' }).then(sim => {
        setSimulationPaths(sim.paths);
      }).catch(err => {
        console.error("Simulation error:", err);
      });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar for Controls */}
      <div className="lg:col-span-1 space-y-6">
        <ControlPanel onSubmit={handleRunAnalytics} isLoading={isLoading} />
        
        {/* Simple error display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Placeholder for Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MetricCard 
            title="Value at Risk (95%)" 
            value={metrics ? `${(metrics.value_at_risk * 100).toFixed(2)}%` : '--'} 
            highlight={metrics ? true : false}
            isLoading={isLoading}
            tooltip="Maximum expected loss over 1 day with 95% confidence."
          />
          <MetricCard 
            title="Expected Return (Ann.)" 
            value={metrics ? `${(metrics.expected_return * 100).toFixed(2)}%` : '--'} 
            highlight={metrics ? true : false}
            isPositive={metrics ? metrics.expected_return > 0 : undefined}
            isLoading={isLoading}
          />
          <MetricCard 
            title="Sharpe Ratio" 
            value={metrics ? metrics.sharpe_ratio.toFixed(2) : '--'} 
            highlight={metrics ? true : false}
            isPositive={metrics ? metrics.sharpe_ratio > 1 : undefined}
            isLoading={isLoading}
            tooltip="Risk-adjusted return; higher is better. >2.0 is institutional grade."
          />
        </div>

        {/* 3D Risk Surface Manifold */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl relative overflow-hidden group min-h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20 transition-all duration-300">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="mt-6 text-emerald-400 font-medium tracking-wide animate-pulse">Running Monte Carlo Engine...</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <RiskSurface paths={simulationPaths} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, highlight, isPositive, isLoading, tooltip }: { title: string, value: string, highlight: boolean, isPositive?: boolean, isLoading?: boolean, tooltip?: string }) {
  let valueColor = highlight ? 'text-white' : 'text-slate-600';
  if (highlight && isPositive === true) valueColor = 'text-emerald-400';
  if (highlight && isPositive === false) valueColor = 'text-red-400';

  return (
    <div className={`bg-slate-900 border ${highlight && !isLoading ? 'border-slate-700 shadow-emerald-900/10' : 'border-slate-800'} rounded-xl p-6 shadow-xl transition-all duration-500`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {tooltip && (
          <div className="relative group flex items-center">
            <svg className="w-4 h-4 text-slate-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="h-9 w-28 bg-slate-800 rounded-md animate-pulse"></div>
      ) : (
        <p className={`text-3xl font-bold tracking-tight ${valueColor} transition-colors duration-300`}>
          {value}
        </p>
      )}
    </div>
  );
}
