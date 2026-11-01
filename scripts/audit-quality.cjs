/* eslint-disable @typescript-eslint/no-require-imports -- This standalone CommonJS runner can use an external Playwright installation. */
/* Local audit: PLAYWRIGHT_MODULE may point to an existing Playwright installation. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AUDIT_BASE_URL || 'http://localhost:3143';
const out = process.env.AUDIT_OUTPUT_DIR || '/tmp/aspectori-quality';
const birth = '1990-08-14~14:30~42.6975~23.3241~Europe/Sofia~Sofia, Bulgaria';
const partner = '1988-03-05~09:15~42.6975~23.3241~Europe/Sofia~Sofia, Bulgaria';
const params = new URLSearchParams({ b: birth, p: partner, pn: 'Alex', rel: 'friend' });
const slugs = ['moon-sign','rising-sign','sun-moon-rising','house-systems','synastry','venus-sign','mars-sign','moon-phase','chart-ruler','annual-profections'];
const routes = ['/', '/calculators', ...slugs.map(s=>'/calculators/'+s), '/learn', '/learn/how-to-read-a-birth-chart', '/learn/birth-chart-without-birth-time', '/learn/whole-sign-vs-placidus', '/learn/aspects-and-orbs', '/birth-chart-report', '/charts', '/charts/albert-einstein', '/charts/category/science', '/zodiac/aries', '/accuracy', '/method', '/privacy', '/#'+params, '/report#'+params, '/about', '/contact', '/terms'];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({headless: true});
  const results = [];
  try {
    const page = await browser.newPage({ viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e=> errors.push({url:page.url(),message:e.message}));
    page.on('console', message=> { if (message.type()==='error') errors.push({url:page.url(),message:message.text()}); });
    for (let i=0;i<routes.length;i++) {
      const route = routes[i];
      const response = await page.goto(base+route, {waitUntil:'networkidle'});
      await page.addScriptTag({path: require.resolve('axe-core/axe.min.js')});
      const axe = await page.evaluate(async()=> {
        const r = await window.axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});
        return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,12)}));
      });
      const metadata = await page.evaluate(()=>({title:document.title,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),description:document.querySelector('meta[name=description]')?.getAttribute('content'),robots:document.querySelector('meta[name=robots]')?.getAttribute('content'),schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{return JSON.parse(e.textContent)}catch{return 'INVALID'}})}));
      const widths = [];
      for (const width of [320,375,390,768,1440]) {
        await page.setViewportSize({width,height:812});
        widths.push(await page.evaluate(()=> {
          const visible = el => {const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'};
          const overflowing = [...document.querySelectorAll('main *, form *, header *')].filter(el=>visible(el)&&!el.closest('svg, [aria-hidden="true"]')&&el.getBoundingClientRect().right>innerWidth+1&&!el.closest('.overflow-x-auto')).slice(0,12).map(el=>({tag:el.tagName,text:el.textContent?.trim().slice(0,60),width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}));
          const selects=[...document.querySelectorAll('select')].filter(visible).map(el=>{const s=getComputedStyle(el);const c=document.createElement('canvas').getContext('2d');c.font=`${s.fontSize} ${s.fontFamily}`;const label=el.selectedOptions[0]?.textContent||'';const room=el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);return {name:el.getAttribute('aria-label'),label,room,needed:c.measureText(label).width}}).filter(x=>x.needed>x.room+2);
          return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflowing,clippedSelects:selects};
        }));
      }
      await page.setViewportSize({width:375,height:812});
      if ([0,2,5,6,17,24,25,26,27,28,29].includes(i)) await page.screenshot({path:path.join(out,`page-${i}-mobile.png`),fullPage:true});
      if (i===25) await page.locator('.connection-result').screenshot({path:path.join(out,'comparison-wheels-mobile.png')});
      if (i===26) await page.locator('.report-cover').screenshot({path:path.join(out,'report-cover-mobile.png')});
      results.push({route,status:response.status(),metadata,axe,widths});
      fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({base,results,errors},null,2));
      console.log(JSON.stringify({route,status:response.status(),axe:axe.map(x=>x.id),overflow:widths.filter(w=>w.overflowing.length).map(w=>w.width),clippedSelects:widths.filter(w=>w.clippedSelects.length).map(w=>w.width)}));
    }
    console.log('Saved '+path.join(out,'audit.json'));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
