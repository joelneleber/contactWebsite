import {batchStatic} from './cockpit-static.js';
import {improveDog} from './cockpit-fixes.js';
import * as THREE from 'three';
import labLayout from './lab-layout.json';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/libs/meshopt_decoder.module.js';
export function addLife(scene){
 const pets=[];let petsReady;(window.__roomPending||=[]).push(new Promise(r=>petsReady=r));new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/cockpit/workshop-pets-fast.glb?v=11',g=>{window.__stage?.('pets-start');g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(o.name==='Dog_cushion'){o.position.x=labLayout.dog.x;o.position.z=labLayout.dog.z;}if(/^(Orange_tabby_sleeping|Brown_tabby_resting|Shepherd_sleeping)$/.test(o.name)){pets.push(o);if(o.name==='Orange_tabby_sleeping')alignCatEyes(o);if(o.name==='Shepherd_sleeping'){o.position.x=labLayout.dog.x;o.position.z=labLayout.dog.z;try{improveDog(o);}catch(e){console.warn("dog",e);window.__dogError=String(e.stack||e);}}}});scene.add(g.scene);addSnores();pets.forEach(p=>batchStatic(p,[...p.children]));window.__stage?.('pets-done');petsReady();},undefined,()=>petsReady());
 // Align the eyelids with the head-to-nose direction, not the body's front axis.
 function alignCatEyes(cat){const head=cat.children.find(o=>o.name.endsWith('Resting_head')),nose=cat.children.find(o=>o.name.endsWith('_nose'));if(!head||!nose)return;const direction=nose.position.clone().sub(head.position);const turn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.atan2(direction.x,direction.z));for(const eye of cat.children.filter(o=>o.name.includes('closed_eye'))){eye.position.sub(head.position).applyQuaternion(turn).add(head.position);eye.quaternion.premultiply(turn);
 cat.updateWorldMatrix(true,true);const center=head.getWorldPosition(new THREE.Vector3()),outward=eye.getWorldPosition(new THREE.Vector3()).sub(center).normalize(),ray=new THREE.Raycaster(center.clone().addScaledVector(outward,.4),outward.clone().negate());const hit=ray.intersectObject(head,false)[0];if(hit)eye.position.copy(cat.worldToLocal(hit.point.addScaledVector(outward,.0015)));
 }}
 // Little "z z Z" drifting up from each sleeping pet's head.
 const snores=[];let zTex=null;
 function zTexture(){if(zTex)return zTex;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='italic 400 92px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#0008';x.shadowBlur=6;x.fillStyle='#f3e6c8';x.fillText('z',64,60);zTex=new THREE.CanvasTexture(c);zTex.colorSpace=THREE.SRGBColorSpace;return zTex;}
 function addSnores(){
  scene.updateMatrixWorld(true);
  pets.forEach((pet,i)=>{let head=null;pet.traverse(o=>{if(!head&&/(^|_)(Resting_head|Head)$/.test(o.name))head=o;});const origin=new THREE.Vector3();(head||pet).getWorldPosition(origin);origin.y+=pet.name==='Shepherd_sleeping'?.17:.15;const anchor=pet.worldToLocal(origin.clone());
   // Drift away from the room's back wall a little so the letters stay in view.
   for(let k=0;k<2;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:zTexture(),transparent:true,depthWrite:false,opacity:0}));s.renderOrder=5;s.position.copy(origin);scene.add(s);const dog=pet.name==='Shepherd_sleeping';snores.push({s,origin,pet,anchor,offset:k/2+i*.17,size:dog?1.1:1,rise:dog?.16:.2});}
  });
 }
 function updateSnores(t){
  const still=document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  snores.forEach(z=>{z.pet.updateWorldMatrix(true,false);z.origin.copy(z.anchor).applyMatrix4(z.pet.matrixWorld);const p=still?.35+z.offset*.6:((t/5200)+z.offset)%1;const ease=Math.sin(p*Math.PI);
   z.s.position.set(z.origin.x+Math.sin(p*Math.PI*2+z.offset*6)*.02+p*.05,z.origin.y+p*z.rise,z.origin.z+p*.1);
   const size=(.055+p*.06)*z.size;z.s.scale.set(size,size,size);z.s.material.opacity=still?.4:Math.min(1,ease*1.4)*.6;z.s.material.rotation=-.25+Math.sin(p*3)*.15;});
 }
 return {inspect:()=>({pets:pets.length}),update(t){pets.forEach((o,i)=>{o.scale.y=1+Math.sin(t*.0012+i)*.012;});updateSnores(t);}};
}
