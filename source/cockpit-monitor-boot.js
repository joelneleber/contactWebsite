// Draw into the monitor's existing texture; no extra scene lights or render loop.
export function monitorBoot(canvas,snapshot,texture){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;let started=null,done=false,last=-1;
 function black(){c.fillStyle='#030807';c.fillRect(0,0,w,h);texture.needsUpdate=true;}
 black();
 return {start(now){started??=now;},get done(){return done;},update(now,motion,ready){
  if(started===null||done)return false;const elapsed=now-started-200;
  if(elapsed<0)return true;
  const tick=Math.floor(elapsed/40);if(last===tick)return true;last=tick;
  if((!motion||elapsed>=3000)&&ready){c.drawImage(snapshot,0,0,w,h);texture.needsUpdate=true;done=true;return false;}
  black();c.textAlign='center';c.textBaseline='middle';
  if(elapsed<450&&motion){const k=Math.min(1,elapsed/450);c.fillStyle='#e5ecd8';c.globalAlpha=Math.sin(k*Math.PI)*.65;c.fillRect(w*(1-k)/2,h*.5-2,w*k,4);c.globalAlpha=1;}
  else if(elapsed<1300&&motion){c.fillStyle='#efe6ce';c.font='italic 100px Georgia';c.fillText('jn',w/2,h*.43);c.font='24px monospace';c.fillStyle='#a6b3a2';c.fillText('Opening the studio',w/2,h*.55);}
  else{const k=Math.min(1,Math.max(0,(elapsed-1300)/1700));c.fillStyle='#173329';c.fillRect(0,0,w,h);c.strokeStyle='#baac83';c.lineWidth=2;
   const boxes=[[.03,.035,.94,.055],[.07,.17,.70,.10],[.07,.39,.26,.30],[.45,.34,.47,.49],[.07,.91,.86,.03]];
   boxes.forEach(([x,y,bw,bh],i)=>{const p=Math.max(0,Math.min(1,k*3-i*.25));if(p)c.strokeRect(x*w,y*h,bw*w*p,bh*h);});
   c.textAlign='left';c.font='24px monospace';c.fillStyle='#efe6ce';c.fillText('joey / software studio',w*.055,h*.065);c.fillStyle='#e1c48c';c.fillRect(0,h-5,w*Math.min(.96,k),5);
   if(ready&&k>.65){c.globalAlpha=(k-.65)/.35;c.drawImage(snapshot,0,0,w,h);c.globalAlpha=1;}
  }texture.needsUpdate=true;return true;
 }};
}
