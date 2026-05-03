const SAMPLE_CSV = `Date,Open,High,Low,Close,Volume
2024-01-02,187.15,188.44,183.89,185.64,82488700
2024-01-16,182.16,184.26,180.93,183.63,65603000
2024-02-01,183.99,186.95,183.82,186.86,64885400
2024-02-15,183.55,184.49,181.35,183.86,65434500
2024-03-01,179.55,180.53,177.38,179.66,73488000
2024-03-15,171.17,172.62,170.29,172.62,121664700
2024-04-01,171.19,171.25,169.48,170.03,46240500
2024-04-15,175.36,176.63,172.50,172.69,73531800
2024-05-01,169.58,172.71,169.11,169.30,50383100
2024-05-15,187.91,190.65,187.37,189.72,70400000
2024-06-03,192.90,194.99,192.52,194.03,50080500
2024-06-17,213.37,218.95,212.72,216.67,93728300
2024-07-01,212.09,217.51,211.92,216.75,60402900
2024-07-15,236.48,237.23,233.09,234.40,62631300
2024-08-01,224.37,224.48,217.02,218.36,62501000
2024-08-15,224.60,225.35,222.76,224.72,46414000
2024-09-03,228.55,229.00,221.17,222.77,50190600
2024-09-16,216.54,217.22,213.92,216.32,59357400
2024-10-01,229.52,229.65,223.74,226.21,63285000
2024-10-15,233.61,237.49,232.37,233.85,64751400
2024-11-01,220.97,225.35,220.27,222.91,65276700
2024-11-15,226.40,226.92,224.27,225.00,47923700
2024-12-02,237.27,240.79,237.16,239.59,48137100
2024-12-16,247.99,251.38,247.65,251.04,51694800
2025-01-02,248.93,249.10,241.82,243.85,55740700
2025-01-15,234.64,238.96,234.43,237.87,39832000
2025-02-03,229.99,231.83,225.70,228.01,73063300
2025-02-18,244.15,245.18,241.84,244.47,48822500
2025-03-03,241.79,244.03,236.11,238.03,47184000
2025-03-17,213.31,215.22,209.97,214.00,48073400
2025-04-01,219.81,223.68,218.90,223.19,36412700
2025-04-15,201.86,203.51,199.80,202.14,39886500
2025-05-01,209.08,214.56,208.90,213.32,57365700
2025-05-15,210.95,212.96,209.54,211.45,45029500
2025-06-02,200.28,202.13,200.12,201.70,35423300
2025-06-16,197.30,198.69,196.56,198.42,43020700
2025-07-01,206.67,210.19,206.14,207.82,78788900
2025-07-15,209.22,211.89,208.92,209.11,42296300
2025-08-01,210.87,213.58,201.50,202.38,104434500
2025-08-15,234.00,234.28,229.34,231.59,56038700
2025-09-02,229.25,230.85,226.97,229.72,44075600
2025-09-15,237.00,238.19,235.03,236.70,42699500
2025-10-01,255.04,258.79,254.93,255.45,48713900
2025-10-15,249.49,251.82,247.47,249.34,33893600
2025-11-03,270.42,270.85,266.25,269.05,50194600
2025-11-17,268.82,270.49,265.73,267.46,45018300
2025-12-01,278.01,283.42,276.14,283.10,46516800
2025-12-15,280.54,284.25,280.02,283.86,35612200
2026-01-02,285.12,287.90,282.41,286.34,38124000
2026-01-15,289.31,291.05,286.44,288.10,40211600
2026-02-02,292.44,296.18,291.52,294.82,44481800
2026-02-17,297.85,300.12,294.60,296.31,42880100
2026-03-02,301.10,305.66,299.20,304.28,46177200
2026-03-16,308.42,309.50,304.71,306.05,39721000
2026-04-01,311.88,315.20,309.42,313.74,44912000
2026-04-22,318.24,320.85,315.10,319.41,48739000`;

const state = {
  watchlist: ["AAPL", "MSFT", "NVDA", "SPY"],
  activeSymbol: "AAPL",
  cache: new Map(),
  metaCache: new Map(),
  chartMode: "price",
  zoomStart: "",
  zoomEnd: "",
  zoomDataKey: "",
  volumeInterval: 1,
  volumeMode: "split",
  showBuyHoldComparison: false,
  strategyParams: {},
  savedSymbolParams: {},
  settingsLoaded: false,
  saveTimer: null,
  backtest: null,
  data: [],
};

const els = {
  watchlist: document.querySelector("#watchlist"),
  symbolForm: document.querySelector("#symbolForm"),
  symbolInput: document.querySelector("#symbolInput"),
  rangeSelect: document.querySelector("#rangeSelect"),
  capitalInput: document.querySelector("#capitalInput"),
  strategySelect: document.querySelector("#strategySelect"),
  strategyParams: document.querySelector("#strategyParams"),
  longOnlyInput: document.querySelector("#longOnlyInput"),
  feesInput: document.querySelector("#feesInput"),
  buyHoldComparisonInput: document.querySelector("#buyHoldComparisonInput"),
  runBtn: document.querySelector("#runBtn"),
  refreshAllBtn: document.querySelector("#refreshAllBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  activeSymbol: document.querySelector("#activeSymbol"),
  dataStatus: document.querySelector("#dataStatus"),
  chartSubtitle: document.querySelector("#chartSubtitle"),
  mainChart: document.querySelector("#mainChart"),
  volumeChart: document.querySelector("#volumeChart"),
  zoomStartInput: document.querySelector("#zoomStartInput"),
  zoomEndInput: document.querySelector("#zoomEndInput"),
  zoomResetBtn: document.querySelector("#zoomResetBtn"),
  volumeIntervalSelect: document.querySelector("#volumeIntervalSelect"),
  volumeModeSelect: document.querySelector("#volumeModeSelect"),
  volumeSummary: document.querySelector("#volumeSummary"),
  signalList: document.querySelector("#signalList"),
  signalCount: document.querySelector("#signalCount"),
  optimiseBtn: document.querySelector("#optimiseBtn"),
  optimiserRanges: document.querySelector("#optimiserRanges"),
  optimiserProgress: document.querySelector("#optimiserProgress"),
  optimiserProgressBar: document.querySelector("#optimiserProgressBar"),
  optimiserProgressText: document.querySelector("#optimiserProgressText"),
  optimiserCancel: document.querySelector("#optimiserCancel"),
  optimiserResults: document.querySelector("#optimiserResults"),
  optimiserResultsBody: document.querySelector("#optimiserResultsBody"),
  optimiserBest: document.querySelector("#optimiserBest"),
  optimiserFooter: document.querySelector("#optimiserFooter"),
  applyBestBtn: document.querySelector("#applyBestBtn"),
  buyHoldComparison: document.querySelector("#buyHoldComparison"),
  buyHoldComparisonBody: document.querySelector("#buyHoldComparisonBody"),
  buyHoldComparisonDelta: document.querySelector("#buyHoldComparisonDelta"),
  saveParamsBtn: document.querySelector("#saveParamsBtn"),
  loadParamsBtn: document.querySelector("#loadParamsBtn"),
  savedParamsHint: document.querySelector("#savedParamsHint"),
  metrics: {
    totalReturn: document.querySelector("#metricReturn"),
    cagr: document.querySelector("#metricCagr"),
    drawdown: document.querySelector("#metricDrawdown"),
    sharpe: document.querySelector("#metricSharpe"),
    trades: document.querySelector("#metricTrades"),
  },
};

const strategyParams = {
  sma: [
    { key: "fast", label: "Fast SMA", value: 20, min: 2, max: 250 },
    { key: "slow", label: "Slow SMA", value: 50, min: 5, max: 400 },
  ],
  rsi: [
    { key: "period", label: "RSI period", value: 14, min: 2, max: 80 },
    { key: "buyBelow", label: "Buy below", value: 35, min: 1, max: 60 },
    { key: "sellAbove", label: "Sell above", value: 65, min: 40, max: 99 },
  ],
  breakout: [
    { key: "lookback", label: "Lookback days", value: 55, min: 5, max: 250 },
    { key: "exit", label: "Exit days", value: 20, min: 3, max: 160 },
  ],
  buyhold: [],
};

const symbolAliases = {
  BATS: "BATS.L",
};

function normalizeSymbol(raw) {
  const symbol = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!symbol) return "";
  return symbol;
}

