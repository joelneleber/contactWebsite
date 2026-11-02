import {views,viewPose} from './source/cockpit-views.js';
// One progress figure for the whole load, weighted by what each step really downloads
// (compressed sizes): styles, project data, the 3D code, the room model, then scene setup.
const loadSteps=[['css',.005],['data',.035],['code',.09],['room',.62],['setup',.25]];
window.__load=(()=>{const done={};let finished=null,shown=0,stepStart=performance.now(),current='css';
 const actual=()=>loadSteps.reduce((sum,[k,w])=>sum+w*(done[k]||0),0);
 return{
  set(step,f){done[step]=Math.max(done[step]||0,Math.min(1,f));const next=loadSteps.find(([k])=>(done[k]||0)<1);if(next&&next[0]!==current){current=next[0];stepStart=performance.now();}},
  // Steps without byte counts (everything but the room model) creep toward (never past) 85% of their share so the drawing keeps moving.
  target(now){let t=actual();const step=loadSteps.find(([k])=>k===current);if(step&&!finished&&current!=='room'){const f=done[current]||0,creep=(1-Math.exp(-(now-stepStart)/(current==='setup'?2500:1800)))*.85;t+=step[1]*Math.max(0,creep-f);}return finished?1:Math.min(.995,t);},
  get shown(){return shown;},set shown(v){shown=v;},
  finish(){if(finished)return finished;finished=new Promise(r=>{this._resolve=r;});return finished;},
  _resolve:null
 };})();

