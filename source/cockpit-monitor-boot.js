// Draw into the monitor's existing texture; no extra scene lights or render loop.
export function monitorBoot(canvas,snapshot,texture){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;let started=null,done=false,last=-1,trace=null;
 function tracePage(){
  trace=document.createElement('canvas');trace.width=w/2;trace.height=h/2;
  const x=trace.getContext('2d');x.drawImage(snapshot,0,0,trace.width,trace.height);
  const src=x.getImageData(0,0,trace.width,trace.height),out=x.createImageData(trace.width,trace.height),d=src.data,o=out.data,stride=trace.width*4;
  for(let i=0;i<d.length-stride-4;i+=4){const edge=Math.max(Math.abs(d[i]-d[i+4])+Math.abs(d[i+1]-d[i+5])+Math.abs(d[i+2]-d[i+6]),Math.abs(d[i]-d[i+stride])+Math.abs(d[i+1]-d[i+stride+1])+Math.abs(d[i+2]-d[i+stride+2]));o[i]=224;o[i+1]=207;o[i+2]=164;o[i+3]=Math.min(230,Math.max(0,edge-35)*2);}
  x.putImageData(out,0,0);
 }
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
   if(ready&&!trace)tracePage();
   if(trace){c.save();c.beginPath();c.rect(0,0,w,h*Math.min(1,k/.65));c.clip();c.drawImage(trace,0,0,w,h);c.restore();}
   c.fillStyle='#e1c48c';c.fillRect(0,h-5,w*Math.min(.96,k),5);
   if(ready&&k>.65){c.globalAlpha=(k-.65)/.35;c.drawImage(snapshot,0,0,w,h);c.globalAlpha=1;}
  }texture.needsUpdate=true;return true;
 }};
}