function sourceSymbol(symbol) {
  const normalized = symbol.toUpperCase().replace(/\.US$/, "");
  return symbolAliases[normalized] || normalized;
}

async function fetchMarketData(symbol, years, force = false) {
  const key = `${symbol}-${years}`;
  if (!force && state.cache.has(key)) return state.cache.get(key);

  const apiUrl = `${location.protocol.startsWith("http") ? "" : "http://localhost:4173"}/api/history?symbol=${encodeURIComponent(sourceSymbol(symbol))}&years=${encodeURIComponent(years)}`;

  setStatus(`Loading ${sourceSymbol(symbol)}...`);
  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : payload.rows;
    const meta = Array.isArray(payload) ? { symbol, currency: inferCurrency(symbol) } : payload.meta || {};
    if (rows.length < 12) throw new Error("Not enough rows returned");
    state.cache.set(key, rows);
    const currency = normalizeCurrency(meta.currency || inferCurrency(symbol));
    state.metaCache.set(symbol, { symbol, currency, sourceSymbol: meta.symbol || sourceSymbol(symbol) });
    setStatus(`Loaded ${rows.length} daily bars from Yahoo Finance${currency ? ` (${currency})` : ""}`);
    return rows;
  } catch (error) {
    const fallback = parseCsv(SAMPLE_CSV);
    state.metaCache.set(symbol, { symbol, currency: "USD", sourceSymbol: "AAPL" });
    setStatus(`Using demo data: ${error.message}`);
    state.cache.set(key, fallback);
    return fallback;
  }
}

function parseCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, open, high, low, close, volume] = line.split(",");
      return {
        date,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        volume: Number(volume),
      };
    })
    .filter((row) => row.date && Number.isFinite(row.close))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function movingAverage(values, period) {
  const result = Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

function rsi(values, period) {
  const result = Array(values.length).fill(null);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }
  return result;
}

function rollingHigh(rows, period) {
  return rows.map((_, index) => {
    if (index < period) return null;
    return Math.max(...rows.slice(index - period, index).map((row) => row.high));
  });
}

function rollingLow(rows, period) {
  return rows.map((_, index) => {
    if (index < period) return null;
    return Math.min(...rows.slice(index - period, index).map((row) => row.low));
  });
}

function getParams() {
  const params = {};
  els.strategyParams.querySelectorAll("input").forEach((input) => {
    params[input.name] = Number(input.value);
  });
  state.strategyParams[els.strategySelect.value] = params;
  return params;
}

function buildSignalSeries(rows, options) {
  const strategy = options?.strategy ?? els.strategySelect.value;
  const params = options?.params ?? getParams();
  const longOnly = options?.longOnly ?? els.longOnlyInput.checked;
  const closes = rows.map((row) => row.close);
  const target = Array(rows.length).fill(0);
  const indicators = {};

  if (strategy === "buyhold") {
    return { target: target.map(() => 1), indicators };
  }

  if (strategy === "sma") {
    const fast = movingAverage(closes, params.fast);
    const slow = movingAverage(closes, params.slow);
    indicators.fast = fast;
    indicators.slow = slow;
    for (let i = 1; i < rows.length; i += 1) {
      target[i] = fast[i] !== null && slow[i] !== null && fast[i] > slow[i] ? 1 : 0;
    }
  }

  if (strategy === "rsi") {
    const values = rsi(closes, params.period);
    indicators.rsi = values;
    let position = 0;
    for (let i = 1; i < rows.length; i += 1) {
      if (values[i] !== null && values[i] < params.buyBelow) position = 1;
      if (values[i] !== null && values[i] > params.sellAbove) position = 0;
      target[i] = position;
    }
  }

  if (strategy === "breakout") {
    const highs = rollingHigh(rows, params.lookback);
    const lows = rollingLow(rows, params.exit);
    indicators.highs = highs;
    indicators.lows = lows;
    let position = 0;
    for (let i = 1; i < rows.length; i += 1) {
      if (highs[i] !== null && rows[i].close > highs[i]) position = 1;
      if (lows[i] !== null && rows[i].close < lows[i]) position = 0;
      target[i] = position;
    }
  }

  if (!longOnly) {
    for (let i = 0; i < target.length; i += 1) {
      target[i] = target[i] === 1 ? 1 : -1;
    }
  }

  return { target, indicators };
}

