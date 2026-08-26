<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

# Systematic BTC Research & Execution Stack

An evidence-backed portfolio of systematic BTC research: multi-horizon directional alpha, a causal five-state market-regime engine, volatility-scaled risk budgeting, a constrained walk-forward machine-learning veto, causal profit protection, and one-second microstructure research.

## ▶ [CLICK TO OPEN THE INTERACTIVE STRATEGY REPLAY](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

Drag or zoom through the four-hour candlestick tape, inspect the synchronized signed target, and toggle lifecycle, order, risk-state, profit-protection, and historical one-second L1 execution events.

[![Systematic BTC research and execution stack](assets/preview.png?v=20260826i)](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

## Quant snapshot

Verified historical replay from **2024-01-01 04:00 to 2026-08-25 16:00 UTC**, constrained to **1.0× maximum exposure**.

| Metric | Result | Metric | Result |
| --- | ---: | --- | ---: |
| Cost-adjusted cumulative return | **+358.09%** | CAGR | **+77.56%** |
| BTC 1.0× cumulative return | +87.58% | BTC CAGR | +26.78% |
| Annualized excess return | **+50.78%** | Maximum drawdown | **−14.34%** |
| Sharpe ratio | 2.35 | Sortino ratio | 3.20 |
| Calmar ratio | 5.41 | Information ratio vs BTC | 0.49 |
| Closed-episode payoff ratio | 1.87× | Profit factor | 1.84 |
| Closed-episode win rate | 49.65% | Closed episodes | 284 |
| Average holding period | 2.38 days | Trade adjustments | 1,035 |

The primary path deducts a **0.02% maker fee** and a **0.05% taker fee**, assumes **zero rebates**, and caps the signed target between **−100% and +100%**. The **+489.41%** gross result is retained only as a diagnostic; the headline result is the cost-adjusted path.

## System design

| Layer | Research function | Hard boundary |
| --- | --- | --- |
| **01 · Direction** | Multi-horizon Donchian voting on closed four-hour bars | Selects long, flat, or short only |
| **02 · Market regime** | Five-state causal engine using trend, volatility, channel, momentum, and derivatives-context families | Conditions risk; never creates direction |
| **03 · Risk budget** | Regime-aware, volatility-scaled target sizing | Exposure remains between −100% and +100% |
| **04 · ML risk veto** | Interpretable decision tree trained and tested through expanding-window time-forward splits | May map short to flat; never opens, flips, or enlarges |
| **05 · Profit protection** | Causal maximum favorable excursion state machine monitors profit giveback | May reduce or exit; never restores, reverses, or expands |
| **06 · Execution study** | Historical one-second L1 bid/ask evidence replaces selected fill prices | Changes price only; never changes side or size |
| **07 · Cost ledger** | Explicit fee, turnover, and fill accounting | Produces the cost-adjusted equity path |

The published architecture is intentionally descriptive rather than replicative. Exact factor definitions, thresholds, fitted tree rules, data joins, and production execution logic remain private.

## Machine learning and market regimes

The machine-learning component has a narrow decision mandate: classify adverse short contexts and veto exposure by mapping **short → flat**. It uses causal feature families spanning trend continuation, path quality, channel position, realized volatility, derivatives crowding, and parent-position context. Future outcomes are used only as training labels; inference uses information available at the decision timestamp.

The five-state market-regime engine is separate from the classifier. It converts trend strength, price location, directional momentum, realized volatility, funding/premium context, and open-interest/squeeze risk into a causal state used by the risk budget. Derivatives inputs inform state and crowding risk; they do not originate the directional signal.

## High-frequency research boundary

The headline backtest is a **four-hour strategy**, not a live HFT claim. The execution component shown here is a historical **one-second L1 study**:

- 94.11% observed L1 quote coverage across executed adjustments
- 63 event-selected execution overrides
- 61 affected trades
- +0.0188% mean selected price improvement

The private research library also covers one-second returns and volatility, L1 spread, microprice, queue imbalance, signed trade flow, VWAP divergence, event-time order-flow imbalance, multi-level depth, book slope, update intensity, and staleness. These capabilities are disclosed as research coverage, not attributed as primary P&L or presented as live execution parity.

## Validation evidence

- The interactive tape exposes 5,806 four-hour candles, synchronized signed targets, lifecycle bands, risk actions, profit-protection events, and historical L1 price events.
- Controlled diagnostics compare variants on a shared 5,438-bar window. Their effects overlap and must not be added together.
- The latest append-only refresh preserved 5,550 earlier targets and appended 256 new four-hour bars without rewriting the historical path.
- Equity, BTC 1.0×, and drawdown share one clock so each timestamp can be inspected directly.

For methodology and evidence limits, read the [Technical Model Note](docs/TECHNICAL_MODEL_NOTE.md). A compact architecture map is available in [Mermaid source](docs/decision-layer-map.mmd).

## Run locally

No build step is required.

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

The charting runtime is vendored from [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) under the Apache License 2.0; the license is retained in `assets/vendor/`.

## Repository scope

This repository contains a sanitized historical evidence snapshot and its interactive presentation layer. It does not publish the private implementation, fitted parameters, experiment registry, proprietary data contracts, or production trading infrastructure. Historical simulation only; not investment advice or a promise of future returns.

— Qidong Yao
