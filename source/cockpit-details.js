import {addPrinterMechanics} from './cockpit-printer.js';
import {addLiveLab} from './cockpit-lab-live.js';
import {labSignal} from './cockpit-lab-signal.js';
import {createProjectBook} from './cockpit-book.js?v=12.4';
import {addLife} from './cockpit-life.js?v=12.6';
import * as THREE from 'three';
import labLayout from './lab-layout.json';
import {furnishRoom} from './cockpit-room.js?v=13.2';
import {drapePlants} from './cockpit-fixes.js';
export function addDetails(scene,model,camera){
 const liveLab=addLiveLab(scene);
 const cncOffset=new THREE.Vector3(...labLayout.cnc.offset);
 const room=furnishRoom(scene);drapePlants(model);const life=addLife(scene);
 const cream=new THREE.MeshStandardMaterial({color:'#ead8ac',roughness:.85});
 const bookUI=createProjectBook(scene),book=bookUI.book;const setBook=bookUI.setBook;
 const scopeCanvas=document.createElement('canvas');scopeCanvas.width=768;scopeCanvas.height=512;const scopeCtx=scopeCanvas.getContext('2d'),scopeTex=new THREE.CanvasTexture(scopeCanvas);scopeTex.colorSpace=THREE.SRGBColorSpace;
 const liveScope=new THREE.Mesh(new THREE.PlaneGeometry(.485,.325),new THREE.MeshBasicMaterial({map:scopeTex}));liveScope.position.fromArray(labLayout.scope.screenSource).sub(new THREE.Vector3(...labLayout.scope.source)).applyAxisAngle(new THREE.Vector3(0,1,0),labLayout.scope.rotationY).add(new THREE.Vector3(...labLayout.scope.position));liveScope.rotation.y=labLayout.scope.rotationY;liveScope.name='Lab live scope display';scene.add(liveScope);
 function drawScope(t){
  const c=scopeCtx,w=768,h=512,left=100,right=744,top=82,bottom=450,mid=(top+bottom)/2,signal=labSignal(t);
  c.fillStyle='#071d25';c.fillRect(0,0,w,h);c.strokeStyle='#32616a77';c.lineWidth=1;
  for(let x=left;x<=right;x+=(right-left)/10){c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();}
  c.font='24px monospace';c.textAlign='right';c.textBaseline='middle';
  for(let v=-5;v<=5;v++){const y=mid-v*(bottom-top)/10;c.strokeStyle=v===0?'#729a9d':'#32616a77';c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();if(v===-5||v===0||v===5){c.fillStyle='#b8d3d1';c.fillText((v>0?'+':'')+v+' V',left-12,y);}}
  c.textAlign='left';c.fillStyle='#eec572';c.font='25px monospace';c.fillText('SINE  0.25 Hz / 10 Vpp',left,34);c.textAlign='right';c.fillStyle='#b8d3d1';c.fillText((signal.voltage>=0?'+':'')+signal.voltage.toFixed(2)+' V',right,34);
  c.strokeStyle='#eec572';c.lineWidth=4;c.beginPath();
  for(let x=left;x<=right;x++){const phase=(x-right)/(right-left)*Math.PI*6+signal.phase,y=mid-5*signal.wave(phase)*(bottom-top)/10;if(x===left)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
  // Fixed time cursor at the sampled (rightmost) point, with its voltage intersection.
  const cursorX=right,cursorY=mid-signal.voltage*(bottom-top)/10;
  c.fillStyle='#77d7d81c';c.fillRect(cursorX-8,top,16,bottom-top);
  c.strokeStyle='#77d7d8';c.lineWidth=2;c.setLineDash([8,6]);c.beginPath();c.moveTo(cursorX,top);c.lineTo(cursorX,bottom);c.moveTo(left,cursorY);c.lineTo(right,cursorY);c.stroke();c.setLineDash([]);
  c.fillStyle='#c9ffff';c.beginPath();c.arc(cursorX,cursorY,6,0,Math.PI*2);c.fill();scopeTex.needsUpdate=true;
 }
 const chips=new THREE.InstancedMesh(new THREE.BoxGeometry(.008,.003,.004),new THREE.MeshStandardMaterial({color:'#d5ac6e',roughness:1}),28);chips.position.copy(cncOffset);scene.add(chips);const chipDummy=new THREE.Object3D();
 const printer=addPrinterMechanics(scene);
 let animTime=0,lastTick=0,lastScope=-Infinity,lastHose=-Infinity;
 const movers=[];model.traverse(o=>{if(!o.isMesh)return;if(['cnc_motion','cnc_gantry','printer_motion'].includes(o.userData.zone)){o.castShadow=false;movers.push({o,type:o.userData.zone,base:o.position.clone()});}const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){if(m.name.includes('Translucent lithophane')){new THREE.TextureLoader().load('assets/lamp-lit.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(.46,.26);t.offset.set(.28,.50);o.visible=false;const shade=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.43,48,1,true),new THREE.MeshStandardMaterial({map:t,emissiveMap:t,color:'#fff1d6',emissive:'#ffdeae',emissiveIntensity:1.3,side:THREE.DoubleSide}));shade.position.set(-3.13,1.38,.35);scene.add(shade);});}}});
 const pool=new THREE.PointLight('#ffc078',7,3,2);pool.position.set(-3.13,1.5,.35);scene.add(pool);
 const foliage=[];
 const heartPoints=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;heartPoints.push(new THREE.Vector3(16*Math.sin(a)**3*.010,0,-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*.008));}const heart=new THREE.CatmullRomCurve3(heartPoints,true);const cutPoints=heart.getPoints(160).map(p=>new THREE.Vector3(p.x-2.57,1.394,p.z-.47));const cut=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(cutPoints),new THREE.LineBasicMaterial({color:'#5c3924'}));cut.position.copy(cncOffset);scene.add(cut);
 const hoseMaterial=new THREE.MeshStandardMaterial({color:'#a18a60',roughness:.7});const hose=new THREE.Mesh(new THREE.BufferGeometry(),hoseMaterial);hose.position.copy(cncOffset);scene.add(hose);
 const ribGeo=new THREE.TorusGeometry(.058,.0045,5,12),ribs=new THREE.InstancedMesh(ribGeo,hoseMaterial,48),ribDummy=new THREE.Object3D();ribs.name='CNC hose ribs';ribs.position.copy(cncOffset);ribs.frustumCulled=false;scene.add(ribs);
 let lastHoseX,lastHoseZ;
 function followHose(dx,dz){if(dx===lastHoseX&&dz===lastHoseZ)return;lastHoseX=dx;lastHoseZ=dz;const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.47+dx,1.91,-.45+dz),new THREE.Vector3(-2.25+dx*.55,2.48,-.75+dz*.5),new THREE.Vector3(-2.85,2.60,-1.13),new THREE.Vector3(-3.22,1.3,-1.27)]);if(!hose.geometry.attributes.position){hose.geometry.dispose();hose.geometry=new THREE.TubeGeometry(curve,40,.052,8,false);}else{const frames=curve.computeFrenetFrames(40,false),positions=hose.geometry.attributes.position,normals=hose.geometry.attributes.normal;for(let j=0;j<=40;j++){const center=curve.getPointAt(j/40),n=frames.normals[j],b=frames.binormals[j];for(let k=0;k<=8;k++){const angle=k/8*Math.PI*2,c=-Math.cos(angle),v=Math.sin(angle),nx=c*n.x+v*b.x,ny=c*n.y+v*b.y,nz=c*n.z+v*b.z,index=j*9+k;positions.setXYZ(index,center.x+.052*nx,center.y+.052*ny,center.z+.052*nz);normals.setXYZ(index,nx,ny,nz);}}positions.needsUpdate=true;normals.needsUpdate=true;hose.geometry.computeBoundingSphere();}for(let i=0;i<48;i++){const u=i/47;ribDummy.position.copy(curve.getPointAt(u));ribDummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangentAt(u));ribDummy.updateMatrix();ribs.setMatrixAt(i,ribDummy.matrix);}ribs.instanceMatrix.needsUpdate=true;}
 const printerLight=new THREE.PointLight('#a8d9e8',3,1.7,2);printerLight.position.set(3.05,2,3.2);scene.add(printerLight);
 return {get bookBusy(){return bookUI.inspect().bookBusy;},bookObject:book,setBook,openBook(){bookUI.openBook();},inspect(){return {pets:life.inspect().pets,...bookUI.inspect(),scopeMode:0,scopeVoltage:labSignal(animTime).voltage,printedLayers:printer.inspect().layers,printer:printer.inspect(),chipsVisible:chips.visible,movingParts:movers.length,axes:movers.map(({o,type,base})=>({type,x:o.position.x-base.x,z:o.position.z-base.z})),offsets:movers.map(({o,base})=>o.position.x-base.x),treeAngles:foliage.map(o=>o.rotation.z)};},update(t,motion){if(lastTick&&motion)animTime+=Math.min(100,t-lastTick);lastTick=t;room.update(animTime);if(animTime-lastScope>=50){drawScope(animTime);lastScope=animTime;}liveLab.update(animTime);const printProgress=(animTime%600000)/600000,printAngle=animTime*.00035;printer.update(animTime);bookUI.update(t,motion);foliage.forEach((o,i)=>o.rotation.z=motion?Math.sin(t*.00045+i)*.015:0);const phase=(animTime%40000)/40000;life.update(animTime,heart.getUtoTmapping(phase));const path=heart.getPointAt(phase);const dx=motion?path.x-.10:0,dz=motion?path.z-.02:0;for(const {o,type,base} of movers){o.position.copy(base);if(type==='cnc_gantry'){o.position.z+=dz;}else if(type==='cnc_motion'){o.position.x+=dx;o.position.z+=dz;o.position.y-=.04;}else{o.position.x+=Math.cos(printAngle)*.085;o.position.z+=Math.sin(printAngle)*.085-.03;o.position.y+=-.105+printProgress*.096;}}if(animTime-lastHose>=50){followHose(dx,dz);lastHose=animTime;}chips.visible=motion;for(let i=0;i<28;i++){const age=(animTime*.001+i/28*.65)%.65,a=i*2.4;chipDummy.position.set(-2.47+dx+Math.cos(a)*age*.22,Math.max(1.394,1.40+age*.24-age*age*.9),-.45+dz+Math.sin(a)*age*.22);chipDummy.rotation.set(age*8+i,age*5,age*7);chipDummy.scale.setScalar(1-age/.65);chipDummy.updateMatrix();chips.setMatrixAt(i,chipDummy.matrix);}chips.instanceMatrix.needsUpdate=true;},book};
}
