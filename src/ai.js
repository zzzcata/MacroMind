import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function explainMove(ticker, priceData, news) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env");
  }

  const newsBlock = news.length === 0
    ? "No recent relevant headlines found."
    : news.map(n => `- ${n.title} (${n.source})`).join("\n");

  const prompt = `
You are a calm, rational market analyst.

Explain why this stock moved.

TICKER: ${ticker}

PRICE DATA:
Current price: ${priceData.current}
Change: ${priceData.change}
Percent change: ${priceData.percent}%
High: ${priceData.high}
Low: ${priceData.low}
Open: ${priceData.open}
Previous close: ${priceData.prevClose}

RECENT NEWS:
${newsBlock}

TASK:
1. Explain in plain English what likely moved the stock (max 120 words)
2. Give exactly 3 bullet point drivers
3. Say if this is short-term noise or structural
4. Add uncertainty note if evidence weak

RULES:
- No hype
- No financial advice
- If unclear → say uncertain
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return res.choices[0].message.content;
}
