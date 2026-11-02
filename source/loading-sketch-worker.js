// Drawing runs independently of model parsing, texture uploads and shader compilation.
let canvas,ctx,cache,cacheCtx,screen=[],total=0,W=0,H=0,dpr=1,copyBox=null,loadingView='room',cachedUpTo=0;
let target=0,shown=0,last=0,updated=0,calm=false,running=false,frame=0;
self.onmessage=({data:d})=>{
 if(d.type==='init'){canvas=d.canvas;ctx=canvas.getContext('2d');calm=d.calm;}
 if(d.type==='layout'){
  ({screen,total,W,H,dpr,copyBox,loadingView}=d);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  cache=new OffscreenCanvas(canvas.width,canvas.height);cacheCtx=cache.getContext('2d');cacheCtx.scale(dpr,dpr);cachedUpTo=0;
  draw(shown);
 }
 if(d.type==='progress'){target=Math.max(target,d.p);updated=performance.now();if(!running){running=true;last=0;frame=requestAnimationFrame(tick);}}
 if(d.type==='stop'){running=false;cancelAnimationFrame(frame);}
};
function tick(now){
 if(!running)return;
 const dt=Math.min(.05,(now-(last||now))/1000);last=now;
 const aim=target>=.999?1:Math.min(.985,target+.025*(1-Math.exp(-(now-updated)/4000)));
 shown=calm?target:Math.max(shown,shown+(aim-shown)*Math.min(1,dt*5));
 if(target>=.999&&1-shown<.003)shown=1;
 draw(shown);self.postMessage({shown});frame=requestAnimationFrame(tick);
}
 function style(g){g.strokeStyle='#e9d6a8';g.globalAlpha=.62;g.lineWidth=.9;g.lineCap='round';g.lineJoin='round';}
 function stroke(g,s,upto){style(g);g.globalAlpha=s.major===false?.58:.82;g.lineWidth=s.major===false?.75:1.45;g.setLineDash([]);
  // Fixed, subpixel pencil drift: one stroke, no duplicated outlines or frame-to-frame jitter.
  if(!s.sketch){const src=s.pts,out=[src[0],src[1]];for(let i=2;i<src.length;i+=2){const ax=src[i-2],ay=src[i-1],bx=src[i],by=src[i+1],len=Math.hypot(bx-ax,by-ay),steps=Math.max(1,Math.ceil(len/35));for(let j=1;j<=steps;j++){const f=j/steps,w=j===steps?0:Math.sin(ax*.17+ay*.23+j*2.7)*(s.major===false?.8:.55);out.push(ax+(bx-ax)*f-(by-ay)/len*w,ay+(by-ay)*f+(bx-ax)/len*w);}}s.sketch=out;}
  const P=s.sketch;g.beginPath();g.moveTo(P[0],P[1]);let run=0,tip=[P[0],P[1]];for(let i=2;i<P.length;i+=2){const seg=Math.hypot(P[i]-P[i-2],P[i+1]-P[i-1]);if(run+seg>=upto){const k=seg?(upto-run)/seg:1;tip=[P[i-2]+(P[i]-P[i-2])*k,P[i-1]+(P[i+1]-P[i-1])*k];g.lineTo(...tip);g.stroke();return tip;}run+=seg;g.lineTo(P[i],P[i+1]);tip=[P[i],P[i+1]];}g.stroke();return tip;}
 function draw(p){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  // faint drafting grid
  ctx.globalAlpha=1;ctx.strokeStyle='#e9d6a805';ctx.lineWidth=1;ctx.beginPath();for(let x=(W%48)/2;x<W;x+=48){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=(H%48)/2;y<H;y+=48){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  if(loadingView==='computer'){ctx.save();ctx.beginPath();ctx.rect(0,0,W*Math.min(1,p*3),H*.29);ctx.clip();ctx.strokeStyle='#e9d6a8';ctx.lineWidth=.8;ctx.font=`${Math.min(72,W*.065)}px Georgia`;ctx.strokeText('Selected software.',W*.06,H*.26);ctx.restore();}
  if(!screen.length)return;const goal=p*total;
  while(cachedUpTo<screen.length&&screen[cachedUpTo].start+screen[cachedUpTo].len<=goal){stroke(cacheCtx,screen[cachedUpTo],Infinity);cachedUpTo++;}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(cache,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);if(copyBox)ctx.clearRect(copyBox.x+3,copyBox.y+3,copyBox.w-6,copyBox.h-6);
  // the stroke being drawn right now, with a warm pen tip
  const s=screen[cachedUpTo];if(s&&p<1){style(ctx);const tip=stroke(ctx,s,goal-s.start);ctx.globalAlpha=1;ctx.fillStyle='#f0b850';ctx.shadowColor='#f0b850';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(tip[0],tip[1],2.6,0,7);ctx.fill();ctx.shadowBlur=0;}}
