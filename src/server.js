import express from "express";
import { getQuote, getNews, getMarketContext } from "./finnhub.js";
import { explainMove } from "./ai.js";
import { buildReasoningContext } from "./reasoning.js";
import { buildEvidence } from "./evidence.js";
import { getCached, setCached } from "./cache.js";

const app = express();
const PORT = 3000;

// Health check
app.get("/", (req, res) => {
  res.send("MacroMind API running");
});

// Analyze endpoint
app.get("/analyze", async (req, res) => {
  try {
    const ticker = req.query.ticker;

    if (!ticker) {
      return res.status(400).json({
        error: "Missing ticker. Use /analyze?ticker=AAPL"
      });
    }

    const cacheKey = `analysis:${ticker}`;
    const cached = getCached(cacheKey);

    if (cached) {
      console.log("Returning cached result");
      return res.json(cached);
    }

    console.log("Fetching fresh data for", ticker);

    const quote = await getQuote(ticker);
    const news = await getNews(ticker);
    const context = await getMarketContext();

    const visibleNews = news.slice(0, 5);

    const reasoning = buildReasoningContext(
      ticker,
      quote,
      context,
      visibleNews
    );

    const evidence = buildEvidence(quote, context, visibleNews);

    const aiResult = await explainMove(
      ticker,
      quote,
      visibleNews,
      context,
      reasoning,
      evidence
    );

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
      evidence: evidence,
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

    res.json(output);

  } catch (err) {
    console.error("API error:", err.message);

    res.status(500).json({
      error: "Analysis failed",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MacroMind API running on http://localhost:${PORT}`);
});
