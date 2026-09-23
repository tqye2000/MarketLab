const ALIASES = { BATS: "BATS.L" };

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const input = String(req.query.symbol || "AAPL").trim().toUpperCase().replace(/\.US$/, "");
  if (!/^[A-Z0-9.^=:_-]{1,40}$/.test(input)) return res.status(400).json({ error: "Invalid symbol" });
  const years = Math.min(Math.max(Number(req.query.years) || 3, 1), 10);
  const symbol = ALIASES[input] || input;
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - years);
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("period1", String(Math.floor(start.getTime() / 1000)));
  url.searchParams.set("period2", String(Math.floor(end.getTime() / 1000)));
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "MarketLab/1.0 (+research tool)", Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Yahoo Finance returned HTTP ${response.status}`);
    const payload = await response.json();
    const result = payload.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    const timestamps = result?.timestamp || [];
    if (!result || !quote || !timestamps.length) {
      throw new Error(payload.chart?.error?.description || "No historical data returned");
    }
    const rows = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      open: quote.open?.[index], high: quote.high?.[index], low: quote.low?.[index],
      close: quote.close?.[index], volume: quote.volume?.[index] || 0,
    })).filter((row) => Number.isFinite(row.close) && Number.isFinite(row.open))
      .sort((a, b) => a.date.localeCompare(b.date));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      meta: {
        symbol: result.meta?.symbol || symbol,
        currency: result.meta?.currency || "",
        shortName: result.meta?.shortName || "",
        longName: result.meta?.longName || "",
        displayName: result.meta?.displayName || "",
        exchangeName: result.meta?.exchangeName || "",
        instrumentType: result.meta?.instrumentType || "",
      },
      rows,
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
};
