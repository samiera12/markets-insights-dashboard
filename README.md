# Market Insights and Portfolio Analytics Dashboard

A sophisticated full stack financial tool that analyzes historical market data to provide portfolio performance metrics and automated business insights. This project demonstrates a decoupled architecture using a Python FastAPI backend and a Next.js React frontend.

## Live Demo and Links
* Production UI: [https://markets-insights-dashboard.netlify.app](https://markets-insights-dashboard.netlify.app/)
* REST API Endpoint: [https://markets-insights-dashboard.onrender.com/api/portfolio](https://markets-insights-dashboard.onrender.com/api/portfolio)
* Repository: [https://github.com/samiera12/markets-insights-dashboard](https://github.com/samiera12/markets-insights-dashboard)

## Tech Stack
* Frontend: Next.js 14, Tailwind CSS, Framer Motion, Recharts
* Backend: Python 3.11, FastAPI, Pandas, NumPy, yfinance
* Deployment: Netlify (Frontend), Render (Backend)

## Mathematical Methodology
The dashboard implements an equal weighted portfolio strategy for a basket of 4 high growth tickers: AAPL, MSFT, GOOGL, AMZN.

### Portfolio Return Calculation
The daily portfolio return $R_{p,t}$ is calculated as the weighted sum of individual asset returns:

$$R_{p,t} = \sum_{i=1}^{n} w_i R_{i,t}$$

Where $w_i = \frac{1}{n}$ and $R_{i,t}$ represents the daily percentage change of asset $i$.

### Performance Metrics
* Cumulative Return: Derived by compounding the daily returns over the 5 year horizon.
* Annualized Volatility: Calculated using the standard deviation of daily returns scaled by the square root of trading days:
$$\sigma_{ann} = \sigma_{daily} \times \sqrt{252}$$
* Maximum Drawdown (MDD): Measures the largest peak to trough decline to assess historical risk by identifying the maximum loss from a peak to a following trough.

## Key Features
* Interactive Data Visualization: Staggered area charts showing cumulative performance with a custom OHLC Tooltip for deep dive price insights.
* Automated Insights: A backend engine that analyzes asset drift and risk profiles to generate natural language takeaways.
* Asset Drift Analysis: A dynamic donut chart visualizing how equal initial weights have diverged over a 5 year period due to market performance.
* Robust UX: Specialized handling for Loading, Empty, and Error states to ensure a seamless customer friendly experience.

## Local Setup Instructions

### 1. Backend Setup
Navigate to the backend directory and start the FastAPI server:
```bash
cd portfolio_backend
python -m venv venv
pip install -r requirements.txt
python main.py
 ```
### 2. Frontend Setup
Navigate to the frontend directory and start the Next.js development server:
```bash
cd portfolio_frontend
npm install
npm run dev
