# QuantEdge — Predictive Portfolio Analytics

High-performance quantitative risk engine and 3D volatility visualization platform.

---

## Overview

QuantEdge is a full-stack portfolio analytics system that couples a Python-based quantitative engine with a modern React interface. The backend computes institutional-grade risk metrics — Historical Value at Risk, Sharpe Ratio, and forward-looking Monte Carlo simulations — while the frontend renders simulation output as an interactive 3D risk manifold in real time.

The system is designed for extensibility: the analytical engine is fully decoupled from the presentation layer via a RESTful API contract, allowing either side to be replaced or scaled independently.

## Core Technologies

| Layer | Stack |
|---|---|
| **Quantitative Engine** | Python, NumPy, Pandas, SciPy, GS Quant |
| **API** | FastAPI, Pydantic, Uvicorn, Gunicorn |
| **Data Feed** | yfinance (historical market data) |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **3D Visualization** | Three.js, React Three Fiber, Drei |
| **Deployment** | Render (backend), Vercel (frontend) |

## Key Features

### Geometric Brownian Motion Monte Carlo Simulation

Generates N stochastic price paths over a configurable time horizon using the GBM model:

```
S(t+1) = S(t) · exp((μ − ½σ²)Δt + σ√Δt · Z)
```

where μ is the calibrated daily drift, σ is the portfolio's daily volatility derived from the covariance matrix, and Z ~ N(0,1). Paths are computed via vectorized NumPy operations for throughput on the order of 1,000 simulations × 252 steps in sub-second latency.

### 95% Historical Value at Risk

Computes portfolio VaR at the 95th percentile using the historical simulation method — no distributional assumptions. Daily portfolio returns are constructed from the weighted sum of constituent asset returns, and the 5th percentile of the empirical distribution is reported as the maximum expected single-day loss.

### Interactive 3D Risk Surface

Monte Carlo output is mapped onto a Three.js mesh geometry where the X-axis represents time, the Y-axis represents simulation path index, and the Z-axis encodes normalized portfolio value. Vertex colors interpolate from rose (downside) to emerald (upside) based on terminal value. The surface auto-rotates and supports full orbit controls for inspection.

## System Architecture

```
┌─────────────────────────────┐       REST / JSON        ┌──────────────────────────────┐
│         BACKEND             │◄────────────────────────►│          FRONTEND            │
│                             │                           │                              │
│  FastAPI (app.main:app)     │   POST /api/metrics       │  Next.js 14 (App Router)     │
│  ├── api/routes.py          │   POST /api/simulation    │  ├── lib/api.ts              │
│  ├── api/schemas.py         │                           │  ├── components/             │
│  ├── quant/engine.py        │                           │  │   ├── ControlPanel.tsx     │
│  ├── quant/monte_carlo.py   │                           │  │   └── visualization/      │
│  └── quant/data_feed.py     │                           │  │       └── RiskSurface.tsx  │
│                             │                           │  └── types/index.ts          │
└─────────────────────────────┘                           └──────────────────────────────┘
       Python 3.11                                              Node.js / TypeScript
```

The backend exposes two endpoints. `/api/metrics` returns VaR, Sharpe Ratio, and annualized expected return for a given portfolio. `/api/simulation` returns the full matrix of Monte Carlo price paths. The frontend consumes both via a centralized fetch client that reads `NEXT_PUBLIC_API_URL` from the environment.

CORS is configured dynamically through the `FRONTEND_URL` environment variable on the backend, defaulting to `http://localhost:3000` for local development.

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Verify with `GET /health`.

### Frontend

```bash
cd frontend
cp .env.example .env.local    # sets NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point, CORS configuration
│   │   ├── api/
│   │   │   ├── routes.py           # /metrics and /simulation endpoints
│   │   │   └── schemas.py          # Pydantic request/response models
│   │   ├── quant/
│   │   │   ├── engine.py           # VaR, Sharpe Ratio, covariance calculations
│   │   │   ├── monte_carlo.py      # GBM simulation engine
│   │   │   └── data_feed.py        # yfinance data ingestion
│   │   └── core/
│   │       └── config.py           # Application settings
│   ├── requirements.txt
│   └── render.yaml                 # Render deployment blueprint
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages and layout
│   │   ├── components/             # UI and visualization components
│   │   ├── lib/                    # API client, utilities
│   │   └── types/                  # TypeScript interfaces
│   ├── .env.example
│   └── package.json
└── README.md
```

## License

This project is provided for portfolio and educational purposes.
