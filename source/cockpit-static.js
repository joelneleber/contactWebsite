import * as THREE from 'three';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
// Only explicitly static furnishings enter here. Keep material, shadow and transparency
// semantics intact; moving equipment, pets, book pages and hit targets stay separate.
export function batchStatic(scene,roots){
 scene.updateWorldMatrix(true,true);
 const inverse=scene.matrixWorld.clone().invert();
 const batches=new Map();
 for(const root of roots)root.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||!o.visible||Array.isArray(o.material)||o.material.transparent||o.material.isShaderMaterial)return;
  const key=[o.material.uuid,o.castShadow,o.receiveShadow,o.renderOrder,Object.keys(o.geometry.attributes).sort().join(',')].join(':');
  const list=batches.get(key)||[];list.push(o);batches.set(key,list);
 });
 for(const objects of batches.values()){
  if(objects.length<2)continue;
  const geometries=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();// Compressed GLTF attributes may be normalized integers. Matrix baking must
  // use floats or transformed coordinates are written back into a bounded integer range.
  for(const name of ['position','normal','tangent']){const a=g.getAttribute(name);if(!a||a.array instanceof Float32Array)continue;const values=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)values[i*a.itemSize+c]=a.getComponent(i,c);g.setAttribute(name,new THREE.Float32BufferAttribute(values,a.itemSize));}
  g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));return g;});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
  geometry.computeBoundingSphere();geometry.computeBoundingBox();
  const first=objects[0],mesh=new THREE.Mesh(geometry,first.material);mesh.name='Static furnishings';mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.renderOrder=first.renderOrder;
  objects.forEach(o=>o.removeFromParent());scene.add(mesh);
 }
}
