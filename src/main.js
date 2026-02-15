import { getQuote, getNews, getMarketContext } from "./finnhub.js";
import { explainMove } from "./ai.js";
import { buildReasoningContext } from "./reasoning.js";
import { buildEvidence } from "./evidence.js";

const ticker = process.argv[2] || "AAPL";

async function run() {
  try {
    console.log("\n=== MacroMind ===\n");
    console.log("Analyzing:", ticker);

    const quote = await getQuote(ticker);
    const news = await getNews(ticker);
    const context = await getMarketContext();

    console.log("\nPRICE:");
    console.log(`$${quote.current} (${quote.percent.toFixed(2)}%)`);

    console.log("\nNEWS:");

    const visibleNews = news.slice(0, 5);

    if (visibleNews.length === 0) {
      console.log("No relevant headlines found.");
    } else {
      visibleNews.forEach(n => console.log("•", n.title));
    }

    // deterministic reasoning layer
    const reasoning = buildReasoningContext(
      ticker,
      quote,
      context,
      visibleNews
    );

    // new evidence layer
    const evidence = buildEvidence(quote, context, visibleNews);

    console.log("\nGenerating structured analysis...\n");

    const aiResult = await explainMove(
      ticker,
      quote,
      visibleNews,
      context,
      reasoning,
      evidence
    );

    // FINAL STRUCTURED OUTPUT
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
        version: "MacroMind v1",
        architecture: "hybrid-intelligence"
      }
    };

    console.log(JSON.stringify(output, null, 2));

  } catch (err) {
    console.error("\nError:", err.message);
  }
}

run();
