import * as THREE from 'three';
import {batchStatic} from './cockpit-static.js';
import {labSignal} from './cockpit-lab-signal.js';
export function addLiveLab(scene){
 const group=new THREE.Group();group.name='Connected lab power and meter leads';scene.add(group);
 const red=new THREE.MeshStandardMaterial({color:'#853c2d',roughness:.75}),black=new THREE.MeshStandardMaterial({color:'#242d29',roughness:.8}),metal=new THREE.MeshStandardMaterial({color:'#a6a08a',metalness:.65,roughness:.4});
 function cable(points,material,r=.005){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,36,r,6,false),material);group.add(mesh);return mesh;}
 function socket(x,y,z,material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,.04,12),material);mesh.rotation.z=Math.PI/2;mesh.position.set(x,y,z);group.add(mesh);}
 // Leads leave the sockets horizontally, fall outside the drawers and meet board terminals.
 for(let i=0;i<2;i++){const material=i?black:red,z=i*.2,pad=.99+i*.06;
  socket(2.875,1.605,z,material);
  cable([[2.86,1.605,z],[2.76,1.59,z],[2.65,1.28,z+.06],[2.65,1.12,.40+i*.06],[2.66,1.12,.82+i*.06],[2.62,1.18,pad],[2.55,1.202,pad]],material);
  cable([[2.55,1.202,pad],[2.51,1.202,pad]],metal,.004);
 }
 // The multimeter has two seated input plugs and a pair of test leads beside the power pair.
 for(let i=0;i<2;i++){const material=i?black:red,z=.64+i*.08,pad=.98+i*.07;
  socket(2.992,1.59,z,black);socket(2.967,1.59,z,material);
  cable([[2.95,1.59,z],[2.80,1.55,z],[2.71,1.28,z],[2.72,1.12,1.20+i*.07],[2.62,1.12,1.30+i*.06],[2.51,1.17,1.24],[2.46,1.202,pad]],material,.004);
  cable([[2.46,1.202,pad],[2.44,1.202,pad]],metal,.003);
 }
 batchStatic(group,[...group.children]);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 for(const [row,x,y,z,w,h] of [[0,2.890,1.845,.1,.316,.064],[1,2.890,1.745,.1,.316,.064],[2,2.987,1.762,.68,.145,.052]]){const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(2-row+uv.getY(i))/3);const mesh=new THREE.Mesh(g,material);mesh.name='Live lab numeric display '+row;mesh.position.set(x,y,z);mesh.rotation.y=-Math.PI/2;scene.add(mesh);}
 let last=-1;return {update(t){const tick=Math.floor(t/160);if(tick===last)return;last=tick;const s=labSignal(t);[s.voltage.toFixed(2)+' V',s.current.toFixed(3)+' A',s.meter.toFixed(2)].forEach((value,i)=>{ctx.fillStyle=i===2?'#176578':'#121c1c';ctx.fillRect(0,i*64,512,64);ctx.globalAlpha=s.brightness;ctx.fillStyle=i===2?'#d4e6dd':'#e4eadb';ctx.font='46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,256,i*64+34);ctx.globalAlpha=1;});texture.needsUpdate=true;},inspect(t){return labSignal(t);}};
}
