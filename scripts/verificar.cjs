const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('/Users/diegorangel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const report = { startedAt: new Date().toISOString(), tests: [] };
const base = process.env.KIT_PREVIEW_URL || 'http://127.0.0.1:8766/';
async function inspect(page, label, viewport) {
  const failures = [], errors = [], external = [], badResponses = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('requestfailed', r => failures.push({ url: r.url(), error: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400) badResponses.push({url:r.url(),status:r.status()}); });
  await page.context().route(/^https?:/, route => {
    if (route.request().url().startsWith(base)) return route.continue();
    external.push(route.request().url());return route.abort();
  });
  const url = label.startsWith('file') ? 'file://' + root + '/index.html' : base;
  await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1400);
  const test = { label, viewport, errors, failures, external, badResponses };
  report.tests.push(test);
  for (let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=650) {
    await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(70);
  }
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>null))));
  test.images = await page.locator('img').evaluateAll(imgs=>({ total:imgs.length, loaded:imgs.filter(i=>i.complete&&i.naturalWidth>0).length }));
  assert.equal(test.images.loaded,test.images.total,'All images must decode');
  test.horizontalOverflow = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(test.horizontalOverflow,false);
  await page.evaluate(()=>scrollTo(0,0));
  await page.locator('a[href="#doar"]').click();await page.waitForTimeout(900);
  test.anchor = await page.evaluate(()=>({hash:location.hash,y:scrollY}));
  assert.ok(test.anchor.y>0);
  const next=page.locator('.elementor-image-carousel-wrapper ~ .elementor-swiper-button-next');
  const getActive=()=>page.locator('.elementor-image-carousel .swiper-slide-active').getAttribute('data-swiper-slide-index');
  const before=await getActive();
  // A seta pertence ao contêiner do carrossel no HTML original do Elementor.
  const arrow=page.locator('.elementor-widget-image-carousel .elementor-swiper-button-next').first();
  await arrow.click();await page.waitForTimeout(800);
  test.carousel={before,after:await getActive()};assert.notEqual(test.carousel.before,test.carousel.after);
  await page.locator('.elementor-image-carousel .swiper-slide-active a').click();
  const dialog=page.locator('.dialog-lightbox-widget');await dialog.waitFor({state:'visible'});
  const photos=[];
  for(let i=0;i<11;i++) {
    const image=dialog.locator('.swiper-slide-active img');
    await image.waitFor();await image.evaluate(e=>e.decode());
    photos.push(await image.getAttribute('src'));
    if(i<10){await dialog.locator('.elementor-swiper-button-next').click();await page.waitForTimeout(380);}
  }
  test.gallery={viewed:photos.length,unique:new Set(photos).size,local:photos.every(s=>!/^https?:/.test(s)||s.startsWith(base))};
  assert.equal(test.gallery.unique,11);assert.equal(test.gallery.local,true);
  await page.screenshot({path:path.join(root,'verificacao',label+'-galeria.png')});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  const video=page.locator('video');await video.scrollIntoViewIfNeeded();
  test.video=await video.evaluate(async e=>{
    e.muted=true;e.pause();e.currentTime=2;await e.play();
    const before=e.currentTime;await new Promise(r=>setTimeout(r,1200));e.pause();
    return {duration:e.duration,advanced:e.currentTime-before,decodedFrames:e.getVideoPlaybackQuality().totalVideoFrames,src:e.currentSrc};
  });assert.ok(test.video.advanced>.5);assert.ok(test.video.decodedFrames>0);
  test.contacts=await page.locator('a[href^="https://api.whatsapp.com/"],a[href^="mailto:"]').evaluateAll(a=>a.map(e=>e.href));
  assert.equal(test.contacts.length,3);assert.ok(test.contacts.filter(s=>s.includes('whatsapp')).every(s=>!s.includes('%E2%80%8B')));
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(const [i,y] of [0,Math.floor(height/2),height-viewport.height].entries()) {
    await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(150);
    await page.screenshot({path:path.join(root,'verificacao',label+'-'+i+'.png'),animations:'disabled'});
  }
  const visibleText=await page.locator('body').innerText();test.visibleTextLength=visibleText.length;
  await page.reload({waitUntil:'load'});await page.waitForTimeout(1000);
  test.reloadImages=await page.locator('img').evaluateAll(a=>({total:a.length,loaded:a.filter(i=>i.complete&&i.naturalWidth>0).length}));
  assert.equal(errors.length,0,'No page errors');assert.equal(failures.length,0,'No failed resource requests');
  assert.equal(badResponses.length,0);assert.equal(external.length,0);
  test.passed=true;
  console.log(label,JSON.stringify({images:test.images,gallery:test.gallery,video:test.video,passed:true}));
}
(async()=>{
  const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  try {
    for(const [label,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}],['file-desktop',{width:1440,height:1000}],['file-mobile',{width:390,height:844}]]) {
      const ctx=await browser.newContext({viewport,serviceWorkers:'block'});const page=await ctx.newPage();page.setDefaultTimeout(10000);
      if(label.startsWith('file'))await ctx.setOffline(true);
      try{await inspect(page,label,viewport)}finally{await ctx.close()}
    }
    report.passed=true;
  } catch(e) {report.passed=false;report.error=e.message;throw e}
  finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(root,'verificacao','resultado.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
