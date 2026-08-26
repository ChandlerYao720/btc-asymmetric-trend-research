<p align="right">
  <strong>English</strong> | <a href="./README.zh-CN.md">简体中文</a>
</p>

# BTC Asymmetric Trend Strategy

A cost-adjusted BTC/USDT directional strategy expressed as bounded long/short exposure. The system separates signal direction, risk allocation, short-side filtering, profit protection and execution so that every layer has a narrow, auditable responsibility.

## ▶ [CLICK HERE TO LAUNCH THE INTERACTIVE STRATEGY REPLAY](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

Drag and zoom through the four-hour candlestick history, inspect the synchronized target position, and toggle lifecycle, order, market-state, profit-guard and one-second execution events.

[![Interactive BTC asymmetric trend strategy replay](assets/preview.png?v=20260826f)](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

## Strategy architecture

| Layer | Decision | Hard boundary |
| --- | --- | --- |
| **01 · Direction** | 20-, 55- and 100-bar Donchian votes on closed four-hour bars | Sets the side only |
| **02 · Risk budget** | Market state and realized volatility determine target size | Exposure remains between −100% and +100% |
| **03 · Short-risk veto** | A shallow walk-forward decision tree filters rebound-prone shorts | May flatten an existing short; never opens or enlarges a position |
| **04 · Profit guard** | A time-causal maximum favorable excursion state machine reacts to profit giveback | May reduce or exit; never restores, flips or expands |
| **05 · Execution** | Observed one-second best bid/ask may replace selected fills | Changes fill price only, not direction or size |

## Verified replay

Historical replay from **2024-01-01 04:00 to 2026-08-25 16:00 UTC**, with a hard **1.0× leverage ceiling**.

| Metric | Result |
| --- | ---: |
| Cost-adjusted cumulative return | **+358.09%** |
| Gross diagnostic cumulative return | +489.41% |
| BTC buy-and-hold return | +87.58% |
| Maximum drawdown | −14.34% |
| Sharpe ratio | 2.35 |
| Calmar ratio | 5.41 |
| Information ratio vs BTC 1× | 0.49 |
| Closed-episode payoff ratio | 1.87× |
| Closed episodes | 284 |
| Target exposure | −100% to +100% |

The primary path deducts a **0.02% maker fee** and a **0.05% taker fee**, uses side-specific one-second best bid/ask where evidence is available, and assumes **zero rebates**. The +489.41% C0 figure is retained as a gross diagnostic, not presented as the investable result.

## What the dashboard exposes

- **Decision tape:** Drag and zoom across 5,806 four-hour candles while the signed target position stays synchronized below.
- **Event layers:** Toggle long/short lifecycle bands, buy/sell adjustments, market-state changes, profit-guard actions and one-second fills independently.
- **Performance path:** Compare the cost-adjusted strategy path with same-clock BTC 1× and inspect drawdown at the same timestamp.
- **Controlled diagnostics:** Review same-window variants, state/side asymmetry and normalized long/short episode outcomes.

The controlled diagnostics use the same 5,438-bar window. Variant differences overlap and should be interpreted individually rather than added together.

## Run locally

No build step is required.

```bash
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000/`.

The charting runtime is vendored from [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) under the Apache License 2.0; its license is retained in `assets/vendor/`.

## Public scope

This repository contains the interactive strategy replay and a sanitized historical evidence snapshot. The private implementation, experiment registry and live-trading infrastructure are not published. Historical simulation only; not investment advice or a promise of future returns.

— Qidong Yao