function runBacktest(rows, options) {
  const capital = options?.capital ?? Math.max(Number(els.capitalInput.value) || 10000, 100);
  const feeRate = options?.feeRate ?? (els.feesInput.checked ? 0.001 : 0);
  const { target, indicators } = buildSignalSeries(rows, options);
  const equity = [capital];
  const drawdown = [0];
  const dailyReturns = [];
  const trades = [];
  let position = target[0] || 0;
  let peak = capital;
  let tradeEntry = null;

  for (let i = 1; i < rows.length; i += 1) {
    const desired = target[i - 1] || 0;
    let currentEquity = equity[i - 1];
    if (desired !== position) {
      currentEquity *= 1 - feeRate;
      const action = desired > position ? "BUY" : "SELL";
      trades.push({ date: rows[i].date, action, price: rows[i].open || rows[i].close });
      tradeEntry = action === "BUY" ? rows[i].open || rows[i].close : null;
      position = desired;
    }
    const marketReturn = rows[i - 1].close === 0 ? 0 : rows[i].close / rows[i - 1].close - 1;
    const dayReturn = marketReturn * position;
    currentEquity *= 1 + dayReturn;
    equity.push(currentEquity);
    dailyReturns.push(dayReturn);
    peak = Math.max(peak, currentEquity);
    drawdown.push(currentEquity / peak - 1);
  }

  const totalReturn = equity.at(-1) / capital - 1;
  const years = Math.max(rows.length / 252, 0.01);
  const cagr = (equity.at(-1) / capital) ** (1 / years) - 1;
  const maxDrawdown = Math.min(...drawdown);
  const avg = dailyReturns.reduce((sum, value) => sum + value, 0) / Math.max(dailyReturns.length, 1);
  const variance = dailyReturns.reduce((sum, value) => sum + (value - avg) ** 2, 0) / Math.max(dailyReturns.length - 1, 1);
  const sharpe = variance === 0 ? 0 : (avg / Math.sqrt(variance)) * Math.sqrt(252);

  return {
    rows,
    target,
    indicators,
    equity,
    drawdown,
    trades,
    metrics: { totalReturn, cagr, maxDrawdown, sharpe, trades: trades.length },
  };
}

/* ── Optimiser defaults ── */
const optimiserDefaults = {
  rsi: { period: { min: 5, max: 30, step: 1 }, buyBelow: { min: 10, max: 40, step: 5 }, sellAbove: { min: 50, max: 90, step: 5 } },
  sma: { fast: { min: 5, max: 50, step: 5 }, slow: { min: 20, max: 200, step: 5 } },
  breakout: { lookback: { min: 10, max: 100, step: 5 }, exit: { min: 5, max: 50, step: 5 } },
};

const MAX_COMBINATIONS = 50000;
const CHUNK_SIZE = 200;

function countCombinations(ranges) {
  return Object.values(ranges).reduce((total, r) => total * (Math.floor((r.max - r.min) / r.step) + 1), 1);
}

function generateParamGrid(strategy, ranges) {
  const keys = Object.keys(ranges);
  const axes = keys.map((k) => {
    const r = ranges[k];
    const values = [];
    for (let v = r.min; v <= r.max; v += r.step) values.push(v);
    return values;
  });

  const grid = [];
  const recurse = (depth, combo) => {
    if (depth === keys.length) {
      if (strategy === "rsi" && combo.buyBelow >= combo.sellAbove) return;
      grid.push({ ...combo });
      return;
    }
    for (const value of axes[depth]) {
      combo[keys[depth]] = value;
      recurse(depth + 1, combo);
    }
  };
  recurse(0, {});
  return grid;
}

function calcWinRate(trades) {
  let wins = 0;
  let closed = 0;
  for (let i = 0; i < trades.length - 1; i += 1) {
    if (trades[i].action === "BUY" && trades[i + 1].action === "SELL") {
      closed += 1;
      if (trades[i + 1].price > trades[i].price) wins += 1;
    }
  }
  return closed === 0 ? 0 : wins / closed;
}

function runOptimisation(rows, strategy, ranges, baseOptions, onProgress, cancelled) {
  const grid = generateParamGrid(strategy, ranges);
  const total = grid.length;
  const results = [];
  let idx = 0;

  return new Promise((resolve) => {
    const start = performance.now();
    function processChunk() {
      if (cancelled.value) { resolve(null); return; }
      const end = Math.min(idx + CHUNK_SIZE, total);
      for (; idx < end; idx += 1) {
        const params = grid[idx];
        const bt = runBacktest(rows, { ...baseOptions, strategy, params });
        const winRate = calcWinRate(bt.trades);
        results.push({ params, metrics: { ...bt.metrics, winRate } });
      }
      if (onProgress) onProgress(idx, total);
      if (idx < total) {
        setTimeout(processChunk, 0);
      } else {
        results.sort((a, b) => b.metrics.cagr - a.metrics.cagr);
        resolve({ results: results.slice(0, 20), totalCombinations: total, elapsed: performance.now() - start });
      }
    }
    processChunk();
  });
}

function renderParamInputs() {
  const params = strategyParams[els.strategySelect.value];
  const savedParams = state.strategyParams[els.strategySelect.value] || {};
  els.strategyParams.innerHTML = params
    .map((param) => `
      <label>
        ${param.label}
        <input name="${param.key}" type="number" min="${param.min}" max="${param.max}" step="1" value="${savedParams[param.key] ?? param.value}">
      </label>
    `)
    .join("");
  els.strategyParams.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      getParams();
      saveSettings();
    });
  });
}

function updateSavedParamsButtons() {
  const symbol = state.activeSymbol;
  const strategy = els.strategySelect.value;
  const saved = state.savedSymbolParams[symbol]?.[strategy];
  els.loadParamsBtn.disabled = !saved;
  if (saved) {
    const paramDefs = strategyParams[strategy] || [];
    const summary = paramDefs.map((p) => `${p.label}: ${saved[p.key]}`).join(", ");
    els.savedParamsHint.textContent = `Saved: ${summary}`;
  } else {
    els.savedParamsHint.textContent = "";
  }
}

function saveSymbolParams() {
  const symbol = state.activeSymbol;
  const strategy = els.strategySelect.value;
  const params = getParams();
  if (!state.savedSymbolParams[symbol]) state.savedSymbolParams[symbol] = {};
  state.savedSymbolParams[symbol][strategy] = { ...params };
  saveSettings();
  updateSavedParamsButtons();
  setStatus(`Saved ${strategy.toUpperCase()} parameters for ${symbol}`);
}

function loadSymbolParams() {
  const symbol = state.activeSymbol;
  const strategy = els.strategySelect.value;
  const saved = state.savedSymbolParams[symbol]?.[strategy];
  if (!saved) return;
  state.strategyParams[strategy] = { ...saved };
  renderParamInputs();
  updateSavedParamsButtons();
  saveSettings();
  selectSymbol(state.activeSymbol);
  setStatus(`Loaded saved ${strategy.toUpperCase()} parameters for ${symbol}`);
}

function autoLoadSymbolParams() {
  const symbol = state.activeSymbol;
  const strategy = els.strategySelect.value;
  const saved = state.savedSymbolParams[symbol]?.[strategy];
  if (!saved) return false;
  state.strategyParams[strategy] = { ...saved };
  renderParamInputs();
  return true;
}

