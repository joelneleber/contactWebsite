import {batchStatic} from './cockpit-static.js';
import {walnutMaterial} from './cockpit-wood.js';
import * as THREE from 'three';
import {addNixieClock} from './cockpit-clock.js';
import {addPlants} from './cockpit-plants.js';
import {addRoomShell} from './cockpit-shell.js';
import {addWarmFurniture} from './cockpit-warm-furniture.js';
import {addWeddingSign} from './cockpit-sign.js?v=12.4';
import {addOutdoors} from './cockpit-outdoors.js?v=12.4';
export function furnishRoom(scene){
 const clock=addNixieClock(scene);const outdoors=addOutdoors(scene);addWeddingSign(scene);addWarmFurniture(scene);addRoomShell(scene);
 const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const wall=mat('#a49d8b'),wood=walnutMaterial(),dark=mat('#202c2a'),paper=mat('#d4c9af'),metal=mat('#74817c',.4),green=mat('#405a49');
 function block(x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;scene.add(o);return o;}
 addPlants(scene);
 const staticBefore=new Set(scene.children);
 // A usable whiteboard occupies the former box shelf and tool rail.
 block(3.55,2.30,2.85,.065,1.20,1.70,metal);
 const wc=document.createElement('canvas');wc.width=1500;wc.height=1000;const w=wc.getContext('2d');w.fillStyle='#f1f0e4';w.fillRect(0,0,1500,1000);w.fillStyle='#244d49';w.font='54px Georgia';w.fillText('On the bench',90,110);w.strokeStyle='#62827b';w.lineWidth=3;w.beginPath();w.moveTo(90,145);w.lineTo(1400,145);w.stroke();
 w.font='36px monospace';['□ Heart toolpath','□ Sensor enclosure','□ Lithophane panels'].forEach((v,i)=>w.fillText(v,100,250+i*95));
 w.font='italic 50px Georgia';w.fillStyle='#7b4a30';w.fillText('Make something',100,720);w.fillText('worth sharing.',100,790);w.font='28px monospace';w.fillStyle='#496563';w.fillText('SKETCH → BUILD → TEST → REPEAT',100,920);
 w.strokeStyle='#b66b4b';w.lineWidth=7;w.beginPath();w.moveTo(1130,520);w.bezierCurveTo(850,340,1050,230,1130,340);w.bezierCurveTo(1220,230,1400,340,1130,520);w.stroke();w.fillStyle='#677d70';w.font='25px monospace';w.fillText('x / y',1080,600);
 const wt=new THREE.CanvasTexture(wc);wt.colorSpace=THREE.SRGBColorSpace;wt.anisotropy=4;const whiteboard=new THREE.Mesh(new THREE.PlaneGeometry(1.64,1.14),new THREE.MeshStandardMaterial({map:wt,roughness:.6}));whiteboard.rotation.y=-Math.PI/2;whiteboard.position.set(3.512,2.30,2.85);scene.add(whiteboard);block(3.48,1.68,2.85,.15,.035,1.70,metal);
 for(let i=0;i<3;i++)block(3.47,1.72,2.30+i*.16,.018,.025,.12,i===1?green:dark);
 // A small orange climbing carabiner hangs from the woodshop peg rail.
 const clip=new THREE.Group();clip.position.set(-3.36,1.95,1.42);clip.rotation.y=Math.PI/2;clip.rotation.z=-.22;scene.add(clip);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.04,-.085,0),new THREE.Vector3(-.04,-.1,0),new THREE.Vector3(-.065,-.05,0),new THREE.Vector3(-.055,.07,0),new THREE.Vector3(-.015,.105,0),new THREE.Vector3(.04,.08,0)]);
 clip.add(new THREE.Mesh(new THREE.TubeGeometry(curve,28,.009,8,false),mat('#ba602e',.35)));
 const gate=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.165,12),metal);gate.position.set(.04,-.003,0);clip.add(gate);
 // Reading shelf above the printer; spine colors are decorative, no invented titles.
 // Books now sit on the main upper shelf over the cabinets.
 const titles=['What Every BODY Is Saying','How to Win Friends and Influence People','The Tipping Point','Becoming the Best','David and Goliath','Atomic Habits','Outliers','Dracula','Calculating the Cosmos'];
 for(let i=0;i<titles.length;i++){const h=.3+(i%4)*.035,z=-.35+i*.15;block(3.38,3.085+h/2,z,.28,h,.135,[green,paper,dark,wood][i%4]);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle=['#405a49','#b4a786','#202c2a','#57432e'][i%4];ctx.fillRect(0,0,256,1024);ctx.translate(128,512);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle='#f5e8ca';ctx.font='48px Georgia';ctx.fillText(titles[i],0,12,850);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(.13,h),new THREE.MeshBasicMaterial({map:texture}));label.rotation.y=-Math.PI/2;label.position.set(3.231,3.085+h/2,z);scene.add(label);}
 // An electronics notebook sits on the working bench.
 const notebook=block(2.75,1.10,2.15,.42,.035,.58,paper);
 for(let i=0;i<5;i++)block(2.75,1.12,1.93+i*.065,.32,.001,.002,metal);
 // Filament gets a countertop cradle beside the printer, clear of the enlarged whiteboard.
 block(3.30,1.105,4.01,.36,.06,.80,wood);
 for(const z of [3.63,4.39])block(3.30,1.23,z,.28,.23,.025,metal);
 for(let i=0;i<3;i++){const spool=new THREE.Mesh(new THREE.TorusGeometry(.095,.035,10,24),mat(['#a87d4d','#b5b9aa','#526e70'][i]));spool.position.set(3.30,1.265,3.78+i*.23);spool.rotation.y=Math.PI/2;scene.add(spool);}
 // Tiny screen-printed legends share one atlas and one material.
 const lc=document.createElement('canvas');lc.width=512;lc.height=256;const lx=lc.getContext('2d');lx.fillStyle='#d7d9ca';lx.textAlign='center';lx.textBaseline='middle';lx.font='600 36px monospace';['DC POWER SUPPLY','V','A','MULTIMETER'].forEach((text,i)=>lx.fillText(text,256,i*64+32));const lt=new THREE.CanvasTexture(lc);lt.colorSpace=THREE.SRGBColorSpace;const lm=new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false});
 for(const [i,x,y,z,w,h] of [[0,2.912,1.908,.1,.31,.025],[1,2.912,1.845,.282,.025,.025],[2,2.912,1.745,.282,.025,.025],[3,2.995,1.835,.68,.16,.019]]){const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setY(j,(3-i+uv.getY(j))/4);const label=new THREE.Mesh(geo,lm);label.rotation.y=-Math.PI/2;label.position.set(x,y,z);scene.add(label);}
 // Warm directional daylight and feathered shafts through the rear glazing.
 const daylightClock={value:0};
 const sun=new THREE.DirectionalLight('#fff0d2',.95);sun.name='Cloud-filtered window daylight';sun.position.set(3,5,-6);sun.target.position.set(-2,0,2);scene.add(sun,sun.target);
 for(let i=0;i<3;i++){
  const x=-1.1+i*.8,geometry=new THREE.BufferGeometry();const vertices=new Float32Array([x-.09,2.85,-2.85,x+.09,2.85,-2.85,x-1.1,.15,3.4,x-.09,2.85,-2.85,x-1.1,.15,3.4,x-1.8,.15,3.4]);geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),2));
  const material=new THREE.ShaderMaterial({uniforms:{daylightClock},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float daylightClock;varying vec2 vUv;void main(){float edge=pow(sin(vUv.x*3.14159),2.);float fade=sin(vUv.y*3.14159);gl_FragColor=vec4(1.,.84,.56,edge*fade*.035*(.75+.25*sin(daylightClock*.6+vUv.x*8.)));}'});scene.add(new THREE.Mesh(geometry,material));
 }
 batchStatic(scene,scene.children.filter(o=>!staticBefore.has(o)));
 return {update(t){outdoors.update(t);clock.update();daylightClock.value=t*.001;sun.intensity=.92+.075*Math.sin(t*.00019)+.035*Math.sin(t*.00043+1.4);}};
}
