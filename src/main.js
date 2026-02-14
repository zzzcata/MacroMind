import { getQuote, getNews } from "./finnhub.js";
import { explainMove } from "./ai.js";

const ticker = process.argv[2] || "AAPL";

async function run() {
  try {
    console.log("\n=== MacroMind ===\n");
    console.log("Analyzing:", ticker);

    const quote = await getQuote(ticker);
    const news = await getNews(ticker);

    console.log("\nPRICE:");
    console.log(`$${quote.current} (${quote.percent.toFixed(2)}%)`);

    console.log("\nNEWS:");
    news.slice(0,5).forEach(n => console.log("•", n.title));

    console.log("\nAI EXPLANATION:\n");

    const explanation = await explainMove(ticker, quote, news);
    console.log(explanation);

  } catch (err) {
    console.error("\nError:", err.message);
  }
}

run();
