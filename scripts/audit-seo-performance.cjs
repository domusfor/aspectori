/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS audit runner. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const base=process.env.AUDIT_BASE_URL||'http://localhost:3143';const out='/tmp/aspectori-seo-performance';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext();const page=await context.newPage();
 const sitemap=await (await context.request.get(base+'/sitemap.xml')).text();
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]));
 assert.equal(urls.length,new Set(urls.map(u=>u.href)).size);assert(!urls.some(u=>u.pathname==='/report'||u.pathname.startsWith('/api/')));
 const groups=[urls.filter(u=>u.pathname.startsWith('/charts/')&&!u.pathname.includes('/category/')),urls.filter(u=>u.pathname.includes('/category/')),urls.filter(u=>u.pathname.startsWith('/zodiac/'))];
 const sample=new Set(urls.filter(u=>!u.pathname.startsWith('/charts/')&&!u.pathname.startsWith('/zodiac/')).map(u=>u.pathname));
 for(const group of groups)for(let i=0;i<12;i++)if(group.length)sample.add(group[Math.floor(i*(group.length-1)/11)].pathname);
 await page.goto(base+'/calculators');const checks=[];
 for(const route of sample){
  const response=await context.request.get(base+route);const html=await response.text();
  const meta=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');return {title:d.title,h1:d.querySelectorAll('h1').length,canonical:d.querySelector('link[rel=canonical]')?.getAttribute('href'),description:d.querySelector('meta[name=description]')?.getAttribute('content'),noindex:d.querySelector('meta[name=robots]')?.getAttribute('content')?.includes('noindex')||false,schema:[...d.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{JSON.parse(e.textContent);return true}catch{return false}})}} ,html);
  assert.equal(response.status(),200,route);assert.equal(meta.h1,1,route);assert(meta.title&&meta.description,route);assert.equal(new URL(meta.canonical).pathname,route,route);assert(!meta.noindex,route);assert(meta.schema.every(Boolean),route);checks.push({route,status:response.status(),...meta});
 }
 const missing=[];for(const route of ['/calculators/not-a-tool','/learn/not-a-guide','/charts/not-a-person','/zodiac/not-a-sign','/charts/category/science/page/999999']){const r=await context.request.get(base+route);assert.equal(r.status(),404,route);missing.push(route);}
 const report=await(await context.request.get(base+'/report')).text();assert(/noindex/.test(report));
 const robots=await(await context.request.get(base+'/robots.txt')).text();assert(!robots.includes('Disallow: /report'));assert(robots.includes('Disallow: /api/'));
 const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const noJsPage=await noJs.newPage();await noJsPage.goto(base+'/');assert.equal(await noJsPage.locator('h1').count(),1);assert(await noJsPage.locator('summary').filter({hasText:'Do I need my exact birth time?'}).isVisible());await noJs.close();
 const perf=[];
 for(const route of ['/','/calculators/moon-sign','/charts']){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.addInitScript(()=>{window.__lab={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__lab.cls+=e.value}).observe({type:'layout-shift',buffered:true});});
  await p.goto(base+route,{waitUntil:'networkidle',timeout:60000});await p.evaluate(()=>document.fonts.ready);
  perf.push({route,...await p.evaluate(()=>({lcpMs:Math.round(window.__lab.lcp),cls:window.__lab.cls,transferBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),jsBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('.js')).reduce((n,r)=>n+r.transferSize,0),fontRequests:performance.getEntriesByType('resource').filter(r=>r.name.includes('.woff')).length}))});await ctx.close();
 }
 const result={sitemapUrls:urls.length,origins:[...new Set(urls.map(u=>u.origin))],publicPagesChecked:checks.length,checks,missing,privateReportNoindex:true,publicContentWithoutJavaScript:true,lab:{description:'Single cold local production run per route; 390x844 Chromium emulation, 150ms latency, 1.6Mbps download, 4x CPU slowdown. Not field CWV, Lighthouse or physical-device results. CLS is observed total during navigation only.',results:perf}};
 fs.writeFileSync(out+'/audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,checks:undefined}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
