import * as THREE from 'three';
// The wedding welcome sign, built as the real object is: a birch backing board, a stained
// panel with the names cut through it, raised "Welcome" letters, and a stacked park badge.
// Every layer is mapped from the straight-on build photo (sign-process-8.jpg, rotated upright).
// Layout coordinates below are pixels in that upright 1024×768 photo.
const W=1024,H=768,S=.0014;
const BOARD=[[30,72,44],[972,158,38],[972,668,40],[40,668,40]];
const PANEL=[[34,338,0],[688,338,10],[722,352,14],[760,370,14],[800,352,12],[826,336,10],[986,334,0],[986,675,42],[36,675,42]];
const BADGE=[[630,112,14],[652,78,10],[698,62,12],[745,64,6],[792,62,12],[842,76,10],[868,108,14],[866,165,20],[854,222,24],[832,276,24],[798,322,20],[761,358,6],[724,326,20],[690,282,24],[664,232,24],[642,178,20]];
const LETTERS=[50,104,560,330]; // box around "Welcome / TO OUR ADVENTURE"

const toWorld=(u,v)=>[(u-W/2)*S,(H/2-v)*S];
function shapeFrom(points){
 // Rounded polygon: each point carries its own corner radius (px).
 const s=new THREE.Shape(),n=points.length;
 points.forEach(([u,v,r],i)=>{
  const [pu,pv]=points[(i+n-1)%n],[nu,nv]=points[(i+1)%n];
  const a=Math.hypot(pu-u,pv-v),b=Math.hypot(nu-u,nv-v),k=Math.min(r,a/2,b/2);
  const p1=toWorld(u+(pu-u)/a*k,v+(pv-v)/a*k),p2=toWorld(u+(nu-u)/b*k,v+(nv-v)/b*k),c=toWorld(u,v);
  i?s.lineTo(...p1):s.moveTo(...p1);if(k)s.quadraticCurveTo(...c,...p2);
 });
 s.closePath();return s;
}
function tracePath(ctx,points){
 const n=points.length;ctx.beginPath();
 points.forEach(([u,v,r],i)=>{const [pu,pv]=points[(i+n-1)%n],[nu,nv]=points[(i+1)%n];const a=Math.hypot(pu-u,pv-v),b=Math.hypot(nu-u,nv-v),k=Math.min(r,a/2,b/2);
  const x1=u+(pu-u)/a*k,y1=v+(pv-v)/a*k;i?ctx.lineTo(x1,y1):ctx.moveTo(x1,y1);ctx.quadraticCurveTo(u,v,u+(nu-u)/b*k,v+(nv-v)/b*k);});
 ctx.closePath();
}
// Faces (not side walls) sample the photo at their own position.
function photoUV(geo,facesOnly){
 const p=geo.attributes.position,nrm=geo.attributes.normal,uv=geo.attributes.uv;
 for(let i=0;i<p.count;i++){if(facesOnly&&Math.abs(nrm.getZ(i))<.05)continue;uv.setXY(i,(p.getX(i)/S+W/2)/W,(p.getY(i)/S+H/2)/H);}
 uv.needsUpdate=true;return geo;
}
const extrude=(shape,depth,bevel)=>photoUV(new THREE.ExtrudeGeometry(shape,{depth,curveSegments:10,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel}),true);
const canvas=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
const tex=(c,srgb)=>{const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;};

function plyEdge(base,dark){
 // Thin alternating veneers, as on cut plywood. Side-wall UVs run along depth in metres.
 const c=document.createElement('canvas');c.width=8;c.height=64;const x=c.getContext('2d');
 for(let i=0;i<8;i++){x.fillStyle=i%2?dark:base;x.fillRect(0,i*8,8,8);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1/.013);return t;
}

