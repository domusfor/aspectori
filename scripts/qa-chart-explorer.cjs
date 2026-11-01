/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.env.AUDIT_BASE_URL||'http://localhost:3143';const out='/tmp/aspectori-explorer';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});page.setDefaultTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fixtures=[['known','1990-08-14~14:30~42.6975~23.3241~Europe/Sofia~Sofia'],['unknown','1990-08-14~~42.6975~23.3241~Europe/Sofia~Sofia'],['polar','1990-08-14~14:30~78.2232~15.6469~Arctic/Longyearbyen~Longyearbyen']];const results=[];
 for(const [name,b] of fixtures){
  await page.goto('about:blank');await page.goto(base+'/#'+new URLSearchParams({b}),{waitUntil:'networkidle'});
  const explorer=page.locator('#chart-explorer');await explorer.waitFor();
  const picker=explorer.getByLabel('Explore a placement or aspect');const region=explorer.getByRole('region',{name:'Selected chart explanation'});
  assert((await region.innerText()).includes('Leo Sun'));
  await explorer.getByRole('button',{name:'Moon',exact:true}).tap();assert.equal(await picker.inputValue(),'moon');
  if(name==='unknown'){assert(await explorer.getByRole('button',{name:'Rising · needs a time'}).isDisabled());assert((await region.innerText()).includes('Birth time is unknown'));assert.equal(await explorer.getByLabel('House system for this reading').count(),0);}
  if(name==='polar'){assert((await region.innerText()).includes('Placidus is unavailable'));assert.equal(await explorer.getByLabel('House system for this reading').count(),0);}
  if(name==='known'){
   await picker.selectOption('sun');const oldPosition=await region.locator('dd').first().innerText();
   await explorer.getByLabel('House system for this reading').selectOption('whole');assert((await region.innerText()).includes('whole sign'));assert.equal(await region.locator('dd').first().innerText(),oldPosition);
   assert.equal(await page.getByRole('radio',{name:'Whole sign',exact:true}).getAttribute('aria-checked'),'true');
  }
  const values=await picker.locator('option').evaluateAll(options=>options.map(o=>o.value));
  for(const value of values){await picker.selectOption(value);assert(await region.locator('h3').innerText());assert.equal(await region.getByRole('heading',{name:'Traditional interpretation',exact:true}).count(),1);}
  const wheel=page.locator('.card-enter svg');await wheel.locator('g').filter({hasText:'☿'}).locator('text.glyph').tap();
  assert.equal(await picker.inputValue(),'mercury');await page.waitForFunction(()=>document.activeElement.id==='chart-explorer-title');
  // The former destination for Mercury remains collapsed; the explainer still works.
  assert.equal(await page.locator('#why details').getAttribute('open'),null);
  await explorer.getByRole('button',{name:'Moon',exact:true}).tap();
  const widths=[];
  for(const width of [320,375,390,768,1440]){
   await page.setViewportSize({width,height:812});
   const measure=await explorer.evaluate(el=>{const select=el.querySelector('select'),s=getComputedStyle(select),canvas=document.createElement('canvas').getContext('2d');canvas.font=`${s.fontSize} ${s.fontFamily}`;const room=select.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,clipped:[...select.options].filter(o=>canvas.measureText(o.text).width>room+1).map(o=>o.text),fontSize:parseFloat(s.fontSize)};});
   assert(measure.documentWidth<=width);assert(measure.fontSize>=15.99,JSON.stringify(measure));assert.deepEqual(measure.clipped,[],name+' at '+width);widths.push(measure);
  }
  await page.setViewportSize({width:375,height:812});await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[]);await explorer.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await explorer.screenshot({path:out+'/'+name+'.png'});
  results.push({name,selections:values.length,wheelSelection:true,focusMoved:true,widths,violations});
 }
 await page.goto(base+'/charts/albert-einstein',{waitUntil:'networkidle'});await page.locator('#chart-explorer').waitFor();await page.getByLabel('Explore a placement or aspect').selectOption('venus');assert((await page.getByRole('region',{name:'Selected chart explanation'}).innerText()).includes('Venus'));
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/audit.json',JSON.stringify({results,famousChart:true,errors},null,2));console.log(JSON.stringify({results,famousChart:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
