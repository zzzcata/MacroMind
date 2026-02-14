import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function explainMove(ticker, priceData, news, context) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env");
  }

  const newsBlock =
    news.length === 0
      ? "No relevant company news found."
      : news.map(n => `- ${n.title} (${n.source})`).join("\n");

  const prompt = `
You are MacroMind, a strict evidence-based market analyst.

You can ONLY use:
- provided price data
- provided headlines
- provided market context

If a reason is NOT explicitly present in headlines,
you MUST say: "No clear company-specific news."

You are NOT allowed to invent or assume news.

TICKER: ${ticker}

PRICE MOVE:
${priceData.percent}% (${priceData.change})

MARKET:
SPY: ${context.spyChange}%
QQQ: ${context.qqqChange}%

HEADLINES (ONLY SOURCE OF TRUTH):
${newsBlock}

TASK:

1. Primary driver (choose ONE):
- macro/market-wide move
- company-specific news (ONLY if explicitly in headlines)
- sector move
- no clear driver

2. Explanation (max 100 words)
Use ONLY headlines above.

3. 3 drivers:
Each driver must reference either:
- a headline
- or market movement

4. Classification:
- short-term
- structural
- unclear

5. Confidence:
High / Medium / Low
Low if evidence weak or generic headlines.

STRICT RULES:
- If headlines are generic market news → NOT company-specific
- If no headline mentions company event → say "no clear driver"
- Never invent product delays, earnings, guidance, etc.
- If unsure → say uncertainty clearly
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
}
