import express from "express";
import cors from "cors";
import { getQuote, getNews, getMarketContext } from "./finnhub.js";
import { explainMove } from "./ai.js";
import { buildReasoningContext } from "./reasoning.js";
import { buildEvidence } from "./evidence.js";
import { getCached, setCached } from "./cache.js";

const app = express();
app.use(cors());

const PORT = 3000;

// Health check
app.get("/", (req, res) => {
  res.send("MacroMind API running");
});

// Analyze endpoint
app.get("/analyze", async (req, res) => {
  try {
    const tickerRaw = req.query.ticker;

    if (!tickerRaw) {
      return res.status(400).json({
        error: "Missing ticker",
        message: "Use /analyze?ticker=AAPL"
      });
    }

    const ticker = tickerRaw.toUpperCase().trim();

    if (!/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(ticker)) {
      return res.status(400).json({
        error: "Invalid ticker format",
        message: "Ticker must be letters only (e.g. AAPL, MSFT)"
      });
    }

    const cacheKey = `analysis:${ticker}`;
    const cached = getCached(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${ticker}`);
      return res.json(cached);
    }

    console.log(`[FETCH] ${ticker}`);

    // FETCH DATA
    let quote, news, context;

    try {
      quote = await getQuote(ticker);
      news = await getNews(ticker);
      context = await getMarketContext();
    } catch (apiErr) {
      console.error("[DATA API ERROR]", apiErr.message);

      return res.status(503).json({
        error: "Market data unavailable",
        message: "Upstream API failed or rate-limited"
      });
    }

    if (!quote || !quote.current) {
      return res.status(404).json({
        error: "Ticker not found",
        message: `No market data for ${ticker}`
      });
    }

    const visibleNews = (news || []).slice(0, 5);

    const reasoning = buildReasoningContext(
      ticker,
      quote,
      context,
      visibleNews
    );

    const evidence = buildEvidence(quote, context, visibleNews);

    let aiResult;

    try {
      aiResult = await explainMove(
        ticker,
        quote,
        visibleNews,
        context,
        reasoning,
        evidence
      );
    } catch (aiErr) {
      console.error("[AI ERROR]", aiErr.message);

      return res.status(503).json({
        error: "AI analysis failed",
        message: "LLM unavailable or rate-limited"
      });
    }

    const output = {
      request: {
        ticker,
        timeframe: "1d",
        generated_at: new Date().toISOString()
      },
      facts: {
        price: quote.current,
        pct_change_1d: quote.percent,
        abs_change: quote.change,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        prev_close: quote.prevClose,
        market: {
          spy_pct: context.spyChange,
          qqq_pct: context.qqqChange
        }
      },
      signals: reasoning,
      evidence,
      news: visibleNews.map((n, i) => ({
        id: `news:${i + 1}`,
        title: n.title,
        source: n.source,
        published_at: n.datetime,
        url: n.url
      })),
      interpretation: aiResult,
      meta: {
        model: "gpt-4o-mini",
        version: "MacroMind API v1",
        architecture: "hybrid-intelligence"
      }
    };

    setCached(cacheKey, output);

    console.log(`[OK] ${ticker} analyzed`);
    res.json(output);

  } catch (err) {
    console.error("[FATAL]", err);

    res.status(500).json({
      error: "Internal server error",
      message: "Unexpected failure"
    });
  }
});

app.listen(PORT, () => {
  console.log(`MacroMind API running on http://localhost:${PORT}`);
});
