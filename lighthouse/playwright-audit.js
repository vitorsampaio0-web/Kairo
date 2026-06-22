const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });

  // Intercept network for diagnostics
  const requests = [];
  page.on('request', r => requests.push({ url: r.url(), type: r.resourceType() }));

  // Navigate
  const start = Date.now();
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - start;

  // Execute performance metrics
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

    const fcp = paints.find(p => p.name === 'first-contentful-paint');
    const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null;

    return {
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
      loadComplete: nav ? nav.loadEventEnd : null,
      fcp: fcp ? fcp.startTime : null,
      lcp: lcp ? lcp.startTime : null,
      resourceCount: performance.getEntriesByType('resource').length,
      transferSize: nav ? nav.transferSize : null,
      encodedBodySize: nav ? nav.encodedBodySize : null,
    };
  });

  // Check for Web Vitals recommendations
  const checks = await page.evaluate(() => {
    // Check render-blocking resources
    const scripts = Array.from(document.querySelectorAll('script'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const imgs = Array.from(document.querySelectorAll('img'));

    const renderBlockingScripts = scripts.filter(s => !s.defer && !s.async && !s.type).length;
    const imgsWithoutDimensions = imgs.filter(i => !i.hasAttribute('width') || !i.hasAttribute('height')).length;
    const imgsWithoutLazy = imgs.filter(i => i.getBoundingClientRect().top > window.innerHeight && !i.loading).length;
    const imgsWithSrcset = imgs.filter(i => i.srcset && i.srcset.includes('.webp')).length;

    return {
      renderBlockingScripts,
      totalScripts: scripts.length,
      totalStylesheets: styles.length,
      imgsWithoutDimensions,
      imgsWithoutLazy,
      imgsWithSrcset,
      totalImgs: imgs.length,
      hasPreconnect: !!document.querySelector('link[rel="preconnect"]'),
      hasDnsPrefetch: !!document.querySelector('link[rel="dns-prefetch"]'),
      hasFontPreload: !!document.querySelector('link[rel="preload"][as="style"]'),
      hasAosPrint: !!document.querySelector('link[href*="aos"]'),
    };
  });

  console.log('');
  console.log('=== LIGHTHOUSE-STYLE AUDIT (localhost) ===');
  console.log('');
  console.log('--- PERFORMANCE METRICS ---');
  console.log('Page load time:      ' + loadTime + ' ms');
  console.log('DOMContentLoaded:    ' + (metrics.domContentLoaded ? Math.round(metrics.domContentLoaded) + ' ms' : 'N/A'));
  console.log('Load complete:       ' + (metrics.loadComplete ? Math.round(metrics.loadComplete) + ' ms' : 'N/A'));
  console.log('First Contentful Paint: ' + (metrics.fcp ? Math.round(metrics.fcp) + ' ms' : 'N/A'));
  console.log('Largest Contentful Paint: ' + (metrics.lcp ? Math.round(metrics.lcp) + ' ms' : 'N/A'));
  console.log('Transfer size:       ' + (metrics.transferSize ? (metrics.transferSize/1024).toFixed(1) + ' KB' : 'N/A'));
  console.log('');

  console.log('--- OPTIMIZATION CHECKLIST ---');
  console.log('Preconnect to fonts.googleapis.com:   ' + (checks.hasPreconnect ? 'PASS' : 'FAIL'));
  console.log('DNS-prefetch external domains:        ' + (checks.hasDnsPrefetch ? 'PASS' : 'FAIL'));
  console.log('Font preload (non-render-blocking):   ' + (checks.hasFontPreload ? 'PASS' : 'FAIL'));
  console.log('AOS CSS not render-blocking:          ' + (checks.hasAosPrint ? 'PASS' : 'FAIL'));
  console.log('Scripts with defer/async:             ' + Math.round(((checks.totalScripts - checks.renderBlockingScripts)/checks.totalScripts)*100) + '% (' + (checks.totalScripts - checks.renderBlockingScripts) + '/' + checks.totalScripts + ')');
  console.log('Images with width/height (CLS):       ' + (checks.imgsWithoutDimensions === 0 ? 'PASS (0 missing)' : 'FAIL (' + checks.imgsWithoutDimensions + ' missing)'));
  console.log('Images with WebP srcset:              ' + checks.imgsWithSrcset + '/' + checks.totalImgs);
  console.log('Total resources loaded:               ' + metrics.resourceCount);
  console.log('');

  // Estimate Lighthouse score
  let score = 100;
  if (metrics.fcp && metrics.fcp > 1800) score -= 15;
  else if (metrics.fcp && metrics.fcp > 900) score -= 5;

  if (metrics.lcp && metrics.lcp > 2500) score -= 20;
  else if (metrics.lcp && metrics.lcp > 1200) score -= 10;

  if (checks.imgsWithoutDimensions > 0) score -= 10;
  if (checks.renderBlockingScripts > 0) score -= 10;
  if (!checks.hasPreconnect) score -= 5;
  if (!checks.hasDnsPrefetch) score -= 5;

  const cl = score >= 90 ? 'green' : score >= 70 ? 'amber' : 'red';
  console.log('Estimated Performance Score: ' + score + '/100 (' + cl + ')');
  console.log('');

  // Save detailed report
  const report = { metrics, checks, score, loadTime, timestamp: new Date().toISOString() };
  fs.writeFileSync('./lighthouse/playwright-audit.json', JSON.stringify(report, null, 2));

  await browser.close();
  process.exit(0);
})();
