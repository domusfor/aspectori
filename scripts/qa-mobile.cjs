/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser verification. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.AUDIT_BASE_URL || 'http://localhost:3143';
const birth = '1990-08-14~14:30~42.6975~23.3241~Europe/Sofia~Sofia, Bulgaria';
const partner = '1988-03-05~09:15~42.6975~23.3241~Europe/Sofia~Sofia, Bulgaria';
const slugs = ['moon-sign','rising-sign','sun-moon-rising','house-systems','synastry','venus-sign','mars-sign','moon-phase','chart-ruler','annual-profections'];
const out = '/tmp/aspectori-mobile';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser = await chromium.launch({headless:true});
 try {
  const context = await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
  const page = await context.newPage(); page.setDefaultTimeout(30000); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Actual native select values; verify the longest month fits at each form width.
  await page.goto(base+'/calculators/moon-sign');
  for(const width of [320,375,430,768]) {
   await page.setViewportSize({width,height:812});
   for(let month=1;month<=12;month++) {
    await page.getByLabel('Month',{exact:true}).selectOption(String(month));
    const fits=await page.getByLabel('Month',{exact:true}).evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=`${s.fontSize} ${s.fontFamily}`;return c.measureText(el.selectedOptions[0].textContent).width<=el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)+1;});
    assert(fits,`Month ${month} clipped at ${width}`);
   }
  }
  await page.setViewportSize({width:375,height:812});
  await page.getByLabel('Year',{exact:true}).selectOption('1990');
  await page.getByLabel('Month',{exact:true}).selectOption('8');
  await page.getByLabel('Day',{exact:true}).selectOption('14');
  await page.getByLabel('Hour',{exact:true}).selectOption('14');
  await page.getByLabel('Minute',{exact:true}).selectOption('30');
  // Controlled geocoder results make touch selection and recovery deterministic.
  let cityFailure=true;
  await page.route('**/api/cities?*',route=>route.fulfill({status:cityFailure?502:200,contentType:'application/json',body:JSON.stringify(cityFailure?{error:'Unavailable'}:{results:[{label:'Sofia, Bulgaria',lat:42.6975,lon:23.3241,tz:'Europe/Sofia'}]})}));
  await page.getByRole('combobox',{name:'Place of birth'}).fill('Sofia');
  await page.getByRole('button',{name:'Retry city search'}).waitFor();
  cityFailure=false;await page.getByRole('button',{name:'Retry city search'}).tap();
  await page.getByRole('listbox',{name:'Birthplace suggestions'}).getByRole('option').first().tap();
  await page.getByRole('button',{name:'Calculate',exact:true}).tap();
  await page.getByRole('link',{name:'Explore chart & matches',exact:true}).waitFor();
  assert(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('b').includes('1990-08-14'));
  await page.locator('.birth-form').screenshot({path:out+'/birth-form-375.png'});
  const modes=[];
  for(const slug of slugs) for(const unknown of [false,true]) {
   console.log(`Checking ${slug}: ${unknown?'unknown':'known'} time`);
   await page.goto('about:blank');
   const hash=new URLSearchParams({b:unknown?birth.replace('14:30',''):birth,...(slug==='synastry'?{p:unknown?partner.replace('09:15',''):partner}:{})});
   const endpoint=slug==='synastry'?'/api/couple':slug==='moon-phase'?'/api/birth-moon':'/api/chart';
   const response=page.waitForResponse(r=>new URL(r.url()).pathname===endpoint&&r.request().method()==='POST');
   await page.goto(base+'/calculators/'+slug+'#'+hash);
   const res=await response;assert.equal(res.status(),200,slug);assert.equal(res.headers()['cache-control'],'no-store');
   await page.getByText('Calculating the sky…',{exact:true}).waitFor({state:'hidden'});
   const alerts=(await page.getByRole('alert').allTextContents()).filter(text=>text.trim());
   assert.deepEqual(alerts,[],`${slug}: unexpected alert`);
   for(const width of [320,390,430,768]) {await page.setViewportSize({width,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${slug} at ${width}`);}
   modes.push({slug,unknown,passed:true});
  }
  await page.setViewportSize({width:375,height:812});
  await page.goto(base+'/calculators/house-systems#'+new URLSearchParams({b:birth}));
  const table=page.getByRole('region',{name:'Planetary house comparison'});await table.waitFor();await table.focus();await page.keyboard.press('ArrowRight');
  assert(await table.evaluate(el=>el===document.activeElement));
  await page.goto(base+'/calculators');await page.getByRole('searchbox').fill('does-not-exist');await page.getByRole('button',{name:'Show all calculators'}).tap();assert.equal(await page.locator('a.tool-result-card').count(),10);
  await page.goto(base+'/charts');await page.getByRole('combobox',{name:'Search famous birth charts'}).fill('Einstein');await page.getByRole('option').first().getByRole('link').tap();await page.waitForURL('**/charts/albert-einstein');
  // Failure/retry for a previously indefinite spinner, using the actual retry control.
  let skyFailure=true;await page.route('**/api/sky',route=>skyFailure?route.fulfill({status:503,body:'unavailable'}):route.continue());
  await page.goto(base+'/');await page.getByRole('button',{name:'Retry sky snapshot'}).waitFor();skyFailure=false;await page.getByRole('button',{name:'Retry sky snapshot'}).tap();await page.getByRole('button',{name:'Refresh sky snapshot'}).waitFor();
  await page.locator('#sky').screenshot({path:out+'/sky-375.png'});
  // Check the actual free mobile PDF download with the real calculation endpoints.
  await page.goto(base+'/report#'+new URLSearchParams({b:birth,p:partner,pn:'Alex',rel:'friend'}));
  await page.getByRole('button',{name:'Download free PDF',exact:true}).waitFor({timeout:60000});
  const downloadPromise=page.waitForEvent('download',{timeout:60000});await page.getByRole('button',{name:'Download free PDF',exact:true}).tap();const download=await downloadPromise;await download.saveAs(out+'/comparison.pdf');assert(fs.statSync(out+'/comparison.pdf').size>100000);
  const actualCity=await page.request.get(base+'/api/cities?q=Sofia');const cityBody=await actualCity.json();
  const result={modes,allMonthsAtWidths:[320,375,430,768],touchCityRetry:true,keyboardTable:true,famousSearch:true,skyRetry:true,pdfBytes:fs.statSync(out+'/comparison.pdf').size,liveGeocoder:{status:actualCity.status(),resultCount:cityBody.results?.length??0},errors};
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
