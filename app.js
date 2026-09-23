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
  holdings: [],
  editingHolding: null,
  holdingQuotes: new Map(),
  dataMetaCache: new Map(),
  selectionLoading: false,
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
  selectionRequest: 0,
  optimiserBusy: false,
  backtest: null,
  data: [],
};

const els = {
  holdingForm: document.querySelector("#holdingForm"),
  holdingSymbolInput: document.querySelector("#holdingSymbolInput"),
  holdingQuantityInput: document.querySelector("#holdingQuantityInput"),
  holdingAverageInput: document.querySelector("#holdingAverageInput"),
  saveHoldingBtn: document.querySelector("#saveHoldingBtn"),
  cancelHoldingBtn: document.querySelector("#cancelHoldingBtn"),
  refreshHoldingsBtn: document.querySelector("#refreshHoldingsBtn"),
  holdingsBody: document.querySelector("#holdingsBody"),
  holdingsMessage: document.querySelector("#holdingsMessage"),
  holdingAnalysisTitle: document.querySelector("#holdingAnalysisTitle"),
  holdingDecision: document.querySelector("#holdingDecision"),
  holdingReason: document.querySelector("#holdingReason"),
  holdingExit: document.querySelector("#holdingExit"),
  holdingAnalysisDetail: document.querySelector("#holdingAnalysisDetail"),
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
  rsiSection: document.querySelector("#rsiSection"),
  indicatorTitle: document.querySelector("#indicatorTitle"),
  rsiChart: document.querySelector("#rsiChart"),
  rsiSummary: document.querySelector("#rsiSummary"),
  volumeChart: document.querySelector("#volumeChart"),
  zoomStartInput: document.querySelector("#zoomStartInput"),
  zoomEndInput: document.querySelector("#zoomEndInput"),
  zoomResetBtn: document.querySelector("#zoomResetBtn"),
  volumeIntervalSelect: document.querySelector("#volumeIntervalSelect"),
  volumeModeSelect: document.querySelector("#volumeModeSelect"),
  volumeSummary: document.querySelector("#volumeSummary"),
  signalList: document.querySelector("#signalList"),
  signalCount: document.querySelector("#signalCount"),
  nextSignalTrigger: document.querySelector("#nextSignalTrigger"),
  nextSignalAction: document.querySelector("#nextSignalAction"),
  nextSignalSummary: document.querySelector("#nextSignalSummary"),
  nextSignalDetail: document.querySelector("#nextSignalDetail"),
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
  macd: [
    { key: "fast", label: "Fast EMA", value: 12, min: 2, max: 80 },
    { key: "slow", label: "Slow EMA", value: 26, min: 3, max: 160 },
    { key: "signal", label: "Signal EMA", value: 9, min: 2, max: 80 },
  ],
  bollinger: [
    { key: "period", label: "Band period", value: 20, min: 5, max: 120 },
    { key: "deviation", label: "Std devs", value: 2, min: 0.5, max: 4, step: 0.5 },
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

function marketDisplayName(symbol) {
  const meta = state.metaCache.get(symbol);
  return meta?.longName || meta?.shortName || meta?.displayName || symbol;
}

async function fetchMarketData(symbol, years, force = false) {
  const key = `${symbol}-${years}`;
  if (!force && state.cache.has(key)) {
    const meta = state.dataMetaCache.get(key);
    if (meta) {
      state.metaCache.set(symbol, meta);
      state.holdingQuotes.set(symbol, { bar: state.cache.get(key).at(-1), currency: meta.currency, demo: meta.demo });
    }
    return state.cache.get(key);
  }

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
    const marketMeta = {
      symbol,
      currency,
      sourceSymbol: meta.symbol || sourceSymbol(symbol),
      shortName: meta.shortName || "",
      longName: meta.longName || "",
      displayName: meta.displayName || "",
      demo: false,
    };
    state.metaCache.set(symbol, marketMeta);
    state.dataMetaCache.set(key, marketMeta);
    state.holdingQuotes.set(symbol, { bar: rows.at(-1), currency, demo: false });
    renderHoldings();
    setStatus(`Loaded ${rows.length} daily bars from Yahoo Finance${currency ? ` (${currency})` : ""}`);
    return rows;
  } catch (error) {
    const fallback = parseCsv(SAMPLE_CSV);
    const marketMeta = { symbol, currency: "USD", sourceSymbol: "AAPL", shortName: "", longName: "", displayName: "", demo: true };
    state.metaCache.set(symbol, marketMeta);
    state.dataMetaCache.set(key, marketMeta);
    state.holdingQuotes.set(symbol, { demo: true });
    renderHoldings();
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
  period = Math.max(Math.round(Number(period)) || 0, 0);
  if (period < 1) return result;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

function rollingStdDev(values, period) {
  const result = Array(values.length).fill(null);
  period = Math.max(Math.round(Number(period)) || 0, 0);
  if (period < 1) return result;

  let sum = 0;
  let sumSquares = 0;
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    sum += value;
    sumSquares += value * value;
    if (i >= period) {
      const old = values[i - period];
      sum -= old;
      sumSquares -= old * old;
    }
    if (i >= period - 1) {
      const mean = sum / period;
      const variance = Math.max(sumSquares / period - mean * mean, 0);
      result[i] = Math.sqrt(variance);
    }
  }
  return result;
}

function exponentialMovingAverage(values, period) {
  const result = Array(values.length).fill(null);
  period = Math.max(Math.round(Number(period)) || 0, 0);
  if (period < 1) return result;
  const alpha = 2 / (period + 1);
  let count = 0;
  let sum = 0;
  let average = null;

  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (!Number.isFinite(value)) continue;
    if (average === null) {
      count += 1;
      sum += value;
      if (count === period) {
        average = sum / period;
        result[i] = average;
      }
    } else {
      average = alpha * value + (1 - alpha) * average;
      result[i] = average;
    }
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
    }
    if (i >= period) result[i] = avgLoss === 0 ? (avgGain === 0 ? 50 : 100) : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

function buildMacd(values, fastPeriod, slowPeriod, signalPeriod) {
  const fast = exponentialMovingAverage(values, fastPeriod);
  const slow = exponentialMovingAverage(values, slowPeriod);
  const macdLine = values.map((_, index) =>
    Number.isFinite(fast[index]) && Number.isFinite(slow[index]) ? fast[index] - slow[index] : null
  );
  const signalLine = exponentialMovingAverage(macdLine, signalPeriod);
  const histogram = macdLine.map((value, index) =>
    Number.isFinite(value) && Number.isFinite(signalLine[index]) ? value - signalLine[index] : null
  );

  return { fast, slow, macdLine, signalLine, histogram };
}

function buildBollingerBands(values, period, deviation) {
  const middle = movingAverage(values, period);
  const stdDev = rollingStdDev(values, period);
  const width = Number(deviation);
  const upper = values.map((_, index) =>
    Number.isFinite(middle[index]) && Number.isFinite(stdDev[index]) ? middle[index] + stdDev[index] * width : null
  );
  const lower = values.map((_, index) =>
    Number.isFinite(middle[index]) && Number.isFinite(stdDev[index]) ? middle[index] - stdDev[index] * width : null
  );

  return { middle, upper, lower };
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

  if (strategy === "macd") {
    const values = buildMacd(closes, params.fast, params.slow, params.signal);
    indicators.fast = values.fast;
    indicators.slow = values.slow;
    indicators.macd = values.macdLine;
    indicators.signal = values.signalLine;
    indicators.histogram = values.histogram;
    for (let i = 1; i < rows.length; i += 1) {
      target[i] = Number.isFinite(values.macdLine[i]) && Number.isFinite(values.signalLine[i]) && values.macdLine[i] > values.signalLine[i] ? 1 : 0;
    }
  }

  if (strategy === "bollinger") {
    const bands = buildBollingerBands(closes, params.period, params.deviation);
    indicators.bbMiddle = bands.middle;
    indicators.bbUpper = bands.upper;
    indicators.bbLower = bands.lower;
    let position = 0;
    for (let i = 1; i < rows.length; i += 1) {
      if (Number.isFinite(bands.lower[i]) && rows[i].close < bands.lower[i]) position = 1;
      if (Number.isFinite(bands.middle[i]) && rows[i].close > bands.middle[i]) position = 0;
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
  macd: { fast: { min: 6, max: 18, step: 2 }, slow: { min: 20, max: 40, step: 2 }, signal: { min: 5, max: 15, step: 2 } },
  bollinger: { period: { min: 10, max: 40, step: 5 }, deviation: { min: 1.5, max: 3, step: 0.5 } },
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
    for (let v = r.min; v <= r.max + r.step / 1000; v += r.step) values.push(Number(v.toFixed(6)));
    return values;
  });

  const grid = [];
  const recurse = (depth, combo) => {
    if (depth === keys.length) {
      if (strategy === "rsi" && combo.buyBelow >= combo.sellAbove) return;
      if (strategy === "sma" && combo.fast >= combo.slow) return;
      if (strategy === "macd" && combo.fast >= combo.slow) return;
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
        <input name="${param.key}" type="number" min="${param.min}" max="${param.max}" step="${param.step ?? 1}" value="${savedParams[param.key] ?? param.value}">
      </label>
    `)
    .join("");
  els.strategyParams.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      getParams();
      saveSettings();
      renderStrategyIndicatorChart();
      renderHoldingAnalysis();
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
      <button class="watch-symbol" type="button"></button>
      <span class="watch-price">${latest ? money(latest.close, currencyForSymbol(symbol)) : "--"}</span>
      <button class="remove-button" type="button">×</button>
    `;
    row.querySelector(".watch-symbol").textContent = symbol;
    row.querySelector(".remove-button").title = `Remove ${symbol}`;
    row.querySelector(".remove-button").setAttribute("aria-label", `Remove ${symbol}`);
    row.querySelector(".watch-symbol").addEventListener("click", () => selectSymbol(symbol));
    row.querySelector(".remove-button").addEventListener("click", () => removeSymbol(symbol));
    els.watchlist.appendChild(row);
  });
}

function sanitizeHoldings(value) {
  if (!Array.isArray(value)) return [];
  const holdings = new Map();
  for (const item of value) {
    if (!item || typeof item !== "object" || typeof item.symbol !== "string") continue;
    const symbol = item.symbol.trim().toUpperCase();
    if (!/^[A-Z0-9.^=:_-]{1,40}$/.test(symbol)) continue;
    if (!Number.isFinite(item.quantity) || item.quantity <= 0 ||
        !Number.isFinite(item.averagePrice) || item.averagePrice <= 0 ||
        !Number.isFinite(item.quantity * item.averagePrice)) continue;
    holdings.set(symbol, { symbol, quantity: item.quantity, averagePrice: item.averagePrice });
  }
  return [...holdings.values()];
}

function resetHoldingForm() {
  state.editingHolding = null;
  els.holdingSymbolInput.value = "";
  els.holdingQuantityInput.value = "";
  els.holdingAverageInput.value = "";
  els.saveHoldingBtn.textContent = "Add holding";
  els.cancelHoldingBtn.hidden = true;
}

function saveHolding(symbol, quantity, averagePrice) {
  const holding = sanitizeHoldings([{ symbol, quantity, averagePrice }])[0];
  if (!holding) {
    els.holdingsMessage.textContent = "Enter a valid symbol, positive share quantity and average price.";
    return false;
  }
  if (state.holdings.some((item) => item.symbol === holding.symbol && item.symbol !== state.editingHolding)) {
    els.holdingsMessage.textContent = `${holding.symbol} already exists. Use Edit to change the position.`;
    return false;
  }
  const index = state.holdings.findIndex((item) => item.symbol === state.editingHolding);
  if (index < 0) state.holdings.push(holding);
  else state.holdings[index] = holding;
  resetHoldingForm();
  saveSettings();
  renderHoldings();
  renderHoldingAnalysis();
  els.holdingsMessage.textContent = `Saved ${holding.symbol}.`;
  return true;
}

function editHolding(symbol) {
  const holding = state.holdings.find((item) => item.symbol === symbol);
  if (!holding) return;
  state.editingHolding = symbol;
  els.holdingSymbolInput.value = symbol;
  els.holdingQuantityInput.value = holding.quantity;
  els.holdingAverageInput.value = holding.averagePrice;
  els.saveHoldingBtn.textContent = "Save changes";
  els.cancelHoldingBtn.hidden = false;
  els.holdingsMessage.textContent = `Editing ${symbol}. Average price must use the same currency/units as its quote.`;
  els.holdingQuantityInput.focus();
}

function removeHolding(symbol) {
  state.holdings = state.holdings.filter((item) => item.symbol !== symbol);
  if (state.editingHolding === symbol) resetHoldingForm();
  saveSettings();
  renderHoldings();
  renderHoldingAnalysis();
  els.holdingsMessage.textContent = `Removed ${symbol} from holdings. No trade was placed.`;
}

function holdingValuation(holding, quote) {
  if (!quote || quote.demo || !Number.isFinite(quote.bar?.close) || quote.bar.close <= 0) return null;
  const cost = holding.quantity * holding.averagePrice;
  const value = holding.quantity * quote.bar.close;
  if (!Number.isFinite(value)) return null;
  return { cost, value, profit: value - cost, returnRate: value / cost - 1 };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function renderHoldings() {
  if (!state.holdings.length) {
    els.holdingsBody.innerHTML = '<tr><td colspan="7">No holdings yet. Add a stock, share quantity and average purchase price above.</td></tr>';
    return;
  }
  els.holdingsBody.innerHTML = state.holdings.map((holding) => {
    const { symbol, quantity, averagePrice } = holding;
    const quote = state.holdingQuotes.get(symbol);
    const valuation = holdingValuation(holding, quote);
    const currency = quote && !quote.demo ? quote.currency : "";
    const price = (value) => escapeHtml(currency ? `${money(value, currency)} (${currency})` : `${formatNumber(value)} quote units`);
    const unavailable = quote?.demo ? "Unavailable (demo ignored)" : "Not loaded";
    return `<tr class="${symbol === state.activeSymbol ? "active" : ""}">
      <td><strong>${symbol}</strong></td>
      <td>${new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(quantity)}</td>
      <td>${price(averagePrice)}</td>
      <td>${valuation ? `${price(quote.bar.close)}<span class="holding-date">As of ${escapeHtml(quote.bar.date)}</span>` : unavailable}</td>
      <td>${valuation ? price(valuation.value) : "--"}</td>
      <td class="${valuation?.profit > 0 ? "positive" : valuation?.profit < 0 ? "negative" : ""}">${valuation ? `${price(valuation.profit)} (${percent(valuation.returnRate)})` : "--"}</td>
      <td><div class="holding-actions">
        <button type="button" data-holding-action="analyse" data-symbol="${symbol}" aria-label="Analyse ${symbol}">Analyse</button>
        <button type="button" class="secondary-button" data-holding-action="edit" data-symbol="${symbol}" aria-label="Edit ${symbol}">Edit</button>
        <button type="button" class="secondary-button" data-holding-action="remove" data-symbol="${symbol}" aria-label="Remove holding ${symbol}">Remove</button>
      </div></td>
    </tr>`;
  }).join("");
}

// Evaluate the exit rule for an already-owned long position, not a simulated entry.
// Holdings always use full, latest history; chart zoom only affects the backtest.
function buildHoldingAnalysis(rows, strategy, params) {
  const unavailable = (reason) => ({ action: "UNAVAILABLE", reason, trigger: null });
  const definitions = strategyParams[strategy];
  if (!definitions || definitions.some((param) => !Number.isFinite(params[param.key]) ||
      params[param.key] < param.min || params[param.key] > param.max ||
      (param.key !== "deviation" && !Number.isInteger(params[param.key]))) ||
      (["sma", "macd"].includes(strategy) && params.fast >= params.slow) ||
      (strategy === "rsi" && params.buyBelow >= params.sellAbove)) {
    return unavailable("Correct the selected strategy parameters before analysing this holding.");
  }
  if (!rows.length || !Number.isFinite(rows.at(-1).close) || rows.at(-1).close <= 0) {
    return unavailable("No valid market history is available.");
  }
  if (strategy === "buyhold") {
    return { action: "HOLD", reason: "Buy and hold keeps the position invested; it defines no sell rule or price target.", trigger: null };
  }
  const { indicators } = buildSignalSeries(rows, { strategy, params, longOnly: true });
  const latest = rows.at(-1);
  const last = (key) => indicators[key]?.at(-1);
  let exit;
  let reason;
  let trigger;
  if (strategy === "sma") {
    if (!Number.isFinite(last("fast")) || !Number.isFinite(last("slow"))) return unavailable("Not enough history to calculate both moving averages. Increase the data range.");
    exit = last("fast") <= last("slow");
    reason = `Fast SMA ${formatNumber(last("fast"))} is ${exit ? "at or below" : "above"} slow SMA ${formatNumber(last("slow"))}.`;
    trigger = nextSmaTrigger(rows, params, 1);
  } else if (strategy === "rsi") {
    if (!Number.isFinite(last("rsi"))) return unavailable("Not enough history to calculate RSI. Increase the data range.");
    exit = last("rsi") > params.sellAbove;
    reason = `RSI ${formatNumber(last("rsi"))} is ${exit ? "above" : "not above"} the sell threshold ${params.sellAbove}.`;
    trigger = nextRsiTrigger(rows, params, 1);
  } else if (strategy === "breakout") {
    if (!Number.isFinite(last("lows"))) return unavailable("Not enough history to calculate the Donchian exit channel. Increase the data range.");
    exit = latest.close < last("lows");
    reason = `Latest close is ${exit ? "below" : "not below"} the prior ${params.exit}-bar low (${formatNumber(last("lows"))}).`;
    trigger = nextBreakoutTrigger(rows, params, 1);
  } else if (strategy === "macd") {
    if (!Number.isFinite(last("macd")) || !Number.isFinite(last("signal"))) return unavailable("Not enough history to calculate MACD and its signal. Increase the data range.");
    exit = last("macd") <= last("signal");
    reason = `MACD ${formatNumber(last("macd"))} is ${exit ? "at or below" : "above"} its signal ${formatNumber(last("signal"))}.`;
    trigger = nextMacdTrigger(rows, params, 1);
  } else if (strategy === "bollinger") {
    if (!Number.isFinite(last("bbMiddle"))) return unavailable("Not enough history to calculate the Bollinger middle band. Increase the data range.");
    exit = latest.close > last("bbMiddle");
    reason = `Latest close is ${exit ? "above" : "not above"} the middle band (${formatNumber(last("bbMiddle"))}).`;
    trigger = nextBollingerTrigger(rows, params, 1);
  }
  return { action: exit ? "SELL" : "HOLD", reason, trigger };
}

function renderHoldingAnalysis() {
  const holding = state.holdings.find((item) => item.symbol === state.activeSymbol);
  const strategy = els.strategySelect.value;
  const strategyLabel = els.strategySelect.selectedOptions?.[0]?.textContent || strategy.toUpperCase();
  els.holdingAnalysisTitle.textContent = holding ? `${holding.symbol} · ${strategyLabel}` : "Holding analysis";
  els.holdingExit.textContent = "";
  els.holdingAnalysisDetail.textContent = "";
  const showDecision = (action, reason) => {
    els.holdingDecision.textContent = action;
    els.holdingDecision.className = `signal-action ${action === "SELL" ? "sell" : "hold"}`;
    els.holdingReason.textContent = reason;
  };
  if (!holding) {
    showDecision("--", "Add or select a holding to analyse its exit rules using the strategy in Strategy Lab.");
    return;
  }
  if (state.selectionLoading) {
    showDecision("LOADING", "Loading this holding's market history…");
    return;
  }
  const key = `${holding.symbol}-${els.rangeSelect.value}`;
  const meta = state.dataMetaCache.get(key);
  const rows = state.cache.get(key) || [];
  if (!meta || meta.demo || !holdingValuation(holding, state.holdingQuotes.get(holding.symbol))) {
    showDecision("UNAVAILABLE", "Verified market data is unavailable. Demo prices are never used to value holdings or generate sell/hold guidance. Refresh prices to retry.");
    return;
  }
  const analysis = buildHoldingAnalysis(rows, strategy, getParams());
  showDecision(analysis.action, analysis.reason);
  const latest = rows.at(-1);
  if (!latest) return;
  const quoteMoney = (value) => `${money(value, meta.currency)} (${meta.currency})`;
  if (analysis.action === "SELL") {
    els.holdingExit.textContent = `Exit rule is met at the latest close of ${quoteMoney(latest.close)}. This is a reference price, not a guaranteed sale price.`;
  } else if (analysis.action === "HOLD" && analysis.trigger) {
    const { level, operator } = analysis.trigger;
    els.holdingExit.textContent = Number.isFinite(level) && level > 0
      ? `Next-close sell threshold: ${operator} ${quoteMoney(level)} (${percent(level / latest.close - 1)} from latest close).`
      : "No positive next-close sell threshold is reachable with the current history. Recalculate after the next bar.";
  } else if (strategy === "buyhold") {
    els.holdingExit.textContent = "Sell price: not defined by this strategy.";
  }
  const stale = Date.now() - Date.parse(latest.date) > 7 * 86400000;
  els.holdingAnalysisDetail.textContent = `As of ${latest.date} · ${quoteMoney(latest.close)}. ${stale ? "Warning: this quote is over 7 days old; refresh and verify before acting. " : ""}Uses all ${rows.length} loaded bars, independent of chart zoom. Assumes your shares are already held long, regardless of the backtest position or short-mode setting. Average cost affects P/L, not these technical exit rules. ${analysis.trigger?.detail || ""}`;
}

async function refreshHoldings(force = true) {
  if (els.refreshHoldingsBtn.disabled) return;
  els.refreshHoldingsBtn.disabled = true;
  els.holdingsMessage.textContent = "Loading holding prices…";
  try {
    const years = els.rangeSelect.value;
    for (const { symbol } of [...state.holdings]) {
      await fetchMarketData(symbol, years, force);
    }
    renderHoldings();
    renderHoldingAnalysis();
    const unavailable = state.holdings.filter((holding) => !holdingValuation(holding, state.holdingQuotes.get(holding.symbol))).length;
    els.holdingsMessage.textContent = unavailable
      ? `${unavailable} holding(s) have unavailable prices. Demo data has been excluded.`
      : "Holding prices updated. See each quote's as-of date; P/L excludes fees, dividends and taxes.";
  } finally {
    els.refreshHoldingsBtn.disabled = false;
  }
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

function renderNextSignalTrigger() {
  const trigger = buildNextSignalTrigger(state.backtest?.rows || []);
  els.nextSignalAction.textContent = trigger.action;
  els.nextSignalAction.className = `signal-action ${trigger.action.toLowerCase()}`;
  els.nextSignalSummary.textContent = trigger.summary;
  els.nextSignalDetail.textContent = trigger.detail || "";
}

function buildNextSignalTrigger(rows) {
  if (!rows.length) {
    return { action: "HOLD", summary: "Run a strategy test to calculate the next trigger.", detail: "" };
  }

  const strategy = els.strategySelect.value;
  const params = getParams();
  const latest = rows.at(-1);
  const latestClose = latest.close;
  const currency = currencyForSymbol(state.activeSymbol);

  if (strategy === "buyhold") {
    return {
      action: "HOLD",
      summary: "Buy and hold stays invested, so there is no rule-based next buy or sell trigger.",
      detail: `Latest close: ${money(latestClose, currency)} on ${latest.date}.`,
    };
  }

  const baseTarget = buildSignalSeries(rows, { strategy, params, longOnly: true }).target;
  const basePosition = baseTarget.at(-1) === 1 ? 1 : 0;
  const trigger =
    strategy === "sma"
      ? nextSmaTrigger(rows, params, basePosition)
      : strategy === "rsi"
        ? nextRsiTrigger(rows, params, basePosition)
        : strategy === "macd"
          ? nextMacdTrigger(rows, params, basePosition)
          : strategy === "bollinger"
            ? nextBollingerTrigger(rows, params, basePosition)
            : nextBreakoutTrigger(rows, params, basePosition);

  if (!trigger) {
    return {
      action: "HOLD",
      summary: "There is not enough selected history to calculate the next trigger.",
      detail: `Latest close: ${money(latestClose, currency)} on ${latest.date}.`,
    };
  }

  const action = basePosition ? "SELL" : "BUY";
  const move = latestClose ? trigger.level / latestClose - 1 : 0;
  const moveText = `${move >= 0 ? "+" : ""}${(move * 100).toFixed(2)}%`;
  const modeNote = els.longOnlyInput.checked ? "" : " Long only is off, so BUY means rotating from short to long and SELL means rotating from long to short.";
  return {
    action,
    summary: `${action} if the next close is ${trigger.operator} ${money(trigger.level, currency)} (${moveText} from latest close).`,
    detail: `${trigger.detail} Latest close: ${money(latestClose, currency)} on ${latest.date}.${modeNote}`,
  };
}

function nextBreakoutTrigger(rows, params, basePosition) {
  if (basePosition) {
    const level = rangeLow(rows, params.exit);
    if (!Number.isFinite(level)) return null;
    return { level, operator: "below", detail: `Donchian exit uses the lowest low from the last ${params.exit} bars.` };
  }
  const level = rangeHigh(rows, params.lookback);
  if (!Number.isFinite(level)) return null;
  return { level, operator: "above", detail: `Donchian entry uses the highest high from the last ${params.lookback} bars.` };
}

function nextSmaTrigger(rows, params, basePosition) {
  const fast = Number(params.fast);
  const slow = Number(params.slow);
  const requiredRows = Math.max(fast, slow) - 1;
  if (rows.length < requiredRows || fast === slow) return null;

  const closes = rows.map((row) => row.close);
  const fastSum = sumLast(closes, fast - 1);
  const slowSum = sumLast(closes, slow - 1);
  const slope = 1 / fast - 1 / slow;
  const offset = fastSum / fast - slowSum / slow;
  if (slope === 0) return null;

  const level = -offset / slope;
  if (!Number.isFinite(level)) return null;
  const operator = basePosition ? (slope > 0 ? "at or below" : "at or above") : (slope > 0 ? "above" : "below");
  return { level, operator, detail: `SMA crossover compares the next ${fast}-day average with the next ${slow}-day average.` };
}

function nextRsiTrigger(rows, params, basePosition) {
  const period = Number(params.period);
  const closes = rows.map((row) => row.close);
  const averages = rsiAverages(closes, period);
  if (!averages) return null;

  const latestClose = closes.at(-1);
  const threshold = basePosition ? params.sellAbove : params.buyBelow;
  const rs = threshold / (100 - threshold);
  const difference = rs * averages.avgLoss - averages.avgGain;
  // Solve Wilder's next update on either the rising- or falling-price branch.
  const level = latestClose + (period - 1) * (difference >= 0 ? difference : difference / rs);
  if (!Number.isFinite(level)) return null;
  return { level, operator: basePosition ? "above" : "below", detail: basePosition
    ? `RSI exit triggers when next RSI rises above ${threshold}.`
    : `RSI entry triggers when next RSI falls below ${threshold}.` };
}

function nextMacdTrigger(rows, params, basePosition) {
  const fastPeriod = Number(params.fast);
  const slowPeriod = Number(params.slow);
  const signalPeriod = Number(params.signal);
  if (fastPeriod >= slowPeriod || signalPeriod <= 1) return null;

  const closes = rows.map((row) => row.close);
  const values = buildMacd(closes, fastPeriod, slowPeriod, signalPeriod);
  const fastEma = values.fast.at(-1);
  const slowEma = values.slow.at(-1);
  const signalLine = values.signalLine.at(-1);
  if (!Number.isFinite(fastEma) || !Number.isFinite(slowEma) || !Number.isFinite(signalLine)) return null;

  const fastAlpha = 2 / (fastPeriod + 1);
  const slowAlpha = 2 / (slowPeriod + 1);
  const slope = fastAlpha - slowAlpha;
  if (slope === 0) return null;

  const offset = (1 - fastAlpha) * fastEma - (1 - slowAlpha) * slowEma;
  const level = (signalLine - offset) / slope;
  if (!Number.isFinite(level)) return null;

  const operator = basePosition ? (slope > 0 ? "at or below" : "at or above") : (slope > 0 ? "above" : "below");
  return {
    level,
    operator,
    detail: `MACD crossover compares the next ${fastPeriod}/${slowPeriod} EMA spread with the ${signalPeriod}-day signal line.`,
  };
}

function nextBollingerTrigger(rows, params, basePosition) {
  const closes = rows.map((row) => row.close);
  const bands = buildBollingerBands(closes, params.period, params.deviation);
  const middle = bands.middle.at(-1);
  const lower = bands.lower.at(-1);

  if (basePosition) {
    if (!Number.isFinite(middle)) return null;
    return {
      level: sumLast(closes, params.period - 1) / (params.period - 1),
      operator: "above",
      detail: `Bollinger exit solves for the next close above its updated ${params.period}-bar middle band. The threshold is recalculated after each new bar.`,
    };
  }

  if (!Number.isFinite(lower)) return null;
  return {
    level: lower,
    operator: "below",
    detail: `Bollinger entry uses the latest lower band at ${params.deviation} standard deviations below the ${params.period}-bar average. The next bar's live band will move as price changes.`,
  };
}

function rsiAverages(values, period) {
  if (values.length <= period || period <= 0) return null;
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
    }
  }
  return { avgGain, avgLoss };
}

function sumLast(values, count) {
  if (count <= 0) return 0;
  return values.slice(-count).reduce((sum, value) => sum + value, 0);
}

function rangeHigh(rows, count) {
  if (rows.length < count || count <= 0) return null;
  return Math.max(...rows.slice(-count).map((row) => row.high));
}

function rangeLow(rows, count) {
  if (rows.length < count || count <= 0) return null;
  return Math.min(...rows.slice(-count).map((row) => row.low));
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

function getSelectedAnalysisRows(rows) {
  if (!rows.length) return [];
  const firstDate = rows[0].date;
  const lastDate = rows.at(-1).date;
  let start = clampDate(state.zoomStart || els.zoomStartInput.value || firstDate, firstDate, lastDate);
  let end = clampDate(state.zoomEnd || els.zoomEndInput.value || lastDate, firstDate, lastDate);
  if (start > end) {
    [start, end] = [end, start];
  }
  state.zoomStart = start;
  state.zoomEnd = end;
  els.zoomStartInput.value = start;
  els.zoomEndInput.value = end;
  return rows.filter((row) => row.date >= start && row.date <= end);
}

function setZoom(start, end) {
  const rows = state.data.length ? state.data : state.backtest?.rows || [];
  if (!rows.length) return;
  hideOptimiserResults();
  const firstDate = rows[0].date;
  const lastDate = rows.at(-1).date;
  state.zoomStart = clampDate(start, firstDate, lastDate);
  state.zoomEnd = clampDate(end, firstDate, lastDate);
  if (state.zoomStart > state.zoomEnd) {
    [state.zoomStart, state.zoomEnd] = [state.zoomEnd, state.zoomStart];
  }
  els.zoomStartInput.value = state.zoomStart;
  els.zoomEndInput.value = state.zoomEnd;
  if (state.data.length) {
    state.backtest = runBacktest(getSelectedAnalysisRows(state.data));
    renderMetrics(state.backtest.metrics);
    renderBuyHoldComparison();
    renderSignals(state.backtest.trades);
    renderNextSignalTrigger();
  }
  saveSettings();
  renderChart();
  renderStrategyIndicatorChart();
  renderVolumeChart();
}

function setZoomWindow(days) {
  const rows = state.data.length ? state.data : state.backtest?.rows || [];
  if (!rows.length) return;
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
    const markerValue =
      mode === "equity"
        ? state.backtest.equity[fullIndex]
        : mode === "drawdown"
          ? state.backtest.drawdown[fullIndex] * 100
          : trade.price;
    ctx.fillStyle = trade.action === "BUY" ? "#0f7a5a" : "#b9443f";
    ctx.beginPath();
    ctx.arc(x(index), y(markerValue), 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(rows[0]?.date || "", pad.left, 318);
  ctx.textAlign = "right";
  ctx.fillText(rows.at(-1)?.date || "", rect.width - pad.right, 318);
  ctx.textAlign = "left";
}

function renderStrategyIndicatorChart() {
  const strategy = els.strategySelect.value;
  const isRsiStrategy = strategy === "rsi";
  const rsiValues = state.backtest?.indicators?.rsi;
  const highValues = state.backtest?.indicators?.highs;
  const lowValues = state.backtest?.indicators?.lows;
  const macdValues = state.backtest?.indicators?.macd;
  const signalValues = state.backtest?.indicators?.signal;
  const histogramValues = state.backtest?.indicators?.histogram;
  const bbMiddleValues = state.backtest?.indicators?.bbMiddle;
  const bbUpperValues = state.backtest?.indicators?.bbUpper;
  const bbLowerValues = state.backtest?.indicators?.bbLower;
  const hasRsiSeries = isRsiStrategy && Array.isArray(rsiValues);
  const hasDonchianSeries = strategy === "breakout" && Array.isArray(highValues) && Array.isArray(lowValues);
  const hasMacdSeries = strategy === "macd" && Array.isArray(macdValues) && Array.isArray(signalValues);
  const hasBollingerSeries = strategy === "bollinger" && Array.isArray(bbMiddleValues) && Array.isArray(bbUpperValues) && Array.isArray(bbLowerValues);
  els.rsiSection.hidden = !hasRsiSeries && !hasDonchianSeries && !hasMacdSeries && !hasBollingerSeries;
  if (!hasRsiSeries && !hasDonchianSeries && !hasMacdSeries && !hasBollingerSeries) return;

  const canvas = els.rsiChart;
  const ctx = canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * pixelRatio);
  canvas.height = Math.round(150 * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, rect.width, 150);

  const visible = getVisibleWindow();
  const params = getParams();
  if (hasMacdSeries) {
    renderMacdIndicatorChart(ctx, rect, visible, params, macdValues, signalValues, histogramValues || []);
    return;
  }
  if (hasBollingerSeries) {
    renderBollingerIndicatorChart(ctx, rect, visible, params, bbMiddleValues, bbUpperValues, bbLowerValues);
    return;
  }
  if (hasDonchianSeries) {
    renderDonchianIndicatorChart(ctx, rect, visible, params, highValues, lowValues);
    return;
  }

  const series = visible.indexes.map((index) => rsiValues[index]);
  const latestValue = [...series].reverse().find((value) => Number.isFinite(value));
  els.indicatorTitle.textContent = "RSI";
  els.rsiSummary.textContent = Number.isFinite(latestValue)
    ? `Latest RSI ${latestValue.toFixed(1)} - buy below ${params.buyBelow} - sell above ${params.sellAbove}`
    : "RSI values begin after the warm-up period for the selected range";

  const pad = { top: 12, right: 56, bottom: 26, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 150 - pad.top - pad.bottom;
  const x = (index) => pad.left + (index / Math.max(series.length - 1, 1)) * width;
  const y = (value) => pad.top + (1 - value / 100) * height;

  drawRsiGrid(ctx, pad, rect.width, y, params.buyBelow, params.sellAbove);
  drawLine(ctx, series, x, y, "#2364aa", 2);

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(visible.rows[0]?.date || "", pad.left, 142);
  ctx.textAlign = "right";
  ctx.fillText(visible.rows.at(-1)?.date || "", rect.width - pad.right, 142);
  ctx.textAlign = "left";
}

function renderBollingerIndicatorChart(ctx, rect, visible, params, middleValues, upperValues, lowerValues) {
  const closeSeries = visible.indexes.map((index) => state.backtest.rows[index].close);
  const middleSeries = visible.indexes.map((index) => middleValues[index]);
  const upperSeries = visible.indexes.map((index) => upperValues[index]);
  const lowerSeries = visible.indexes.map((index) => lowerValues[index]);
  const values = [...closeSeries, ...middleSeries, ...upperSeries, ...lowerSeries].filter((value) => Number.isFinite(value));
  const latestClose = [...closeSeries].reverse().find((value) => Number.isFinite(value));
  const latestMiddle = [...middleSeries].reverse().find((value) => Number.isFinite(value));
  const latestLower = [...lowerSeries].reverse().find((value) => Number.isFinite(value));
  const currency = currencyForSymbol(state.activeSymbol);

  els.indicatorTitle.textContent = "Bollinger Bands";
  els.rsiSummary.textContent =
    Number.isFinite(latestMiddle) && Number.isFinite(latestLower)
      ? `Close ${money(latestClose, currency)} - buy below ${money(latestLower, currency)} - exit above ${money(latestMiddle, currency)}`
      : `Bollinger bands begin after the ${params.period}-bar warm-up`;

  if (!values.length) return;

  const pad = { top: 18, right: 72, bottom: 26, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 150 - pad.top - pad.bottom;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index) => pad.left + (index / Math.max(closeSeries.length - 1, 1)) * width;
  const y = (value) => pad.top + (1 - (value - min) / span) * height;

  drawGrid(ctx, pad, rect.width, 150, min, max);
  drawLine(ctx, closeSeries, x, y, "#2364aa", 2);
  drawLine(ctx, upperSeries, x, y, "#b9443f", 1.5);
  drawLine(ctx, middleSeries, x, y, "#b7791f", 1.5);
  drawLine(ctx, lowerSeries, x, y, "#0f7a5a", 1.5);

  drawLegend(ctx, pad.left, 14, [
    { label: "Close", color: "#2364aa" },
    { label: "Upper", color: "#b9443f" },
    { label: "Middle", color: "#b7791f" },
    { label: "Lower", color: "#0f7a5a" },
  ]);

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(visible.rows[0]?.date || "", pad.left, 142);
  ctx.textAlign = "right";
  ctx.fillText(visible.rows.at(-1)?.date || "", rect.width - pad.right, 142);
  ctx.textAlign = "left";
}

function renderMacdIndicatorChart(ctx, rect, visible, params, macdValues, signalValues, histogramValues) {
  const macdSeries = visible.indexes.map((index) => macdValues[index]);
  const signalSeries = visible.indexes.map((index) => signalValues[index]);
  const histogramSeries = visible.indexes.map((index) => histogramValues[index]);
  const values = [...macdSeries, ...signalSeries, ...histogramSeries, 0].filter((value) => Number.isFinite(value));
  const latestMacd = [...macdSeries].reverse().find((value) => Number.isFinite(value));
  const latestSignal = [...signalSeries].reverse().find((value) => Number.isFinite(value));

  els.indicatorTitle.textContent = "MACD";
  els.rsiSummary.textContent =
    Number.isFinite(latestMacd) && Number.isFinite(latestSignal)
      ? `Latest MACD ${latestMacd.toFixed(2)} - signal ${latestSignal.toFixed(2)} - EMAs ${params.fast}/${params.slow}/${params.signal}`
      : `MACD values begin after the ${params.slow}-bar slow EMA and ${params.signal}-bar signal warm-up`;

  if (!values.length) return;

  const pad = { top: 18, right: 72, bottom: 26, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 150 - pad.top - pad.bottom;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index) => pad.left + (index / Math.max(macdSeries.length - 1, 1)) * width;
  const y = (value) => pad.top + (1 - (value - min) / span) * height;
  const zeroY = y(0);
  const barWidth = Math.max(width / Math.max(histogramSeries.length, 1) - 1, 1);

  drawGrid(ctx, pad, rect.width, 150, min, max);
  ctx.strokeStyle = "#7d8b8f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(rect.width - pad.right, zeroY);
  ctx.stroke();

  histogramSeries.forEach((value, index) => {
    if (!Number.isFinite(value)) return;
    const valueY = y(value);
    ctx.fillStyle = value >= 0 ? "rgba(15, 122, 90, 0.35)" : "rgba(185, 68, 63, 0.35)";
    ctx.fillRect(x(index) - barWidth / 2, Math.min(valueY, zeroY), barWidth, Math.max(Math.abs(zeroY - valueY), 1));
  });

  drawLine(ctx, macdSeries, x, y, "#2364aa", 2);
  drawLine(ctx, signalSeries, x, y, "#b7791f", 1.5);
  drawLegend(ctx, pad.left, 14, [
    { label: "MACD", color: "#2364aa" },
    { label: "Signal", color: "#b7791f" },
    { label: "Histogram", color: "#0f7a5a" },
  ]);

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(visible.rows[0]?.date || "", pad.left, 142);
  ctx.textAlign = "right";
  ctx.fillText(visible.rows.at(-1)?.date || "", rect.width - pad.right, 142);
  ctx.textAlign = "left";
}

function renderDonchianIndicatorChart(ctx, rect, visible, params, highValues, lowValues) {
  const closeSeries = visible.indexes.map((index) => state.backtest.rows[index].close);
  const entrySeries = visible.indexes.map((index) => highValues[index]);
  const exitSeries = visible.indexes.map((index) => lowValues[index]);
  const values = [...closeSeries, ...entrySeries, ...exitSeries].filter((value) => Number.isFinite(value));
  const latestEntry = [...entrySeries].reverse().find((value) => Number.isFinite(value));
  const latestExit = [...exitSeries].reverse().find((value) => Number.isFinite(value));
  const latestClose = [...closeSeries].reverse().find((value) => Number.isFinite(value));
  const currency = currencyForSymbol(state.activeSymbol);

  els.indicatorTitle.textContent = "Donchian Breakout";
  els.rsiSummary.textContent =
    Number.isFinite(latestEntry) && Number.isFinite(latestExit)
      ? `Close ${money(latestClose, currency)} - entry above ${money(latestEntry, currency)} - exit below ${money(latestExit, currency)}`
      : `Donchian channels begin after ${Math.max(params.lookback, params.exit)} bars`;

  if (!values.length) return;

  const pad = { top: 18, right: 72, bottom: 26, left: 52 };
  const width = rect.width - pad.left - pad.right;
  const height = 150 - pad.top - pad.bottom;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index) => pad.left + (index / Math.max(closeSeries.length - 1, 1)) * width;
  const y = (value) => pad.top + (1 - (value - min) / span) * height;

  drawGrid(ctx, pad, rect.width, 150, min, max);
  drawLine(ctx, closeSeries, x, y, "#2364aa", 2);
  drawLine(ctx, entrySeries, x, y, "#0f7a5a", 1.5);
  drawLine(ctx, exitSeries, x, y, "#b9443f", 1.5);

  drawLegend(ctx, pad.left, 14, [
    { label: "Close", color: "#2364aa" },
    { label: "Entry high", color: "#0f7a5a" },
    { label: "Exit low", color: "#b9443f" },
  ]);

  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText(visible.rows[0]?.date || "", pad.left, 142);
  ctx.textAlign = "right";
  ctx.fillText(visible.rows.at(-1)?.date || "", rect.width - pad.right, 142);
  ctx.textAlign = "left";
}

function drawLegend(ctx, x, y, items) {
  ctx.font = "12px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  let offset = 0;
  items.forEach((item) => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + 16, y);
    ctx.stroke();
    ctx.fillStyle = "#627074";
    ctx.fillText(item.label, x + offset + 22, y);
    offset += ctx.measureText(item.label).width + 50;
  });
  ctx.textBaseline = "alphabetic";
}

function drawRsiGrid(ctx, pad, fullWidth, y, buyBelow, sellAbove) {
  const lines = [100, sellAbove, 50, buyBelow, 0]
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => b - a);
  ctx.lineWidth = 1;
  ctx.fillStyle = "#627074";
  ctx.font = "12px system-ui, sans-serif";

  lines.forEach((level) => {
    const lineY = y(level);
    ctx.beginPath();
    ctx.moveTo(pad.left, lineY);
    ctx.lineTo(fullWidth - pad.right, lineY);
    ctx.strokeStyle = level === 50 ? "#d6dfda" : level === buyBelow ? "#0f7a5a" : level === sellAbove ? "#b9443f" : "#e4e9e5";
    ctx.stroke();
    ctx.fillText(String(level), fullWidth - pad.right + 8, lineY + 4);
  });
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
  if (currency === "GBp") return "GBX";
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

function usesLocalSettingsServer() {
  return location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
}

async function loadSettings() {
  let settings = null;
  try {
    if (usesLocalSettingsServer()) {
      const response = await fetch(settingsUrl(), { cache: "no-store" });
      if (response.ok) settings = await response.json();
    }
  } catch {
    settings = null;
  }

  if (!settings) {
    try {
      settings = JSON.parse(localStorage.getItem("marketlabSettings") || "null") || {
        watchlist: JSON.parse(localStorage.getItem("watchlist") || "null"),
        activeSymbol: localStorage.getItem("activeSymbol"),
      };
    } catch {
      settings = {};
    }
  }

  applySettings(settings);
  state.settingsLoaded = true;
  saveSettings();
}

function applySettings(settings) {
  state.watchlist = Array.isArray(settings.watchlist) && settings.watchlist.length ? settings.watchlist : state.watchlist;
  state.holdings = sanitizeHoldings(settings.holdings);
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
    holdings: state.holdings,
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

let settingsSaveQueue = Promise.resolve();

function persistSettings(settings, keepalive = false) {
  if (!usesLocalSettingsServer()) return Promise.resolve();
  const body = JSON.stringify(settings);
  settingsSaveQueue = settingsSaveQueue.then(async () => {
    try {
      const response = await fetch(settingsUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      setStatus("Server settings save failed; any browser backup remains available.");
    }
  });
  return settingsSaveQueue;
}

function saveSettings() {
  if (!state.settingsLoaded) return;
  clearTimeout(state.saveTimer);
  const settings = collectSettings();
  try {
    localStorage.setItem("marketlabSettings", JSON.stringify(settings));
    localStorage.setItem("watchlist", JSON.stringify(settings.watchlist));
    localStorage.setItem("activeSymbol", settings.activeSymbol);
  } catch {
    setStatus("Browser settings backup unavailable; saving to the local server.");
  }
  state.saveTimer = setTimeout(() => {
    state.saveTimer = null;
    persistSettings(collectSettings());
  }, 250);
}

window.addEventListener("pagehide", () => {
  if (state.saveTimer === null) return;
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  persistSettings(collectSettings(), true);
});

async function selectSymbol(symbol, force = false, options = {}) {
  const request = ++state.selectionRequest;
  hideOptimiserResults();
  const dataKey = `${symbol}-${els.rangeSelect.value}`;
  const previousSymbol = state.activeSymbol;
  const shouldAutoLoadParams = options.autoLoadParams ?? symbol !== previousSymbol;
  state.activeSymbol = symbol;
  state.selectionLoading = true;
  els.activeSymbol.textContent = marketDisplayName(symbol);
  renderWatchlist();
  renderHoldings();
  renderHoldingAnalysis();
  if (shouldAutoLoadParams) autoLoadSymbolParams();
  updateSavedParamsButtons();
  const data = await fetchMarketData(symbol, els.rangeSelect.value, force);
  if (request !== state.selectionRequest) return;
  state.selectionLoading = false;
  state.data = data;
  els.activeSymbol.textContent = marketDisplayName(symbol);
  syncZoomBounds(state.data, dataKey);
  state.backtest = runBacktest(getSelectedAnalysisRows(state.data));
  renderMetrics(state.backtest.metrics);
  renderBuyHoldComparison();
  renderSignals(state.backtest.trades);
  renderNextSignalTrigger();
  renderWatchlist();
  renderHoldings();
  renderHoldingAnalysis();
  renderChart();
  renderStrategyIndicatorChart();
  renderVolumeChart();
  saveSettings();
}

async function refreshAllSymbols() {
  setStatus("Refreshing watchlist...");
  for (const symbol of new Set([...state.watchlist, ...state.holdings.map((holding) => holding.symbol)])) {
    await fetchMarketData(symbol, els.rangeSelect.value, true);
  }
  await selectSymbol(state.activeSymbol);
}

function removeSymbol(symbol) {
  const wasActive = state.activeSymbol === symbol;
  state.watchlist = state.watchlist.filter((item) => item !== symbol);
  if (!state.watchlist.length) state.watchlist = ["AAPL"];
  const nextSymbol = wasActive ? state.watchlist[0] : state.activeSymbol;
  saveWatchlist();
  selectSymbol(nextSymbol, false, { autoLoadParams: wasActive });
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

els.holdingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const symbol = els.holdingSymbolInput.value.trim().toUpperCase();
  if (saveHolding(symbol, Number(els.holdingQuantityInput.value), Number(els.holdingAverageInput.value))) {
    selectSymbol(symbol);
  }
});
els.cancelHoldingBtn.addEventListener("click", () => {
  resetHoldingForm();
  els.holdingsMessage.textContent = "Edit cancelled.";
});
els.holdingsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-holding-action]");
  if (!button) return;
  const { holdingAction, symbol } = button.dataset;
  if (holdingAction === "analyse") selectSymbol(symbol);
  if (holdingAction === "edit") editHolding(symbol);
  if (holdingAction === "remove") removeHolding(symbol);
});
els.refreshHoldingsBtn.addEventListener("click", () => refreshHoldings());

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
  selectSymbol(state.activeSymbol, false, { autoLoadParams: true });
});
els.saveParamsBtn.addEventListener("click", saveSymbolParams);
els.loadParamsBtn.addEventListener("click", loadSymbolParams);
els.refreshAllBtn.addEventListener("click", refreshAllSymbols);
els.exportBtn.addEventListener("click", exportBacktest);
els.zoomStartInput.addEventListener("change", () => setZoom(els.zoomStartInput.value, els.zoomEndInput.value));
els.zoomEndInput.addEventListener("change", () => setZoom(els.zoomStartInput.value, els.zoomEndInput.value));
els.zoomResetBtn.addEventListener("click", () => {
  const rows = state.data.length ? state.data : state.backtest?.rows || [];
  if (!rows.length) return;
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
window.addEventListener("resize", renderStrategyIndicatorChart);
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
        <label>Step <input name="${key}-step" type="number" value="${r.step}" min="0.1" step="any"></label>
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
    if (step <= 0 || min > max) return null;
    ranges[key] = { min, max, step };
  }
  return ranges;
}