function renderWatchlist() {
  els.watchlist.innerHTML = "";
  state.watchlist.forEach((symbol) => {
    const latest = latestBarFor(symbol);
    const row = document.createElement("div");
    row.className = `watch-row${symbol === state.activeSymbol ? " active" : ""}`;
    row.innerHTML = `
      <button class="watch-symbol" type="button">${symbol}</button>
      <span class="watch-price">${latest ? money(latest.close, currencyForSymbol(symbol)) : "--"}</span>
      <button class="remove-button" type="button" title="Remove ${symbol}" aria-label="Remove ${symbol}">×</button>
    `;
    row.querySelector(".watch-symbol").addEventListener("click", () => selectSymbol(symbol));
    row.querySelector(".remove-button").addEventListener("click", () => removeSymbol(symbol));
    els.watchlist.appendChild(row);
  });
}

function latestBarFor(symbol) {
  const prefix = `${symbol}-`;
  const entry = [...state.cache.entries()].find(([key]) => key.startsWith(prefix));
  return entry ? entry[1].at(-1) : null;
}

function renderMetrics(metrics) {
  setMetric(els.metrics.totalReturn, percent(metrics.totalReturn), metrics.totalReturn);
  setMetric(els.metrics.cagr, percent(metrics.cagr), metrics.cagr);
  setMetric(els.metrics.drawdown, percent(metrics.maxDrawdown), metrics.maxDrawdown);
  els.metrics.sharpe.textContent = metrics.sharpe.toFixed(2);
  els.metrics.trades.textContent = metrics.trades;
}

function renderBuyHoldComparison() {
  if (!state.showBuyHoldComparison || !state.backtest?.rows.length) {
    els.buyHoldComparison.hidden = true;
    return;
  }

  const capital = Math.max(Number(els.capitalInput.value) || 10000, 100);
  const feeRate = els.feesInput.checked ? 0.001 : 0;
  const reference = runBacktest(state.backtest.rows, {
    strategy: "buyhold",
    params: {},
    capital,
    feeRate,
    longOnly: true,
  });
  const active = state.backtest.metrics;
  const buyHold = reference.metrics;
  const activeLabel = els.strategySelect.selectedOptions[0]?.textContent || "Strategy";
  const cagrDelta = active.cagr - buyHold.cagr;

  setMetric(
    els.buyHoldComparisonDelta,
    cagrDelta === 0 ? "Same CAGR" : `Strategy ${cagrDelta > 0 ? "+" : ""}${(cagrDelta * 100).toFixed(2)} pp CAGR`,
    cagrDelta,
  );

  const rows = [
    { label: "Total return", activeValue: percent(active.totalReturn), referenceValue: percent(buyHold.totalReturn), delta: formatComparisonDelta(active.totalReturn - buyHold.totalReturn, "pp"), tone: true },
    { label: "CAGR", activeValue: percent(active.cagr), referenceValue: percent(buyHold.cagr), delta: formatComparisonDelta(cagrDelta, "pp"), tone: true },
    { label: "Max drawdown", activeValue: percent(active.maxDrawdown), referenceValue: percent(buyHold.maxDrawdown), delta: formatComparisonDelta(active.maxDrawdown - buyHold.maxDrawdown, "pp"), tone: true },
    { label: "Sharpe", activeValue: active.sharpe.toFixed(2), referenceValue: buyHold.sharpe.toFixed(2), delta: formatComparisonDelta(active.sharpe - buyHold.sharpe, ""), tone: true },
    { label: "Trades", activeValue: String(active.trades), referenceValue: String(buyHold.trades), delta: formatComparisonDelta(active.trades - buyHold.trades, ""), tone: false },
  ];

  els.buyHoldComparisonBody.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr><th>Metric</th><th>${activeLabel}</th><th>Buy and hold</th><th>Difference</th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <th>${row.label}</th>
            <td>${row.activeValue}</td>
            <td>${row.referenceValue}</td>
            <td class="${row.tone && row.delta.value > 0 ? "positive" : row.tone && row.delta.value < 0 ? "negative" : ""}">${row.delta.text}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
  els.buyHoldComparison.hidden = false;
}

function formatComparisonDelta(value, suffix) {
  if (value === 0) return { text: suffix ? `0.00 ${suffix}` : "0.00", value };
  const sign = value > 0 ? "+" : "";
  const scaled = suffix === "pp" ? value * 100 : value;
  return { text: `${sign}${scaled.toFixed(2)}${suffix ? ` ${suffix}` : ""}`, value };
}

function setMetric(element, text, value) {
  element.textContent = text;
  element.classList.toggle("positive", value > 0);
  element.classList.toggle("negative", value < 0);
}

function renderSignals(trades) {
  els.signalCount.textContent = trades.length;
  if (!trades.length) {
    els.signalList.innerHTML = `<p class="source-note">No trade signals were generated for this range.</p>`;
    return;
  }
  els.signalList.innerHTML = trades
    .slice()
    .reverse()
    .map((trade) => `
      <div class="signal-item">
        <span>${trade.date}</span>
        <span>${money(trade.price, currencyForSymbol(state.activeSymbol))}</span>
        <span class="signal-action ${trade.action.toLowerCase()}">${trade.action}</span>
      </div>
    `)
    .join("");
}

function syncZoomBounds(rows, dataKey) {
  if (!rows.length) return;
  const firstDate = rows[0].date;
  const lastDate = rows.at(-1).date;
  const shouldReset = state.zoomDataKey !== dataKey || !state.zoomStart || !state.zoomEnd;

  els.zoomStartInput.min = firstDate;
  els.zoomStartInput.max = lastDate;
  els.zoomEndInput.min = firstDate;
  els.zoomEndInput.max = lastDate;

  if (shouldReset) {
    state.zoomStart = firstDate;
    state.zoomEnd = lastDate;
    state.zoomDataKey = dataKey;
  } else {
    state.zoomStart = clampDate(state.zoomStart, firstDate, lastDate);
    state.zoomEnd = clampDate(state.zoomEnd, firstDate, lastDate);
    if (state.zoomStart > state.zoomEnd) {
      state.zoomStart = firstDate;
      state.zoomEnd = lastDate;
    }
  }

  els.zoomStartInput.value = state.zoomStart;
  els.zoomEndInput.value = state.zoomEnd;
}

