# MacroMind

AI-powered market move explainer.

Enter a stock ticker and receive a structured explanation of why the stock moved based on price data, market context, and recent news.

Live demo:
https://macromind-api-3edn.onrender.com/analyze?ticker=AAPL

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

## System architecture

MacroMind is designed as a hybrid intelligence system:

1. Market data ingestion (price + news)
2. Deterministic signal detection
3. Evidence scoring layer
4. AI reasoning constrained by data
5. Structured JSON output
6. 5-minute caching layer
7. Deployable API endpoint

This approach avoids black-box AI outputs and ensures explanations remain grounded in verifiable inputs.

## Future ideas

- API endpoint deployment
- daily market brief
- portfolio tracker
- macro regime detection
- multi-stock comparison
- simple UI dashboard

## Author

zzzCata exploring AI-native product design and market intelligence systems.
