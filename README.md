# FunFin

A dependency-free browser app for monitoring stocks and quickly testing simple investment strategies.

## Run

Run the local server, then open the shown URL:

```powershell
node server.js
```

The default URL is `http://localhost:4173`.

You can also choose a port:

```powershell
node server.js --port 4174
```

## Local Settings

The app saves your watchlist and UI parameters to `data/settings.json` through the local server. This file is ignored by Git so your personal symbols, strategy settings, zoom window, capital amount, fee toggle, buy-and-hold comparison preference, and volume display preferences stay local to your machine.

Strategy parameters can also be saved per stock. Click **Save params** in the Strategy Lab to store the current parameters for the active symbol and strategy. When you switch back to that stock, the saved parameters are restored automatically. The optimiser's **Apply best parameters** button also saves the result per stock.

## Data Source

The app requests daily OHLCV data through a tiny local Node server from Yahoo Finance's public chart endpoint:

`https://query1.finance.yahoo.com/v8/finance/chart/AAPL`

Use normal Yahoo Finance symbols such as `AAPL`, `MSFT`, `SPY`, or exchange suffixes such as `VOD.L`. The app also maps `BATS` to `BATS.L`. If the browser cannot reach the local server or the remote source is unavailable, the app falls back to a bundled demo dataset so the strategy lab remains usable.

## Included Strategies

- SMA crossover
- RSI mean reversion
- Donchian breakout
- MACD crossover
- Buy and hold

Each strategy (except buy and hold) has tuneable parameters. The built-in optimiser searches parameter combinations for a selected stock and data range to maximise CAGR.

The backtester reports total return, CAGR, max drawdown, Sharpe ratio, trade count, signal history, an optional buy-and-hold reference, a next signal trigger estimate, and exportable CSV results.

## Notes

This is an analysis tool, not financial advice. Free market data can be delayed, corrected after publication, rate-limited, or unavailable for some exchanges. Use broker-grade data before putting real money behind a strategy.
