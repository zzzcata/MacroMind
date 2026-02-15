# MacroMind — AI Market Move Explainer

MacroMind is a small AI-powered analysis engine that explains daily stock price movements using structured market data, news, and deterministic reasoning.

This project demonstrates how to design an AI product that is:
- grounded in real data
- transparent in reasoning
- explicit about uncertainty
- structured for API use

## What it does

Input:
Ticker (e.g. AAPL)

Output:
Structured JSON containing:
- market data
- macro context
- evidence scoring
- AI interpretation
- confidence + uncertainty

The system combines deterministic logic with LLM interpretation to avoid narrative hallucination.

## Architecture

Flow:

Finnhub API →  
Deterministic reasoning layer →  
Evidence scoring engine →  
LLM interpretation (OpenAI) →  
Structured JSON output

Key idea:
The AI does not invent explanations.  
It interprets only provided evidence.

## Why this project exists

Most AI demos generate narratives.

MacroMind attempts something different:
An evidence-based explanation engine that knows when it does NOT know.

Focus:
- hybrid intelligence (rules + LLM)
- structured outputs
- explicit confidence handling
- API-ready design

## Example usage

Run locally:

node src/main.js AAPL

Output:
Structured JSON analysis explaining the move.

## Tech stack

Node.js  
Finnhub API (market data + news)  
OpenAI API  
dotenv  

## Future ideas (not implemented)

- API endpoint deployment
- daily market brief
- portfolio tracking
- macro regime detection
- multi-stock comparison
- UI dashboard

## Author

Catalina Pandrea exploring AI-native product design and market intelligence tools.