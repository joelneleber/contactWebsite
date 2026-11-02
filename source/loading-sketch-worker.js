// Drawing runs independently of model parsing, texture uploads and shader compilation.
let canvas,ctx,cache,cacheCtx,screen=[],total=0,W=0,H=0,dpr=1,copyBox=null,loadingView='room',cachedUpTo=0;
let progress=0;
let target=0,shown=0,last=0,calm=false,running=false,frame=0,started=0,lastReport=0,previous=null,swapStarted=0,grid=null,blend=null;
self.onmessage=({data:d})=>{
 if(d.type==='init'){canvas=d.canvas;ctx=canvas.getContext('2d');calm=d.calm;}
 if(d.type==='layout'){
  if(cache&&canvas.width===Math.round(d.W*d.dpr)&&canvas.height===Math.round(d.H*d.dpr)){previous=new OffscreenCanvas(canvas.width,canvas.height);blend=new OffscreenCanvas(canvas.width,canvas.height);previous.getContext('2d').drawImage(canvas,0,0);swapStarted=performance.now();}
  ({screen,total,W,H,dpr,copyBox,loadingView}=d);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  cache=new OffscreenCanvas(canvas.width,canvas.height);cacheCtx=cache.getContext('2d');cacheCtx.scale(dpr,dpr);cachedUpTo=0;
  grid=new OffscreenCanvas(canvas.width,canvas.height);const g=grid.getContext('2d');g.scale(dpr,dpr);g.strokeStyle='#e9d6a805';g.lineWidth=1;g.beginPath();for(let x=(W%48)/2;x<W;x+=48){g.moveTo(x,0);g.lineTo(x,H);}for(let y=(H%48)/2;y<H;y+=48){g.moveTo(0,y);g.lineTo(W,y);}g.stroke();
  if(previous){ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(previous,0,0);}else draw(shown);
 }
 if(d.type==='progress'){target=Math.max(target,d.p);if(!running){running=true;last=0;frame=requestAnimationFrame(tick);}}
 if(d.type==='stop'){running=false;cancelAnimationFrame(frame);}
};
function tick(now){
 if(!running)return;
 const dt=Math.min(.05,(now-(last||now))/1000);last=now;started||=now;
 // Drawing is decorative, not the download meter. Keep a steady pencil speed
 // through progress jumps and main-thread stalls; readiness controls the fade.
 const elapsed=(now-started)/1000;
 const speed=.22*Math.min(1,elapsed/.3);
 shown=calm?target:Math.min(.99,shown+speed*dt*Math.min(1,(1-shown)/.08));
 // Limit the meter's catch-up speed rather than snapping to new download targets.
 progress=calm?target:Math.min(target,progress+Math.min(.55,Math.max(.035,(target-progress)*3))*dt);
 if(target===1&&1-progress<.001)progress=1;
 draw(shown);
 if(previous){const mix=Math.min(1,(now-swapStarted)/350),g=blend.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.drawImage(canvas,0,0);ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=1-mix;ctx.drawImage(previous,0,0);ctx.globalAlpha=mix;ctx.drawImage(blend,0,0);ctx.globalAlpha=1;if(mix===1){previous=null;blend=null;}}

 if(now-lastReport>=100){self.postMessage({shown,progress});lastReport=now;}
 frame=requestAnimationFrame(tick);
}

 function style(g){g.strokeStyle='#e9d6a8';g.globalAlpha=.62;g.lineWidth=.9;g.lineCap='round';g.lineJoin='round';}
 function stroke(g,s,upto){style(g);g.globalAlpha=s.major===false?.58:.82;g.lineWidth=s.major===false?.75:1.45;g.setLineDash([]);
  // Fixed, subpixel pencil drift: one stroke, no duplicated outlines or frame-to-frame jitter.
  if(!s.sketch){const src=s.pts,out=[src[0],src[1]];for(let i=2;i<src.length;i+=2){const ax=src[i-2],ay=src[i-1],bx=src[i],by=src[i+1],len=Math.hypot(bx-ax,by-ay),steps=Math.max(1,Math.ceil(len/35));for(let j=1;j<=steps;j++){const f=j/steps,w=j===steps?0:Math.sin(ax*.17+ay*.23+j*2.7)*(s.major===false?.8:.55);out.push(ax+(bx-ax)*f-(by-ay)/len*w,ay+(by-ay)*f+(bx-ax)/len*w);}}s.sketch=out;}
  const P=s.sketch;g.beginPath();g.moveTo(P[0],P[1]);let run=0,tip=[P[0],P[1]];for(let i=2;i<P.length;i+=2){const seg=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);if(run+seg>=upto){const k=seg?(upto-run)/seg:1;tip=[P[i-2]+(P[i]-P[i-2])*k,P[i-1]+(P[i+1]-P[i-1])*k];g.lineTo(...tip);g.stroke();return tip;}run+=seg;g.lineTo(P[i],P[i+1]);tip=[P[i],P[i+1]];}g.stroke();return tip;}
 function draw(p){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;if(grid)ctx.drawImage(grid,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  if(loadingView==='computer'){ctx.save();ctx.beginPath();ctx.rect(0,0,W*Math.min(1,p*3),H*.29);ctx.clip();ctx.strokeStyle='#e9d6a8';ctx.lineWidth=.8;ctx.font=`${Math.min(72,W*.065)}px Georgia`;ctx.strokeText('Selected software.',W*.06,H*.26);ctx.restore();}
  if(!screen.length)return;const goal=p*total;
  while(cachedUpTo<screen.length&&screen[cachedUpTo].start+screen[cachedUpTo].len<=goal){stroke(cacheCtx,screen[cachedUpTo],Infinity);cachedUpTo++;}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(cache,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);if(copyBox)ctx.clearRect(copyBox.x+3,copyBox.y+3,copyBox.w-6,copyBox.h-6);
  // Draw the active stroke without a glowing dot teleporting between objects.
  const active=screen[cachedUpTo];if(active&&p<1)stroke(ctx,active,goal-active.start);
 }
