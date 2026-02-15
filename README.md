# MacroMind

AI-powered market move explainer.

Enter a stock ticker and receive a structured explanation of why the stock moved based on price data, market context, and recent news.

## Features

- Real-time stock data (price, % move, volume context)
- Market context (SPY, QQQ comparison)
- News ingestion and filtering
- Deterministic reasoning engine (pre-AI classification)
- Evidence scoring layer
- Structured AI-generated explanation
- 5-minute caching to reduce API cost
- JSON output for transparency and auditability

## Run locally

node src/main.js AAPL

## Output

Structured JSON analysis explaining likely drivers behind the move.

## Tech stack

Node.js  
Finnhub API (market data + news)  
OpenAI API  
dotenv  
File-based caching  

## Architecture

Hybrid intelligence system:

Deterministic signals → Evidence layer → LLM reasoning → Structured output

This avoids “black box AI” and ensures explanations are grounded in data.

## Future ideas

- API endpoint deployment
- daily market brief
- portfolio tracker
- macro regime detection
- multi-stock comparison
- simple UI dashboard

## Author

zzzCata exploring AI-native product design and market intelligence systems.
