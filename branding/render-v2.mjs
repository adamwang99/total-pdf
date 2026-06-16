import { createRequire } from 'module';
const require = createRequire('/home/tiep/.openclaw/workspace/');
const puppeteer = await import(require.resolve('puppeteer')).then(m => m.default);
import { readFileSync } from 'fs';

const CHROME = '/home/tiep/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome';
const DIR = '/home/tiep/.openclaw/workspace/projects/total-pdf/branding/';

const jobs = [
  { svg: 'total-pdf-logo-wide-v2.svg', out: 'total-pdf-logo-wide-v2.png', w: 1600, h: 480 },
  { svg: 'total-pdf-icon-v2.svg', out: 'total-pdf-icon-v2.png', w: 512, h: 512 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});

for (const j of jobs) {
  let svg;
  try { svg = readFileSync(DIR + j.svg, 'utf8'); } catch (e) { console.log('skip', j.svg, e.message); continue; }
  const page = await browser.newPage();
  await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: DIR + j.out, omitBackground: false });
  console.log('rendered:', j.out);
  await page.close();
}
await browser.close();