function clampDate(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function setZoom(start, end) {
  if (!state.backtest?.rows.length) return;
  const rows = state.backtest.rows;
  const firstDate = rows[0].date;
  const lastDate = rows.at(-1).date;
  state.zoomStart = clampDate(start, firstDate, lastDate);
  state.zoomEnd = clampDate(end, firstDate, lastDate);
  if (state.zoomStart > state.zoomEnd) {
    [state.zoomStart, state.zoomEnd] = [state.zoomEnd, state.zoomStart];
  }
  els.zoomStartInput.value = state.zoomStart;
  els.zoomEndInput.value = state.zoomEnd;
  saveSettings();
  renderChart();
  renderVolumeChart();
}

function setZoomWindow(days) {
  if (!state.backtest?.rows.length) return;
  const rows = state.backtest.rows;
  const clampedEndIndex = rows.length - 1;
  const startIndex = Math.max(clampedEndIndex - days + 1, 0);
  setZoom(rows[startIndex].date, rows[clampedEndIndex].date);
}

function getVisibleWindow() {
  const rows = state.backtest?.rows || [];
  if (!rows.length) return { rows: [], indexes: [], startIndex: 0, endIndex: -1 };
  const start = state.zoomStart || rows[0].date;
  const end = state.zoomEnd || rows.at(-1).date;
  const indexes = [];
  rows.forEach((row, index) => {
    if (row.date >= start && row.date <= end) indexes.push(index);
  });
  if (!indexes.length) return { rows: [], indexes: [], startIndex: 0, endIndex: -1 };
  return {
    rows: indexes.map((index) => rows[index]),
    indexes,
    startIndex: indexes[0],
    endIndex: indexes.at(-1),
  };
}

function renderChart() {
  const canvas = els.mainChart;
  const ctx = canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * pixelRatio);
  canvas.height = Math.round(330 * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, rect.width, 330);

  if (!state.backtest) return;
  const visible = getVisibleWindow();
  const rows = visible.rows;
  if (!rows.length) return;
  const mode = state.chartMode;
  const fullSeries =
    mode === "equity"
      ? state.backtest.equity
      : mode === "drawdown"
        ? state.backtest.drawdown.map((value) => value * 100)
        : state.backtest.rows.map((row) => row.close);
  const series =
    visible.indexes.map((index) => fullSeries[index]);

  const pad = { top: 18, right: 56, bottom: 34, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 330 - pad.top - pad.bottom;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const x = (index) => pad.left + (index / Math.max(series.length - 1, 1)) * width;
  const y = (value) => pad.top + (1 - (value - min) / span) * height;

  drawGrid(ctx, pad, rect.width, 330, min, max);
  drawLine(ctx, series, x, y, mode === "drawdown" ? "#b9443f" : "#2364aa", 2);

  if (mode === "price" && state.backtest.indicators.fast) {
    drawLine(ctx, visible.indexes.map((index) => state.backtest.indicators.fast[index]), x, y, "#0f7a5a", 1.5);
    drawLine(ctx, visible.indexes.map((index) => state.backtest.indicators.slow[index]), x, y, "#b7791f", 1.5);
  }

  state.backtest.trades.forEach((trade) => {
    const fullIndex = state.backtest.rows.findIndex((row) => row.date === trade.date);
    const index = visible.indexes.indexOf(fullIndex);
    if (index < 0) return;
    ctx.fillStyle = trade.action === "BUY" ? "#0f7a5a" : "#b9443f";
    ctx.beginPath();
    ctx.arc(x(index), y(mode === "equity" ? state.backtest.equity[fullIndex] : mode === "drawdown" ? state.backtest.drawdown[fullIndex] * 100 : state.backtest.rows[fullIndex].close), 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(rows[0]?.date || "", pad.left, 318);
  ctx.textAlign = "right";
  ctx.fillText(rows.at(-1)?.date || "", rect.width - pad.right, 318);
  ctx.textAlign = "left";
}

function renderVolumeChart() {
  const canvas = els.volumeChart;
  const ctx = canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * pixelRatio);
  canvas.height = Math.round(170 * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, rect.width, 170);

  if (!state.backtest) return;
  const visible = getVisibleWindow();
  const rows = visible.rows;
  if (!rows.length) return;
  const volumes = buildVolumeBuckets(rows, state.volumeInterval);
  const integratedVolumes = buildIntegratedVolumes(volumes);
  const maxVolume =
    state.volumeMode === "integrated"
      ? Math.max(...integratedVolumes.map((item) => Math.abs(item.net)), 1)
      : state.volumeMode === "net"
      ? Math.max(...volumes.map((item) => Math.abs(item.net)), 1)
      : Math.max(...volumes.flatMap((item) => [item.buy, item.sell]), 1);
  const pad = { top: 14, right: 58, bottom: 26, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 170 - pad.top - pad.bottom;
  const barGap = volumes.length > 120 ? 1 : 2;
  const barWidth = Math.max(width / Math.max(volumes.length, 1) - barGap, 1);
  const zeroY = pad.top + height / 2;
  const halfHeight = height / 2;

  drawVolumeGrid(ctx, pad, rect.width, 170, maxVolume);

  if (state.volumeMode === "integrated") {
    drawIntegratedVolume(ctx, integratedVolumes, pad, width, zeroY, halfHeight, maxVolume);
  } else {
    volumes.forEach((volume, index) => {
      const x = pad.left + (index / Math.max(volumes.length, 1)) * width;
      if (state.volumeMode === "net") {
        const netHeight = (Math.abs(volume.net) / maxVolume) * halfHeight;
        ctx.fillStyle = volume.net >= 0 ? "#0f7a5a" : "#b9443f";
        ctx.fillRect(x, volume.net >= 0 ? zeroY - netHeight : zeroY, barWidth, netHeight);
      } else {
        const buyHeight = (volume.buy / maxVolume) * halfHeight;
        const sellHeight = (volume.sell / maxVolume) * halfHeight;
        ctx.fillStyle = "#0f7a5a";
        ctx.fillRect(x, zeroY - buyHeight, barWidth, buyHeight);
        ctx.fillStyle = "#b9443f";
        ctx.fillRect(x, zeroY, barWidth, sellHeight);
      }
    });
  }

  ctx.strokeStyle = "#7d8b8f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(rect.width - pad.right, zeroY);
  ctx.stroke();

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(volumes[0]?.startDate || rows[0]?.date || "", pad.left, 160);
  ctx.textAlign = "right";
  ctx.fillText(volumes.at(-1)?.endDate || rows.at(-1)?.date || "", rect.width - pad.right, 160);
  ctx.textAlign = "left";
  updateVolumeSummary(volumes, integratedVolumes);
}

function splitVolume(row) {
  const total = Math.max(Number(row.volume) || 0, 0);
  const range = row.high - row.low;
  const buyRatio = range > 0 ? (row.close - row.low) / range : row.close >= row.open ? 0.65 : 0.35;
  const buy = total * Math.min(Math.max(buyRatio, 0), 1);
  return { buy, sell: total - buy, total };
}

function buildVolumeBuckets(rows, interval) {
  const size = Math.max(Number(interval) || 1, 1);
  const buckets = [];
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    const totals = slice.reduce(
      (sum, row) => {
        const volume = splitVolume(row);
        sum.buy += volume.buy;
        sum.sell += volume.sell;
        sum.total += volume.total;
        sum.net += volume.buy - volume.sell;
        return sum;
      },
      { buy: 0, sell: 0, total: 0, net: 0 }
    );
    buckets.push({
      ...totals,
      startDate: slice[0].date,
      endDate: slice.at(-1).date,
    });
  }
  return buckets;
}

function buildIntegratedVolumes(volumes) {
  let net = 0;
  return volumes.map((volume) => {
    net += volume.net;
    return {
      ...volume,
      net,
    };
  });
}

function updateVolumeSummary(volumes, integratedVolumes) {
  const buy = volumes.reduce((sum, item) => sum + item.buy, 0);
  const sell = volumes.reduce((sum, item) => sum + item.sell, 0);
  const net = buy - sell;
  const label = state.volumeInterval === 1 ? "daily" : `${state.volumeInterval}-day`;
  if (state.volumeMode === "integrated") {
    const last = integratedVolumes.at(-1) || { net: 0 };
    els.volumeSummary.textContent = `integrated ${label} net volume change: ${formatSignedVolume(last.net)}`;
    return;
  }
  if (state.volumeMode === "net") {
    els.volumeSummary.textContent = `${label} net volume change: ${formatSignedVolume(net)}`;
    return;
  }
  els.volumeSummary.textContent = `${label} integrated volume: ${formatVolume(buy)} buying / ${formatVolume(sell)} selling`;
}

function drawIntegratedVolume(ctx, volumes, pad, width, zeroY, halfHeight, maxVolume) {
  const x = (index) => pad.left + (index / Math.max(volumes.length - 1, 1)) * width;
  const netY = (volume) => zeroY - (volume.net / maxVolume) * halfHeight;

  drawVolumePath(ctx, volumes, x, netY, "#2364aa");
  volumes.forEach((volume, index) => {
    ctx.fillStyle = volume.net >= 0 ? "#0f7a5a" : "#b9443f";
    ctx.beginPath();
    ctx.arc(x(index), netY(volume), 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawVolumePath(ctx, volumes, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  volumes.forEach((volume, index) => {
    const pointX = x(index);
    const pointY = y(volume);
    if (index === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
  });
  ctx.stroke();
}

function drawVolumeGrid(ctx, pad, fullWidth, fullHeight, maxVolume) {
  ctx.strokeStyle = "#e4e9e5";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  const plotHeight = fullHeight - pad.top - pad.bottom;
  const zeroY = pad.top + plotHeight / 2;
  const levels = [
    { y: pad.top, label: formatVolume(maxVolume) },
    { y: zeroY, label: "0" },
    { y: pad.top + plotHeight, label: `-${formatVolume(maxVolume)}` },
  ];

  levels.forEach((level) => {
    ctx.beginPath();
    ctx.moveTo(pad.left, level.y);
    ctx.lineTo(fullWidth - pad.right, level.y);
    ctx.stroke();
    ctx.fillText(level.label, fullWidth - pad.right + 8, level.y + 4);
  });
}

function drawGrid(ctx, pad, fullWidth, fullHeight, min, max) {
  ctx.strokeStyle = "#e4e9e5";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + ((fullHeight - pad.top - pad.bottom) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(fullWidth - pad.right, y);
    ctx.stroke();
    const value = max - ((max - min) * i) / 4;
    ctx.fillText(Number.isFinite(value) ? value.toFixed(2) : "", fullWidth - pad.right + 8, y + 4);
  }
}

function drawLine(ctx, values, x, y, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  let started = false;
  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) return;
    if (!started) {
      ctx.moveTo(x(index), y(value));
      started = true;
    } else {
      ctx.lineTo(x(index), y(value));
    }
  });
  ctx.stroke();
}

function percent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function currencyForSymbol(symbol) {
  return state.metaCache.get(symbol)?.currency || inferCurrency(symbol);
}

function inferCurrency(symbol) {
  const normalized = sourceSymbol(symbol);
  if (normalized.endsWith(".L")) return "GBX";
  return "USD";
}

function normalizeCurrency(currency) {
  if (!currency) return "";
  if (currency.toUpperCase() === "GBP" || currency === "GBp") return "GBX";
  return currency.toUpperCase();
}

function money(value, currency = "USD") {
  if (currency === "GBX") return `${formatNumber(value)} GBX`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency || ""}`.trim();
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function formatVolume(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function formatSignedVolume(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatVolume(Math.abs(value))}`;
}

function setStatus(text) {
  els.dataStatus.textContent = text;
}

function settingsUrl() {
  return `${location.protocol.startsWith("http") ? "" : "http://localhost:4173"}/api/settings`;
}

async function loadSettings() {
  let settings = null;
  try {
    const response = await fetch(settingsUrl(), { cache: "no-store" });
    if (response.ok) settings = await response.json();
  } catch {
    settings = null;
  }

  if (!settings) {
    settings = {};
  }

  const browserWatchlist = JSON.parse(localStorage.getItem("watchlist") || "null");
  const browserActiveSymbol = localStorage.getItem("activeSymbol");
  if (Array.isArray(browserWatchlist) && browserWatchlist.length) {
    settings.watchlist = [...new Set([...(settings.watchlist || []), ...browserWatchlist])];
  }
  if (!settings.activeSymbol && browserActiveSymbol) settings.activeSymbol = browserActiveSymbol;

  applySettings(settings);
  state.settingsLoaded = true;
  saveSettings();
}

function applySettings(settings) {
  state.watchlist = Array.isArray(settings.watchlist) && settings.watchlist.length ? settings.watchlist : state.watchlist;
  state.activeSymbol = settings.activeSymbol || state.watchlist[0] || "AAPL";
  state.chartMode = settings.chartMode || state.chartMode;
  state.volumeInterval = Number(settings.volumeInterval) || state.volumeInterval;
  state.volumeMode = settings.volumeMode || state.volumeMode;
  state.showBuyHoldComparison = Boolean(settings.showBuyHoldComparison);
  state.strategyParams = settings.strategyParams && typeof settings.strategyParams === "object" ? settings.strategyParams : {};
  state.savedSymbolParams = settings.savedSymbolParams && typeof settings.savedSymbolParams === "object" ? settings.savedSymbolParams : {};
  state.zoomStart = settings.zoomStart || "";
  state.zoomEnd = settings.zoomEnd || "";

  els.rangeSelect.value = settings.rangeYears || els.rangeSelect.value;
  els.capitalInput.value = settings.startingCapital || els.capitalInput.value;
  els.strategySelect.value = settings.strategy || els.strategySelect.value;
  els.longOnlyInput.checked = settings.longOnly ?? els.longOnlyInput.checked;
  els.feesInput.checked = settings.includeFees ?? els.feesInput.checked;
  els.buyHoldComparisonInput.checked = state.showBuyHoldComparison;
  els.volumeIntervalSelect.value = String(state.volumeInterval);
  els.volumeModeSelect.value = state.volumeMode;
  state.zoomDataKey = `${state.activeSymbol}-${els.rangeSelect.value}`;

  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.chartMode === state.chartMode);
  });
}

function collectSettings() {
  getParams();
  return {
    watchlist: state.watchlist,
    activeSymbol: state.activeSymbol,
    rangeYears: els.rangeSelect.value,
    startingCapital: Number(els.capitalInput.value) || 10000,
    strategy: els.strategySelect.value,
    strategyParams: state.strategyParams,
    savedSymbolParams: state.savedSymbolParams,
    longOnly: els.longOnlyInput.checked,
    includeFees: els.feesInput.checked,
    showBuyHoldComparison: state.showBuyHoldComparison,
    chartMode: state.chartMode,
    volumeInterval: state.volumeInterval,
    volumeMode: state.volumeMode,
    zoomStart: state.zoomStart,
    zoomEnd: state.zoomEnd,
  };
}

function saveSettings() {
  if (!state.settingsLoaded) return;
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(async () => {
    const settings = collectSettings();
    localStorage.setItem("watchlist", JSON.stringify(settings.watchlist));
    localStorage.setItem("activeSymbol", settings.activeSymbol);
    try {
      await fetch(settingsUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch {
      setStatus("Settings saved in browser only; server settings file unavailable");
    }
  }, 250);
}

async function selectSymbol(symbol, force = false) {
  const dataKey = `${symbol}-${els.rangeSelect.value}`;
  state.activeSymbol = symbol;
  els.activeSymbol.textContent = symbol;
  renderWatchlist();
  autoLoadSymbolParams();
  updateSavedParamsButtons();
  state.data = await fetchMarketData(symbol, els.rangeSelect.value, force);
  state.backtest = runBacktest(state.data);
  syncZoomBounds(state.backtest.rows, dataKey);
  renderMetrics(state.backtest.metrics);
  renderBuyHoldComparison();
  renderSignals(state.backtest.trades);
  renderWatchlist();
  renderChart();
  renderVolumeChart();
  saveSettings();
}

async function refreshAllSymbols() {
  setStatus("Refreshing watchlist...");
  for (const symbol of state.watchlist) {
    await fetchMarketData(symbol, els.rangeSelect.value, true);
  }
  await selectSymbol(state.activeSymbol);
}

function removeSymbol(symbol) {
  state.watchlist = state.watchlist.filter((item) => item !== symbol);
  if (!state.watchlist.length) state.watchlist = ["AAPL"];
  if (state.activeSymbol === symbol) state.activeSymbol = state.watchlist[0];
  saveWatchlist();
  selectSymbol(state.activeSymbol);
}

function saveWatchlist() {
  saveSettings();
}

function exportBacktest() {
  if (!state.backtest) return;
  const currency = currencyForSymbol(state.activeSymbol);
  const lines = [`symbol,${state.activeSymbol}`, `currency,${currency}`, "date,close,position,equity,drawdown"];
  state.backtest.rows.forEach((row, index) => {
    lines.push([row.date, row.close, state.backtest.target[index] ?? 0, state.backtest.equity[index] ?? "", state.backtest.drawdown[index] ?? ""].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.activeSymbol}-${els.strategySelect.value}-backtest.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

els.symbolForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const symbol = normalizeSymbol(els.symbolInput.value);
  if (!symbol) return;
  if (!state.watchlist.includes(symbol)) state.watchlist.push(symbol);
  els.symbolInput.value = "";
  saveWatchlist();
  selectSymbol(symbol);
});

els.rangeSelect.addEventListener("change", () => selectSymbol(state.activeSymbol));
els.capitalInput.addEventListener("change", saveSettings);
els.longOnlyInput.addEventListener("change", () => {
  saveSettings();
  selectSymbol(state.activeSymbol);
});
els.feesInput.addEventListener("change", () => {
  saveSettings();
  selectSymbol(state.activeSymbol);
});
els.buyHoldComparisonInput.addEventListener("change", () => {
  state.showBuyHoldComparison = els.buyHoldComparisonInput.checked;
  renderBuyHoldComparison();
  saveSettings();
});
els.runBtn.addEventListener("click", () => {
  saveSettings();
  selectSymbol(state.activeSymbol);
});
els.strategySelect.addEventListener("change", () => {
  renderParamInputs();
  renderOptimiserRanges();
  hideOptimiserResults();
  els.optimiseBtn.disabled = els.strategySelect.value === "buyhold";
  updateSavedParamsButtons();
  saveSettings();
  selectSymbol(state.activeSymbol);
});
els.saveParamsBtn.addEventListener("click", saveSymbolParams);
els.loadParamsBtn.addEventListener("click", loadSymbolParams);
els.refreshAllBtn.addEventListener("click", refreshAllSymbols);
els.exportBtn.addEventListener("click", exportBacktest);
els.zoomStartInput.addEventListener("change", () => setZoom(els.zoomStartInput.value, els.zoomEndInput.value));
els.zoomEndInput.addEventListener("change", () => setZoom(els.zoomStartInput.value, els.zoomEndInput.value));
els.zoomResetBtn.addEventListener("click", () => {
  if (!state.backtest?.rows.length) return;
  const rows = state.backtest.rows;
  setZoom(rows[0].date, rows.at(-1).date);
});
els.volumeIntervalSelect.addEventListener("change", () => {
  state.volumeInterval = Number(els.volumeIntervalSelect.value);
  saveSettings();
  renderVolumeChart();
});
els.volumeModeSelect.addEventListener("change", () => {
  state.volumeMode = els.volumeModeSelect.value;
  saveSettings();
  renderVolumeChart();
});
window.addEventListener("resize", renderChart);
window.addEventListener("resize", renderVolumeChart);

document.querySelectorAll("[data-zoom-window]").forEach((button) => {
  button.addEventListener("click", () => setZoomWindow(Number(button.dataset.zoomWindow)));
});

document.querySelectorAll("[data-chart-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-chart-mode]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.chartMode = button.dataset.chartMode;
    saveSettings();
    els.chartSubtitle.textContent =
      state.chartMode === "price"
        ? "Close price with strategy signal markers"
        : state.chartMode === "equity"
          ? "Portfolio value after strategy rules and fees"
          : "Peak-to-trough drawdown in percent";
    renderChart();
  });
});

/* ── Optimiser UI ── */
let optimiserCancelled = { value: false };

function renderOptimiserRanges() {
  const strategy = els.strategySelect.value;
  const defs = optimiserDefaults[strategy];
  if (!defs) { els.optimiserRanges.innerHTML = ""; return; }
  els.optimiserRanges.innerHTML = Object.entries(defs).map(([key, r]) => {
    const label = (strategyParams[strategy] || []).find((p) => p.key === key)?.label || key;
    return `
      <div class="range-row">
        <span class="range-label">${label}</span>
        <label>Min <input name="${key}-min" type="number" value="${r.min}" step="1"></label>
        <label>Max <input name="${key}-max" type="number" value="${r.max}" step="1"></label>
        <label>Step <input name="${key}-step" type="number" value="${r.step}" min="1" step="1"></label>
      </div>`;
  }).join("");
}

function readOptimiserRanges() {
  const strategy = els.strategySelect.value;
  const defs = optimiserDefaults[strategy];
  if (!defs) return null;
  const ranges = {};
  for (const key of Object.keys(defs)) {
    const min = Number(els.optimiserRanges.querySelector(`[name="${key}-min"]`).value);
    const max = Number(els.optimiserRanges.querySelector(`[name="${key}-max"]`).value);
    const step = Number(els.optimiserRanges.querySelector(`[name="${key}-step"]`).value);
    if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step)) return null;
    if (step < 1 || min > max) return null;
    ranges[key] = { min, max, step };
  }
  return ranges;
}

