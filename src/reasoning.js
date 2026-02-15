export function buildReasoningContext(ticker, quote, context, news) {
  const move = quote.percent;
  const spy = context.spyChange ?? 0;
  const qqq = context.qqqChange ?? 0;

  const absMove = Math.abs(move);

  // relative strength vs Nasdaq
  const relativeVsQQQ = move - qqq;

  let moveVsMarket = "inline";
  if (Math.sign(move) === Math.sign(qqq) && absMove > 0.5) {
    moveVsMarket = "with_market";
  } else if (Math.sign(move) !== Math.sign(qqq) && absMove > 0.5) {
    moveVsMarket = "against_market";
  }

  // move size classification
  let moveSize = "small";
  if (absMove > 3) moveSize = "large";
  else if (absMove > 1.5) moveSize = "medium";

  // news strength
  let newsStrength = "weak";
  if (news.length >= 3) newsStrength = "moderate";
  if (news.length >= 6) newsStrength = "strong";

  // primary driver pre-classification (system logic)
  let systemDriver = "unclear";

  if (moveVsMarket === "with_market") {
    systemDriver = "macro";
  } else if (moveVsMarket === "against_market" && newsStrength !== "weak") {
    systemDriver = "company";
  } else if (absMove < 1) {
    systemDriver = "noise";
  }

  return {
    move,
    absMove,
    moveSize,
    spy,
    qqq,
    relativeVsQQQ,
    moveVsMarket,
    newsCount: news.length,
    newsStrength,
    systemDriver
  };
}
