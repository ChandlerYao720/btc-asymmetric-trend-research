<p align="right">
  <strong>English</strong> · <a href="./TECHNICAL_MODEL_NOTE.zh-CN.md">简体中文</a>
</p>

# Technical Model Note

## Public research claim

This artifact demonstrates a systematic BTC research workflow in which directional alpha, risk allocation, machine-learning controls, lifecycle management, execution research, and cost accounting are separated by design. The published performance is a **1.0× historical simulation**, not a live-trading record and not an HFT production claim.

The public package exposes architecture, time-series decisions, controlled comparisons, and evidence limits. It withholds exact factor formulas, thresholds, fitted tree rules, data joins, and production execution logic.

## Decision-layer map

| Stage | Purpose | Observable input | Transformation | Output | Downstream action | Failure boundary |
| --- | --- | --- | --- | --- | --- | --- |
| Multi-horizon trend | Establish direction | Closed four-hour OHLC bars | Channel votes across multiple horizons | Long, flat, or short | Passed to regime and risk layers | Has no authority over leverage or fill price |
| Market regime | Describe the current risk environment | Trend strength, price location, momentum, realized volatility, and derivatives-context families | Causal five-state mapping | Market-state label | Conditions the target risk budget | Cannot originate a trade direction |
| Risk budget | Convert a view into bounded exposure | Direction, regime, and realized volatility | State-aware volatility scaling | Signed target exposure | Passed to the ML veto and lifecycle controls | Hard-clipped to −100% through +100% |
| ML short-risk veto | Remove historically adverse short contexts | Causal trend, path, volatility, derivatives, and position-context features | Interpretable classifier with expanding-window time-forward validation | Keep short or map short to flat | Modifies the candidate target | Cannot open, reverse, or enlarge exposure |
| Causal MFE guard | Protect profits after favorable movement | Entry state, visible profit path, and profit giveback observed to date | Recursive state machine | Keep, reduce, or exit | Produces the protected target path | Cannot restore, reverse, or expand after acting |
| Historical 1s L1 study | Test selected fill-price improvement | Observed best bid and ask near eligible events | Event-selected historical price replacement | Adjusted fill price | Passed to the cost ledger | Cannot change side or target size |
| Real-cost ledger | Produce the primary equity path | Fills, turnover, fees, and target changes | Sequential portfolio accounting | Net equity and drawdown | Performance and risk reporting | Uses zero rebates and fixed public fee assumptions |

The system is intentionally hierarchical. A later layer may narrow an earlier decision only within its stated authority.

## Machine-learning policy

The classifier is not the alpha engine. Its task is **bad-short classification**: estimate whether a proposed short resembles historically adverse short contexts, then veto the exposure by mapping **short → flat**.

The model uses an interpretable decision-tree family and expanding-window time-forward splits. Earlier years form the training window and the subsequent year forms the evaluation window. Feature families include:

- multi-horizon return and trend continuation;
- path efficiency and trend strength;
- channel position and directional momentum;
- realized volatility;
- funding, open-interest, premium, and squeeze-risk context;
- the parent target-position context.

Future price outcomes are used only to construct training labels. At inference time, the classifier receives contemporaneously available features. The exact label threshold, probability threshold, fitted tree structure, and feature-level parameters are private.

The controlled common-window replay reports **+304.18%** without the bad-short veto versus **+349.14%** for the parent configuration with the veto and related active structure. This is an overlapping system comparison, not an additive attribution claim.

## Five-state market-regime engine

The regime layer maps the observable market environment into five causal states. It combines trend strength, channel location, directional momentum, realized volatility, funding and premium context, and open-interest or squeeze-risk information.

Its role is to condition the risk budget and suppress fragile short exposure. It does not determine direction. On the controlled common window, removing market-state conditioning reduces cumulative return from **+349.14%** to **+222.41%**; removing long/short asymmetry reduces it to **+254.82%**. These differences overlap and must be interpreted separately.

## Causal lifecycle control

Maximum Favorable Excursion (MFE) means the largest unrealized gain observed so far within an open position. The lifecycle state machine compares the current unrealized outcome with the profit path visible at that timestamp. When profit giveback becomes material, it may reduce exposure or exit.

The guard is recursive and close-only: each action changes the future position state. It cannot restore a reduced position, reverse direction, or increase exposure. In the controlled overlay replay, the parent path reports **+349.14%** and the parent plus the MFE guard reports **+365.79%**.

## One-second microstructure research

The headline strategy makes decisions on four-hour bars. The one-second component is a **historical L1 execution study**, not a live high-frequency trading claim.

For selected historical events, the study uses observed best bid or ask evidence to replace the modeled fill price. The overlay changes execution price only; it cannot change signal direction or target size.

| Execution evidence | Result |
| --- | ---: |
| L1 quote coverage | 94.11% |
| Selected historical events | 63 |
| Affected trades | 61 |
| Mean selected price improvement | +0.0188% |

The broader research library covers one-second return and volatility, L1 spread, microprice, queue imbalance, signed trade flow, VWAP divergence, event-time order-flow imbalance, multi-level depth imbalance, book slope, update intensity, and book staleness. These are disclosed as research coverage and are not attributed as primary strategy P&L.

## Backtest and cost contract

- Instrument: BTC/USDT
- Decision interval: four hours
- Replay window: 2024-01-01 04:00 to 2026-08-25 16:00 UTC
- Target exposure: −100% to +100%
- Maximum leverage shown: 1.0×
- Maker fee: 0.02%
- Taker fee: 0.05%
- Rebate assumption: 0.00%
- Benchmark: same-clock BTC 1.0× buy and hold
- Refresh mode: append-only; previously published targets remain unchanged

## Verified public metrics

| Metric | Result |
| --- | ---: |
| Cost-adjusted cumulative return | **+358.09%** |
| CAGR | **+77.56%** |
| BTC 1.0× cumulative return | +87.58% |
| BTC CAGR | +26.78% |
| Annualized excess return | **+50.78%** |
| Maximum drawdown | **−14.34%** |
| Sharpe ratio | 2.35 |
| Sortino ratio | 3.20 |
| Calmar ratio | 5.41 |
| Information ratio vs BTC | 0.49 |
| Episode payoff ratio | 1.87× |
| Episode profit factor | 1.84 |
| Episode win rate | 49.65% |
| Closed episodes | 284 |
| Average holding period | 2.38 days |
| Trade adjustments | 1,035 |

The gross **+489.41%** result excludes the public fee burden and is retained only as a diagnostic. It is not the headline result.

## Evidence limits

- Historical performance does not establish future performance.
- The public package does not claim live execution parity, capacity, queue priority, market impact, or production HFT readiness.
- Controlled variants share decisions and market periods; their return differences are not additive causal contributions.
- Bar-level ML veto events are not plotted because the sanitized public snapshot does not contain a per-bar public veto label.
- Proprietary parameters and data-engineering contracts are intentionally excluded, so this document explains the system without making it directly replicable.

Historical simulation only. Not investment advice.
