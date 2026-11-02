import * as THREE from 'three';
export function addPrinterMechanics(scene){
 const root=new THREE.Group();root.name='Coupled printer XY gantry and filament feed';scene.add(root);
 const steel=new THREE.MeshStandardMaterial({color:'#909c98',metalness:.65,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:'#293431',roughness:.65}),ivory=new THREE.MeshStandardMaterial({color:'#dfd9be',roughness:.8});
 function box(x,y,z,a,b,c,mat=dark){const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),mat);o.position.set(x,y,z);root.add(o);return o;}
 const gantry=new THREE.Group();root.add(gantry);gantry.name='Moving X bridge';
 for(const z of [-.026,.026]){const rail=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.46,10),steel);rail.rotation.z=Math.PI/2;rail.position.set(3.05,0,z);gantry.add(rail);}
 const yRails=[];for(const x of [2.82,3.28]){const rail=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.48,10),steel);rail.rotation.x=Math.PI/2;rail.position.set(x,1.8,3.1);root.add(rail);yRails.push(rail);const block=new THREE.Mesh(new THREE.BoxGeometry(.045,.045,.07),dark);block.position.x=x;gantry.add(block);}
 const carriage=box(3.05,1.8,3.1,.13,.045,.09);
 const layers=new THREE.InstancedMesh(new THREE.TorusGeometry(.085,.0015,5,48),ivory,100),dummy=new THREE.Object3D();layers.name='Uniform deposited filament';root.add(layers);
 for(let i=0;i<100;i++){dummy.position.set(3.05,1.4015+i*.003,3.1);dummy.rotation.x=Math.PI/2;dummy.updateMatrix();layers.setMatrixAt(i,dummy.matrix);}layers.instanceMatrix.needsUpdate=true;
 const core=new THREE.Mesh(new THREE.CylinderGeometry(.0835,.0835,1,48),ivory);root.add(core);
 // A supported spool above the enclosure, with the feed leaving the winding tangentially.
 box(3.17,2.18,3.32,.22,.07,.17);box(3.17,2.27,3.32,.025,.20,.035);
 for(const x of [3.08,3.23]){const flange=new THREE.Mesh(new THREE.CylinderGeometry(.135,.135,.016,28),dark);flange.rotation.z=Math.PI/2;flange.position.set(x,2.34,3.32);root.add(flange);}
 const winding=new THREE.Mesh(new THREE.CylinderGeometry(.112,.112,.135,28),ivory);winding.rotation.z=Math.PI/2;winding.position.set(3.155,2.34,3.32);root.add(winding);
 const tube=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:'#e2dfcb',roughness:.5}));tube.name='Filament guide to toolhead';tube.frustumCulled=false;root.add(tube);let last=-1;
 return {layers,update(t){const progress=(t%600000)/600000,angle=t*.00035,dx=Math.cos(angle)*.085,dz=Math.sin(angle)*.085,height=1.8+progress*.096;
  gantry.position.set(0,height,3.1+dz);yRails.forEach(o=>o.position.y=height);carriage.position.set(3.05+dx,height,3.1+dz);
  layers.count=67+Math.floor(progress*32);core.scale.y=layers.count*.003;core.position.set(3.05,1.4+core.scale.y/2,3.1);
  const tick=Math.floor(t/80);if(tick===last)return;last=tick;
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(3.155,2.45,3.32),new THREE.Vector3(2.98,2.52,3.10),new THREE.Vector3(3.05+dx*.5,2.2,3.1+dz*.5),new THREE.Vector3(3.05+dx,height,3.1+dz)]);
  const next=new THREE.TubeGeometry(curve,24,.006,5,false);if(!tube.geometry.attributes.position){tube.geometry.dispose();tube.geometry=next;}else{tube.geometry.attributes.position.array.set(next.attributes.position.array);tube.geometry.attributes.normal.array.set(next.attributes.normal.array);tube.geometry.attributes.position.needsUpdate=true;tube.geometry.attributes.normal.needsUpdate=true;next.dispose();}
 },inspect(){return {layers:layers.count,gantry:gantry.position.toArray(),carriage:carriage.position.toArray(),radius:.085};}};
}
