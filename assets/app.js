(() => {
  "use strict";

  const data = window.BTC_SHOWCASE_DATA;
  const charts = window.LightweightCharts;

  if (!data || !charts) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p class="load-error">The interactive research data could not be loaded.</p>',
    );
    return;
  }

  const palette = {
    background: "#020912",
    text: "#8fa5be",
    grid: "rgba(133, 183, 255, 0.075)",
    border: "rgba(133, 183, 255, 0.18)",
    cyan: "#48d7ff",
    blue: "#4f7cff",
    green: "#35efad",
    red: "#ff5c80",
    amber: "#ffc65c",
    benchmark: "#d9e4f4",
  };

  const byTime = (rows) => new Map(rows.map((row) => [row.time, row]));
  const candleByTime = byTime(data.candles);
  const positionByTime = byTime(data.positions);
  const equityByTime = byTime(data.equity);
  const benchmarkByTime = byTime(data.benchmark);
  const drawdownByTime = byTime(data.drawdown);

  const eventMap = new Map();
  const addEvent = (time, label) => {
    const events = eventMap.get(time) ?? [];
    events.push(label);
    eventMap.set(time, events);
  };
  data.episodes.forEach((episode) => addEvent(episode.entryTime, `${episode.side === "long" ? "Long" : "Short"} episode`));
  data.hftEvents.forEach((event) => addEvent(event.time, `1s fill +${event.improvementPct.toFixed(4)}%`));
  data.mfeEvents.forEach((event) => addEvent(event.time, `MFE ${event.action.toLowerCase()}`));

  const signedPercent = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    return `${sign}${Math.abs(value).toFixed(digits)}%`;
  };

  const plainPercent = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "—";
    return `${value.toFixed(digits)}%`;
  };

  const numeric = (value, digits = 2) => Number(value).toFixed(digits);
  const utcLabel = (time) => {
    if (typeof time !== "number") return "—";
    return new Date(time * 1000).toISOString().replace("T", " ").slice(0, 16);
  };

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const metricBindings = {
    netReturn: signedPercent(data.metrics.netReturnPct),
    benchmarkReturn: signedPercent(data.metrics.benchmarkReturnPct),
    maxDrawdown: signedPercent(data.metrics.maxDrawdownPct),
    sharpe: numeric(data.metrics.sharpe),
    episodes: String(data.metrics.episodes),
    episodeSplit: `${data.metrics.longEpisodes} long · ${data.metrics.shortEpisodes} short`,
    grossReturn: signedPercent(data.metrics.grossReturnPct),
    longMedian: signedPercent(data.metrics.longMedianPct),
    shortMedian: signedPercent(data.metrics.shortMedianPct),
  };
  Object.entries(metricBindings).forEach(([key, value]) => setText(`[data-metric="${key}"]`, value));

  const ablationBindings = {
    state0Asym0: data.ablation.state0Asym0,
    state0Asym1: data.ablation.state0Asym1,
    state1Asym0: data.ablation.state1Asym0,
    state1Asym1: data.ablation.state1Asym1,
    interaction: data.ablation.interactionPct,
    withoutState: data.ablation.variants.find((row) => row.key === "withoutState").returnPct,
    withoutBadShort: data.ablation.variants.find((row) => row.key === "withoutBadShort").returnPct,
    parent: data.overlay.parentReturnPct,
  };
  Object.entries(ablationBindings).forEach(([key, value]) => setText(`[data-ablation="${key}"]`, signedPercent(value)));

  const moduleBindings = {
    parentReturn: data.overlay.parentReturnPct,
    mfeOnly: data.overlay.mfeOnlyPct,
    hftOnly: data.overlay.hftOnlyPct,
    comboReturn: data.overlay.comboPct,
    mfeDelta: data.overlay.mfeDifferencePct,
    hftDelta: data.overlay.hftDifferencePct,
    comboDelta: data.overlay.comboDifferencePct,
    hftImprove: data.execution.meanSelectedPriceImprovementPct,
  };
  Object.entries(moduleBindings).forEach(([key, value]) => {
    const digits = key === "hftImprove" ? 4 : 2;
    setText(`[data-module="${key}"]`, signedPercent(value, digits));
  });

  const grossWidth = 100;
  const netWidth = Math.max(0, Math.min(100, data.metrics.netReturnPct / data.metrics.grossReturnPct * 100));
  document.querySelector("#grossBar").style.width = `${grossWidth}%`;
  document.querySelector("#netBar").style.width = `${netWidth}%`;

  const baseChartOptions = (height) => ({
    width: 0,
    height,
    layout: {
      background: { type: "solid", color: palette.background },
      textColor: palette.text,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: palette.grid },
      horzLines: { color: palette.grid },
    },
    crosshair: {
      mode: charts.CrosshairMode.Normal,
      vertLine: { color: "rgba(72, 215, 255, 0.42)", labelBackgroundColor: "#153555" },
      horzLine: { color: "rgba(72, 215, 255, 0.24)", labelBackgroundColor: "#153555" },
    },
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    },
    timeScale: {
      borderColor: palette.border,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 3,
      barSpacing: 7,
      minBarSpacing: 0.08,
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
    localization: {
      locale: "en-US",
    },
  });

  const createResponsiveChart = (element, options) => {
    const chart = charts.createChart(element, {
      ...options,
      width: Math.max(320, element.clientWidth),
    });
    const observer = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0].contentRect.width);
      if (width > 0) chart.applyOptions({ width });
    });
    observer.observe(element);
    return { chart, observer };
  };

  const priceElement = document.querySelector("#priceChart");
  const positionElement = document.querySelector("#positionChart");
  const priceRuntime = createResponsiveChart(priceElement, baseChartOptions(540));
  const positionRuntime = createResponsiveChart(positionElement, {
    ...baseChartOptions(150),
    timeScale: {
      ...baseChartOptions(150).timeScale,
      visible: true,
    },
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.04, bottom: 0.04 },
    },
  });

  const candleSeries = priceRuntime.chart.addCandlestickSeries({
    upColor: palette.green,
    downColor: palette.red,
    borderUpColor: palette.green,
    borderDownColor: palette.red,
    wickUpColor: "rgba(53, 239, 173, 0.82)",
    wickDownColor: "rgba(255, 92, 128, 0.82)",
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
    autoscaleInfoProvider: () => ({
      priceRange: { minValue: -100, maxValue: 100 },
    }),
  });
  positionSeries.setData(data.positions);

  const syncTimeScales = (leftChart, rightChart) => {
    let syncing = false;
    const sync = (source, target) => {
      source.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (!range || syncing) return;
        syncing = true;
        target.timeScale().setVisibleRange(range);
        syncing = false;
      });
    };
    sync(leftChart, rightChart);
    sync(rightChart, leftChart);
  };
  syncTimeScales(priceRuntime.chart, positionRuntime.chart);

  const markerState = { entries: true, hft: true, mfe: true };
  const markerGroups = {
    entries: data.episodes.map((episode) => ({
      time: episode.entryTime,
      position: episode.side === "long" ? "belowBar" : "aboveBar",
      color: episode.side === "long" ? palette.green : palette.red,
      shape: episode.side === "long" ? "arrowUp" : "arrowDown",
      size: 0.7,
    })),
    hft: data.hftEvents.map((event) => ({
      time: event.time,
      position: event.side === "long" ? "belowBar" : "aboveBar",
      color: palette.cyan,
      shape: "circle",
      size: 0.65,
    })),
    mfe: data.mfeEvents.map((event) => ({
      time: event.time,
      position: event.side === "long" ? "aboveBar" : "belowBar",
      color: palette.amber,
      shape: "square",
      text: event.action === "Reduce 50%" ? "MFE 50%" : "MFE exit",
      size: 0.65,
    })),
  };

  const refreshMarkers = () => {
    const markers = Object.entries(markerGroups)
      .filter(([key]) => markerState[key])
      .flatMap(([, rows]) => rows)
      .sort((left, right) => left.time - right.time);
    candleSeries.setMarkers(markers);
  };
  refreshMarkers();

  document.querySelectorAll("[data-marker]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.marker;
      markerState[key] = !markerState[key];
      button.classList.toggle("active", markerState[key]);
      button.setAttribute("aria-pressed", String(markerState[key]));
      refreshMarkers();
    });
    button.setAttribute("aria-pressed", "true");
  });

  const setVisibleDays = (days) => {
    if (days === "all") {
      priceRuntime.chart.timeScale().fitContent();
      positionRuntime.chart.timeScale().fitContent();
      return;
    }
    const end = data.meta.end;
    const range = { from: end - Number(days) * 86400, to: end + 3 * 4 * 3600 };
    priceRuntime.chart.timeScale().setVisibleRange(range);
    positionRuntime.chart.timeScale().setVisibleRange(range);
  };

  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-range]").forEach((candidate) => candidate.classList.remove("active"));
      button.classList.add("active");
      setVisibleDays(button.dataset.range);
    });
  });
  setVisibleDays(365);

  const updateDecisionReadout = (time, candle, position) => {
    if (typeof time !== "number" || !candle || !position) return;
    document.querySelector("#readoutTime").textContent = `${utcLabel(time)} UTC`;
    document.querySelector("#readoutClose").textContent = money.format(candle.close);
    document.querySelector("#readoutPosition").textContent = signedPercent(position.value, 1);
    document.querySelector("#readoutState").textContent = position.value > 0.01 ? "Long" : position.value < -0.01 ? "Short" : "Flat";
    document.querySelector("#readoutEvents").textContent = (eventMap.get(time) ?? ["No discrete event"]).join(" · ");
  };

  const crosshairSync = (sourceChart, targetChart, sourceSeries, targetSeries, targetMap, callback) => {
    sourceChart.subscribeCrosshairMove((param) => {
      if (typeof param.time !== "number") {
        targetChart.clearCrosshairPosition();
        return;
      }
      const sourceRow = param.seriesData.get(sourceSeries);
      const targetRow = targetMap.get(param.time);
      if (sourceRow && targetRow) {
        targetChart.setCrosshairPosition(targetRow.value ?? targetRow.close, param.time, targetSeries);
        callback(param.time);
      }
    });
  };

  crosshairSync(priceRuntime.chart, positionRuntime.chart, candleSeries, positionSeries, positionByTime, (time) => {
    updateDecisionReadout(time, candleByTime.get(time), positionByTime.get(time));
  });
  crosshairSync(positionRuntime.chart, priceRuntime.chart, positionSeries, candleSeries, candleByTime, (time) => {
    updateDecisionReadout(time, candleByTime.get(time), positionByTime.get(time));
  });

  const equityElement = document.querySelector("#equityChart");
  const drawdownElement = document.querySelector("#drawdownChart");
  const equityRuntime = createResponsiveChart(equityElement, {
    ...baseChartOptions(430),
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.09, bottom: 0.08 },
    },
  });
  const drawdownRuntime = createResponsiveChart(drawdownElement, {
    ...baseChartOptions(160),
    rightPriceScale: {
      borderColor: palette.border,
      scaleMargins: { top: 0.08, bottom: 0.08 },
    },
  });

  const percentPriceFormat = {
    type: "custom",
    minMove: 0.01,
    formatter: (value) => plainPercent(value, 0),
  };
  const strategySeries = equityRuntime.chart.addAreaSeries({
    lineColor: palette.green,
    topColor: "rgba(53, 239, 173, 0.24)",
    bottomColor: "rgba(53, 239, 173, 0.015)",
    lineWidth: 2,
    priceFormat: percentPriceFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });
  const benchmarkSeries = equityRuntime.chart.addLineSeries({
    color: palette.benchmark,
    lineWidth: 1,
    lineStyle: charts.LineStyle.Dashed,
    priceFormat: percentPriceFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });
  const drawdownSeries = drawdownRuntime.chart.addAreaSeries({
    lineColor: palette.red,
    topColor: "rgba(255, 92, 128, 0.03)",
    bottomColor: "rgba(255, 92, 128, 0.28)",
    lineWidth: 1,
    priceFormat: percentPriceFormat,
    priceLineVisible: false,
    lastValueVisible: true,
  });

  strategySeries.setData(data.equity);
  benchmarkSeries.setData(data.benchmark);
  drawdownSeries.setData(data.drawdown);
  syncTimeScales(equityRuntime.chart, drawdownRuntime.chart);
  equityRuntime.chart.timeScale().fitContent();
  drawdownRuntime.chart.timeScale().fitContent();

  const updateEquityReadout = (time) => {
    const strategy = equityByTime.get(time);
    const benchmark = benchmarkByTime.get(time);
    const drawdown = drawdownByTime.get(time);
    if (!strategy || !benchmark || !drawdown) return;
    document.querySelector("#equityReadout").textContent = `${utcLabel(time)} UTC · Strategy ${signedPercent(strategy.value)} · BTC ${signedPercent(benchmark.value)} · Drawdown ${signedPercent(drawdown.value)}`;
  };

  crosshairSync(equityRuntime.chart, drawdownRuntime.chart, strategySeries, drawdownSeries, drawdownByTime, updateEquityReadout);
  crosshairSync(drawdownRuntime.chart, equityRuntime.chart, drawdownSeries, strategySeries, equityByTime, updateEquityReadout);

  const ablationRoot = document.querySelector("#ablationChart");
  const maxAblation = Math.max(...data.ablation.variants.map((variant) => variant.returnPct));
  data.ablation.variants.forEach((variant) => {
    const row = document.createElement("div");
    row.className = `ablation-row ${variant.status === "best" ? "best" : ""} ${variant.status === "unstable" ? "unstable" : ""}`.trim();
    const suffix = variant.status === "unstable" ? " *" : "";
    row.innerHTML = `<span class="ablation-label">${variant.label}${suffix}</span><span class="ablation-track"><i style="width:${(variant.returnPct / maxAblation * 100).toFixed(2)}%"></i></span><strong class="ablation-value">${signedPercent(variant.returnPct)}</strong>`;
    ablationRoot.appendChild(row);
  });

  const drawEpisodeDistribution = () => {
    const canvas = document.querySelector("#episodeDistribution");
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    const margin = { top: 18, right: 18, bottom: 42, left: 42 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;
    const min = -5;
    const max = 12;
    const step = 1;
    const bins = Array.from({ length: Math.round((max - min) / step) }, (_, index) => min + index * step);
    const sides = ["long", "short"];
    const counts = Object.fromEntries(sides.map((side) => [side, Array(bins.length).fill(0)]));
    const totals = Object.fromEntries(sides.map((side) => [side, data.episodes.filter((episode) => episode.side === side).length]));

    data.episodes.forEach((episode) => {
      const clipped = Math.min(max - Number.EPSILON, Math.max(min, episode.pnlPct));
      const index = Math.min(bins.length - 1, Math.max(0, Math.floor((clipped - min) / step)));
      counts[episode.side][index] += 1;
    });

    const densities = Object.fromEntries(sides.map((side) => [side, counts[side].map((value) => value / totals[side] * 100)]));
    const yMax = Math.max(5, Math.ceil(Math.max(...densities.long, ...densities.short) / 5) * 5);
    const x = (value) => margin.left + (value - min) / (max - min) * width;
    const y = (value) => margin.top + height - value / yMax * height;

    context.strokeStyle = "rgba(133, 183, 255, 0.13)";
    context.fillStyle = palette.text;
    context.font = '10px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let tick = 0; tick <= yMax; tick += 5) {
      context.beginPath();
      context.moveTo(margin.left, y(tick));
      context.lineTo(margin.left + width, y(tick));
      context.stroke();
      context.fillText(`${tick}%`, margin.left - 8, y(tick));
    }

    const zeroX = x(0);
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.beginPath();
    context.moveTo(zeroX, margin.top);
    context.lineTo(zeroX, margin.top + height);
    context.stroke();

    const slot = width / bins.length;
    const barWidth = Math.max(3, slot * 0.34);
    bins.forEach((bin, index) => {
      const center = x(bin + step / 2);
      const longHeight = margin.top + height - y(densities.long[index]);
      const shortHeight = margin.top + height - y(densities.short[index]);
      context.fillStyle = "rgba(53, 239, 173, 0.78)";
      context.fillRect(center - barWidth - 1, y(densities.long[index]), barWidth, longHeight);
      context.fillStyle = "rgba(255, 92, 128, 0.74)";
      context.fillRect(center + 1, y(densities.short[index]), barWidth, shortHeight);
    });

    context.fillStyle = palette.text;
    context.textAlign = "center";
    context.textBaseline = "top";
    [-5, 0, 5, 10, 12].forEach((tick) => {
      context.fillText(`${tick > 0 ? "+" : ""}${tick}%`, x(tick), margin.top + height + 12);
    });
  };

  drawEpisodeDistribution();
  const distributionObserver = new ResizeObserver(() => window.requestAnimationFrame(drawEpisodeDistribution));
  distributionObserver.observe(document.querySelector("#episodeDistribution"));

  if (window.location.hash) {
    try {
      const target = document.querySelector(window.location.hash);
      if (target) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
        });
      }
    } catch {
      // Ignore malformed URL fragments; the report remains fully usable.
    }
  }

  window.addEventListener("beforeunload", () => {
    [priceRuntime, positionRuntime, equityRuntime, drawdownRuntime].forEach((runtime) => {
      runtime.observer.disconnect();
      runtime.chart.remove();
    });
    distributionObserver.disconnect();
  }, { once: true });
})();
