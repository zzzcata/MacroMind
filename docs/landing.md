# MacroMind — AI Market Intelligence Engine

Live API:
https://macromind-api-3edn.onrender.com/analyze?ticker=AAPL

## What this is

MacroMind is an AI-assisted market intelligence backend that explains daily stock moves using structured data + reasoning layers.

This is not a chatbot wrapper.

It is a hybrid system combining:
- deterministic signal detection
- evidence scoring
- structured LLM reasoning
- transparent JSON output

## Why it exists

Most AI finance tools generate ungrounded narratives.

MacroMind first builds a factual market context, then lets the model reason only inside verified signals.

Goal:
explain market moves with evidence, not hallucination.

## How it works

Pipeline:

Market data → Signal engine → Evidence layer → AI reasoning → Structured output → Cache

Key design decision:
AI never guesses without data.  
If evidence is weak → output says so explicitly.

## Example endpoint

/analyze?ticker=AAPL

Returns:

- price move context  
- market comparison (SPY/QQQ)  
- relevant headlines  
- detected drivers  
- confidence level  
- missing data flags  

All in structured JSON.

## Architecture principles

- hybrid intelligence (rules + LLM)
- cost-aware (caching layer)
- deployable backend (Render)
- explainable output
- modular for UI or automation

## Tech stack

Node.js  
Express API  
OpenAI  
Finnhub market data  
File-based caching  
Render deployment  

## Why this project

Built to explore:
AI-native product design  
explainable financial intelligence  
real-world LLM integration  
production-minded architecture  

## Next steps

UI dashboard  
multi-stock compare  
macro brief endpoint  
portfolio intelligence layer
