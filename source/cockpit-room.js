import * as THREE from 'three';
import {addWarmFurniture} from './cockpit-warm-furniture.js';
import {addWeddingSign} from './cockpit-sign.js?v=12.4';
import {addOutdoors} from './cockpit-outdoors.js?v=12.4';
export function furnishRoom(scene){
 addOutdoors(scene);addWeddingSign(scene);addWarmFurniture(scene);
 const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const wall=mat('#ded3bf'),wood=mat('#b79160'),dark=mat('#202c2a'),paper=mat('#d4c9af'),metal=mat('#74817c',.4),green=mat('#405a49');
 function block(x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;scene.add(o);return o;}
 // Small potted plants: tapered terracotta pot with a rim, arching stems and real leaf shapes.
 const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(.42,.18,.38,.72,0,1);leafShape.bezierCurveTo(-.38,.72,-.42,.18,0,0);
 const leafGeo=new THREE.ShapeGeometry(leafShape,10);{const p=leafGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-x*x*.9+Math.sin(y*Math.PI)*.08);}leafGeo.computeVertexNormals();}
 const leafMats=['#3f6b3a','#4d7d43','#5d8c4c','#355e33'].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.62,side:THREE.DoubleSide}));
 function plant(x,y,z,size){const potMat=mat('#a0623f',.85);const pot=new THREE.Mesh(new THREE.CylinderGeometry(size*.27,size*.2,size*.42,28),potMat);pot.position.set(x,y+size*.21,z);pot.castShadow=true;scene.add(pot);const rim=new THREE.Mesh(new THREE.TorusGeometry(size*.27,size*.028,8,28),potMat);rim.rotation.x=Math.PI/2;rim.position.set(x,y+size*.42,z);scene.add(rim);const soil=new THREE.Mesh(new THREE.CylinderGeometry(size*.25,size*.25,.01,24),mat('#2a2018'));soil.position.set(x,y+size*.405,z);scene.add(soil);
  const stemMat=mat('#4d6b3a');for(let i=0;i<15;i++){const a=i*2.399,reach=size*(.22+(i%4)*.09),h=size*(.35+(i%5)*.13),base=new THREE.Vector3(x+Math.cos(a)*size*.05,y+size*.4,z+Math.sin(a)*size*.05),tip=new THREE.Vector3(x+Math.cos(a)*reach,y+size*.4+h,z+Math.sin(a)*reach);
   const curve=new THREE.QuadraticBezierCurve3(base,new THREE.Vector3(x+Math.cos(a)*reach*.2,tip.y+size*.05,z+Math.sin(a)*reach*.2),tip);const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,8,size*.008,5,false),stemMat);scene.add(stem);
   const holder=new THREE.Group();holder.position.copy(tip);holder.rotation.y=-a-Math.PI/2;scene.add(holder);const leaf=new THREE.Mesh(leafGeo,leafMats[i%4]);const s=size*(.24+(i%3)*.05);leaf.scale.set(s,s,s);leaf.rotation.x=-(.45+(i%4)*.22);leaf.castShadow=true;holder.add(leaf);}}
 plant(-3.38,2.985,-1.6,.48);plant(3.38,2.985,-1.6,.48);
 // Continue the enclosure beyond the camera's visible front corners.
 for(const x of [-4.05,4.05])block(x,2.05,5.7,.18,4.1,2.4,wall);
 block(0,-.07,5.8,8.25,.14,6,wood);block(0,4.1,5,8.25,.15,7,wall);block(0,2,8.2,8.25,4,.15,wall);
 for(const x of [-3.75,3.75])block(x,3.85,1.5,.18,.55,12,wall);
 // Large recessed-looking woodshop window in the quiet wall section.
 for(const z of [1.72,3.48])block(-3.59,2.35,z,.12,1.4,.08,wood);
 for(const y of [1.68,3.02])block(-3.59,y,2.6,.12,.08,1.84,wood);
 block(-3.55,1.65,2.6,.32,.08,1.92,wood);block(-3.56,2.35,2.6,.06,1.27,.035,dark);
 const windowLight=new THREE.SpotLight('#fff0d5',27,7,1,.7,2);windowLight.position.set(-3.4,2.7,2.5);windowLight.target.position.set(-1.7,1,1);scene.add(windowLight,windowLight.target);

 // Continuous enclosure: the forest is visible only through the framed window.
 block(-3.73,1.76,-.91,.16,3.52,5.18,wall);
 block(-3.73,1.76,6.25,.16,3.52,5.5,wall);
 block(-3.73,.82,2.6,.16,1.64,1.84,wall);
 block(-3.73,3.29,2.6,.16,.46,1.84,wall);
 block(3.84,1.76,2.25,.16,3.52,13.5,wall);
 const ceilingMat=mat('#e1d7c6');block(0,3.92,2,7.65,.08,13,ceilingMat);
 for(const z of [-1.9,1.6,5.1])block(0,3.86,z,7.5,.065,.12,wood);
 // A usable whiteboard occupies the former box shelf and tool rail.
 block(3.55,2.22,2.24,.065,.87,1.35,metal);
 const wc=document.createElement('canvas');wc.width=1500;wc.height=1000;const w=wc.getContext('2d');w.fillStyle='#f1f0e4';w.fillRect(0,0,1500,1000);w.fillStyle='#244d49';w.font='54px Georgia';w.fillText('On the bench',90,110);w.strokeStyle='#62827b';w.lineWidth=3;w.beginPath();w.moveTo(90,145);w.lineTo(1400,145);w.stroke();
 w.font='36px monospace';['□ Heart toolpath','□ Sensor enclosure','□ Lithophane panels'].forEach((v,i)=>w.fillText(v,100,250+i*95));
 w.font='italic 50px Georgia';w.fillStyle='#7b4a30';w.fillText('Make something',100,720);w.fillText('worth sharing.',100,790);w.font='28px monospace';w.fillStyle='#496563';w.fillText('SKETCH → BUILD → TEST → REPEAT',100,920);
 w.strokeStyle='#b66b4b';w.lineWidth=7;w.beginPath();w.moveTo(1130,520);w.bezierCurveTo(850,340,1050,230,1130,340);w.bezierCurveTo(1220,230,1400,340,1130,520);w.stroke();w.fillStyle='#677d70';w.font='25px monospace';w.fillText('x / y',1080,600);
 const wt=new THREE.CanvasTexture(wc);wt.colorSpace=THREE.SRGBColorSpace;wt.anisotropy=4;const whiteboard=new THREE.Mesh(new THREE.PlaneGeometry(1.29,.81),new THREE.MeshStandardMaterial({map:wt,roughness:.6}));whiteboard.rotation.y=-Math.PI/2;whiteboard.position.set(3.512,2.22,2.24);scene.add(whiteboard);block(3.48,1.75,2.24,.15,.035,1.35,metal);
 for(let i=0;i<3;i++)block(3.47,1.79,1.88+i*.16,.018,.025,.12,i===1?green:dark);
 // A small orange climbing carabiner hangs from the woodshop peg rail.
 const clip=new THREE.Group();clip.position.set(-3.36,2.18,-.90);clip.rotation.y=Math.PI/2;clip.rotation.z=-.22;scene.add(clip);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.04,-.085,0),new THREE.Vector3(-.04,-.1,0),new THREE.Vector3(-.065,-.05,0),new THREE.Vector3(-.055,.07,0),new THREE.Vector3(-.015,.105,0),new THREE.Vector3(.04,.08,0)]);
 clip.add(new THREE.Mesh(new THREE.TubeGeometry(curve,28,.009,8,false),mat('#ba602e',.35)));
 const gate=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.165,12),metal);gate.position.set(.04,-.003,0);clip.add(gate);
 // Reading shelf above the printer; spine colors are decorative, no invented titles.
 block(3.65,2.72,3.05,.45,.055,1.72,wood);
 const titles=['What Every BODY Is Saying','How to Win Friends and Influence People','The Tipping Point','Becoming the Best','David and Goliath','Atomic Habits','Outliers','Dracula','Calculating the Cosmos'];
 for(let i=0;i<titles.length;i++){const h=.3+(i%4)*.035,z=2.35+i*.17;block(3.64,2.75+h/2,z,.28,h,.135,[green,paper,dark,wood][i%4]);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle=['#405a49','#b4a786','#202c2a','#57432e'][i%4];ctx.fillRect(0,0,256,1024);ctx.translate(128,512);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle='#f5e8ca';ctx.font='48px Georgia';ctx.fillText(titles[i],0,12,850);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(.13,h),new THREE.MeshBasicMaterial({map:texture}));label.rotation.y=-Math.PI/2;label.position.set(3.491,2.75+h/2,z);scene.add(label);}
 // An electronics notebook sits on the working bench.
 // A glowing sign over the monitors says what the computer holds: the software projects.
 {const W=1600,H=300,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const wood=g.createLinearGradient(0,0,0,H);wood.addColorStop(0,'#3a2817');wood.addColorStop(1,'#24180d');g.fillStyle=wood;g.beginPath();g.roundRect(6,6,W-12,H-12,34);g.fill();
  g.strokeStyle='#e0b8723a';g.lineWidth=5;g.beginPath();g.roundRect(22,22,W-44,H-44,24);g.stroke();
  for(let i=0;i<18;i++){g.strokeStyle=`rgba(0,0,0,${.06+Math.random()*.06})`;g.lineWidth=2;g.beginPath();const y=30+Math.random()*(H-60);g.moveTo(30,y);g.bezierCurveTo(W*.3,y+8,W*.6,y-8,W-30,y+4);g.stroke();}
  g.textAlign='center';g.textBaseline='middle';g.font='italic 400 132px Georgia,serif';
  for(const [blur,a] of [[60,.55],[28,.75],[10,.9]]){g.shadowColor=`rgba(255,184,92,${a})`;g.shadowBlur=blur;g.fillStyle='#ffd99a';g.fillText('Software projects',W/2,H/2+6);}
  g.shadowBlur=0;g.fillStyle='#fff3da';g.fillText('Software projects',W/2,H/2+6);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.244),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false}));sign.position.set(0,3.57,-2.88);sign.name='Software_sign';scene.add(sign);
  const glow=new THREE.PointLight('#ffb862',.6,1.6,2);glow.position.set(0,3.57,-2.7);scene.add(glow);
  for(const x of [-.5,.5]){const wire=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.5,4),mat('#1a1a1a'));wire.position.set(x,3.84,-2.885);scene.add(wire);}}
 const notebook=block(2.75,1.14,1.8,.42,.035,.58,paper);notebook.rotation.y=.12;
 for(let i=0;i<5;i++)block(2.75,1.16,1.58+i*.065,.32,.001,.002,metal);
 // A compact filament rack near the printer, separated from the microscope.
 for(let i=0;i<3;i++){const spool=new THREE.Mesh(new THREE.TorusGeometry(.095,.035,10,24),mat(['#a87d4d','#b5b9aa','#526e70'][i]));spool.position.set(3.55,2.28,3.65+i*.23);spool.rotation.y=Math.PI/2;scene.add(spool);}
 // Warm directional daylight and feathered shafts through the rear glazing.
 const sun=new THREE.DirectionalLight('#fff0d2',1.6);sun.position.set(3,5,-6);sun.target.position.set(-2,0,2);scene.add(sun,sun.target);
 for(let i=0;i<3;i++){
  const x=-1.1+i*.8,geometry=new THREE.BufferGeometry();const vertices=new Float32Array([x-.09,2.85,-2.85,x+.09,2.85,-2.85,x-1.1,.15,3.4,x-.09,2.85,-2.85,x-1.1,.15,3.4,x-1.8,.15,3.4]);geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),2));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float edge=pow(sin(vUv.x*3.14159),2.);float fade=sin(vUv.y*3.14159);gl_FragColor=vec4(1.,.84,.56,edge*fade*.055);}'});scene.add(new THREE.Mesh(geometry,material));
 }
}
