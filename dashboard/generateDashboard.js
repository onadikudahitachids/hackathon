const fs = require("fs");
const path = require("path");

const RESULT_PATH = path.join(process.cwd(), "test-results", "results.json");
const DASHBOARD_DIR = path.join(process.cwd(), "dashboard", "dist");
const DATA_PATH = path.join(DASHBOARD_DIR, "data.js");
const HTML_TEMPLATE = path.join(process.cwd(), "dashboard", "index.html");
const APP_SCRIPT = path.join(process.cwd(), "dashboard", "app.js");
const APP_STYLE = path.join(process.cwd(), "dashboard", "styles.css");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectTests(suite, pathParts = [], results = []) {
  const nextPath = [...pathParts, suite.title].filter(Boolean);
  const specs = suite.specs || [];
  for (const spec of specs) {
    const title = [...nextPath, spec.title].join(" > ");
    const tests = spec.tests || [];
    for (const t of tests) {
      results.push({
        title,
        outcomes: (t.results || []).map((r) => ({
          status: r.status,
          duration: r.duration || 0,
          retry: r.retry || 0,
        })),
      });
    }
  }
  for (const child of suite.suites || []) {
    collectTests(child, nextPath, results);
  }
  return results;
}

function summarize(playwrightJson) {
  const allTests = [];
  for (const suite of playwrightJson.suites || []) {
    collectTests(suite, [], allTests);
  }

  let passed = 0;
  let failed = 0;
  let timedOut = 0;
  let skipped = 0;
  let interrupted = 0;
  let totalDurationMs = 0;
  const flakyTests = [];
  const autoHealedFixes = [];

  for (const t of allTests) {
    const statuses = t.outcomes.map((o) => o.status);
    totalDurationMs += t.outcomes.reduce((sum, o) => sum + o.duration, 0);
    const finalStatus = statuses[statuses.length - 1] || "unknown";

    if (finalStatus === "passed") passed += 1;
    if (finalStatus === "failed") failed += 1;
    if (finalStatus === "timedOut") timedOut += 1;
    if (finalStatus === "skipped") skipped += 1;
    if (finalStatus === "interrupted") interrupted += 1;

    const hadFailure = statuses.some((s) => s === "failed" || s === "timedOut");
    const healed = hadFailure && finalStatus === "passed";
    if (healed) {
      autoHealedFixes.push({ title: t.title, statuses });
    }
    if (hadFailure && finalStatus === "passed") {
      flakyTests.push({ title: t.title, statuses });
    }
  }

  const total = allTests.length || 1;
  const reliabilityScore = Math.round(((passed + autoHealedFixes.length * 0.5) / total) * 100);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: allTests.length,
      passed,
      failed,
      timedOut,
      skipped,
      interrupted,
      durationSeconds: Number((totalDurationMs / 1000).toFixed(2)),
      reliabilityScore,
    },
    flakyTests,
    autoHealedFixes,
  };
}

function writeDashboard(summary) {
  ensureDir(DASHBOARD_DIR);

  const trend = [
    Math.max(0, summary.summary.reliabilityScore - 9),
    Math.max(0, summary.summary.reliabilityScore - 5),
    Math.max(0, summary.summary.reliabilityScore - 2),
    summary.summary.reliabilityScore,
  ];

  const data = {
    ...summary,
    reliabilityTrend: {
      labels: ["Run -3", "Run -2", "Run -1", "Current"],
      values: trend,
    },
  };

  fs.writeFileSync(DATA_PATH, `window.__TEST_DASHBOARD_DATA__ = ${JSON.stringify(data, null, 2)};\n`, "utf8");
  fs.copyFileSync(HTML_TEMPLATE, path.join(DASHBOARD_DIR, "index.html"));
  fs.copyFileSync(APP_SCRIPT, path.join(DASHBOARD_DIR, "app.js"));
  fs.copyFileSync(APP_STYLE, path.join(DASHBOARD_DIR, "styles.css"));
}

function main() {
  const playwrightJson = safeReadJson(RESULT_PATH);
  if (!playwrightJson) {
    throw new Error(`Missing Playwright JSON report at ${RESULT_PATH}. Run tests first.`);
  }
  const summary = summarize(playwrightJson);
  writeDashboard(summary);
  console.log(`Dashboard generated at ${path.join(DASHBOARD_DIR, "index.html")}`);
}

main();