function hideOptimiserResults() {
  els.optimiserResults.hidden = true;
  els.optimiserProgress.hidden = true;
}

function renderOptimiserResults(result) {
  const strategy = els.strategySelect.value;
  const paramDefs = strategyParams[strategy] || [];
  const best = result.results[0];

  // best summary
  const bestLines = paramDefs.map((p) => `<span><strong>${p.label}:</strong> ${best.params[p.key]}</span>`).join(" &middot; ");
  els.optimiserBest.innerHTML = `
    <div class="optimiser-best-params">${bestLines}</div>
    <div class="optimiser-best-metrics">
      <span>CAGR <strong class="${best.metrics.cagr >= 0 ? "positive" : "negative"}">${percent(best.metrics.cagr)}</strong></span>
      <span>Return <strong>${percent(best.metrics.totalReturn)}</strong></span>
      <span>Drawdown <strong class="negative">${percent(best.metrics.maxDrawdown)}</strong></span>
      <span>Sharpe <strong>${best.metrics.sharpe.toFixed(2)}</strong></span>
      <span>Trades <strong>${best.metrics.trades}</strong></span>
      <span>Win rate <strong>${percent(best.metrics.winRate)}</strong></span>
    </div>`;

  // table
  const headerCols = paramDefs.map((p) => `<th>${p.label}</th>`).join("");
  const rows = result.results.map((r, i) => {
    const paramCols = paramDefs.map((p) => `<td>${r.params[p.key]}</td>`).join("");
    return `<tr><td>${i + 1}</td>${paramCols}<td class="${r.metrics.cagr >= 0 ? "positive" : "negative"}">${percent(r.metrics.cagr)}</td><td>${percent(r.metrics.totalReturn)}</td><td class="negative">${percent(r.metrics.maxDrawdown)}</td><td>${r.metrics.sharpe.toFixed(2)}</td><td>${r.metrics.trades}</td><td>${percent(r.metrics.winRate)}</td></tr>`;
  }).join("");
  els.optimiserResultsBody.innerHTML = `<table class="optimiser-table"><thead><tr><th>#</th>${headerCols}<th>CAGR</th><th>Return</th><th>Drawdown</th><th>Sharpe</th><th>Trades</th><th>Win rate</th></tr></thead><tbody>${rows}</tbody></table>`;

  els.optimiserFooter.textContent = `${result.totalCombinations.toLocaleString()} combinations tested in ${(result.elapsed / 1000).toFixed(1)}s`;
  els.optimiserResults.hidden = false;
}

