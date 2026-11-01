// One progress figure for the whole load, weighted by what each step really downloads
// (compressed sizes): styles, project data, the 3D code, the room model, then scene setup.
const loadSteps=[['css',.005],['data',.04],['code',.1],['room',.775],['setup',.08]];
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

// Blueprint: edges traced from the room model (assets/cockpit/blueprint-room.json, centimetres,
// delta-encoded polylines, back to front) projected with the same camera the room view uses.
(()=>{const loading=document.getElementById('loading'),canvas=document.getElementById('bp-canvas'),quip=document.getElementById('load-quip'),pct=document.getElementById('load-pct');if(!loading||!canvas)return;
 const ctx=canvas.getContext('2d'),calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const lines=['Sketching the room…','Drawing the benches…','Setting out the tools…','Inking the details…'];
 let polys=null,screen=[],total=0,cache=null,cacheCtx=null,cachedUpTo=0,cachedLen=0,stage=-1,W=0,H=0,dpr=1;
 fetch('assets/cockpit/blueprint-room.json').then(r=>r.ok?r.json():null).then(d=>{if(!d)return;polys=d.map(l=>{const o=new Float32Array(l.length);let x=l[0],y=l[1],z=l[2];for(let i=0;i<l.length;i+=3){if(i){x+=l[i];y+=l[i+1];z+=l[i+2];}o[i]=x/100;o[i+1]=y/100;o[i+2]=z/100;}return o;});layout();}).catch(()=>{});
 // Mirrors cockpit.js: destination('room') + frameStation() for the current viewport.
 function cameraFor(w,h){const aspect=w/h,mobile=w<=900,t=[0,1.45,-1.2],p0=[0,2.68,5.1];const k=mobile?1.3:Math.max(1,1.65/aspect);const p=p0.map((v,i)=>t[i]+(v-t[i])*k);if(mobile&&h>w)t[1]-=.3;p[0]=Math.min(3.3,Math.max(-3.25,p[0]));p[2]=Math.min(p[2],7.6);p[1]=Math.min(p[1],3.6);
  const widen=aspect<1.25?Math.min(2.4,1.25/aspect):Math.min(1,1.8/aspect);const fov=Math.min(84,2*Math.atan(Math.tan(43.8*Math.PI/360)*widen)*180/Math.PI);const offY=mobile&&aspect<.8?h*.17:0;
  const zx=p[0]-t[0],zy=p[1]-t[1],zz=p[2]-t[2],zl=Math.hypot(zx,zy,zz),z=[zx/zl,zy/zl,zz/zl];let x=[z[2],0,-z[0]];const xl=Math.hypot(...x);x=x.map(v=>v/xl);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return{p,x,y,z,f:1/Math.tan(fov*Math.PI/360),aspect,offY};}
 function layout(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;if(!polys)return;const c=cameraFor(W,H);screen=[];total=0;
  for(const pl of polys){const pts=[];let len=0,prev=null,ok=true;for(let i=0;i<pl.length;i+=3){const dx=pl[i]-c.p[0],dy=pl[i+1]-c.p[1],dz=pl[i+2]-c.p[2];const zc=-(dx*c.z[0]+dy*c.z[1]+dz*c.z[2]);if(zc<.05){ok=false;break;}const sx=((dx*c.x[0]+dy*c.x[1]+dz*c.x[2])/zc*c.f/c.aspect+1)/2*W,sy=(1-(dx*c.y[0]+dy*c.y[1]+dz*c.y[2])/zc*c.f)/2*H-c.offY;if(prev)len+=Math.hypot(sx-prev[0],sy-prev[1]);prev=[sx,sy];pts.push(sx,sy);}
   if(ok&&pts.length>=4){screen.push({pts,len,start:total});total+=len;}}
  cache=document.createElement('canvas');cache.width=canvas.width;cache.height=canvas.height;cacheCtx=cache.getContext('2d');cacheCtx.scale(dpr,dpr);style(cacheCtx);cachedUpTo=0;cachedLen=0;}
 function style(g){g.strokeStyle='#e9d6a8';g.globalAlpha=.62;g.lineWidth=.9;g.lineCap='round';g.lineJoin='round';}
 function stroke(g,s,upto){const P=s.pts;g.beginPath();g.moveTo(P[0],P[1]);let run=0,tip=[P[0],P[1]];for(let i=2;i<P.length;i+=2){const seg=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);if(run+seg>=upto){const k=seg?(upto-run)/seg:1;tip=[P[i-2]+(P[i]-P[i-2])*k,P[i-1]+(P[i+1]-P[i-1])*k];g.lineTo(...tip);g.stroke();return tip;}run+=seg;g.lineTo(P[i],P[i+1]);tip=[P[i],P[i+1]];}g.stroke();return tip;}
 function draw(p){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  // faint drafting grid
  ctx.globalAlpha=1;ctx.strokeStyle='#e9d6a80d';ctx.lineWidth=1;ctx.beginPath();for(let x=(W%48)/2;x<W;x+=48){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=(H%48)/2;y<H;y+=48){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  if(!screen.length)return;const goal=p*total;
  while(cachedUpTo<screen.length&&screen[cachedUpTo].start+screen[cachedUpTo].len<=goal){stroke(cacheCtx,screen[cachedUpTo],Infinity);cachedUpTo++;}
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(cache,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  // the stroke being drawn right now, with a warm pen tip
  const s=screen[cachedUpTo];if(s&&p<1){style(ctx);const tip=stroke(ctx,s,goal-s.start);ctx.globalAlpha=1;ctx.fillStyle='#f0b850';ctx.shadowColor='#f0b850';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(tip[0],tip[1],2.6,0,7);ctx.fill();ctx.shadowBlur=0;}}
 function caption(p){pct&&(pct.textContent=Math.round(p*100));const st=Math.min(3,Math.floor(p*4));if(st!==stage&&quip){stage=st;quip.classList.add('fading');setTimeout(()=>{quip.textContent=lines[st];quip.classList.remove('fading');},300);}}
 addEventListener('resize',layout);layout();
 let finishing=false;
 window.__loadDone=()=>{if(finishing)return;finishing=true;window.__load.finish();
  const t0=performance.now();const wait=()=>{if(window.__load.shown>=.999||performance.now()-t0>1100){loading.classList.add('done');setTimeout(()=>{loading.hidden=true;loading.classList.remove('done');},calm?0:950);}else requestAnimationFrame(wait);};wait();};
 function tick(now){requestAnimationFrame(tick);if(loading.hidden||!document.body.classList.contains('workshop-started'))return;
  const L=window.__load,target=L.target(now);let v=calm?target:L.shown+(target-L.shown)*(finishing?.2:.08);if(finishing&&1-v<.002)v=1;L.shown=v;draw(L.shown);caption(L.shown);}
 requestAnimationFrame(tick);
})();

// No static 3D imports. The main route opens the room; data-saving visitors get a choice first.
const entry=document.getElementById('entry'),button=document.getElementById('enter-workshop');
let starting=false;
async function startWorkshop(){
 if(starting)return;starting=true;button.disabled=true;
 document.body.classList.add('workshop-started');entry.hidden=true;
 try{
  const css=document.createElement('link');css.rel='stylesheet';css.href='cockpit.css?v=24';document.head.append(css);
  await new Promise((resolve,reject)=>{css.onload=resolve;css.onerror=reject;});window.__load?.set('css',1);
  {const list=['projects.js','portfolio-stories.js?v=8','deep-case-data.js?v=20'];let done=0;for(const src of list){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});window.__load?.set('data',++done/list.length);}}
  await import('./cockpit.bundle.js?v=24');window.__load?.set('code',1);
 }catch(error){document.body.classList.remove('workshop-started');entry.hidden=false;document.getElementById('entry-note').textContent='The workshop couldn’t load. You can still browse every project in the lightweight site.';starting=false;button.disabled=false;console.warn('Workshop unavailable',error);}
}
button.addEventListener('click',startWorkshop);
const connection=navigator.connection;
if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType))document.getElementById('entry-note').textContent='On a slow connection? Browse projects to keep downloads small. Photos are optional.';
const explicit3D=new URLSearchParams(location.search).get('mode')==='3d';
// ?loader-preview plays the loading screen on a simulated 12-second download, without loading the room.
const loaderPreview=new URLSearchParams(location.search).has('loader-preview');
if(loaderPreview){document.body.classList.add('workshop-started');entry.hidden=true;const t0=performance.now();const steps=[['css',.02],['data',.06],['code',.18],['room',.9],['setup',1]];let last=0;const run=()=>{const k=(performance.now()-t0)/12000;for(const [step,end] of steps){const start=last;last=end;window.__load.set(step,Math.max(0,Math.min(1,(k-start)/(end-start))));}last=0;if(k<1)requestAnimationFrame(run);else window.__loadDone?.();};run();}
const saveData=connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType);
if(!loaderPreview&&(explicit3D||(document.body.dataset.defaultView==='workshop'&&!saveData)))startWorkshop();