// Blueprint: curated hand-drawn contours of the room, packed into BLUEPRINT by source/scripts/sketch-blueprint.py,
// drawn back to front and projected with the same camera the room view uses.
const BLUEPRINT='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';
(()=>{const loading=document.getElementById('loading'),canvas=document.getElementById('bp-canvas'),pct=document.getElementById('load-pct');if(!loading||!canvas)return;
 const sketchViews=Object.fromEntries(Object.entries(views).map(([key,v])=>[key,{...v,title:v.label.split('/')[0].trim()}]));
 let loadingView='room',replayProgress=null;
 function selectView(){loadingView=Object.hasOwn(sketchViews,location.hash.slice(1).split('/')[0])?location.hash.slice(1).split('/')[0]:'room';loading.dataset.view=loadingView;loadDetailedSketch(loadingView);}
 selectView();
 const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let sketchWorker=null;
 if(canvas.transferControlToOffscreen&&window.Worker){try{
  sketchWorker=new Worker(new URL('./source/loading-sketch-worker.js?v=3',import.meta.url));
  const offscreen=canvas.transferControlToOffscreen();sketchWorker.postMessage({type:'init',canvas:offscreen,calm:calm||new URLSearchParams(location.search).get('loader-preview')==='complete'},[offscreen]);
  sketchWorker.onmessage=({data})=>{loading.dataset.sketchProgress=data.shown.toFixed(4);loading.dataset.meterProgress=data.progress.toFixed(4);if(pct)pct.textContent=(data.progress*100).toFixed(1);};
 }catch(error){sketchWorker?.terminate();sketchWorker=null;}}
 const ctx=sketchWorker?null:canvas.getContext('2d');
 loading.dataset.sketchRenderer=sketchWorker?'worker':'main';
 let polys=null,monitorEnd=.08,screen=[],total=0,cache=null,cacheCtx=null,cachedUpTo=0,cachedLen=0,W=0,H=0,dpr=1,copyBox=null;
 function loadDetailedSketch(view){fetch('assets/cockpit/sketches/'+view+'.json?v=8').then(r=>{if(!r.ok)throw new Error('Sketch unavailable');return r.json();}).then(data=>{if(view!==loadingView||loading.hidden)return;loading.dataset.sketch='detailed';decodeBlueprint(data.packed,100);layout();draw(replayProgress??window.__load?.shown??0);}).catch(()=>{});}
 // Decode the built-in blueprint (source/scripts/sketch-blueprint.py): per stroke a point count, then
 // zigzag varints in 2 cm units, first point absolute and the rest as deltas.
 function decodeBlueprint(packed,scale){try{const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));let k=0;const next=()=>{let n=0,shift=0,b;do{b=bytes[k++];n+=(b&127)*2**shift;shift+=7;}while(b&128);return n%2?-(n+1)/2:n/2;};
  polys=[];while(k<bytes.length){const count=next(),o=new Float32Array(count*3);let x=0,y=0,z=0;for(let i=0;i<count;i++){x+=next();y+=next();z+=next();o[i*3]=x/scale;o[i*3+1]=y/scale;o[i*3+2]=z/scale;}
   o.monitor=true;for(let i=0;i<o.length;i+=3)if(Math.abs(o[i])>1.25||o[i+1]<1.3||o[i+1]>2.75||o[i+2]<-1.8||o[i+2]>-1.3){o.monitor=false;break;}polys.push(o);}}catch(e){polys=null;}}
 decodeBlueprint(BLUEPRINT,50);
 // Mirrors cockpit.js: destination('room') + frameStation() for the current viewport.
 function cameraFor(w,h){const aspect=w/h,{p,t,fov,offX,offY}=viewPose(loadingView,w,h);
  const zx=p[0]-t[0],zy=p[1]-t[1],zz=p[2]-t[2],zl=Math.hypot(zx,zy,zz),z=[zx/zl,zy/zl,zz/zl];let x=[z[2],0,-z[0]];const xl=Math.hypot(...x);x=x.map(v=>v/xl);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return{p,x,y,z,f:1/Math.tan(fov*Math.PI/360),aspect,offY,offX};}
 function project(c,x,y,z){const dx=x-c.p[0],dy=y-c.p[1],dz=z-c.p[2];const zc=-(dx*c.z[0]+dy*c.z[1]+dz*c.z[2]);return [((dx*c.x[0]+dy*c.x[1]+dz*c.x[2])/zc*c.f/c.aspect+1)/2*W-c.offX,(1-(dx*c.y[0]+dy*c.y[1]+dz*c.y[2])/zc*c.f)/2*H-c.offY];}
 // The main monitor's screen (cockpit.js screenPosition): the welcome and status sit on it.
 function placeCopy(c){const copy=loading.querySelector('.loader-copy');if(!copy)return null;const a=project(c,-1.075,2.63,-1.548),b=project(c,1.075,1.41,-1.548);const r=loadingView==='room'?{x:a[0],y:a[1],w:b[0]-a[0],h:b[1]-a[1]}:{x:W<700?24:W*.06,y:H-Math.min(300,H*.42)-48,w:Math.min(380,W-48),h:Math.min(300,H*.42)};
  copy.style.setProperty('--sx',r.x+'px');copy.style.setProperty('--sy',r.y+'px');copy.style.setProperty('--sw',r.w+'px');copy.style.setProperty('--sh',r.h+'px');copy.style.setProperty('--fs',Math.max(7,Math.min(17,r.w/27))+'px');return r;}
 function layout(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;if(!sketchWorker){canvas.width=W*dpr;canvas.height=H*dpr;}const c=cameraFor(W,H);loading.dataset.camera=JSON.stringify({p:c.p,fov:2*Math.atan(1/c.f)*180/Math.PI,offX:c.offX,offY:c.offY});const r=placeCopy(c);copyBox=r;if(!polys)return;screen=[];total=0;
  // The monitor is drawn first: its screen outline, then every stroke that belongs to the monitors.
  if(r){const box=[r.x,r.y,r.x+r.w,r.y,r.x+r.w,r.y+r.h,r.x,r.y+r.h,r.x,r.y];screen.push({pts:box,len:2*(r.w+r.h),start:0});total=2*(r.w+r.h);}
  const first=[],rest=[];
  if(loadingView==='computer'){
   const add=pts=>{let len=0;for(let i=2;i<pts.length;i+=2)len+=Math.hypot(pts[i]-pts[i-2],pts[i+1]-pts[i-1]);rest.push({pts,len});};
   const box=(x,y,w,h)=>add([x,y,x+w,y,x+w,y+h,x,y+h,x,y]);
   box(W*.035,H*.035,W*.93,H*.075);add([W*.06,H*.19,W*.94,H*.19]);add([W*.06,H*.9,W*.94,H*.9]);
   const phoneW=W<700?W*.22:W*.12,phoneH=phoneW*2.05,startX=W<700?W*.13:W*.48,startY=H*.29;
   for(let i=0;i<3;i++){const x=startX+i*phoneW*1.22,y=startY+(i===1?-H*.025:0);box(x,y,phoneW,phoneH);box(x+phoneW*.08,y+phoneH*.04,phoneW*.84,phoneH*.9);box(x+phoneW*.32,y+phoneH*.02,phoneW*.36,phoneH*.025);for(let row=0;row<5;row++){const yy=y+phoneH*(.17+row*.14);box(x+phoneW*.14,yy,phoneW*.72,phoneH*.105);add([x+phoneW*.20,yy+phoneH*.035,x+phoneW*.70,yy+phoneH*.035]);add([x+phoneW*.20,yy+phoneH*.065,x+phoneW*.53,yy+phoneH*.065]);}}
   if(W>=700){for(let i=0;i<4;i++)add([W*.07,H*(.40+i*.035),W*(i%2?.29:.34),H*(.40+i*.035)]);box(W*.07,H*.56,W*.14,H*.045);}
   for(let i=0;i<5;i++)box(W*(.07+i*.175),H*.93,W*.12,H*.015);
  }
  // Preserve the whole monitor contour even when an offline capture cropped its top or side.
  const monitorOutline=new Float32Array([-1.12,1.38,-1.57,-1.12,2.66,-1.57,1.12,2.66,-1.57,1.12,1.38,-1.57,-1.12,1.38,-1.57]);
  const outlines=loadingView==='computer'?[]:loadingView==='room'?polys:[...polys,monitorOutline];
  for(const pl of outlines){if(loadingView==='room'&&pl.monitor)continue;const pts=[];let len=0,prev=null,ok=true;for(let i=0;i<pl.length;i+=3){const dx=pl[i]-c.p[0],dy=pl[i+1]-c.p[1],dz=pl[i+2]-c.p[2];const zc=-(dx*c.z[0]+dy*c.z[1]+dz*c.z[2]);if(zc<.05){ok=false;break;}const sx=((dx*c.x[0]+dy*c.x[1]+dz*c.x[2])/zc*c.f/c.aspect+1)/2*W-c.offX,sy=(1-(dx*c.y[0]+dy*c.y[1]+dz*c.y[2])/zc*c.f)/2*H-c.offY;if(prev)len+=Math.hypot(sx-prev[0],sy-prev[1]);prev=[sx,sy];pts.push(sx,sy);}
   if(ok&&pts.length>=4)(pl.monitor?first:rest).push({pts,len});}
  // Collapse nearby parallel bevels into a single contour in the actual viewport.
  const kept=[],gap=Math.max(2.5,Math.min(5,W/350));
  for(const line of [...first,...rest].sort((a,b)=>b.len-a.len)){
   const [ax,ay,bx,by]=line.pts;if(line.len<1.8||Math.max(...line.pts.filter((_,i)=>i%2===0))<0||Math.min(...line.pts.filter((_,i)=>i%2===0))>W||Math.max(...line.pts.filter((_,i)=>i%2))<0||Math.min(...line.pts.filter((_,i)=>i%2))>H)continue;
   const dx=(bx-ax)/line.len,dy=(by-ay)/line.len;
   const duplicate=line.pts.length===4&&kept.some(k=>{if(k.pts.length!==4)return false;const [x,y,u,v]=k.pts,l=k.len,ex=(u-x)/l,ey=(v-y)/l;if(Math.abs(dx*ey-dy*ex)>.025)return false;
    if(Math.abs((ax-x)*ey-(ay-y)*ex)>gap||Math.abs((bx-x)*ey-(by-y)*ex)>gap)return false;
    const a=(ax-x)*ex+(ay-y)*ey,b=(bx-x)*ex+(by-y)*ey;return Math.max(0,Math.min(l,Math.max(a,b))-Math.max(0,Math.min(a,b)))>line.len*.55;
   });if(!duplicate)kept.push(line);if(kept.length>=2800)break;
  }
  const chosen=new Set(kept);
  for(const s of [...first,...rest].filter(s=>chosen.has(s))){s.major=s.len>W*.045;s.start=total;screen.push(s);total+=s.len;}monitorEnd=(first.reduce((a,s)=>a+s.len,0)+(r?2*(r.w+r.h):0))/Math.max(1,total);
  if(sketchWorker){sketchWorker.postMessage({type:'layout',screen,total,W,H,dpr,copyBox,loadingView});return;}
  cache=document.createElement('canvas');cache.width=canvas.width;cache.height=canvas.height;cacheCtx=cache.getContext('2d');cacheCtx.scale(dpr,dpr);style(cacheCtx);cachedUpTo=0;cachedLen=0;}
 function style(g){g.strokeStyle='#e9d6a8';g.globalAlpha=.62;g.lineWidth=.9;g.lineCap='round';g.lineJoin='round';}
 function stroke(g,s,upto){style(g);g.globalAlpha=s.major===false?.58:.82;g.lineWidth=s.major===false?.75:1.45;g.setLineDash([]);
  // Fixed, subpixel pencil drift: one stroke, no duplicated outlines or frame-to-frame jitter.
  if(!s.sketch){const src=s.pts,out=[src[0],src[1]];for(let i=2;i<src.length;i+=2){const ax=src[i-2],ay=src[i-1],bx=src[i],by=src[i+1],len=Math.hypot(bx-ax,by-ay),steps=Math.max(1,Math.ceil(len/35));for(let j=1;j<=steps;j++){const f=j/steps,w=j===steps?0:Math.sin(ax*.17+ay*.23+j*2.7)*(s.major===false?.8:.55);out.push(ax+(bx-ax)*f-(by-ay)/len*w,ay+(by-ay)*f+(bx-ax)/len*w);}}s.sketch=out;}
  const P=s.sketch;g.beginPath();g.moveTo(P[0],P[1]);let run=0,tip=[P[0],P[1]];for(let i=2;i<P.length;i+=2){const seg=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);if(run+seg>=upto){const k=seg?(upto-run)/seg:1;tip=[P[i-2]+(P[i]-P[i-2])*k,P[i-1]+(P[i+1]-P[i-1])*k];g.lineTo(...tip);g.stroke();return tip;}run+=seg;g.lineTo(P[i],P[i+1]);tip=[P[i],P[i+1]];}g.stroke();return tip;}
 function draw(p){if(sketchWorker){sketchWorker.postMessage({type:'progress',p});return;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  // faint drafting grid
  ctx.globalAlpha=1;ctx.strokeStyle='#e9d6a805';ctx.lineWidth=1;ctx.beginPath();for(let x=(W%48)/2;x<W;x+=48){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=(H%48)/2;y<H;y+=48){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  if(loadingView==='computer'){ctx.save();ctx.beginPath();ctx.rect(0,0,W*Math.min(1,p*3),H*.29);ctx.clip();ctx.strokeStyle='#e9d6a8';ctx.lineWidth=.8;ctx.font=`${Math.min(72,W*.065)}px Georgia`;ctx.strokeText('Selected software.',W*.06,H*.26);ctx.restore();}
  if(!screen.length)return;const goal=p*total;
  while(cachedUpTo<screen.length&&screen[cachedUpTo].start+screen[cachedUpTo].len<=goal){stroke(cacheCtx,screen[cachedUpTo],Infinity);cachedUpTo++;}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(cache,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);if(copyBox)ctx.clearRect(copyBox.x+3,copyBox.y+3,copyBox.w-6,copyBox.h-6);
  // the stroke being drawn right now, with a warm pen tip
  const s=screen[cachedUpTo];if(s&&p<1){style(ctx);const tip=stroke(ctx,s,goal-s.start);ctx.globalAlpha=1;ctx.fillStyle='#f0b850';ctx.shadowColor='#f0b850';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(tip[0],tip[1],2.6,0,7);ctx.fill();ctx.shadowBlur=0;}}
 function caption(p){loading.querySelector('.loader-copy')?.classList.add('on');if(!sketchWorker){if(pct)pct.textContent=(p*100).toFixed(1);document.getElementById('load-progress').style.transform=`scaleX(${p})`;}}
 addEventListener('resize',()=>{if(loading.hidden)return;layout();draw(window.__load?.shown||0);});addEventListener('hashchange',()=>{if(loading.hidden)return;selectView();layout();draw(window.__load?.shown||0);});layout();
 let finishing=false;const pace={last:0,start:0,speed:0,prevF:0,recent:0};
 window.__loadDone=()=>{if(finishing)return;finishing=true;window.__load.finish();sketchWorker?.postMessage({type:'progress',p:1});
  // Let the percentage and drawing finish, then fade; tell the room once the loader is gone.
  const t0=performance.now();const wait=()=>{if((sketchWorker?Number(loading.dataset.meterProgress||0):window.__load.shown)>=.999||performance.now()-t0>2600){loading.classList.add('done');setTimeout(()=>{loading.hidden=true;sketchWorker?.terminate();loading.classList.remove('done');window.__load._resolve?.();},calm?0:950);}else requestAnimationFrame(wait);};wait();};
 let lastDrawn=-1;
 function tick(now){if(loading.hidden)return;requestAnimationFrame(tick);if(!document.body.classList.contains('workshop-started'))return;
  const L=window.__load,f=L.target(now),dt=Math.min(.1,(now-(pace.last||now))/1000);pace.last=now;pace.start||=now;let v=L.shown;
  if(dt>0)pace.recent+=((f-pace.prevF)/dt-pace.recent)*Math.min(1,dt/2);pace.prevF=f;
  if(calm)v=f;else if(finishing)v=v+(1-v)*Math.min(1,dt*9);else{
   // Real speed (overall average, or the recent speed once the model streams) gives a time-left estimate; the shown figure glides
   // toward 100% at the pace that lands there when the download does, never far ahead of reality.
   const elapsed=Math.max(.25,(now-pace.start)/1000),rate=Math.max(f/elapsed,pace.recent*.85),left=rate>0?(1-f)/rate:30,want=(1-v)/Math.max(.3,left);
   pace.speed+=(want-pace.speed)*Math.min(1,dt*3);v=Math.min(v+Math.max(0,pace.speed)*dt,f+.02,.99);}
  if(finishing&&1-v<.003)v=1;L.shown=Math.max(L.shown,v);if(L.shown!==lastDrawn){lastDrawn=L.shown;draw(L.shown);}caption(L.shown);if(copyBox&&ctx)ctx.clearRect(copyBox.x+3,copyBox.y+3,copyBox.w-6,copyBox.h-6);}
 window.__playComputerSketch=()=>{
  if(calm||!loading.hidden)return;
  replayProgress=0;loading.hidden=false;loading.classList.remove('done');selectView();layout();const start=performance.now();
  const replay=now=>{if(location.hash.slice(1).split('/')[0]!=='computer'){loading.hidden=true;return;}const p=Math.min(1,(now-start)/1100);replayProgress=p;draw(p);caption(p);if(p<1)requestAnimationFrame(replay);else{loading.classList.add('done');setTimeout(()=>{loading.hidden=true;replayProgress=null;loading.classList.remove('done');},300);}};
  requestAnimationFrame(replay);
 };
 requestAnimationFrame(tick);
})();

