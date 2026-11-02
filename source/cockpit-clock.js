import * as THREE from 'three';
export function addNixieClock(scene){
 const group=new THREE.Group();group.name='Nixie desk clock';group.position.set(0,1.14,-1.43);group.scale.setScalar(.9);scene.add(group);
 const base=new THREE.Mesh(new THREE.BoxGeometry(.65,.035,.18),new THREE.MeshStandardMaterial({color:'#66462b',roughness:.7}));base.position.y=.0175;base.castShadow=true;group.add(base);
 const glass=new THREE.MeshBasicMaterial({color:'#e9bb87',transparent:true,opacity:.14,depthWrite:false});
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const digits=new THREE.Mesh(new THREE.PlaneGeometry(.60,.18),new THREE.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false,depthWrite:false}));digits.position.set(0,.125,.057);group.add(digits);
 const digitX=[64,176,320,432,576,688];
 const tubeGeo=new THREE.CapsuleGeometry(.034,.10,3,12);for(let i=0;i<6;i++){const tube=new THREE.Mesh(tubeGeo,glass);tube.position.set((digitX[i]/768-.5)*.60,.12,0);group.add(tube);}
 let last='';return {update(){const now=new Date();const time=[now.getHours(),now.getMinutes(),now.getSeconds()].map(v=>String(v).padStart(2,'0')).join('');if(time===last)return;last=time;ctx.clearRect(0,0,768,256);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='150px monospace';ctx.shadowColor='#ff6a18';ctx.shadowBlur=22;ctx.fillStyle='#ffad57';for(let i=0;i<6;i++)ctx.fillText(time[i],digitX[i],133);ctx.font='90px monospace';ctx.fillText(':',248,128);ctx.fillText(':',504,128);tex.needsUpdate=true;}};
}
