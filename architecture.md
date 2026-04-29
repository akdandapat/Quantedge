# Architecture: High-Performance Predictive Portfolio Analytics Platform

## 1. System Overview
The platform consists of a React/Next.js frontend providing a modern SaaS dashboard with 3D visualizations, powered by a high-performance FastAPI backend that wraps a Python-based Quantitative Engine.

## 2. Technology Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript.
- **3D Visualization**: Three.js, React Three Fiber (`@react-three/fiber`), Drei.
- **Backend API**: FastAPI, Uvicorn, Pydantic.
- **Quant/ML Engine**: Python, pandas, numpy, scikit-learn, yfinance (for market data).

## 3. Directory Structure
```text
/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── routes.py        # RESTful API endpoints (/metrics, /simulation)
│   │   │   └── schemas.py       # Pydantic data validation models
│   │   ├── quant/
│   │   │   ├── engine.py        # VaR and Sharpe Ratio calculations
│   │   │   ├── monte_carlo.py   # Monte Carlo simulation logic
│   │   │   └── data_feed.py     # Data ingestion (yfinance)
│   │   └── core/
│   │       └── config.py        # App configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── ui/              # Reusable Shadcn-style base components
│   │   │   ├── dashboard/       # Layout components for the analytics view
│   │   │   └── visualization/   # Three.js 3D Canvas components (Risk Surface)
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios/Fetch client for backend communication
│   │   │   └── utils.ts         # Formatting and helper functions
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── architecture.md              # This document
```

## 4. Data Flow
1. **User Interaction**: User configures portfolio weights and simulation parameters in the React frontend.
2. **API Request**: Frontend sends a request to FastAPI endpoints (e.g., `/api/metrics`, `/api/simulation`).
3. **Data Ingestion**: The Quant Engine fetches required asset data via `yfinance` (or cached local data).
4. **Computation**: The Quant Engine computes Value at Risk (VaR), Sharpe Ratio, and generates Monte Carlo future paths.
5. **API Response**: Backend serializes the results to JSON and returns them to the frontend.
6. **Visualization**: Frontend updates the Dashboard UI components and passes the 3D surface data to the React Three Fiber canvas to render the Risk Surface manifold.
