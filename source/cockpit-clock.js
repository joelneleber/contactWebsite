import * as THREE from 'three';
import {walnutMaterial} from './cockpit-wood.js';
export function addNixieClock(scene){
 const group=new THREE.Group();group.name='Nixie desk clock';group.position.set(0,1.14,-1.43);group.scale.setScalar(.9);scene.add(group);
 // A low walnut plinth keeps the entire glass envelope below the monitor riser.
 const shape=new THREE.Shape(),w=.34,d=.10,r=.018;shape.moveTo(-w+r,-d);shape.lineTo(w-r,-d);shape.quadraticCurveTo(w,-d,w,-d+r);shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(-w+r,d);shape.quadraticCurveTo(-w,d,-w,d-r);shape.lineTo(-w,-d+r);shape.quadraticCurveTo(-w,-d,-w+r,-d);
 const baseGeo=new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,curveSegments:5});baseGeo.rotateX(-Math.PI/2);baseGeo.translate(0,.004,0);
 const base=new THREE.Mesh(baseGeo,walnutMaterial());base.castShadow=true;group.add(base);
 const brass=new THREE.MeshStandardMaterial({color:'#856b43',metalness:.7,roughness:.36}),dark=new THREE.MeshStandardMaterial({color:'#322d25',metalness:.55,roughness:.6});
 const digitX=[64,176,320,432,576,688],xs=digitX.map(x=>(x/768-.5)*.60),dummy=new THREE.Object3D();
 const sockets=new THREE.InstancedMesh(new THREE.CylinderGeometry(.038,.041,.020,20),brass,6);group.add(sockets);
 const electrodes=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0015,.0015,.118,5),dark,12);group.add(electrodes);
 const profile=[[.027,.052],[.033,.057],[.034,.071],[.034,.157],[.031,.178],[.022,.192],[.009,.199],[0,.201]].map(([x,y])=>new THREE.Vector2(x,y));
 const glass=new THREE.InstancedMesh(new THREE.LatheGeometry(profile,20),new THREE.MeshBasicMaterial({color:'#d8dfd7',transparent:true,opacity:.065,depthWrite:false}),6);group.add(glass);
 const highlights=[];
 xs.forEach((x,i)=>{dummy.position.set(x,.049,0);dummy.updateMatrix();sockets.setMatrixAt(i,dummy.matrix);dummy.position.set(x,0,0);dummy.updateMatrix();glass.setMatrixAt(i,dummy.matrix);for(let j=0;j<2;j++){dummy.position.set(x+(j?1:-1)*.023,.115,-.012);dummy.updateMatrix();electrodes.setMatrixAt(i*2+j,dummy.matrix);}highlights.push(x-.025,.078,.021,x-.025,.158,.021,x-.025,.158,.021,x-.019,.179,.021);});
 group.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(highlights,3)),new THREE.LineBasicMaterial({color:'#d4dfdc',transparent:true,opacity:.38})));
 // One texture for all six wire-style digits and the two neon colons; updated once a second.
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d'),tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const digits=new THREE.Mesh(new THREE.PlaneGeometry(.60,.135),new THREE.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false,depthWrite:false}));digits.position.set(0,.122,.026);group.add(digits);
 let last='';return {update(){const now=new Date(),time=[now.getHours(),now.getMinutes(),now.getSeconds()].map(v=>String(v).padStart(2,'0')).join('');if(time===last)return;last=time;ctx.clearRect(0,0,768,256);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='150px monospace';ctx.lineWidth=2.8;ctx.shadowColor='#ff681f';ctx.shadowBlur=12;ctx.strokeStyle='#ffb365';for(let i=0;i<6;i++)ctx.strokeText(time[i],digitX[i],137);ctx.fillStyle='#ffc078';for(const x of [248,504])for(const y of [115,158]){ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}tex.needsUpdate=true;}};
}