// Loading screen: the blueprint draws itself in step with the download.
// Before the room model starts reporting progress, a slow creep keeps the pen moving.
(()=>{const loading=document.getElementById('loading'),bar=document.getElementById('load-progress'),quip=document.getElementById('load-quip'),pct=document.getElementById('load-pct'),pen=loading?.querySelector('.bp-pen');if(!loading||!bar||!pen)return;
 const strokes=[...loading.querySelectorAll('.bp-draw > *')].map(el=>{const l=el.getTotalLength();el.style.strokeDasharray=l;el.style.strokeDashoffset=l;return{el,l};});
 const lines=['Sketching the room…','Drawing the benches…','Hanging the lamps…','Inking the details…'];
 const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;let shown=0,start=0,stage=-1;
 function draw(p){const n=strokes.length;strokes.forEach((s,i)=>{const k=Math.max(0,Math.min(1,p*n-i));s.el.style.strokeDashoffset=s.l*(1-k);if(k>0&&k<1){const pt=s.el.getPointAtLength(s.l*k);pen.setAttribute('cx',pt.x);pen.setAttribute('cy',pt.y);}});pen.style.opacity=p<.999?1:0;pct.textContent=Math.round(p*100);
  const st=Math.min(3,Math.floor(p*4));if(st!==stage){stage=st;quip.classList.add('fading');setTimeout(()=>{quip.textContent=lines[st];quip.classList.remove('fading');},300);}}
 function tick(t){if(!document.body.classList.contains('workshop-started')||loading.hidden){start=0;requestAnimationFrame(tick);return;}
  start||=t;const real=(parseFloat(bar.style.width)||0)/100,creep=.3*(1-Math.exp(-(t-start)/5000)),target=Math.max(real,creep);
  shown=calm?target:shown+(target-shown)*.06;draw(shown);requestAnimationFrame(tick);}
 requestAnimationFrame(tick);
})();
