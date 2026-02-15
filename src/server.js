import express from "express";
import cors from "cors";
import {
  getQuote,
  getNews,
  getMarketContext,
  searchTicker
} from "./finnhub.js";
import { explainMove } from "./ai.js";
import { buildReasoningContext } from "./reasoning.js";
import { buildEvidence } from "./evidence.js";
import { getCached, setCached } from "./cache.js";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// -----------------------------
// HEALTH CHECK
// -----------------------------
app.get("/", (req, res) => {
  res.send("MacroMind API running");
});

// -----------------------------
// ANALYZE ENDPOINT
// -----------------------------
app.get("/analyze", async (req, res) => {
  try {
    const input = req.query.ticker;

    if (!input) {
      return res.status(400).json({
        error: "Missing ticker",
        message: "Use /analyze?ticker=AAPL or company name"
      });
    }

    let ticker = input.toUpperCase().trim();

    // -----------------------------------------
    // IF NOT TICKER FORMAT → SEARCH COMPANY NAME
    // -----------------------------------------
    if (!/^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(ticker)) {
      console.log(`[SEARCH] resolving name: ${input}`);

      try {
        const resolved = await searchTicker(input);

        if (!resolved) {
          return res.status(404).json({
            error: "Symbol not found",
            message: "Could not resolve company name"
          });
        }

        ticker = resolved;
        console.log(`[RESOLVED] ${input} → ${ticker}`);
      } catch (e) {
        console.error("[SEARCH ERROR]", e.message);

        return res.status(503).json({
          error: "Search failed",
          message: "Ticker resolution unavailable"
        });
      }
    }

    // -----------------------------------------
    // CACHE
    // -----------------------------------------
    const cacheKey = `analysis:${ticker}`;
    const cached = getCached(cacheKey);

    if (cached) {
      console.log(`[CACHE HIT] ${ticker}`);
      return res.json(cached);
    }

    console.log(`[FETCH] ${ticker}`);

    // -----------------------------------------
    // FETCH DATA
    // -----------------------------------------
    let quote, news, context;

    try {
      quote = await getQuote(ticker);
      news = await getNews(ticker);
      context = await getMarketContext();
    } catch (apiErr) {
      console.error("[DATA API ERROR]", apiErr.message);

      return res.status(503).json({
        error: "Market data unavailable",
        message: "Finnhub rate limit or API failure"
      });
    }

    if (!quote || !quote.current) {
      return res.status(404).json({
        error: "Ticker not found",
        message: `No market data for ${ticker}`
      });
    }

    const visibleNews = (news || []).slice(0, 5);

    // -----------------------------------------
    // REASONING + EVIDENCE
    // -----------------------------------------
    const reasoning = buildReasoningContext(
      ticker,
      quote,
      context,
      visibleNews
    );

    const evidence = buildEvidence(quote, context, visibleNews);

    // -----------------------------------------
    // AI ANALYSIS
    // -----------------------------------------
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
        message: "OpenAI unavailable or rate-limited"
      });
    }

    // -----------------------------------------
    // FINAL OUTPUT
    // -----------------------------------------
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

    // SAVE CACHE
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

// -----------------------------
app.listen(PORT, () => {
  console.log(`MacroMind API running on http://localhost:${PORT}`);
});
