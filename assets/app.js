(() => {
  "use strict";

  const data = window.BTC_SHOWCASE_DATA;
  const charts = window.LightweightCharts;

  if (!data || !charts) {
    document.body.insertAdjacentHTML("afterbegin", '<p class="load-error">DATA_LOAD_ERROR // research snapshot unavailable</p>');
    return;
  }

  const palette = {
    background: "#04090d",
    text: "#6f8595",
    grid: "rgba(72, 101, 120, 0.115)",
    border: "#1a2a37",
    lineHot: "#345064",
    acid: "#c9ff3d",
    green: "#2ff0a4",
    red: "#ff4d73",
    cyan: "#31ddf5",
    amber: "#ffd35a",
    benchmark: "#c5d2da",
    mono: '"SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  };

  const epsilon = 1e-8;
  const day = 86400;
  const byTime = (rows) => new Map(rows.map((row) => [row.time, row]));
  const candleByTime = byTime(data.candles);
  const positionByTime = byTime(data.positions);
  const equityByTime = byTime(data.equity);
  const benchmarkByTime = byTime(data.benchmark);
  const drawdownByTime = byTime(data.drawdown);

  const signedPercent = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    return `${sign}${Math.abs(value).toFixed(digits)}%`;
  };

  const plainPercent = (value, digits = 0) => Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—";
  const utcLabel = (time) => typeof time === "number"
    ? new Date(time * 1000).toISOString().replace("T", " ").slice(0, 16)
    : "—";
  const compactUtcLabel = (time) => typeof time === "number"
    ? `${new Date(time * 1000).toISOString().slice(0, 16).replace("T", "_")}Z`
    : "—";
  const dateLabel = (time) => new Date(time * 1000).toISOString().slice(0, 10);
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  setText("[data-run-range]", `RUN / ${compactUtcLabel(data.meta.start)} → ${compactUtcLabel(data.meta.end)}`);
  setText("[data-evidence-updated]", `UPDATED ${utcLabel(data.meta.end)}Z / NO LIVE OR QUEUE-PARITY CLAIM`);

  const metricBindings = {
    netReturn: signedPercent(data.metrics.netReturnPct),
    grossReturn: signedPercent(data.metrics.grossReturnPct),
    benchmarkReturn: signedPercent(data.metrics.benchmarkReturnPct),
    maxDrawdown: signedPercent(data.metrics.maxDrawdownPct),
    sharpe: Number(data.metrics.sharpe).toFixed(2),
    calmar: Number(data.metrics.calmar).toFixed(2),
    informationRatio: Number(data.metrics.informationRatio4hVsBtc1x).toFixed(2),
    episodePayoff: `${Number(data.metrics.episodePayoffRatio1x).toFixed(2)}×`,
    episodePayoffMeta: `${data.metrics.episodes} CLOSED · W/L`,
    longMedian: signedPercent(data.metrics.longMedianPct),
    shortMedian: signedPercent(data.metrics.shortMedianPct),
  };
  Object.entries(metricBindings).forEach(([key, value]) => setText(`[data-metric="${key}"]`, value));

  const replayBindings = {
    latestPrice: money.format(data.recentReplay.latestPrice),
    latestTime: `${utcLabel(data.recentReplay.latestTime)}Z`,
    latestTarget: `${signedPercent(data.recentReplay.latestTargetPct)} ${data.recentReplay.latestSide}`,
    troughCapture: signedPercent(data.recentReplay.troughToLatestReturnPct),
    troughBenchmark: `BTC ${signedPercent(data.recentReplay.troughToLatestBtcPct)}`,
    last120h: signedPercent(data.recentReplay.last120hReturnPct),
    last120hBenchmark: `BTC ${signedPercent(data.recentReplay.last120hBtcPct)}`,
    postCutoff: signedPercent(data.recentReplay.postCutoffReturnPct),
    postCutoffBenchmark: `BTC ${signedPercent(data.recentReplay.postCutoffBtcPct)}`,
  };
  Object.entries(replayBindings).forEach(([key, value]) => setText(`[data-replay="${key}"]`, value));

  const ablationBindings = {
    state0Asym0: data.ablation.state0Asym0,
    state0Asym1: data.ablation.state0Asym1,
    state1Asym0: data.ablation.state1Asym0,
    state1Asym1: data.ablation.state1Asym1,
  };
  Object.entries(ablationBindings).forEach(([key, value]) => setText(`[data-ablation="${key}"]`, signedPercent(value)));

  const moduleBindings = {
    parentReturn: data.overlay.parentReturnPct,
    mfeOnly: data.overlay.mfeOnlyPct,
    hftOnly: data.overlay.hftOnlyPct,
    comboReturn: data.overlay.comboPct,
    hftImprove: data.execution.meanSelectedPriceImprovementPct,
  };
  Object.entries(moduleBindings).forEach(([key, value]) => {
    setText(`[data-module="${key}"]`, signedPercent(value, key === "hftImprove" ? 4 : 2));
  });
  setText('[data-execution="overrides"]', String(data.execution.overrides));

  const eventMap = new Map();
  const addEvent = (time, label) => {
    const events = eventMap.get(time) ?? [];
    if (!events.includes(label)) events.push(label);
    eventMap.set(time, events);
  };

  data.episodes.forEach((episode) => {
    const code = episode.side === "long" ? "L" : "S";
    addEvent(episode.entryTime, `${code}:ENTRY`);
    addEvent(episode.exitTime, `${code}:${episode.closed ? "EXIT" : "OPEN"}`);
  });
  data.trades.forEach((trade) => addEvent(trade.time, `${trade.action}:${trade.kind.toUpperCase()} ${signedPercent(trade.deltaPct, 1)}`));
  data.stateEvents.forEach((event) => addEvent(event.time, `STATE:${event.action.toUpperCase()}`));
  data.hftEvents.forEach((event) => addEvent(event.time, `1S:${signedPercent(event.improvementPct, 4)}`));
  data.mfeEvents.forEach((event) => addEvent(event.time, `MFE:${event.action.toUpperCase().replaceAll(" ", "_")}`));

  const baseChartOptions = () => ({
    width: 0,
    height: 0,
    layout: {
      background: { type: "solid", color: palette.background },
      textColor: palette.text,
      fontFamily: palette.mono,
      fontSize: 10,
      attributionLogo: false,
    },
    grid: {
      vertLines: { color: palette.grid },
      horzLines: { color: palette.grid },
    },
    crosshair: {
      mode: charts.CrosshairMode.Normal,
      vertLine: { color: "rgba(201, 255, 61, 0.42)", width: 1, labelBackgroundColor: "#2a3810" },
      horzLine: { color: "rgba(201, 255, 61, 0.20)", width: 1, labelBackgroundColor: "#2a3810" },
    },
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.14, bottom: 0.08 },
    },
    timeScale: {
      borderColor: palette.border,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 2,
      barSpacing: 13,
      minBarSpacing: 0.35,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
    localization: { locale: "en-US" },
  });

  const createResponsiveChart = (element, extra = {}) => {
    const chart = charts.createChart(element, {
      ...baseChartOptions(),
      ...extra,
      width: Math.max(280, element.clientWidth),
      height: Math.max(80, element.clientHeight),
    });
    const observer = new ResizeObserver((entries) => {
      const box = entries[0].contentRect;
      const width = Math.floor(box.width);
      const height = Math.floor(box.height);
      if (width > 0 && height > 0) chart.resize(width, height);
    });
    observer.observe(element);
    return { chart, observer };
  };

  const priceElement = document.querySelector("#priceChart");
  const positionElement = document.querySelector("#positionChart");
  const priceRuntime = createResponsiveChart(priceElement);
  const positionRuntime = createResponsiveChart(positionElement, {
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.04, bottom: 0.04 },
    },
    timeScale: {
      ...baseChartOptions().timeScale,
      visible: true,
      barSpacing: 13,
    },
    crosshair: {
      mode: charts.CrosshairMode.Normal,
      vertLine: { color: "rgba(201, 255, 61, 0.28)", labelBackgroundColor: "#2a3810" },
      horzLine: { color: "rgba(201, 255, 61, 0.14)", labelBackgroundColor: "#2a3810" },
    },
  });

  const candleSeries = priceRuntime.chart.addCandlestickSeries({
    upColor: palette.green,
    downColor: palette.red,
    borderUpColor: palette.green,
    borderDownColor: palette.red,
    wickUpColor: "rgba(47, 240, 164, 0.82)",
    wickDownColor: "rgba(255, 77, 115, 0.84)",
    priceLineVisible: false,
    lastValueVisible: true,
  });
  candleSeries.setData(data.candles);

  const positionSeries = positionRuntime.chart.addHistogramSeries({
    base: 0,
    priceFormat: {
      type: "custom",
      minMove: 1,
      formatter: (value) => signedPercent(value, 0),
    },
    priceLineVisible: false,
    lastValueVisible: true,
    autoscaleInfoProvider: () => ({ priceRange: { minValue: -100, maxValue: 100 } }),
  });
  positionSeries.setData(data.positions.map((row) => ({
    ...row,
    color: row.value > epsilon
      ? "rgba(47, 240, 164, 0.70)"
      : row.value < -epsilon
        ? "rgba(255, 77, 115, 0.68)"
        : "rgba(88, 108, 123, 0.22)",
  })));

  let tapeSyncing = false;
  const mirrorTimeScale = (source, target) => {
    source.timeScale().subscribeVisibleTimeRangeChange((range) => {
      if (!range || tapeSyncing) return;
      tapeSyncing = true;
      target.timeScale().setVisibleRange(range);
      tapeSyncing = false;
    });
  };
  mirrorTimeScale(priceRuntime.chart, positionRuntime.chart);
  mirrorTimeScale(positionRuntime.chart, priceRuntime.chart);

  const layerState = { lifecycles: true, trades: true, state: true, hft: true, mfe: true };
  const stateCode = (action) => action === "reduce" ? "R" : action === "restore" ? "RS" : "X";
  const markerGroups = {
    trades: data.trades.map((trade) => ({
      time: trade.time,
      position: trade.action === "B" ? "belowBar" : "aboveBar",
      color: trade.action === "B" ? palette.green : palette.red,
      shape: "circle",
      text: trade.action,
      size: trade.boundary === "internal" ? 0.34 : 1.18,
    })),
    state: data.stateEvents.map((event) => ({
      time: event.time,
      position: event.side === "short" ? "belowBar" : "aboveBar",
      color: palette.amber,
      shape: "square",
      text: stateCode(event.action),
      size: 0.62,
    })),
    hft: data.hftEvents.map((event) => ({
      time: event.time,
      position: event.side === "long" ? "belowBar" : "aboveBar",
      color: palette.cyan,
      shape: "circle",
      text: "1S",
      size: 0.56,
    })),
    mfe: data.mfeEvents.map((event) => ({
      time: event.time,
      position: event.side === "long" ? "aboveBar" : "belowBar",
      color: palette.amber,
      shape: "square",
      text: event.action === "Reduce 50%" ? "M50" : "MX",
      size: 0.72,
    })),
  };

  const refreshMarkers = () => {
    const markers = ["trades", "state", "hft", "mfe"]
      .filter((key) => layerState[key])
      .flatMap((key) => markerGroups[key])
      .sort((left, right) => left.time - right.time);
    candleSeries.setMarkers(markers);
  };
  refreshMarkers();

  const overlay = document.querySelector("#lifecycleOverlay");
  let overlayFrame = 0;
  const queueLifecycleOverlay = () => {
    cancelAnimationFrame(overlayFrame);
    overlayFrame = requestAnimationFrame(drawLifecycleOverlay);
  };

  function drawLifecycleOverlay() {
    const width = priceElement.clientWidth;
    const height = priceElement.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    if (!width || !height) return;
    if (overlay.width !== Math.floor(width * dpr) || overlay.height !== Math.floor(height * dpr)) {
      overlay.width = Math.floor(width * dpr);
      overlay.height = Math.floor(height * dpr);
    }
    const context = overlay.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    if (!layerState.lifecycles) return;

    const visible = priceRuntime.chart.timeScale().getVisibleRange();
    if (!visible) return;
    const plotRight = Math.max(0, width - 72);
    const plotBottom = Math.max(40, height - 27);
    const bandTop = 8;
    const bandHeight = 11;

    for (const episode of data.episodes) {
      const episodeEnd = episode.exitTime + data.meta.barIntervalSeconds;
      if (episodeEnd < visible.from || episode.entryTime > visible.to) continue;

      const startVisible = episode.entryTime <= visible.from;
      const endVisible = episodeEnd >= visible.to;
      const rawStart = startVisible ? 0 : priceRuntime.chart.timeScale().timeToCoordinate(episode.entryTime);
      const rawEnd = endVisible ? plotRight : priceRuntime.chart.timeScale().timeToCoordinate(episodeEnd);
      const x0 = Math.max(0, Math.min(plotRight, Number.isFinite(rawStart) ? rawStart : 0));
      const x1 = Math.max(0, Math.min(plotRight, Number.isFinite(rawEnd) ? rawEnd : plotRight));
      if (x1 <= x0) continue;

      const long = episode.side === "long";
      const stroke = long ? palette.green : palette.red;
      const fill = long ? "rgba(47, 240, 164, 0.27)" : "rgba(255, 77, 115, 0.27)";
      const wash = long ? "rgba(47, 240, 164, 0.018)" : "rgba(255, 77, 115, 0.018)";
      const span = x1 - x0;

      context.fillStyle = wash;
      context.fillRect(x0, bandTop + bandHeight, span, Math.max(0, plotBottom - bandTop - bandHeight));
      context.fillStyle = fill;
      context.fillRect(x0, bandTop, span, bandHeight);
      context.strokeStyle = stroke;
      context.lineWidth = episode.closed ? 1 : 1.5;
      context.setLineDash(episode.closed ? [] : [4, 3]);
      context.strokeRect(x0 + 0.5, bandTop + 0.5, Math.max(0, span - 1), bandHeight - 1);

      const entryY = candleSeries.priceToCoordinate(episode.entryPrice);
      if (Number.isFinite(entryY) && entryY > bandTop + bandHeight + 4 && entryY < plotBottom) {
        context.strokeStyle = long ? "rgba(47, 240, 164, 0.48)" : "rgba(255, 77, 115, 0.48)";
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.beginPath();
        context.moveTo(x0, entryY + 0.5);
        context.lineTo(x1, entryY + 0.5);
        context.stroke();
      }

      context.setLineDash([]);
      if (span > 32) {
        const state = episode.closed ? signedPercent(episode.pnlPct, 2) : `OPEN ${signedPercent(episode.pnlPct, 2)}`;
        const label = `${long ? "L" : "S"} ${state}`;
        context.save();
        context.beginPath();
        context.rect(x0 + 2, bandTop - 1, Math.max(0, span - 4), bandHeight + 2);
        context.clip();
        context.fillStyle = stroke;
        context.font = `500 9px ${palette.mono}`;
        context.textBaseline = "middle";
        context.fillText(label, x0 + 5, bandTop + bandHeight / 2 + 0.5);
        context.restore();
      }
    }
  }

  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      const layer = button.dataset.layer;
      layerState[layer] = !layerState[layer];
      button.classList.toggle("active", layerState[layer]);
      button.setAttribute("aria-pressed", String(layerState[layer]));
      if (layer === "lifecycles") queueLifecycleOverlay();
      else refreshMarkers();
    });
  });

  let activeDuration = 30 * day;
  let activeWindow = "30";
  let applyingWindow = false;
  const pan = document.querySelector("#tapePan");
  const windowLabel = document.querySelector("#windowLabel");

  const setWindowLabel = (from, to) => {
    const days = Math.max(1, Math.round((to - from) / day));
    windowLabel.textContent = `WINDOW / ${dateLabel(from)} → ${dateLabel(to)} / ${days}D`;
  };

  const applyWindowAt = (ratio = 1) => {
    if (activeWindow === "all") {
      applyingWindow = true;
      priceRuntime.chart.timeScale().fitContent();
      applyingWindow = false;
      pan.disabled = true;
      windowLabel.textContent = `WINDOW / ${dateLabel(data.meta.start)} → ${dateLabel(data.meta.end)} / ALL`;
      queueLifecycleOverlay();
      return;
    }

    pan.disabled = false;
    const duration = Math.min(activeDuration, data.meta.end - data.meta.start);
    const maxFrom = data.meta.end - duration;
    const from = data.meta.start + Math.max(0, Math.min(1, ratio)) * Math.max(0, maxFrom - data.meta.start);
    const to = from + duration;
    applyingWindow = true;
    priceRuntime.chart.timeScale().setVisibleRange({ from, to });
    applyingWindow = false;
    setWindowLabel(from, to);
    queueLifecycleOverlay();
  };

  document.querySelectorAll("[data-window]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-window]").forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      activeWindow = button.dataset.window;
      if (activeWindow !== "all") activeDuration = Number(activeWindow) * day;
      pan.value = "1000";
      applyWindowAt(1);
    });
  });

  pan.addEventListener("input", () => applyWindowAt(Number(pan.value) / 1000));

  priceRuntime.chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
    if (!range) return;
    queueLifecycleOverlay();
    if (applyingWindow || activeWindow === "all") return;
    activeDuration = Math.max(data.meta.barIntervalSeconds, range.to - range.from);
    const maxFrom = data.meta.end - activeDuration;
    const denominator = Math.max(1, maxFrom - data.meta.start);
    const ratio = Math.max(0, Math.min(1, (range.from - data.meta.start) / denominator));
    pan.value = String(Math.round(ratio * 1000));
    setWindowLabel(range.from, range.to);
  });

  const updateDecisionReadout = (time) => {
    const candle = candleByTime.get(time);
    const position = positionByTime.get(time);
    if (!candle || !position) return;
    document.querySelector("#readoutTime").textContent = `${utcLabel(time)}Z`;
    document.querySelector("#readoutClose").textContent = money.format(candle.close);
    document.querySelector("#readoutPosition").textContent = signedPercent(position.value, 1);
    document.querySelector("#readoutState").textContent = position.value > epsilon ? "LONG" : position.value < -epsilon ? "SHORT" : "FLAT";
    const events = eventMap.get(time) ?? [];
    const visibleEvents = events.slice(0, 4);
    document.querySelector("#readoutEvents").textContent = visibleEvents.length
      ? `${visibleEvents.join(" / ")}${events.length > visibleEvents.length ? ` / +${events.length - visibleEvents.length}` : ""}`
      : "NO_DISCRETE_EVENT";
  };

  const syncCrosshair = (sourceChart, targetChart, sourceSeries, targetSeries, targetMap) => {
    sourceChart.subscribeCrosshairMove((param) => {
      if (typeof param.time !== "number") {
        targetChart.clearCrosshairPosition();
        return;
      }
      const sourceRow = param.seriesData.get(sourceSeries);
      const targetRow = targetMap.get(param.time);
      if (!sourceRow || !targetRow) return;
      targetChart.setCrosshairPosition(targetRow.value ?? targetRow.close, param.time, targetSeries);
      updateDecisionReadout(param.time);
    });
  };
  syncCrosshair(priceRuntime.chart, positionRuntime.chart, candleSeries, positionSeries, positionByTime);
  syncCrosshair(positionRuntime.chart, priceRuntime.chart, positionSeries, candleSeries, candleByTime);

  const equityElement = document.querySelector("#equityChart");
  const drawdownElement = document.querySelector("#drawdownChart");
  const equityRuntime = createResponsiveChart(equityElement, {
    rightPriceScale: { borderColor: palette.border, scaleMargins: { top: 0.08, bottom: 0.07 } },
  });
  const drawdownRuntime = createResponsiveChart(drawdownElement, {
    rightPriceScale: { borderColor: palette.border, scaleMargins: { top: 0.08, bottom: 0.08 } },
  });
  const percentFormat = {
    type: "custom",
    minMove: 0.01,
    formatter: (value) => plainPercent(value, 0),
  };
  const strategySeries = equityRuntime.chart.addAreaSeries({
    lineColor: palette.acid,
    topColor: "rgba(201, 255, 61, 0.16)",
    bottomColor: "rgba(201, 255, 61, 0.006)",
    lineWidth: 2,
    priceFormat: percentFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });
  const benchmarkSeries = equityRuntime.chart.addLineSeries({
    color: palette.benchmark,
    lineWidth: 1,
    lineStyle: charts.LineStyle.Dashed,
    priceFormat: percentFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });
  const drawdownSeries = drawdownRuntime.chart.addAreaSeries({
    lineColor: palette.red,
    topColor: "rgba(255, 77, 115, 0.01)",
    bottomColor: "rgba(255, 77, 115, 0.24)",
    lineWidth: 1,
    priceFormat: percentFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });
  strategySeries.setData(data.equity);
  benchmarkSeries.setData(data.benchmark);
  drawdownSeries.setData(data.drawdown);
  mirrorTimeScale(equityRuntime.chart, drawdownRuntime.chart);
  mirrorTimeScale(drawdownRuntime.chart, equityRuntime.chart);
  equityRuntime.chart.timeScale().fitContent();
  drawdownRuntime.chart.timeScale().fitContent();

  const updateEquityReadout = (time) => {
    const strategy = equityByTime.get(time);
    const benchmark = benchmarkByTime.get(time);
    const drawdown = drawdownByTime.get(time);
    if (!strategy || !benchmark || !drawdown) return;
    document.querySelector("#equityReadout").textContent = `${utcLabel(time)}Z // C1 ${signedPercent(strategy.value)} // BTC ${signedPercent(benchmark.value)} // DD ${signedPercent(drawdown.value)}`;
  };

  const syncEquityCrosshair = (sourceChart, targetChart, sourceSeries, targetSeries, targetMap) => {
    sourceChart.subscribeCrosshairMove((param) => {
      if (typeof param.time !== "number") {
        targetChart.clearCrosshairPosition();
        return;
      }
      const sourceRow = param.seriesData.get(sourceSeries);
      const targetRow = targetMap.get(param.time);
      if (!sourceRow || !targetRow) return;
      targetChart.setCrosshairPosition(targetRow.value, param.time, targetSeries);
      updateEquityReadout(param.time);
    });
  };
  syncEquityCrosshair(equityRuntime.chart, drawdownRuntime.chart, strategySeries, drawdownSeries, drawdownByTime);
  syncEquityCrosshair(drawdownRuntime.chart, equityRuntime.chart, drawdownSeries, strategySeries, equityByTime);

  const ablationRoot = document.querySelector("#ablationChart");
  const maxAblation = Math.max(...data.ablation.variants.map((variant) => variant.returnPct));
  const ablationLabel = {
    full: "FULL.SYSTEM",
    parent: "PARENT.ONLY",
    withoutBadShort: "− BAD_SHORT.VETO",
    withoutSideAsym: "− SIDE.ASYMMETRY",
    withoutState: "− MARKET.STATE",
    withoutBullCap: "− BULL.CAP",
  };
  data.ablation.variants.forEach((variant) => {
    const row = document.createElement("div");
    row.className = `ablation-row ${variant.status === "best" ? "best" : ""} ${variant.status === "unstable" ? "unstable" : ""}`.trim();
    row.innerHTML = `<span class="ablation-label">${ablationLabel[variant.key] ?? variant.label.toUpperCase()}</span><span class="ablation-track"><i style="width:${(variant.returnPct / maxAblation * 100).toFixed(2)}%"></i></span><strong class="ablation-value">${signedPercent(variant.returnPct)}</strong>`;
    ablationRoot.appendChild(row);
  });

  const drawEpisodeDistribution = () => {
    const canvas = document.querySelector("#episodeDistribution");
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    const margin = { top: 10, right: 12, bottom: 30, left: 34 };
    const width = Math.max(1, rect.width - margin.left - margin.right);
    const height = Math.max(1, rect.height - margin.top - margin.bottom);
    const min = -5;
    const max = 12;
    const step = 1;
    const bins = Array.from({ length: max - min }, (_, index) => min + index);
    const closed = data.episodes.filter((episode) => episode.closed);
    const sides = ["long", "short"];
    const counts = Object.fromEntries(sides.map((side) => [side, Array(bins.length).fill(0)]));
    const totals = Object.fromEntries(sides.map((side) => [side, closed.filter((episode) => episode.side === side).length]));

    closed.forEach((episode) => {
      const clipped = Math.min(max - Number.EPSILON, Math.max(min, episode.pnlPct));
      const index = Math.max(0, Math.min(bins.length - 1, Math.floor((clipped - min) / step)));
      counts[episode.side][index] += 1;
    });

    const density = Object.fromEntries(sides.map((side) => [side, counts[side].map((value) => value / totals[side] * 100)]));
    const yMax = Math.max(5, Math.ceil(Math.max(...density.long, ...density.short) / 5) * 5);
    const x = (value) => margin.left + (value - min) / (max - min) * width;
    const y = (value) => margin.top + height - value / yMax * height;

    context.font = `9px ${palette.mono}`;
    context.textBaseline = "middle";
    context.textAlign = "right";
    for (let tick = 0; tick <= yMax; tick += 5) {
      context.strokeStyle = palette.grid;
      context.beginPath();
      context.moveTo(margin.left, y(tick));
      context.lineTo(margin.left + width, y(tick));
      context.stroke();
      context.fillStyle = palette.text;
      context.fillText(`${tick}%`, margin.left - 6, y(tick));
    }

    context.strokeStyle = palette.lineHot;
    context.beginPath();
    context.moveTo(x(0), margin.top);
    context.lineTo(x(0), margin.top + height);
    context.stroke();

    const slot = width / bins.length;
    const barWidth = Math.max(2, slot * 0.34);
    bins.forEach((bin, index) => {
      const center = x(bin + step / 2);
      const longHeight = margin.top + height - y(density.long[index]);
      const shortHeight = margin.top + height - y(density.short[index]);
      context.fillStyle = "rgba(47, 240, 164, 0.72)";
      context.fillRect(center - barWidth - 1, y(density.long[index]), barWidth, longHeight);
      context.fillStyle = "rgba(255, 77, 115, 0.68)";
      context.fillRect(center + 1, y(density.short[index]), barWidth, shortHeight);
    });

    context.fillStyle = palette.text;
    context.textAlign = "center";
    context.textBaseline = "top";
    [-5, 0, 5, 10].forEach((tick) => context.fillText(`${tick > 0 ? "+" : ""}${tick}%`, x(tick), margin.top + height + 10));
  };

  drawEpisodeDistribution();
  const distributionObserver = new ResizeObserver(() => requestAnimationFrame(drawEpisodeDistribution));
  distributionObserver.observe(document.querySelector("#episodeDistribution"));
  const overlayObserver = new ResizeObserver(queueLifecycleOverlay);
  overlayObserver.observe(priceElement);

  applyWindowAt(1);
  queueLifecycleOverlay();

  if (window.location.hash) {
    try {
      const target = document.querySelector(window.location.hash);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
    } catch {
      // Keep the console usable when a fragment is malformed.
    }
  }

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(overlayFrame);
    [priceRuntime, positionRuntime, equityRuntime, drawdownRuntime].forEach((runtime) => {
      runtime.observer.disconnect();
      runtime.chart.remove();
    });
    distributionObserver.disconnect();
    overlayObserver.disconnect();
  }, { once: true });
})();
