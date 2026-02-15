import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function explainMove(ticker, quote, news, context, reasoning, evidence) {

  const headlines =
    news.length === 0
      ? "NO_RELEVANT_NEWS"
      : news.map((n, i) => `news:${i + 1} | ${n.title}`).join("\n");

  const prompt = `
You are MacroMind, an evidence-based market intelligence engine. You are a cautious market analyst. Avoid narrative bias.

Return ONLY valid JSON. No extra text.

INPUT
Ticker: ${ticker}
Move: ${quote.percent}%
SPY: ${context.spyChange}%
QQQ: ${context.qqqChange}%

SYSTEM SIGNALS
move_size: ${reasoning.moveSize}
move_vs_market: ${reasoning.moveVsMarket}
relative_strength_vs_qqq: ${reasoning.relativeVsQQQ}
news_count: ${reasoning.newsCount}
news_strength: ${reasoning.newsStrength}
system_bias: ${reasoning.systemDriver}

EVIDENCE ASSESSMENT
move_significance: ${evidence.moveSignificance}
market_alignment: ${evidence.marketAlignment}
headline_score: ${evidence.headlineScore}
evidence_strength: ${evidence.evidenceStrength}
system_bias: ${evidence.systemBias}

HEADLINES
${headlines}

OUTPUT JSON:

{
  "primary_driver": "macro | company | sector | unclear",
  "summary": "max 120 words, professional but readable",

  "drivers": [
    {
      "label": "",
      "type": "macro | company | sector | flow | unclear",
      "evidence": ["news:1", "ctx:spy", "ctx:qqq"],
      "strength": "high | medium | low"
    },
    {
      "label": "",
      "type": "macro | company | sector | flow | unclear",
      "evidence": [],
      "strength": "high | medium | low"
    },
    {
      "label": "",
      "type": "macro | company | sector | flow | unclear",
      "evidence": [],
      "strength": "high | medium | low"
    }
  ],

  "classification": "short-term | structural | unclear",

  "confidence": {
    "level": "high | medium | low",
    "rationale": ""
  },

  "missing_data": []
}

RULES
- JSON only
- No markdown
- No commentary outside JSON
- Use only provided headlines
- Evidence must reference news:X or ctx values
- If headlines are generic or weak → say so explicitly
- Do NOT assume causality without strong evidence
- If multiple weak headlines → classify as "unclear" or "mixed"
- If evidence_strength = weak → confidence must be low
- If evidence_strength = strong but ambiguous → confidence medium
- Only use "high" confidence if a clear causal headline exists
- Always return EXACTLY 3 drivers
- One driver may be "unclear" if needed
- Fill missing_data when evidence incomplete (earnings, guidance, macro data etc)
- Treat generic strategy headlines as weak evidence unless directly tied to move
- If multiple plausible drivers exist → lower confidence
- If causality uncertain → include note in summary
- Use missing_data when earnings, guidance or macro catalyst absent
- High confidence ONLY if one clear causal headline directly linked to move
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.choices[0].message.content.trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("AI RAW OUTPUT:", text);
    throw new Error("AI did not return valid JSON");
  }
}
