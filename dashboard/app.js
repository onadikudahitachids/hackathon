const data = window.__TEST_DASHBOARD_DATA__;

function el(id) {
  return document.getElementById(id);
}

function renderSummaryCards(summary) {
  const cards = [
    ["Total", summary.total],
    ["Passed", summary.passed],
    ["Failed", summary.failed + summary.timedOut],
    ["Skipped", summary.skipped],
    ["Duration (s)", summary.durationSeconds],
  ];

  el("summaryCards").innerHTML = cards
    .map(
      ([title, value]) => `
      <div class="card">
        <div class="card-title">${title}</div>
        <div class="card-value">${value}</div>
      </div>
    `,
    )
    .join("");
}

function renderReliabilityBadge(score) {
  const badge = el("reliabilityBadge");
  badge.textContent = `Reliability: ${score}%`;
  badge.classList.add(score >= 85 ? "good" : score >= 70 ? "warn" : "bad");
}

function renderTrendChart(trend) {
  const ctx = el("reliabilityTrend");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: trend.labels,
      datasets: [
        {
          label: "Reliability %",
          data: trend.values,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79,70,229,0.15)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function renderList(id, items, emptyLabel) {
  const list = el(id);
  if (!items.length) {
    list.innerHTML = `<li class="item muted">${emptyLabel}</li>`;
    return;
  }
  list.innerHTML = items
    .map((item) => `<li class="item"><span>${item.title}</span><code>${item.statuses.join(" -> ")}</code></li>`)
    .join("");
}

function boot() {
  const generatedAt = new Date(data.generatedAt).toLocaleString();
  el("generatedAt").textContent = `Generated at ${generatedAt}`;
  renderSummaryCards(data.summary);
  renderReliabilityBadge(data.summary.reliabilityScore);
  renderTrendChart(data.reliabilityTrend);
  renderList("autoHealedList", data.autoHealedFixes, "No auto-healed runs found.");
  renderList("flakyList", data.flakyTests, "No flaky tests detected.");
}

boot();
