import axios from "axios";
import "dotenv/config";

const API_KEY = process.env.FINNHUB_API_KEY;

if (!API_KEY) {
  throw new Error("Missing FINNHUB_API_KEY in .env");
}

// --------------------------------------------------
// SEARCH TICKER BY COMPANY NAME
// --------------------------------------------------
export async function searchTicker(query) {
  try {
    const res = await axios.get(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
    );

    if (!res.data.result || res.data.result.length === 0) {
      return null;
    }

    // best match
    return res.data.result[0].symbol;

  } catch (err) {
    console.error("Ticker search failed");
    return null;
  }
}

// --------------------------------------------------
// GET QUOTE
// --------------------------------------------------
export async function getQuote(ticker) {
  try {
    const res = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY}`
    );

    if (!res.data || res.data.c === 0) {
      throw new Error("Invalid ticker or no data");
    }

    return {
      current: res.data.c,
      change: res.data.d,
      percent: res.data.dp,
      high: res.data.h,
      low: res.data.l,
      open: res.data.o,
      prevClose: res.data.pc,
      timestamp: res.data.t,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to fetch market data"
    );
  }
}

// --------------------------------------------------
// GET NEWS
// --------------------------------------------------
export async function getNews(ticker) {
  try {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 2);

    const format = d => d.toISOString().split("T")[0];

    const res = await axios.get(
      `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${format(from)}&to=${format(today)}&token=${API_KEY}`
    );

    if (!res.data || res.data.length === 0) {
      return [];
    }

    // take top 7 recent headlines
    return res.data
      .slice(0, 7)
      .map(n => ({
        title: n.headline,
        source: n.source,
        datetime: new Date(n.datetime * 1000).toLocaleString(),
        url: n.url
      }));

  } catch (err) {
    throw new Error("Failed to fetch news");
  }
}

// --------------------------------------------------
// MARKET CONTEXT (SPY + QQQ)
// --------------------------------------------------
export async function getMarketContext() {
  try {
    const spy = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=SPY&token=${API_KEY}`
    );

    const qqq = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=QQQ&token=${API_KEY}`
    );

    return {
      spyChange: spy.data.dp,
      qqqChange: qqq.data.dp
    };
  } catch (err) {
    return {
      spyChange: null,
      qqqChange: null
    };
  }
}
