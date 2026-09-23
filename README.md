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

On Vercel, settings and holdings are saved in each visitor's browser storage. They do not sync between devices and can be lost when browser data is cleared. Market history is fetched through `/api/history` on a Vercel Function.

Strategy parameters can also be saved per stock. Click **Save params** in the Strategy Lab to store the current parameters for the active symbol and strategy. When you switch back to that stock, the saved parameters are restored automatically. The optimiser's **Apply best parameters** button also saves the result per stock.

## Holdings

Use **My holdings** to add a stock symbol, share quantity (including fractional shares), and average purchase price per share. **Edit** changes an existing position; **Remove** only deletes the local record, never places a trade. Holdings are saved with your local settings and browser backup. Old settings without holdings remain compatible.

Average price must be entered in the quote's currency/units: for example, a GBX quote uses pence, not GBP pounds. Each row shows the latest available close and its date, current value (shares × close), and unrealised gain/loss relative to average cost. Values exclude fees, dividends and taxes; there is no FX conversion or mixed-currency portfolio total. **Refresh prices** reloads market data. Failed requests leave valuations and guidance unavailable rather than substituting demo prices.

Click **Analyse** on a holding, then select a strategy and parameters in **Strategy Lab**. The holding card updates automatically and uses the full latest loaded history, independent of backtest chart zoom. It evaluates the exit rule for shares you already own, even if the simulated strategy never bought them. Holdings remain long positions when backtest short mode is enabled.

- **HOLD**: the exit rule is not currently met; the card shows the next-close sell threshold where one exists.
- **SELL**: the latest close meets the exit rule; that close is a reference price, not an executable quote.
- **UNAVAILABLE**: market data, indicator warmup, or parameters are insufficient; refresh, increase the data range, or correct the inputs.
- **Buy and hold** deliberately has no rule-based sell price.

Thresholds change with each new bar. These are closing-price conditions, not intraday limit/stop orders or profit forecasts. Average cost affects P/L, not the technical exit rules. Confirm quote dates and broker prices before making a decision.

## Data Source

The app requests daily OHLCV data through a tiny local Node server from Yahoo Finance's public chart endpoint:

`https://query1.finance.yahoo.com/v8/finance/chart/AAPL`

Use normal Yahoo Finance symbols such as `AAPL`, `MSFT`, `SPY`, or exchange suffixes such as `VOD.L`. The app also maps `BATS` to `BATS.L`. If the browser cannot reach the local server or the remote source is unavailable, the app falls back to a bundled demo dataset so the strategy lab remains usable.

## Included Strategies

- SMA crossover
- RSI mean reversion
- Donchian breakout
- MACD crossover
- Bollinger Band mean reversion
- Buy and hold

Each strategy (except buy and hold) has tuneable parameters. The built-in optimiser searches parameter combinations for a selected stock and data range to maximise CAGR.

The backtester reports total return, CAGR, max drawdown, Sharpe ratio, trade count, signal history, an optional buy-and-hold reference, a next signal trigger estimate, and exportable CSV results.

## Notes

This is an analysis tool, not financial advice. Free market data can be delayed, corrected after publication, rate-limited, or unavailable for some exchanges. Use broker-grade data before putting real money behind a strategy.
