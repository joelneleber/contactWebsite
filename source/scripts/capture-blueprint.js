// Offline authoring only. Bake visible model contours; visitors only draw the packed strokes.
import * as THREE from '../vendor/three.module.js';
export function captureBlueprint({scene,renderer},pose){
 const camera=new THREE.PerspectiveCamera(pose.fov||52,1.6,.05,30);
 camera.position.fromArray(pose.p);camera.lookAt(...pose.t);if(pose.offX||pose.offY)camera.setViewOffset(1440,900,pose.offX||0,pose.offY||0,1440,900);camera.updateMatrixWorld();scene.updateMatrixWorld(true);
 const width=1280,height=800,target=new THREE.WebGLRenderTarget(width,height),pixels=new Uint8Array(width*height*4);
 const depth=new THREE.ShaderMaterial({vertexShader:'varying float d; void main(){vec4 p=modelViewMatrix*vec4(position,1.);d=-p.z/30.;gl_Position=projectionMatrix*p;}',fragmentShader:'varying float d; void main(){vec2 e=fract(d*vec2(1.,255.));e.x-=e.y/255.;gl_FragColor=vec4(e,0.,1.);}',side:THREE.DoubleSide});
 const hidden=[];scene.traverseVisible(o=>{if(o.isMesh&&(Array.isArray(o.material)||o.material.transparent||o.material.isShaderMaterial||o.isInstancedMesh)){hidden.push(o);}});hidden.forEach(o=>o.visible=false);
 const previous={override:scene.overrideMaterial,target:renderer.getRenderTarget(),background:scene.background,clear:renderer.getClearColor(new THREE.Color()),alpha:renderer.getClearAlpha(),shadow:renderer.shadowMap.autoUpdate};
 scene.overrideMaterial=depth;scene.background=null;renderer.setClearColor(0xffffff,1);renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,width,height,pixels);
 renderer.setRenderTarget(previous.target);renderer.setClearColor(previous.clear,previous.alpha);scene.overrideMaterial=previous.override;scene.background=previous.background;renderer.shadowMap.autoUpdate=previous.shadow;
 const visible=v=>{const p=v.clone().project(camera);if(Math.abs(p.x)>1.04||Math.abs(p.y)>1.04||p.z>1)return false;const x=Math.max(0,Math.min(width-1,Math.round((p.x+1)*width/2))),y=Math.max(0,Math.min(height-1,Math.round((p.y+1)*height/2)));const distance=-v.clone().applyMatrix4(camera.matrixWorldInverse).z;let nearest=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=(Math.max(0,Math.min(height-1,y+dy))*width+Math.max(0,Math.min(width-1,x+dx)))*4;nearest=Math.max(nearest,(pixels[i]/255+pixels[i+1]/65025)*30);}return distance<nearest+.035;};
 const lines=[],seen=new Set();
 scene.traverseVisible(o=>{if(!o.isMesh)return;const edges=new THREE.EdgesGeometry(o.geometry,16),edgePoints=Array.from(edges.attributes.position.array),pos=o.geometry.attributes.position,index=o.geometry.index,adjacent=new Map(),eye=camera.position.clone().applyMatrix4(o.matrixWorld.clone().invert());
 // Curved objects need their silhouette, even where neighboring faces meet smoothly.
 const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),normal=new THREE.Vector3();
 const vertexKey=v=>v.toArray().map(n=>Math.round(n*10000)).join(',');
 for(let k=0;k<(index?index.count:pos.count);k+=3){A.fromBufferAttribute(pos,index?index.getX(k):k);B.fromBufferAttribute(pos,index?index.getX(k+1):k+1);C.fromBufferAttribute(pos,index?index.getX(k+2):k+2);normal.crossVectors(B.clone().sub(A),C.clone().sub(A));const facing=normal.dot(eye.clone().sub(A))>=0;for(const [u,v] of [[A,B],[B,C],[C,A]]){const key=[vertexKey(u),vertexKey(v)].sort().join('|');let item=adjacent.get(key);if(!item){item={a:u.toArray(),b:v.toArray(),front:false,back:false};adjacent.set(key,item);}item[facing?'front':'back']=true;}}
 for(const e of adjacent.values())if(e.front&&e.back)edgePoints.push(...e.a,...e.b);
 const p=new THREE.Float32BufferAttribute(edgePoints,3);
 for(let i=0;i<p.count;i+=2){const a=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld),b=new THREE.Vector3().fromBufferAttribute(p,i+1).applyMatrix4(o.matrixWorld);if(a.distanceTo(b)<.005)continue;
 const pa=a.clone().project(camera),pb=b.clone().project(camera);const length=Math.hypot((pa.x-pb.x)*width/2,(pa.y-pb.y)*height/2);if(length<.8||length>width*2)continue;
 if(!visible(a.clone().lerp(b,.5))||(!visible(a.clone().lerp(b,.15))&&!visible(a.clone().lerp(b,.85))))continue;
 const q=[a,b].map(v=>v.toArray().map(x=>Math.round(x*100)));const key=q.map(v=>v.join(',')).sort().join('|');if(seen.has(key))continue;seen.add(key);lines.push({q,length,depth:a.distanceTo(camera.position)+b.distanceTo(camera.position)});
 }edges.dispose();});hidden.forEach(o=>o.visible=true);target.dispose();depth.dispose();
 const chosen=lines.sort((a,b)=>b.length-a.length).slice(0,8000).sort((a,b)=>b.depth-a.depth),bytes=[];
 const put=n=>{let v=n<0?-n*2-1:n*2;while(v>127){bytes.push((v&127)|128);v=Math.floor(v/128);}bytes.push(v);};
 for(const {q} of chosen){put(2);q[0].forEach(put);q[1].forEach((n,i)=>put(n-q[0][i]));}
 return {strokes:chosen.length,packed:btoa(String.fromCharCode(...bytes))};
}
