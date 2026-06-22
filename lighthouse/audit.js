const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  const runnerResult = await lighthouse('http://localhost:8765/index.html', {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  });

  const report = runnerResult.lhr;

  const scores = {
    Performance:    Math.round(report.categories.performance.score * 100),
    Accessibility:  Math.round(report.categories.accessibility.score * 100),
    BestPractices:  Math.round(report.categories['best-practices'].score * 100),
    SEO:            Math.round(report.categories.seo.score * 100),
    PWA:            Math.round(report.categories.pwa.score * 100),
  };

  const audits = report.audits;
  const metrics = {
    'First Contentful Paint': audits['first-contentful-paint']?.displayValue || 'N/A',
    'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue || 'N/A',
    'Total Blocking Time': audits['total-blocking-time']?.displayValue || 'N/A',
    'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue || 'N/A',
    'Speed Index': audits['speed-index']?.displayValue || 'N/A',
  };

  console.log('=== LIGHTHOUSE SCORES ===');
  Object.entries(scores).forEach(([k,v]) => console.log(`${k}: ${v}`));
  console.log('');
  console.log('=== CORE WEB VITALS ===');
  Object.entries(metrics).forEach(([k,v]) => console.log(`${k}: ${v}`));

  // Salvar detalhes
  fs.writeFileSync('./lighthouse/report.json', JSON.stringify(report, null, 2));

  await chrome.kill();
  process.exit(0);
})();
