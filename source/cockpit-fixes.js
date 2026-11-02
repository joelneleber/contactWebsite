import * as THREE from 'three';
import {mergeVertices} from './vendor/utils/BufferGeometryUtils.js';

const smoothstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

// The trailing pothos used to hang straight through the high shelves and their trays.
// Bend everything below the pot rim outward so the vines spill over the shelf edge instead.
export function drapePlants(model){
 const side={wood__Pothos_leaf_green:-1,lab__Pothos_leaf_green:1,room__Plant_stem:0};
 model.updateMatrixWorld(true);
 model.traverse(o=>{
  if(!o.isMesh||!(o.name in side))return;
  // Quantized glTF positions clamp to their original range, so move them into plain floats first.
  const q=o.geometry.attributes.position,plain=new Float32Array(q.count*3);
  for(let i=0;i<q.count;i++){plain[i*3]=q.getX(i);plain[i*3+1]=q.getY(i);plain[i*3+2]=q.getZ(i);}
  o.geometry.setAttribute('position',new THREE.BufferAttribute(plain,3));
  const pos=o.geometry.attributes.position,inv=o.matrixWorld.clone().invert(),v=new THREE.Vector3();
  const world=[];for(let i=0;i<pos.count;i++)world.push(v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld).clone());
  // Leaves move as rigid pieces (judged at their centre) so they keep their shape; thin stems bend per vertex.
  const leaves=side[o.name]!==0,group=leaves?islands(o.geometry):null,centre=new Map();
  if(leaves){world.forEach((p,i)=>{const c=centre.get(group[i])||{p:new THREE.Vector3(),n:0};c.p.add(p);c.n++;centre.set(group[i],c);});centre.forEach(c=>c.p.divideScalar(c.n));}
  for(let i=0;i<pos.count;i++){
   const p=world[i],ref=leaves?centre.get(group[i]).p:p;
   if(ref.z>-.55||ref.y>3.32)continue;
   const s=side[o.name]||Math.sign(ref.x);
   // Left shelf edge is at x≈-2.875; right tray inner edge at x≈3.0.
   const push=s<0?.42:-.24,w=1-smoothstep(3.02,3.3,ref.y);
   v.copy(p);v.x+=push*w;v.y-=.03*w;
   v.applyMatrix4(inv);pos.setXYZ(i,v.x,v.y,v.z);
  }
  pos.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
 });
}

// Connected pieces of a mesh (vertices sharing a triangle or a position) → piece id per vertex.
function islands(geometry){
 const pos=geometry.attributes.position,n=pos.count,parent=new Int32Array(n).map((_,i)=>i);
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[a]=b;};
 const idx=geometry.index;if(idx)for(let t=0;t<idx.count;t+=3){join(idx.getX(t),idx.getX(t+1));join(idx.getX(t),idx.getX(t+2));}
 else for(let t=0;t<n;t+=3){join(t,t+1);join(t,t+2);}
 const seen=new Map();for(let i=0;i<n;i++){const k=`${Math.round(pos.getX(i)*1e4)},${Math.round(pos.getY(i)*1e4)},${Math.round(pos.getZ(i)*1e4)}`;if(seen.has(k))join(i,seen.get(k));else seen.set(k,i);}
 return Array.from({length:n},(_,i)=>find(i));
}

function colored(geometry,fn){
 const pos=geometry.attributes.position,c=new Float32Array(pos.count*3),v=new THREE.Vector3(),col=new THREE.Color();
 for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);fn(v,col);c.set([col.r,col.g,col.b],i*3);}
 geometry.setAttribute('color',new THREE.BufferAttribute(c,3));return geometry;
}
function smooth(mesh){
 // Copy out of the compressed/interleaved glTF buffers so vertices can be welded.
 const src=mesh.geometry,g=new THREE.BufferGeometry();
 for(const name of ['position','color']){const a=src.attributes[name];if(!a)continue;const n=a.itemSize,out=new Float32Array(a.count*n);for(let i=0;i<a.count;i++){out[i*n]=a.getX(i);out[i*n+1]=a.getY(i);if(n>2)out[i*n+2]=a.getZ(i);if(n>3)out[i*n+3]=a.getW(i);}g.setAttribute(name,new THREE.BufferAttribute(out,n));}
 if(src.index)g.setIndex(Array.from(src.index.array));
 const merged=mergeVertices(g,1e-3);merged.computeVertexNormals();mesh.geometry=merged;
}

