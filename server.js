const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = resolvePort();
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function resolvePort() {
  const portFlagIndex = process.argv.findIndex((arg) => arg === "--port" || arg === "-p");
  const portArg = portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : "";
  const inlinePortArg = process.argv.find((arg) => arg.startsWith("--port="));
  const rawPort = portArg || inlinePortArg?.split("=")[1] || process.env.PORT || "4173";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Invalid port: ${rawPort}`);
    process.exit(1);
  }
  return port;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function defaultSettings() {
  return {
    watchlist: ["AAPL", "MSFT", "NVDA", "SPY"],
    activeSymbol: "AAPL",
    rangeYears: "3",
    startingCapital: 10000,
    strategy: "sma",
    strategyParams: {},
    savedSymbolParams: {},
    longOnly: true,
    includeFees: true,
    showBuyHoldComparison: false,
    chartMode: "price",
    volumeInterval: 1,
    volumeMode: "split",
    zoomStart: "",
    zoomEnd: "",
  };
}

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return defaultSettings();
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

function sanitizeSettings(input) {
  const defaults = defaultSettings();
  const settings = { ...defaults, ...input };
  const watchlist = Array.isArray(settings.watchlist)
    ? settings.watchlist.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
    : defaults.watchlist;

  return {
    watchlist: watchlist.length ? [...new Set(watchlist)] : defaults.watchlist,
    activeSymbol: String(settings.activeSymbol || defaults.activeSymbol).trim().toUpperCase(),
    rangeYears: ["1", "2", "3", "5", "10"].includes(String(settings.rangeYears)) ? String(settings.rangeYears) : defaults.rangeYears,
    startingCapital: Math.max(Number(settings.startingCapital) || defaults.startingCapital, 100),
    strategy: ["sma", "rsi", "breakout", "buyhold"].includes(String(settings.strategy)) ? String(settings.strategy) : defaults.strategy,
    strategyParams: settings.strategyParams && typeof settings.strategyParams === "object" ? settings.strategyParams : {},
    savedSymbolParams: settings.savedSymbolParams && typeof settings.savedSymbolParams === "object" ? settings.savedSymbolParams : {},
    longOnly: Boolean(settings.longOnly),
    includeFees: Boolean(settings.includeFees),
    showBuyHoldComparison: Boolean(settings.showBuyHoldComparison),
    chartMode: ["price", "equity", "drawdown"].includes(String(settings.chartMode)) ? String(settings.chartMode) : defaults.chartMode,
    volumeInterval: [1, 3, 7, 14, 30].includes(Number(settings.volumeInterval)) ? Number(settings.volumeInterval) : defaults.volumeInterval,
    volumeMode: ["split", "net", "integrated"].includes(String(settings.volumeMode)) ? String(settings.volumeMode) : defaults.volumeMode,
    zoomStart: String(settings.zoomStart || ""),
    zoomEnd: String(settings.zoomEnd || ""),
  };
}

function writeSettings(settings) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, `${JSON.stringify(sanitizeSettings(settings), null, 2)}\n`);
}

function safeFilePath(urlPath) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const resolved = path.resolve(PUBLIC_DIR, `.${decodeURIComponent(requested)}`);
  return resolved.startsWith(PUBLIC_DIR) ? resolved : null;
}

function yahooSymbol(symbol) {
  const normalized = String(symbol || "AAPL").trim().toUpperCase().replace(/\.US$/, "");
  const aliases = {
    BATS: "BATS.L",
  };
  return aliases[normalized] || normalized;
}

function unixSeconds(date) {
  return Math.floor(date.getTime() / 1000);
}

async function fetchHistory(symbol, years) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - Math.min(Math.max(Number(years) || 3, 1), 10));

  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol(symbol))}`);
  url.searchParams.set("period1", String(unixSeconds(start)));
  url.searchParams.set("period2", String(unixSeconds(end)));
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MarketLab/1.0 (+local research tool)",
      "Accept": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Yahoo Finance returned HTTP ${response.status}`);

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp || [];
  if (!result || !quote || !timestamps.length) {
    const message = payload.chart?.error?.description || "No historical data returned";
    throw new Error(message);
  }

  const rows = timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      open: quote.open?.[index],
      high: quote.high?.[index],
      low: quote.low?.[index],
      close: quote.close?.[index],
      volume: quote.volume?.[index] || 0,
    }))
    .filter((row) => Number.isFinite(row.close) && Number.isFinite(row.open))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    meta: {
      symbol: result.meta?.symbol || yahooSymbol(symbol),
      currency: result.meta?.currency || "",
      shortName: result.meta?.shortName || "",
      longName: result.meta?.longName || "",
      displayName: result.meta?.displayName || "",
      exchangeName: result.meta?.exchangeName || "",
      instrumentType: result.meta?.instrumentType || "",
    },
    rows,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (requestUrl.pathname === "/api/health") {
      send(res, 200, JSON.stringify({ ok: true }), { "Content-Type": "application/json; charset=utf-8" });
      return;
    }

    if (requestUrl.pathname === "/api/settings" && req.method === "GET") {
      send(res, 200, JSON.stringify(readSettings()), { "Content-Type": "application/json; charset=utf-8" });
      return;
    }

    if (requestUrl.pathname === "/api/settings" && req.method === "POST") {
      const settings = sanitizeSettings(await readJsonBody(req));
      writeSettings(settings);
      send(res, 200, JSON.stringify(settings), { "Content-Type": "application/json; charset=utf-8" });
      return;
    }

    if (requestUrl.pathname === "/api/history") {
      const history = await fetchHistory(requestUrl.searchParams.get("symbol"), requestUrl.searchParams.get("years"));
      send(res, 200, JSON.stringify(history), { "Content-Type": "application/json; charset=utf-8" });
      return;
    }

    const filePath = safeFilePath(requestUrl.pathname);
    if (!filePath) {
      send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
        return;
      }
      const contentType = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
      send(res, 200, data, { "Content-Type": contentType });
    });
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }), { "Content-Type": "application/json; charset=utf-8" });
  }
});

server.listen(PORT, () => {
  console.log(`MarketLab is running at http://localhost:${PORT}`);
});