function hideOptimiserResults() {
  optimiserCancelled.value = true;
  state.lastOptimiserResult = null;
  els.optimiserResults.hidden = true;
  els.optimiserProgress.hidden = true;
}

function optimisationContext() {
  return JSON.stringify([
    state.activeSymbol, els.strategySelect.value, els.rangeSelect.value,
    state.zoomStart, state.zoomEnd, els.capitalInput.value,
    els.longOnlyInput.checked, els.feesInput.checked,
  ]);
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
  if (state.optimiserBusy) return;
  const strategy = els.strategySelect.value;
  const symbol = state.activeSymbol;
  const rangeYears = els.rangeSelect.value;
  const context = optimisationContext();
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

  state.optimiserBusy = true;
  state.lastOptimiserResult = null;
  els.optimiseBtn.disabled = true;
  els.runBtn.disabled = true;
  els.optimiserResults.hidden = true;
  els.optimiserProgress.hidden = false;
  els.optimiserProgressBar.style.width = "0%";
  els.optimiserProgressText.textContent = `0 / ${combos.toLocaleString()}`;
  optimiserCancelled = { value: false };
  const cancelled = optimiserCancelled;

  try {
    setStatus(`Optimising ${combos.toLocaleString()} combinations...`);
    const data = await fetchMarketData(symbol, rangeYears);
    if (cancelled.value || context !== optimisationContext()) return;
    const analysisRows = getSelectedAnalysisRows(data || []);
    const analysisContext = optimisationContext();
    if (analysisRows.length < 12) {
      setStatus("Not enough data to optimise.");
      return;
    }

    const result = await runOptimisation(analysisRows, strategy, ranges, baseOptions, (done, total) => {
      const pct = Math.round((done / total) * 100);
      els.optimiserProgressBar.style.width = `${pct}%`;
      els.optimiserProgressText.textContent = `${done.toLocaleString()} / ${total.toLocaleString()}`;
    }, cancelled);

    if (cancelled.value || analysisContext !== optimisationContext()) return;
    if (!result) { setStatus("Optimisation cancelled."); return; }
    if (!result.results.length) { setStatus("No valid results found."); return; }

    setStatus(`Optimisation complete — best CAGR: ${percent(result.results[0].metrics.cagr)}`);
    state.lastOptimiserResult = { ...result, context: analysisContext };
    renderOptimiserResults(result);
  } catch (error) {
    setStatus(`Optimisation failed: ${error.message}`);
  } finally {
    state.optimiserBusy = false;
    els.optimiserProgress.hidden = true;
    els.optimiseBtn.disabled = els.strategySelect.value === "buyhold";
    els.runBtn.disabled = false;
  }
}

function applyBestParams() {
  const result = state.lastOptimiserResult;
  if (!result?.results.length) return;
  if (result.context !== optimisationContext()) {
    hideOptimiserResults();
    setStatus("Settings changed. Optimise again before applying parameters.");
    return;
  }
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
  renderHoldings();
  els.optimiseBtn.disabled = els.strategySelect.value === "buyhold";
  selectSymbol(state.activeSymbol, false, { autoLoadParams: true }).then(() => refreshHoldings(false));
});
