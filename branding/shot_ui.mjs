import { createRequire } from 'module';
const require = createRequire('/home/tiep/.openclaw/workspace/');
const puppeteer = await import(require.resolve('puppeteer')).then(m => m.default);

const CHROME = '/home/tiep/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome';
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:8791/index.html';
const OUT = '/home/tiep/.openclaw/workspace/projects/total-pdf/branding/ui-preview.png';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));
await page.screenshot({ path: OUT, fullPage: false });
console.log('shot:', OUT);
console.log('console errors:', errs.length);
errs.slice(0, 15).forEach(e => console.log('  -', e.slice(0, 200)));
await browser.close();
