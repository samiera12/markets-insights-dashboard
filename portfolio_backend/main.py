import numpy as np
import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN"]

def fetch_and_process_data():
    try:
        data = yf.download(TICKERS, period="5y", interval="1d")

        if data.empty:
            raise ValueError("No data retrieved from Yahoo Finance.")

        adj_close = data["Close"]
        daily_returns = adj_close.pct_change().dropna()

        num_assets = len(TICKERS)
        weights = np.ones(num_assets) / num_assets

        individual_cum_returns = (1 + daily_returns).cumprod() - 1

        portfolio_daily_return = daily_returns.dot(weights)
        portfolio_cum_return = (1 + portfolio_daily_return).cumprod() - 1

        total_return = portfolio_cum_return.iloc[-1]
        ann_volatility = portfolio_daily_return.std() * np.sqrt(252)

        portfolio_value = (1 + portfolio_daily_return).cumprod()
        peak = portfolio_value.cummax()
        drawdown = (portfolio_value - peak) / peak
        max_drawdown = drawdown.min()

        chart_data = []
        for date, row in portfolio_cum_return.items():
            date_str = date.strftime("%Y-%m-%d")
            data_point = {
                "date": date_str,
                "Portfolio": round(float(row) * 100, 2),
            }
            
            for ticker in TICKERS:
                data_point[ticker] = round(float(individual_cum_returns.loc[date, ticker]) * 100, 2)
                try:
                    data_point[f"{ticker}_Open"] = round(float(data["Open"][ticker].loc[date]), 2)
                    data_point[f"{ticker}_High"] = round(float(data["High"][ticker].loc[date]), 2)
                    data_point[f"{ticker}_Low"] = round(float(data["Low"][ticker].loc[date]), 2)
                    data_point[f"{ticker}_Close"] = round(float(data["Close"][ticker].loc[date]), 2)
                except Exception:
                    pass

            chart_data.append(data_point)

        final_asset_values = (1 + daily_returns).cumprod().iloc[-1] * weights
        total_final_value = final_asset_values.sum()
        
        best_asset = final_asset_values.idxmax()
        worst_asset = final_asset_values.idxmin()
        
        insights = [
            f"Growth Driver: Over the 5-year period, {best_asset} was the primary growth driver, outperforming the baseline.",
            f"Risk Profile: The portfolio experienced a maximum drawdown of {round(max_drawdown * 100, 2)}%, highlighting historical volatility risks.",
            f"Asset Drift: Due to compounding divergence, {best_asset} now holds a disproportionate weight compared to the initial equal allocation. Rebalancing is recommended."
        ]

        allocation_data = [
            {
                "name": ticker,
                "value": round((float(final_asset_values[ticker]) / total_final_value) * 100, 2),
            }
            for ticker in TICKERS
        ]

        metrics = {
            "totalReturn": f"{round(total_return * 100, 2)}%",
            "annualizedVolatility": f"{round(ann_volatility * 100, 2)}%",
            "maxDrawdown": f"{round(max_drawdown * 100, 2)}%",
        }

        return {
            "status": "success",
            "metrics": metrics,
            "allocation": allocation_data,
            "chartData": chart_data,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process financial data: {str(e)}"
        )

@app.get("/api/portfolio")
def get_portfolio_analytics():
    return fetch_and_process_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)