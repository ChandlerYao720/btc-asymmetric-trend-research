# BTC Asymmetric Trend Research

An interactive, evidence-grounded research console for a BTC/USDT trend system with a strict **1.0× leverage ceiling** and target exposure bounded between −100% and +100%.

[Open the interactive research page](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

![Interactive BTC strategy research preview](assets/preview.png?v=20260826c)

## Research thesis

The contribution is not the headline return by itself. The system separates five responsibilities:

1. A four-hour trend parent chooses direction from 20-, 55- and 100-bar Donchian votes.
2. Market state and volatility determine how much of the risk budget may be used.
3. A shallow, walk-forward decision tree may veto an existing short that is at high risk of a sharp rebound. It cannot open a long or increase exposure.
4. A time-causal maximum favorable excursion (MFE) state machine may reduce or exit after observed profit is given back. It cannot restore, flip or expand a position.
5. One-second best bid/ask observations may improve selected fills. This layer cannot change direction or size.

## Latest strict append-only replay

| Measure | Result |
| --- | ---: |
| Gross diagnostic cumulative return | +489.41% |
| Real-cost primary cumulative return | **+358.09%** |
| BTC buy-and-hold return | +87.58% |
| Maximum drawdown | −14.34% |
| Sharpe ratio | 2.35 |
| Calmar ratio | 5.41 |
| Information ratio vs BTC 1× | 0.49 |
| Closed-episode payoff ratio | 1.87× |
| Closed episodes | 284 |
| Leverage ceiling | 1.0× |
| Target exposure | −100% to +100% |

The primary path includes a 0.02% maker fee, a 0.05% taker fee, side-specific one-second best bid/ask execution where available, and no rebate. The page contains no higher-leverage scenario. Sharpe uses the four-hour C1 net-return series. Calmar is annualized return divided by the absolute maximum drawdown. Information ratio is the annualized mean four-hour active return versus same-clock BTC 1× divided by its tracking error. Closed-episode payoff is the mean winning one-times episode return divided by the absolute mean losing one-times episode return; the still-open final episode is excluded.

The interactive report includes:

- 5,806 draggable and zoomable four-hour candles;
- lifecycle bands and entry-price guides aligned to the candle clock;
- the signed target position beneath the market path;
- buy/sell adjustments, state-machine transitions, one-second fills and MFE actions as independent event layers;
- a scrubber for moving a fixed historical window through the full sample;
- cost-aware equity, benchmark and drawdown paths;
- common-window state/asymmetry comparisons and ablations;
- normalized long/short episode outcome distributions;
- explicit evidence and attribution boundaries.

## Interpreting the evidence

The headline report covers 2024-01-01 04:00 through 2026-08-25 16:00 UTC. The previous 5,550 decisions are held fixed and only later bars are appended. Since the prior artifact, the added window returned −1.90% net while BTC rose 27.52%; the model captured the August 19 impulse and the later August 22–25 leg, but stayed flat through the middle of the rally. The controlled ablation window still ends on 2026-06-25 08:00 UTC so every variant uses the same 5,438 observations.

Ablation differences overlap and should not be added. The state-by-asymmetry comparison is descriptive evidence within this frozen experiment, not a universal causal claim. Historical one-second fill improvements still require forward validation of online timing and queue behavior.

## Run locally

No build step is required.

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

The charting runtime is vendored from [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) under the Apache License 2.0; its license is retained in `assets/vendor/`.

## Scope

This repository publishes a visual research artifact and a sanitized historical evidence snapshot. It does not publish the private strategy implementation, internal experiment registry or live-trading infrastructure.

Historical research simulation only. Not live performance, investment advice or a promise of future returns.

— Qidong Yao