export function addWeddingSign(scene){
 const group=new THREE.Group();group.name='Wedding welcome sign';group.position.set(-3.645,2.35,4.45);group.rotation.y=Math.PI/2;scene.add(group);
 const colorC=canvas(),photoC=canvas(),panelC=canvas(),lettersC=canvas(),bumpC=canvas();
 const photoT=tex(photoC,true),colorT=tex(colorC,true),panelT=tex(panelC),lettersT=tex(lettersC),bumpT=tex(bumpC);
 const face=(o={})=>new THREE.MeshStandardMaterial({map:colorT,bumpMap:bumpT,bumpScale:.004,roughness:.78,color:'#e9e2d6',...o});
 const maskDepth=m=>new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,alphaMap:m,alphaTest:.5});
 const add=(geo,mat,z,{cast=true,depth}={})=>{const m=new THREE.Mesh(geo,mat);m.position.z=z;m.castShadow=cast;m.receiveShadow=true;if(depth)m.customDepthMaterial=depth;group.add(m);return m;};

 // 1. Birch backing board, standing a little off the wall so it throws a shadow.
 const T0=.013,T1=.006,T2=.006,TB=.016,lift=.014;
 const birchEdge=new THREE.MeshStandardMaterial({map:plyEdge('#d9c6a2','#b89c72'),roughness:.85});
 const board=add(extrude(shapeFrom(BOARD),T0,.0012),[face(),birchEdge],lift);
 // 2. Stained panel; the names are holes cut through it (alpha mask), with stained walls.
 const panelShape=shapeFrom(PANEL),z1=lift+T0;
 add(extrude(panelShape,T1,0),[face({alphaMap:panelT,alphaTest:.5}),new THREE.MeshStandardMaterial({color:'#4a2c1b',roughness:.8})],z1,{depth:maskDepth(panelT)});
 const wall=new THREE.MeshStandardMaterial({color:'#3c2416',roughness:.85,alphaMap:panelT,alphaTest:.5});
 for(const k of [.33,.66])add(photoUV(new THREE.ShapeGeometry(panelShape,10)),wall,z1+T1*k,{cast:false});
 // 3. Raised "Welcome / TO OUR ADVENTURE" letters glued onto the birch.
 const [lx,ly,lw,lh]=LETTERS,box=new THREE.Shape();
 [[lx,ly],[lx+lw,ly],[lx+lw,ly+lh],[lx,ly+lh]].forEach(([u,v],i)=>{const p=toWorld(u,v);i?box.lineTo(...p):box.moveTo(...p);});
 const letterGeo=photoUV(new THREE.ShapeGeometry(box));
 add(letterGeo,face({map:photoT,alphaMap:lettersT,alphaTest:.5}),z1+T2,{depth:maskDepth(lettersT)});
 const lwall=new THREE.MeshStandardMaterial({color:'#5b3520',roughness:.85,alphaMap:lettersT,alphaTest:.5});
 for(const k of [.25,.5,.75])add(letterGeo,lwall,z1+T2*k,{cast:false});
 // 4. The park badge: its own thicker stacked piece, overhanging the board's top edge.
 add(extrude(shapeFrom(BADGE),TB,.0012),[face({bumpScale:2}),new THREE.MeshStandardMaterial({color:'#2a1c14',roughness:.7})],z1);

 // Soft contact shadow on the wall behind the board.
 const sh=document.createElement('canvas');sh.width=256;sh.height=192;const sx=sh.getContext('2d');
 for(let i=0;i<14;i++){sx.fillStyle='rgba(0,0,0,.045)';sx.fillRect(12+i*2.4,10+i*2.4,232-i*4.8,172-i*4.8);}
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(W*S*1.18,H*S*1.22),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sh),transparent:true,depthWrite:false}));
 shadow.position.set(.01,-.03,.002);group.add(shadow);

 // A soft picture light from above, not a hot spot.
 const light=new THREE.SpotLight('#ffe2b8',2.6,3.4,.62,1,2);light.position.set(-2.75,3.25,4.45);light.target=group;
 light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.0004;light.shadow.normalBias=.002;light.shadow.radius=3;light.shadow.camera.near=.3;light.shadow.camera.far=3.5;scene.add(light);

 // Masks come from the photo once it loads; then ask the renderer for one fresh shadow pass.
 let refreshShadows=false;
 board.onBeforeRender=renderer=>{if(refreshShadows){renderer.shadowMap.needsUpdate=true;refreshShadows=false;}};
 const img=new Image();img.decoding='async';let signReady;(window.__roomPending||=[]).push(new Promise(r=>signReady=r));img.onerror=()=>signReady();
 img.onload=()=>{window.__stage?.('sign-start');
  const c=colorC.getContext('2d',{willReadFrequently:true});c.save();c.translate(0,H);c.rotate(-Math.PI/2);c.drawImage(img,0,0,H,W);c.restore();
  const src=c.getImageData(0,0,W,H),d=src.data;
  const inside=(points)=>{const k=canvas().getContext('2d');tracePath(k,points);k.fillStyle='#fff';k.fill();return k.getImageData(0,0,W,H).data;};
  const inPanel=inside(PANEL),inBadge=inside(BADGE);
  // Cut-outs only well inside the panel, so the photo's background can't nibble its edge.
  const inset=(()=>{const k=canvas().getContext('2d');tracePath(k,PANEL);k.fillStyle='#fff';k.fill();k.lineWidth=36;k.strokeStyle='#000';k.stroke();return k.getImageData(0,0,W,H).data;})();
  const birch=new Uint8Array(W*H),panel=new ImageData(W,H),letters=new ImageData(W,H),bump=new ImageData(W,H);
  let br=0,bg=0,bb=0,bn=0;
  for(let i=0;i<d.length;i+=4){
   const r=d[i],g=d[i+1],b=d[i+2],x=(i/4)%W,y=(i/4/W)|0,lum=.3*r+.59*g+.11*b,warm=r-b;
   // Stain is saturated red-brown; birch and the grey shadows inside the cut-outs are not.
   const stained=warm>40&&lum<190;
   birch[i/4]=lum>150&&warm<70?1:0;
   const inBox=x>=LETTERS[0]&&x<LETTERS[0]+LETTERS[2]&&y>=LETTERS[1]&&y<LETTERS[1]+LETTERS[3]&&inBadge[i]<128&&inPanel[i]<128;
   const la=inBox&&stained?255:0;letters.data.set([la,la,la,255],i);
   if(inBox&&!stained&&lum>185){br+=r;bg+=g;bb+=b;bn++;}
   const g8=Math.max(0,Math.min(255,lum));bump.data.set([g8,g8,g8,255],i);
  }
  // Cut-outs = bare birch grown ~4px, which also swallows the shadow rim inside each hole.
  const grow=(m,r)=>{const t=new Uint8Array(W*H),o=new Uint8Array(W*H);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=0;for(let k=-r;k<=r&&!v;k++){const xx=x+k;if(xx>=0&&xx<W)v=m[y*W+xx];}t[y*W+x]=v;}
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=0;for(let k=-r;k<=r&&!v;k++){const yy=y+k;if(yy>=0&&yy<H)v=t[yy*W+x];}o[y*W+x]=v;}return o;};
  const holes=grow(birch,4);
  for(let j=0;j<W*H;j++){const pa=inPanel[j*4]>127&&!(holes[j]&&inset[j*4]>127)?255:0;panel.data.set([pa,pa,pa,255],j*4);}
  const put=(ctxC,data,blur)=>{const k=ctxC.getContext('2d');k.putImageData(data,0,0);if(blur){k.filter=`blur(${blur}px)`;k.drawImage(ctxC,0,0);k.filter='none';}};
  put(panelC,panel,1.5);put(lettersC,letters,2);put(bumpC,bump,1.5);
  // Under the raised letters the backing is plain birch, so the photo's letters don't show twice.
  const avg=bn?`rgb(${br/bn|0},${bg/bn|0},${bb/bn|0})`:'#e2d9c7';
  photoC.getContext('2d').drawImage(colorC,0,0);
  const cover=new ImageData(W,H);for(let i=3;i<cover.data.length;i+=4)cover.data[i]=letters.data[i-3];
  const mask=canvas(),mk=mask.getContext('2d');mk.putImageData(cover,0,0);
  // Grow the mask a few px so the letters' baked shadows are covered too.
  const fill=canvas(),fk=fill.getContext('2d');for(const [dx,dy] of [[0,0],[3,3],[-2,-2],[3,-2],[-2,3],[5,5]])fk.drawImage(mask,dx,dy);
  fk.globalCompositeOperation='source-in';fk.fillStyle=avg;fk.fillRect(0,0,W,H);c.drawImage(fill,0,0);
  // Tame the white birch a touch so it doesn't blow out under the lamp.
  for(const k of [c,photoC.getContext('2d')]){k.globalCompositeOperation='multiply';k.fillStyle='#f2ece2';k.fillRect(0,0,W,H);k.globalCompositeOperation='source-over';}
  for(const t of [photoT,colorT,panelT,lettersT,bumpT])t.needsUpdate=true;
  refreshShadows=true;window.__stage?.('sign-done');signReady();
 };
 img.src='assets/sign-process-8.jpg';
}
