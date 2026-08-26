# BTC Asymmetric Trend Strategy

## BTC 非对称趋势策略

A cost-adjusted BTC/USDT timing strategy that converts four-hour trend signals into bounded long/short exposure. Market-state sizing allocates the risk budget, a walk-forward machine-learning filter vetoes rebound-prone shorts, a time-causal profit guard controls giveback, and one-second quote observations improve selected fills.

一套计入真实手续费的 BTC/USDT 择时策略：将四小时趋势信号映射为受限多空仓位，通过市场状态分配风险预算，以滚动前推的机器学习过滤器否决容易遭遇反弹的空头，再用仅依赖当时可见信息的利润保护机制控制回吐，并以秒级盘口改善部分成交价格。

## ▶ [CLICK HERE TO LAUNCH THE INTERACTIVE STRATEGY REPLAY](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

### [点击此处进入可拖动、可缩放的交互式策略回放](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

Drag the candlestick window, inspect each position decision, and toggle lifecycle, order, state, profit-guard and one-second execution events.
拖动 K 线窗口查看每次仓位决策，并按需显示仓位周期、买卖、状态切换、利润保护与秒级执行事件。

[![Interactive BTC asymmetric trend strategy replay](assets/preview.png?v=20260826e)](https://chandleryao720.github.io/btc-asymmetric-trend-research/)

## Strategy at a glance / 策略概览

| Layer / 层级 | Decision / 决策 | Hard boundary / 严格边界 |
| --- | --- | --- |
| **01 · Direction / 方向** | 20-, 55- and 100-bar Donchian votes on closed four-hour bars / 基于已收盘四小时 K 线的 20、55、100 周期唐奇安通道投票 | Sets the side only / 只决定多空方向 |
| **02 · Risk budget / 风险预算** | Market state and volatility determine target size / 市场状态与波动率共同决定目标仓位 | Exposure remains between −100% and +100% / 仓位始终限制在 −100% 至 +100% |
| **03 · ML filter / 机器学习过滤** | A shallow walk-forward decision tree acts as a bad-short veto / 浅层滚动前推决策树仅负责否决高反弹风险空头 | May flatten an existing short; never opens or enlarges a position / 只能平掉已有空头，不能开仓或扩大仓位 |
| **04 · Profit guard / 利润保护** | Maximum favorable excursion (MFE) tracks the best observed open profit and reacts to giveback / 最大有利波动记录截至当时的最高浮盈，并在利润回吐时触发动作 | May reduce or exit; never restores, flips or expands / 只能减仓或退出，不能恢复、反向或加仓 |
| **05 · Execution / 执行** | Observed one-second best bid/ask may replace selected fills / 以实际可见的一秒级最优买卖价改善部分成交 | Changes fill price only, not direction or size / 只改变成交价，不改变方向或仓位 |

## Performance snapshot / 绩效概览

Historical replay from **2024-01-01 04:00 to 2026-08-25 16:00 UTC**, with a hard **1.0× leverage ceiling**.
历史回放区间为 **2024-01-01 04:00 至 2026-08-25 16:00 UTC**，杠杆上限严格限制为 **1.0×**。

| Metric / 指标 | Result / 结果 |
| --- | ---: |
| Cost-adjusted cumulative return / 含成本累计收益 | **+358.09%** |
| Gross diagnostic cumulative return / 毛收益诊断累计收益 | +489.41% |
| BTC buy-and-hold return / BTC 买入并持有收益 | +87.58% |
| Maximum drawdown / 最大回撤 | −14.34% |
| Sharpe ratio / 夏普比率 | 2.35 |
| Calmar ratio / 卡玛比率 | 5.41 |
| Information ratio vs BTC 1× / 相对 BTC 一倍持有的信息比率 | 0.49 |
| Closed-episode payoff ratio / 已结束交易周期盈亏比 | 1.87× |
| Closed episodes / 已结束交易周期 | 284 |
| Target exposure / 目标仓位 | −100% to +100% |

The primary path deducts a **0.02% maker fee** and a **0.05% taker fee**, uses side-specific one-second best bid/ask where evidence is available, and assumes **zero rebates**.
主要绩效路径扣除 **0.02% 挂单手续费**与 **0.05% 吃单手续费**，在证据可用时按交易方向采用一秒级最优买卖价，并假设**返佣为零**。

## What to inspect / 可直接检查的内容

- **Decision tape / 决策时序：** Drag and zoom across 5,806 four-hour candles while the signed target position stays synchronized below. / 在 5,806 根四小时 K 线上拖动和缩放，下方目标仓位与主图同步。
- **Event layers / 事件图层：** Toggle long/short lifecycle bands, buy/sell adjustments, market-state changes, MFE actions and one-second fills independently. / 独立显示或隐藏多空仓位周期、买卖调仓、市场状态变化、利润保护动作与秒级成交。
- **Performance path / 绩效路径：** Compare the cost-adjusted strategy path with same-clock BTC 1× and inspect drawdown at the same timestamp. / 将含成本策略路径与同时钟 BTC 一倍持有进行比较，并查看同一时点的回撤。
- **Strategy diagnostics / 策略诊断：** Review controlled same-window variants, state/side asymmetry and normalized long/short episode outcomes. / 查看共同窗口下的受控变体、市场状态与多空非对称性，以及标准化后的多空交易周期分布。

The controlled diagnostics use the same 5,438-bar window; overlapping variant differences should be read individually rather than summed.
受控诊断统一使用 5,438 根 K 线的共同窗口；各变体差异存在重叠，应分别解读，不应直接相加。

## Run locally / 本地运行

No build step is required. / 无需构建步骤。

```bash
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000/`. / 随后访问 `http://127.0.0.1:8000/`。

The charting runtime is vendored from [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) under the Apache License 2.0; its license is retained in `assets/vendor/`.
图表运行时来自 [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts)，采用 Apache License 2.0；许可证保留在 `assets/vendor/`。

## Public scope / 公开范围

This repository contains the interactive strategy replay and a sanitized historical evidence snapshot. The private implementation, experiment registry and live-trading infrastructure are not published. Historical simulation only; not investment advice or a promise of future returns.
本仓库公开交互式策略回放与脱敏后的历史证据快照，不包含私有策略实现、实验注册表或实盘基础设施。展示结果仅为历史模拟，不构成投资建议或未来收益承诺。

— Qidong Yao
