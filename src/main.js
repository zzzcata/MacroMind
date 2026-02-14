import { getQuote, getNews, getMarketContext } from "./finnhub.js";
import { explainMove } from "./ai.js";

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

    // ONLY take first 5 headlines and use them everywhere
    const visibleNews = news.slice(0, 5);

    if (visibleNews.length === 0) {
      console.log("No relevant headlines found.");
    } else {
      visibleNews.forEach(n => console.log("•", n.title));
    }

    console.log("\nAI EXPLANATION:\n");

    // Send ONLY visible headlines to AI
    const explanation = await explainMove(
      ticker,
      quote,
      visibleNews,
      context
    );

    console.log(explanation);

  } catch (err) {
    console.error("\nError:", err.message);
  }
}

run();
