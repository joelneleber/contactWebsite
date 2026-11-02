import * as THREE from 'three';
// A cloth-bound hardcover: boards overhang the page block, rounded spine, striped page edges,
// gold-foil title and a soft contact shadow. API and page-turn behavior are unchanged.
export function createProjectBook(scene){
 const book=new THREE.Group();book.position.set(-2.65,1.105,2.35);book.rotation.y=Math.PI/2;scene.add(book);
 const W=.88,D=.64,T=.016,PW=.85,PD=.61,PH=.05,BASE=-.011;      // boards, page block, bench contact
 const blockTop=BASE+T+PH,pageW=.84,pageD=.60;
 const texture=(c,srgb=true)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
 const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

 // ---- Materials ----
 // Book cloth: deep green with fibre noise, a faint weave and a debossed border panel.
 const cloth=make(1024,744),cx=cloth.getContext('2d');
 cx.fillStyle='#2f4632';cx.fillRect(0,0,1024,744);
 const img=cx.getImageData(0,0,1024,744),px=img.data;
 for(let y=0;y<744;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4,n=(Math.random()-.5)*18+((x%3===0)?-4:0)+((y%3===0)?-3:0);px[i]+=n;px[i+1]+=n*1.05;px[i+2]+=n*.9;}
 cx.putImageData(img,0,0);
 const edge=cx.createRadialGradient(512,372,250,512,372,640);edge.addColorStop(0,'#0000');edge.addColorStop(1,'#0000002e');cx.fillStyle=edge;cx.fillRect(0,0,1024,744);
 cx.strokeStyle='#1d2e20';cx.lineWidth=5;cx.strokeRect(58,58,908,628);cx.strokeStyle='#4a6449';cx.lineWidth=2;cx.strokeRect(62,62,908,628);
 const clothTex=texture(cloth),clothBump=texture(cloth,false);
 const clothMat=new THREE.MeshStandardMaterial({map:clothTex,bumpMap:clothBump,bumpScale:.6,roughness:.86,metalness:0});

 // Page edges: hundreds of fine leaves, slightly darker toward the boards.
 const edges=make(64,512),ex=edges.getContext('2d');
 ex.fillStyle='#e9dcbf';ex.fillRect(0,0,64,512);
 for(let y=0;y<512;y+=2){ex.fillStyle=`rgba(120,96,62,${.05+Math.random()*.12})`;ex.fillRect(0,y,64,1);}
 const g=ex.createLinearGradient(0,0,0,512);g.addColorStop(0,'#6a5236');g.addColorStop(.06,'#6a523600');g.addColorStop(.94,'#6a523600');g.addColorStop(1,'#6a5236');ex.fillStyle=g;ex.globalAlpha=.55;ex.fillRect(0,0,64,512);ex.globalAlpha=1;
 const edgeMat=new THREE.MeshStandardMaterial({map:texture(edges),roughness:.95});
 const plainPaper=new THREE.MeshStandardMaterial({color:'#e7d9bb',roughness:.95});

 // ---- Geometry ----
 // Rounded-corner board lying flat; x along the spread, z across, thickness on y.
 function board(){const r=.012,s=new THREE.Shape(),w=W/2,d=D/2;s.moveTo(-w,-d);s.lineTo(w-r,-d);s.quadraticCurveTo(w,-d,w,-d+r);s.lineTo(w,d-r);s.quadraticCurveTo(w,d,w-r,d);s.lineTo(-w,d);s.lineTo(-w,-d);
  const geo=new THREE.ExtrudeGeometry(s,{depth:T-.004,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,curveSegments:6});
  geo.rotateX(Math.PI/2);geo.translate(0,T/2-.002,0);
  // Map the cloth across the whole face.
  const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w)/W,1-(pos.getZ(i)+d)/D);
  const m=new THREE.Mesh(geo,clothMat);m.castShadow=true;m.receiveShadow=true;return m;}
 const back=board();back.position.y=BASE+T/2;book.add(back);

 // Page block: flush with the spine, inset ~3mm from the board edges elsewhere.
 const blockMats=[edgeMat,plainPaper,plainPaper,plainPaper,edgeMat,edgeMat];
 const block=new THREE.Mesh(new THREE.BoxGeometry(PW,PH,PD),blockMats);
 block.position.set(-W/2+PW/2+.004,BASE+T+PH/2,0);block.castShadow=true;block.receiveShadow=true;book.add(block);

 // Rounded spine wrapping the block on the hinge side.
 const spineR=(PH+2*T)/2;
 const spineGeo=new THREE.CylinderGeometry(spineR,spineR,D,24,1,true,Math.PI,Math.PI);spineGeo.rotateX(Math.PI/2);
 const spine=new THREE.Mesh(spineGeo,new THREE.MeshStandardMaterial({map:clothTex,bumpMap:clothBump,bumpScale:.6,roughness:.86,side:THREE.DoubleSide}));
 spine.scale.x=.34;spine.position.set(-W/2,BASE+spineR,0);spine.castShadow=true;book.add(spine);
 // Two foil bands across the spine.
 const foil=new THREE.MeshStandardMaterial({color:'#c9a45e',roughness:.38,metalness:.35});
 for(const z of [-.24,.24]){const band=new THREE.Mesh(new THREE.CylinderGeometry(spineR*1.003,spineR*1.003,.006,24,1,true,Math.PI,Math.PI),foil);band.rotation.x=Math.PI/2;band.scale.x=.34;band.position.set(-W/2,BASE+spineR,z);spine.parent.add(band);band.userData.spineBand=true;}

 // Soft contact shadow so the book sits on the bench (static shadow maps don't follow it).
 const sh=make(256,256),sx=sh.getContext('2d'),sg=sx.createRadialGradient(128,128,40,128,128,128);sg.addColorStop(0,'rgba(0,0,0,.55)');sg.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=sg;sx.fillRect(0,0,256,256);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(W*1.25,D*1.3),new THREE.MeshBasicMaterial({map:texture(sh),transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=BASE+.0006;shadow.renderOrder=-1;book.add(shadow);

 // ---- Pages ----
 const PX=2048,PY=Math.round(2048*pageD/pageW),S=PX/1200,LH=PY/S;     // logical page is 1200 × LH
 const canvas=()=>make(PX,PY);
 const leftCanvas=canvas(),rightCanvas=canvas(),leftTexture=texture(leftCanvas),rightTexture=texture(rightCanvas);
 function sheet(map,parent,x,y,back=false){const o=new THREE.Mesh(new THREE.PlaneGeometry(pageW,pageD),new THREE.MeshBasicMaterial({map,color:'#e6dccb',side:THREE.FrontSide,toneMapped:false}));o.position.set(x,y,0);o.rotation.x=-Math.PI/2;if(back)o.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI));o.receiveShadow=true;parent.add(o);return o;}
 const right=sheet(rightTexture,book,-W/2+pageW/2+.006,blockTop+.0008);

 // Front cover pivots on the spine edge at the top of the block, so open pages lie level.
 const hinge=new THREE.Group();hinge.position.set(-W/2+.004,blockTop,0);book.add(hinge);
 const front=board();front.position.set(W/2-.004,T/2+.0015,0);hinge.add(front);
 // Gold-foil title, drawn crisply at 2048px.
 const title=make(2048,1490),tc=title.getContext('2d'),gold=tc.createLinearGradient(0,300,0,1200);
 gold.addColorStop(0,'#e9cf8c');gold.addColorStop(.5,'#c79e55');gold.addColorStop(1,'#e2c27c');
 tc.fillStyle=gold;tc.strokeStyle=gold;tc.textAlign='center';tc.textBaseline='alphabetic';
 tc.lineWidth=4;tc.strokeRect(150,150,1748,1190);tc.lineWidth=2;tc.strokeRect(172,172,1704,1146);
 const spaced=(text,x,y,px,track)=>{tc.font=`600 ${px}px Georgia,serif`;const chars=[...text],w=chars.reduce((a,ch)=>a+tc.measureText(ch).width,0)+track*(chars.length-1);let cx=x-w/2;tc.textAlign='left';for(const ch of chars){tc.fillText(ch,cx,y);cx+=tc.measureText(ch).width+track;}tc.textAlign='center';};
 spaced('MADE BY HAND',1024,470,50,22);
 tc.fillRect(904,520,240,3);
 tc.font='italic 400 196px Georgia,serif';tc.fillText('Woodshop',1024,780);
 tc.font='400 150px Georgia,serif';tc.fillText('projects',1024,960);
 tc.fillRect(944,1040,160,3);
 tc.font='italic 52px Georgia,serif';tc.fillText('a book of things I’ve made',1024,1150);
 const titleTex=texture(title),titleMat=new THREE.MeshStandardMaterial({map:titleTex,emissiveMap:titleTex,emissive:'#ffffff',emissiveIntensity:.32,transparent:true,alphaTest:.35,roughness:.35,metalness:.25,depthWrite:false});
 const titlePlane=new THREE.Mesh(new THREE.PlaneGeometry(W,D),titleMat);titlePlane.rotation.x=-Math.PI/2;titlePlane.position.set(W/2-.004,T+.0018,0);hinge.add(titlePlane);
 const left=sheet(leftTexture,hinge,pageW/2+.002,.0007,true);

 const flip=new THREE.Group();flip.position.set(-W/2+.004,blockTop+.002,0);book.add(flip);const frontC=canvas(),backC=canvas(),frontT=texture(frontC),backT=texture(backC);const frontSheet=sheet(frontT,flip,pageW/2,.0006),backSheet=sheet(backT,flip,pageW/2,-.0006,true);flip.visible=false;
 frontSheet.material.side=backSheet.material.side=THREE.FrontSide;

 const cache=new Map();function photo(src){if(!src)return Promise.resolve(null);if(!cache.has(src))cache.set(src,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;}));return cache.get(src);}
 (window.PROJECTS||[]).filter(p=>p.group==='wood').forEach(p=>photo(p.photos?.[0]?.src));
 let pending=false,open=false,requested=false,ready=false,serial=0,opening=Infinity,index=0,turn=null;
 const copy=(from,to,tex)=>{const c=to.getContext('2d');c.clearRect(0,0,PX,PY);c.drawImage(from,0,0);tex.needsUpdate=true;};
 function wrap(c,text,x,y,max,size,font='Georgia,serif',lead=1.42){c.font=size+'px '+font;let line='';for(const word of String(text||'').split(/\s+/)){const next=line+word+' ';if(c.measureText(next).width>max&&line){c.fillText(line,x,y);y+=size*lead;line=word+' ';}else line=next;}c.fillText(line,x,y);return y+size*lead;}
 // Paper with fine grain and a shaded gutter toward the spine.
 function paper(c,gutterLeft){c.fillStyle='#efe4cb';c.fillRect(0,0,1200,LH);
  for(let i=0;i<900;i++){c.fillStyle=`rgba(120,95,60,${Math.random()*.05})`;c.fillRect(Math.random()*1200,Math.random()*LH,1+Math.random()*2,1);}
  const g=c.createLinearGradient(gutterLeft?0:1200,0,gutterLeft?150:1050,0);g.addColorStop(0,'rgba(70,48,24,.32)');g.addColorStop(1,'rgba(70,48,24,0)');c.fillStyle=g;c.fillRect(0,0,1200,LH);
  const o=c.createLinearGradient(gutterLeft?1200:0,0,gutterLeft?1130:70,0);o.addColorStop(0,'rgba(70,48,24,.10)');o.addColorStop(1,'rgba(70,48,24,0)');c.fillStyle=o;c.fillRect(0,0,1200,LH);}
 async function draw(p,n){const im=await photo(p.photos?.[0]?.src);const result=[canvas(),canvas()];
  for(let i=0;i<2;i++){const c=result[i].getContext('2d');c.scale(S,S);paper(c,i===1);c.fillStyle='#6d634c';c.font='600 20px Georgia,serif';
   const head='WOODSHOP · '+String(n+1).padStart(2,'0');c.textAlign=i?'right':'left';c.fillText(head.split('').join(String.fromCharCode(8202)),i?1110:90,64);
   c.textAlign='center';c.font='italic 20px Georgia,serif';c.fillText(String(n*2+i+1),600,LH-42);c.textAlign='left';}
  const a=result[0].getContext('2d');
  if(im){const maxW=960,maxH=LH-210,scale=Math.min(maxW/im.width,maxH/im.height),w=im.width*scale,h=im.height*scale,x=(1200-w)/2+20,y=105+(maxH-h)/2;
   // Mounted print: soft shadow, white border, the photo.
   a.save();a.shadowColor='rgba(40,25,10,.35)';a.shadowBlur=18;a.shadowOffsetY=6;a.fillStyle='#fbf7ee';a.fillRect(x-14,y-14,w+28,h+28);a.restore();a.drawImage(im,x,y,w,h);
   a.fillStyle='#5f5643';a.font='italic 22px Georgia,serif';a.textAlign='center';a.fillText(p.photos?.[0]?.caption||'',600,y+h+48,1000);a.textAlign='left';}
  const b=result[1].getContext('2d');b.fillStyle='#1f281c';
  let y=wrap(b,p.name,110,190,960,60,'Georgia,serif',1.15);
  b.fillStyle='#b08a4c';b.fillRect(110,y-12,90,3);
  b.fillStyle='#34342a';y=wrap(b,p.purpose,110,y+50,960,34,'Georgia,serif',1.5);
  b.fillStyle='#6d634c';b.font='600 19px Georgia,serif';b.fillText('MATERIALS & METHODS',110,y+48);
  b.fillStyle='#45412f';wrap(b,String(p.tech||'').replaceAll('·',' · '),110,y+90,960,28,'Georgia,serif',1.5);
  return result;}
 function setBook(value,p,n=0,total=1,animate=false){
 if(!value){pending=false;serial++;open=false;requested=false;ready=false;opening=Infinity;hinge.rotation.z=0;spine.visible=true;flip.visible=false;turn=null;return;}
 if(!p)return;const first=!open;open=true;const token=++serial;pending=true;
 draw(p,n).then(next=>{if(token!==serial)return;pending=false;if(first||!animate){copy(next[0],leftCanvas,leftTexture);copy(next[1],rightCanvas,rightTexture);index=n;ready=true;if(requested&&opening===Infinity)opening=performance.now();return;}
 const dir=n>index?1:-1;copy(dir===1?rightCanvas:leftCanvas,frontC,frontT);copy(dir===1?next[0]:next[1],backC,backT);
 frontSheet.position.x=backSheet.position.x=dir*pageW/2;
 // The reverse sheet begins on the left; its UV direction must follow the physical page.
 frontSheet.rotation.set(-Math.PI/2,0,0);backSheet.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2)));
 if(dir===1)copy(next[1],rightCanvas,rightTexture);else copy(next[0],leftCanvas,leftTexture);
 turn={start:performance.now(),dir,next};flip.rotation.z=0;flip.visible=true;index=n;
 });
 }
 return {book,setBook,openBook(){requested=true;if(ready&&opening===Infinity)opening=performance.now();},inspect(){return {bookOpen:open,bookBusy:pending||!!turn||(open&&(!ready||hinge.rotation.z<Math.PI)),bookCoverAngle:hinge.rotation.z};},update(t,motion){
 if(!open)return;const k=ready&&requested?(motion?Math.max(0,Math.min(1,(t-opening)/1250)):1):0;hinge.rotation.z=(k*k*(3-2*k))*Math.PI;
 // The rounded spine flattens under an open book; hide it once the cover passes upright.
 spine.visible=hinge.rotation.z<Math.PI*.55;book.children.forEach(o=>{if(o.userData.spineBand)o.visible=spine.visible;});
 if(turn){const q=motion?Math.min(1,(t-turn.start)/1000):1;flip.rotation.z=turn.dir*q*q*(3-2*q)*Math.PI;
  // A turning leaf bows slightly mid-turn.
  flip.position.y=blockTop+.002+Math.sin(q*Math.PI)*.012;
  if(q===1){copy(turn.next[0],leftCanvas,leftTexture);copy(turn.next[1],rightCanvas,rightTexture);flip.visible=false;turn=null;}}
 }};
}