// A softer, more readable German shepherd: rounded head, tapered muzzle, folded ears,
// a full bushy tail, and smooth shading instead of faceted blocks.
export function improveDog(dog){
 const get=n=>dog.getObjectByName(n);
 const fur=get('Body')?.material;if(!fur)return;
 const tan=new THREE.Color(0x9a7a50),saddle=new THREE.Color(0x2d241b),mask=new THREE.Color(0x221b15),cream=new THREE.Color(0xb8996a);
 for(const n of ['Body','Chest','Haunch','Foreleg','Hind_leg','Paw'])if(get(n))smooth(get(n));
 // Repaint the coat with soft gradients; the baked colours stair-stepped on the low-poly body.
 const coat={Body:[-.12,.28,.97],Haunch:[-.1,.45,.92],Chest:[.25,.8,.55]};
 for(const n of ['Body','Haunch','Chest','Foreleg','Hind_leg','Paw']){const m=get(n);if(!m)continue;const [a,b,amt]=coat[n]||[2,3,0];
  colored(m.geometry,(v,c)=>{c.copy(tan).lerp(saddle,smoothstep(a,b,v.y)*amt).lerp(cream,smoothstep(-.3,-.9,v.y)*.35);});}

 const head=get('Head');
 if(head){
  // Unit sphere, slightly longer than tall, with a gentle stop where the muzzle begins.
  const g=new THREE.SphereGeometry(1,40,28);g.scale(1,.72,.78);
  colored(g,(v,c)=>{c.copy(tan).lerp(saddle,smoothstep(.15,.75,v.y)*.85).lerp(cream,smoothstep(-.2,-.75,v.y)*.5);});
  head.geometry=g;head.scale.setScalar(.155);head.position.set(-.53,.175,.1);
 }
 const muzzle=get('Muzzle');
 if(muzzle){
  const g=new THREE.SphereGeometry(1,32,20);g.scale(1,.42,.5);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),k=1+Math.min(0,x)*.32;p.setY(i,p.getY(i)*k);p.setZ(i,p.getZ(i)*k);}
  g.computeVertexNormals();
  colored(g,(v,c)=>{c.copy(mask).lerp(tan,smoothstep(-.1,.8,v.x)*.6);});
  muzzle.geometry=g;muzzle.scale.setScalar(.15);muzzle.position.set(-.68,.125,.115);
 }
 const nose=get('Dog_nose');if(nose){nose.position.set(-.825,.135,.115);nose.scale.setScalar(.032);smooth(nose);}
 const eye=get('Dog_closed_eye');if(eye){eye.position.set(-.6,.215,.205);eye.rotation.z=-.15;}
 // Folded-back triangular ears.
 const earGeo=colored((()=>{const g=new THREE.ConeGeometry(.55,1.25,18,1);g.scale(1,1,.38);g.translate(0,.62,0);return g;})(),(v,c)=>{c.copy(saddle).lerp(mask,smoothstep(.2,1.2,v.y));});
 for(const [n,z,tilt,lean] of [['Dog_ear',.17,-1.0,.35],['Dog_far_ear',.03,-1.1,-.35]]){const e=get(n);if(!e)continue;e.geometry=earGeo;e.scale.setScalar(.1);e.position.set(-.5,.28,z);e.rotation.set(lean,0,tilt);}
 // Bushy tail curling around the hind leg toward the front paws.
 const tail=get('Dog_tail');
 if(tail){
  const curve=new THREE.CatmullRomCurve3([[.52,.26,-.08],[.68,.2,.1],[.6,.14,.3],[.36,.11,.4],[.06,.1,.39]].map(p=>new THREE.Vector3(...p)));
  const seg=48,rad=14,g=new THREE.TubeGeometry(curve,seg,1,rad,false),p=g.attributes.position,c=new THREE.Vector3(),v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const t=i/seg;curve.getPointAt(t,c);const r=.075*(1-.5*t)*(.8+.2*Math.sin(Math.PI*Math.min(1,t*1.3)))*(t>.93?Math.sqrt(Math.max(0,1-((t-.93)/.07)**2)):1);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.fromBufferAttribute(p,k).sub(c).multiplyScalar(r).add(c);p.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();
  colored(g,(v,col)=>{col.copy(saddle).lerp(tan,smoothstep(.12,.06,v.y)*.55);});
  tail.geometry=g;tail.position.set(0,0,0);tail.scale.set(1,1,1);tail.rotation.set(0,0,0);
  tail.material=fur;
 }
 for(const n of ['Body','Haunch'])get(n)?.geometry.computeBoundingSphere();
}
