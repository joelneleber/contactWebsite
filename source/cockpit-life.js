import {improveDog} from './cockpit-fixes.js';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';
export function addLife(scene){
 const pets=[];let petsReady;(window.__roomPending||=[]).push(new Promise(r=>petsReady=r));new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/cockpit/workshop-pets-fast.glb?v=11',g=>{window.__stage?.('pets-start');g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(o.name==='Dog_cushion'){o.position.x=.65;o.position.z=-1.75;}if(/^(Orange_tabby_sleeping|Brown_tabby_resting|Shepherd_sleeping)$/.test(o.name)){pets.push(o);if(o.name==='Shepherd_sleeping'){o.position.x=.65;o.position.z=-1.75;try{improveDog(o);}catch(e){console.warn("dog",e);window.__dogError=String(e.stack||e);}}}});scene.add(g.scene);addSnores();window.__stage?.('pets-done');petsReady();},undefined,()=>petsReady());
 // Little "z z Z" drifting up from each sleeping pet's head.
 const snores=[];let zTex=null;
 function zTexture(){if(zTex)return zTex;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='italic 400 92px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#0008';x.shadowBlur=6;x.fillStyle='#f3e6c8';x.fillText('z',64,60);zTex=new THREE.CanvasTexture(c);zTex.colorSpace=THREE.SRGBColorSpace;return zTex;}
 function addSnores(){
  scene.updateMatrixWorld(true);
  pets.forEach((pet,i)=>{let head=null;pet.traverse(o=>{if(!head&&/(^|_)(Resting_head|Head)$/.test(o.name))head=o;});const origin=new THREE.Vector3();(head||pet).getWorldPosition(origin);origin.y+=pet.name==='Shepherd_sleeping'?.17:.15;
   // Drift away from the room's back wall a little so the letters stay in view.
   for(let k=0;k<2;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:zTexture(),transparent:true,depthWrite:false,opacity:0}));s.renderOrder=5;s.position.copy(origin);scene.add(s);const dog=pet.name==='Shepherd_sleeping';snores.push({s,origin,offset:k/2+i*.17,size:dog?1.1:1,rise:dog?.16:.2});}
  });
 }
 function updateSnores(t){
  const still=document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  snores.forEach(z=>{const p=still?.35+z.offset*.6:((t/5200)+z.offset)%1;const ease=Math.sin(p*Math.PI);
   z.s.position.set(z.origin.x+Math.sin(p*Math.PI*2+z.offset*6)*.02+p*.05,z.origin.y+p*z.rise,z.origin.z+p*.1);
   const size=(.055+p*.06)*z.size;z.s.scale.set(size,size,size);z.s.material.opacity=still?.4:Math.min(1,ease*1.4)*.6;z.s.material.rotation=-.25+Math.sin(p*3)*.15;});
 }
 function monitor(x,angle){const c=document.createElement('canvas');c.width=512;c.height=1152;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(.47,1.08),new THREE.MeshBasicMaterial({map:tex}));m.position.set(x+Math.sin(angle)*.056,1.98,-1.57+Math.cos(angle)*.056);m.rotation.y=angle;if(x<0)scene.add(m);return {c,ctx:c.getContext('2d'),tex};}
 const left=monitor(-1.38,.16);
 function heart(a){return [16*Math.sin(a)**3,-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))];}
 let lastDraw=-1,displayTime=0,lastTime=0,frozenPhase=0;
 return {inspect:()=>({pets:pets.length}),update(t,phase){const focused=document.body.dataset.view==='computer';if(!focused){displayTime=t;frozenPhase=phase;}phase=frozenPhase;pets.forEach((o,i)=>{o.scale.y=1+Math.sin(t*.0012+i)*.012;});updateSnores(t);if(focused&&lastDraw===displayTime)return;if(!focused&&t-lastDraw<140&&lastDraw>=0)return;lastDraw=displayTime;t=displayTime;
 const d=left.ctx;d.fillStyle='#101f24';d.fillRect(0,0,512,1152);d.fillStyle='#ddc49b';d.font='25px monospace';d.fillText('CNC / HEART STUDY',26,48);d.fillStyle='#77918c';d.font='18px monospace';d.fillText('XY TOOLPATH · TOP VIEW',26,91);d.fillStyle='#423522';d.fillRect(35,190,442,490);d.strokeStyle='#896d4333';for(let y=200;y<680;y+=22){d.beginPath();d.moveTo(35,y);d.lineTo(477,y+10);d.stroke();}function trace(end,color){d.strokeStyle=color;d.lineWidth=4;d.beginPath();for(let i=0;i<=end;i++){const p=heart(i/200*Math.PI*2);if(i)d.lineTo(256+p[0]*11,430+p[1]*11);else d.moveTo(256+p[0]*11,430+p[1]*11);}d.stroke();}trace(200,'#837559');trace(Math.floor(phase*200),'#b69e73');const p=heart(phase*Math.PI*2),x=256+p[0]*11,y=430+p[1]*11;d.strokeStyle='#64837c66';d.lineWidth=2;d.beginPath();d.moveTo(35,y);d.lineTo(477,y);d.moveTo(x,190);d.lineTo(x,680);d.stroke();d.fillStyle='#f1dfb1';d.beginPath();d.arc(x,y,4,0,Math.PI*2);d.fill();d.font='21px monospace';d.fillText('PASS 01 / OUTLINE',35,755);d.fillStyle='#9db4ac';d.font='19px monospace';d.fillText('X '+(p[0]*10).toFixed(1)+' mm',35,810);d.fillText('Y '+(-p[1]*8).toFixed(1)+' mm',35,850);d.fillText('FEED   600 mm/min',35,915);d.fillText('SPINDLE    12,000',35,955);d.fillStyle='#2b4240';d.fillRect(35,1020,442,7);d.fillStyle='#d3b47b';d.fillRect(35,1020,442*phase,7);left.tex.needsUpdate=true;
 }};
}
