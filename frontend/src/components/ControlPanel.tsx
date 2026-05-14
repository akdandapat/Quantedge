'use client';

import React, { useState } from 'react';

interface ControlPanelProps {
  onSubmit: (tickers: string[], weights?: number[]) => void;
  isLoading?: boolean;
}

export default function ControlPanel({ onSubmit, isLoading = false }: ControlPanelProps) {
  const [tickerInput, setTickerInput] = useState('AAPL, MSFT, GS');
  const [weightInput, setWeightInput] = useState('0.4, 0.4, 0.2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tickers = tickerInput.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    
    let weights: number[] | undefined = undefined;
    if (weightInput.trim()) {
      const parsedWeights = weightInput.split(',').map(w => parseFloat(w.trim()));
      // Basic validation
      if (parsedWeights.length === tickers.length && !parsedWeights.some(isNaN)) {
        weights = parsedWeights;
      } else {
        alert("Please ensure the number of weights matches the number of tickers, and all are valid numbers.");
        return;
      }
    }

    onSubmit(tickers, weights);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Configuration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Tickers (comma separated)</label>
          <input
            type="text"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            placeholder="e.g. AAPL, MSFT, GS"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Weights (comma separated, optional)</label>
          <input
            type="text"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            placeholder="e.g. 0.4, 0.4, 0.2"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Run Analytics'}
        </button>
      </form>
    </div>
  );
}
