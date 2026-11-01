/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser audit. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.AUDIT_BASE_URL||'http://localhost:3143';
const out='/tmp/aspectori-wheel';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(30000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cases=[['known','1990-08-14~14:30~42.6975~23.3241~Europe/Sofia~Sofia'],['unknown','1990-08-14~~42.6975~23.3241~Europe/Sofia~Sofia'],['polar','1990-08-14~14:30~78.2232~15.6469~Arctic/Longyearbyen~Longyearbyen']];
 const results=[];
 for(const [name,b] of cases){
  await page.goto('about:blank');
  const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/chart'&&r.request().method()==='POST');
  await page.goto(base+'/#'+new URLSearchParams({b}));const chart=await(await response).json();
  const wheel=page.locator('.card-enter svg[aria-label="Birth chart wheel"]');await wheel.waitFor();
  const measured=await wheel.evaluate(svg=>{
   const texts=[...svg.querySelectorAll('text')];
   const bodies=[...svg.querySelectorAll('g')].filter(g=>g.querySelector('text.glyph')).map(g=>{const t=g.querySelector('text.glyph'),tick=g.querySelector('line');const box=t.getBBox();return {glyph:t.textContent.trim(),x:+t.getAttribute('x'),y:+t.getAttribute('y'),tickX:+tick.getAttribute('x1'),tickY:+tick.getAttribute('y1'),box:{x:box.x,y:box.y,width:box.width,height:box.height}};});
   return {signs:texts.filter(t=>t.getAttribute('font-size')==='14').map(t=>t.textContent.trim()),bodies,houses:texts.filter(t=>t.getAttribute('font-size')==='7'&&/^\d+$/.test(t.textContent)).length,angles:texts.filter(t=>['ASC','MC'].includes(t.textContent)).map(t=>({label:t.textContent,x:+t.getAttribute('x'),y:+t.getAttribute('y')})),delays:[...svg.querySelectorAll('.fade,.draw')].map(e=>getComputedStyle(e).animationDelay)};
  });
  assert.equal(measured.signs.length,12);assert.equal(measured.bodies.length,12);assert.equal(measured.houses,name==='unknown'?0:12);assert(measured.delays.every(d=>d==='0s'));
  const ids=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','node','chiron'];
  const glyphs=['☉','☽','☿','♀','♂','♃','♄','♅','♆','♇','☊','⚷'];
  const norm=n=>(n%360+360)%360;const rot=chart.timeKnown?chart.points.find(p=>p.id==='asc').lon:0;
  for(const body of measured.bodies){const index=glyphs.findIndex(g=>body.glyph.startsWith(g));assert(index>=0);const point=chart.points.find(p=>p.id===ids[index]);let lon=point.lon;if(point.range){let d=norm(point.range.end-point.range.start);if(d>180)d-=360;lon=norm(point.range.start+d/2);}const rad=(180+lon-rot)*Math.PI/180;assert(Math.abs(body.tickX-(200+156*Math.cos(rad)))<0.001);assert(Math.abs(body.tickY-(200-156*Math.sin(rad)))<0.001);}
  for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const a=measured.bodies[i].box,b=measured.bodies[j].box;assert(!(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y),'Planet glyph boxes overlap');}
  assert.equal(measured.angles.length,name==='unknown'?0:2);if(name!=='unknown')assert(measured.angles.find(a=>a.label==='ASC').x<10);
  if(name==='polar'){assert.equal(chart.cusps.placidus,null);await page.getByText('Placidus cannot be drawn this close to the pole, so only whole sign is shown.').waitFor();}
  await wheel.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  await wheel.screenshot({path:out+'/'+name+'.png'});results.push({name,checked:true,...measured});
 }
 const sky=await(await context.request.get(base+'/api/sky')).json();const phases=[];
 for(const waxing of [true,false])for(const illumination of [0,25,50,75,100]){
  await page.route('**/api/sky',route=>route.fulfill({json:{...sky,moon:{...sky.moon,waxing,illumination}}}));
  await page.goto(base+'/');const moon=page.locator('svg[aria-label^="Moon "]');await moon.waitFor();
  const lit=await moon.evaluate(svg=>{const p=new Path2D(svg.querySelector('path').getAttribute('d'));const c=document.createElement('canvas').getContext('2d');let all=0,lit=0,left=0,right=0;for(let x=2.1;x<42;x+=.2)for(let y=2.1;y<42;y+=.2)if((x-22)**2+(y-22)**2<400){all++;if(c.isPointInPath(p,x,y)){lit++;if(x<22)left++;else right++;}}return {fraction:lit/all,left,right};});
  assert(Math.abs(lit.fraction-illumination/100)<.01);if(illumination>0&&illumination<100)assert(waxing?lit.right>lit.left:lit.left>lit.right);
  phases.push({waxing,illumination,...lit});await page.unroute('**/api/sky');
 }
 await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.locator('.hero-sky svg').waitFor();
 assert.equal(await page.locator('.spin-slower').evaluate(el=>getComputedStyle(el).animationDuration),'600s');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.spin-slower').evaluate(el=>getComputedStyle(el).animationIterationCount),'1');
 const motion=await page.locator('.hero-sky .fade').first().evaluate(el=>({delay:getComputedStyle(el).animationDelay,duration:getComputedStyle(el).animationDuration}));assert.equal(motion.delay,'0s');assert(parseFloat(motion.duration)<.001);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/audit.json',JSON.stringify({results,phases,motion,errors},null,2));console.log('PASS: 3 wheel fixtures, exact ticks, 12 symbols/signs, glyph separation, polar/unknown handling, 10 Moon-phase fills and motion preferences.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