// No static 3D imports. The main route opens the room; data-saving visitors get a choice first.
const entry=document.getElementById('entry'),button=document.getElementById('enter-workshop');
let starting=false;
async function startWorkshop(){
 if(starting)return;starting=true;button.disabled=true;
 document.body.classList.add('workshop-started');entry.hidden=true;
 try{
  const css=document.createElement('link');css.rel='stylesheet';css.href='cockpit.css?v=warm-20261102-meter';document.head.append(css);
  await new Promise((resolve,reject)=>{css.onload=resolve;css.onerror=reject;});window.__load?.set('css',1);
  {const list=['projects.js','portfolio-stories.js?v=8','deep-case-data.js?v=20'];let done=0;for(const src of list){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});window.__load?.set('data',++done/list.length);}}
  await import('./cockpit.bundle.js?v=warm-20261102-meter');window.__load?.set('code',1);
 }catch(error){document.documentElement.classList.remove('autostart');document.body.classList.remove('workshop-started');entry.hidden=false;document.getElementById('entry-note').textContent='The workshop couldn’t load. You can still browse every project in the lightweight site.';starting=false;button.disabled=false;console.warn('Workshop unavailable',error);}
}
button.addEventListener('click',startWorkshop);
const connection=navigator.connection;
if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType))document.getElementById('entry-note').textContent='On a slow connection? Browse projects to keep downloads small. Photos are optional.';
const explicit3D=new URLSearchParams(location.search).get('mode')==='3d';
// ?loader-preview plays the loading screen on a simulated 12-second download on a loop, without loading the room.
const loaderPreview=new URLSearchParams(location.search).has('loader-preview');
if(loaderPreview&&new URLSearchParams(location.search).get('loader-preview')==='complete'){document.body.classList.add('workshop-started');entry.hidden=true;window.__load.target=()=>1;window.__load.shown=1;}
else if(loaderPreview){document.body.classList.add('workshop-started');entry.hidden=true;const t0=performance.now();const steps=[['css',.02],['data',.06],['code',.18],['room',.9],['setup',1]];let last=0;const run=()=>{const k=(performance.now()-t0)/12000;for(const [step,end] of steps){const start=last;last=end;window.__load.set(step,Math.max(0,Math.min(1,(k-start)/(end-start))));}last=0;if(k<1)requestAnimationFrame(run);else setTimeout(()=>location.reload(),2500);};run();}
const saveData=connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType);
if(!loaderPreview&&(explicit3D||(document.body.dataset.defaultView==='workshop'&&!saveData)))startWorkshop();
