import assert from 'node:assert/strict';
import * as THREE from 'three';
import {batchStatic} from '../cockpit-static.js';
const root=new THREE.Group();root.position.set(3,2,-1);root.rotation.y=.4;root.scale.set(2,1.2,.8);
const material=new THREE.MeshStandardMaterial();const transparent=new THREE.MeshBasicMaterial({transparent:true,opacity:.5});
for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(),material);mesh.position.set(i,.2*i,-i);mesh.rotation.z=.2*i;mesh.castShadow=true;root.add(mesh);}
const glass=new THREE.Mesh(new THREE.BoxGeometry(),transparent);root.add(glass);
const before=new THREE.Box3().setFromObject(root,true);batchStatic(root,[...root.children]);const after=new THREE.Box3().setFromObject(root,true);
assert.equal(root.children.length,2);assert.ok(root.children.includes(glass));assert.ok(before.min.distanceTo(after.min)<1e-6);assert.ok(before.max.distanceTo(after.max)<1e-6);assert.equal(root.getObjectByName('Static furnishings').geometry.attributes.position.count,108);assert.equal(root.getObjectByName('Static furnishings').castShadow,true);
console.log('Static batching preserves world bounds, triangles, shadows and transparent objects.');

const quantizedRoot=new THREE.Group();
for(let i=0;i<2;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Int16BufferAttribute([-16384,0,0,16384,0,0,0,16384,0],3,true));const m=new THREE.Mesh(g,material);m.position.set(4+i,2,3);quantizedRoot.add(m);}
const qBefore=new THREE.Box3().setFromObject(quantizedRoot,true);batchStatic(quantizedRoot,[...quantizedRoot.children]);const qAfter=new THREE.Box3().setFromObject(quantizedRoot,true);
assert.ok(qBefore.min.distanceTo(qAfter.min)<1e-6);assert.ok(qBefore.max.distanceTo(qAfter.max)<1e-6);assert.ok(quantizedRoot.children[0].geometry.attributes.position.array instanceof Float32Array);
console.log('Normalized integer pet geometry retains translated coordinates when batched.');
