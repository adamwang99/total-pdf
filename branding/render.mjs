import { createRequire } from 'module';
const require = createRequire('/home/tiep/.openclaw/workspace/');
const puppeteer = await import(require.resolve('puppeteer')).then(m => m.default);

const HTML = '/home/tiep/.openclaw/workspace/projects/total-pdf/branding/total-pdf-overview.html';
const OUT = '/home/tiep/.openclaw/workspace/projects/total-pdf/branding/total-pdf-overview.png';
const CHROME = '/home/tiep/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log('rendered:', OUT);
