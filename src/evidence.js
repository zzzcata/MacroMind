export function buildEvidence(quote, context, news) {
  const move = Math.abs(quote.percent);
  const qqq = context.qqqChange ?? 0;

  // 1. move significance
  let moveSignificance = "noise";
  if (move > 4) moveSignificance = "large";
  else if (move > 2) moveSignificance = "meaningful";
  else if (move > 1) moveSignificance = "small";

  // 2. market alignment
  let marketAlignment = "neutral";
  if (move < 1) marketAlignment = "neutral";
  else if (Math.sign(quote.percent) === Math.sign(qqq))
    marketAlignment = "with_market";
  else
    marketAlignment = "against_market";

  // 3. headline scoring
  let score = 0;

  news.forEach(n => {
    const t = n.title.toLowerCase();

    // strong signals
    if (move > 2) {
      if (t.includes("regulation") || t.includes("lawsuit")) score += 3;
    }

    if (
      t.includes("earnings") ||
      t.includes("guidance") ||
      t.includes("upgrade") ||
      t.includes("downgrade") ||
      t.includes("product")
    ) score += 3;

    // company mention
    if (t.includes("apple") || t.includes("aapl")) score += 2;

    // negative relevance
    if (t.includes("top") || t.includes("stocks to buy")) score -= 2;
    if (t.includes("ai boom") || t.includes("market wrap")) score -= 1;
  });

  const headlineScore = score;

  // 4. evidence strength
  let evidenceStrength = "weak";

  if (
    (moveSignificance === "meaningful" || moveSignificance === "large") &&
    headlineScore >= 3
  ) evidenceStrength = "strong";
  else if (moveSignificance === "meaningful" && headlineScore >= 1)
    evidenceStrength = "moderate";

  // 5. system bias
  let systemBias = "unclear";

  if (marketAlignment === "with_market" && evidenceStrength === "weak")
    systemBias = "macro";
  else if (marketAlignment === "against_market" && evidenceStrength === "strong")
    systemBias = "company";
  else if (evidenceStrength === "weak")
    systemBias = "unclear";
  else
    systemBias = "mixed";

  return {
    moveSignificance,
    marketAlignment,
    headlineScore,
    evidenceStrength,
    systemBias
  };
}