async function startOptimisation() {
  const strategy = els.strategySelect.value;
  if (strategy === "buyhold") { setStatus("Buy and hold has no tuneable parameters."); return; }

  const ranges = readOptimiserRanges();
  if (!ranges) { setStatus("Invalid parameter ranges."); return; }

  const combos = countCombinations(ranges);
  if (combos > MAX_COMBINATIONS) {
    setStatus(`Too many combinations (${combos.toLocaleString()}). Reduce ranges or increase step size. Max: ${MAX_COMBINATIONS.toLocaleString()}.`);
    return;
  }
  if (combos === 0) { setStatus("No parameter combinations to test."); return; }

  const baseOptions = {
    capital: Math.max(Number(els.capitalInput.value) || 10000, 100),
    feeRate: els.feesInput.checked ? 0.001 : 0,
    longOnly: els.longOnlyInput.checked,
  };

  els.optimiseBtn.disabled = true;
  els.runBtn.disabled = true;
  els.optimiserResults.hidden = true;
  els.optimiserProgress.hidden = false;
  els.optimiserProgressBar.style.width = "0%";
  els.optimiserProgressText.textContent = `0 / ${combos.toLocaleString()}`;
  optimiserCancelled = { value: false };

  setStatus(`Optimising ${combos.toLocaleString()} combinations...`);
  const data = await fetchMarketData(state.activeSymbol, els.rangeSelect.value);
  if (!data || data.length < 12) {
    setStatus("Not enough data to optimise.");
    els.optimiseBtn.disabled = false;
    els.runBtn.disabled = false;
    els.optimiserProgress.hidden = true;
    return;
  }

  const result = await runOptimisation(data, strategy, ranges, baseOptions, (done, total) => {
    const pct = Math.round((done / total) * 100);
    els.optimiserProgressBar.style.width = `${pct}%`;
    els.optimiserProgressText.textContent = `${done.toLocaleString()} / ${total.toLocaleString()}`;
  }, optimiserCancelled);

  els.optimiserProgress.hidden = true;
  els.optimiseBtn.disabled = false;
  els.runBtn.disabled = false;

  if (!result) { setStatus("Optimisation cancelled."); return; }
  if (!result.results.length) { setStatus("No valid results found."); return; }

  setStatus(`Optimisation complete — best CAGR: ${percent(result.results[0].metrics.cagr)}`);
  state.lastOptimiserResult = result;
  renderOptimiserResults(result);
}

function applyBestParams() {
  const result = state.lastOptimiserResult;
  if (!result?.results.length) return;
  const best = result.results[0].params;
  const strategy = els.strategySelect.value;
  const symbol = state.activeSymbol;
  state.strategyParams[strategy] = { ...best };
  if (!state.savedSymbolParams[symbol]) state.savedSymbolParams[symbol] = {};
  state.savedSymbolParams[symbol][strategy] = { ...best };
  renderParamInputs();
  updateSavedParamsButtons();
  saveSettings();
  selectSymbol(state.activeSymbol);
}

els.optimiseBtn.addEventListener("click", startOptimisation);
els.optimiserCancel.addEventListener("click", () => { optimiserCancelled.value = true; });
els.applyBestBtn.addEventListener("click", applyBestParams);

loadSettings().then(() => {
  renderParamInputs();
  renderOptimiserRanges();
  els.optimiseBtn.disabled = els.strategySelect.value === "buyhold";
  selectSymbol(state.activeSymbol);
});
