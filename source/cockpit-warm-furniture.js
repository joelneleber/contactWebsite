import * as THREE from 'three';

// Furniture stays out of workstation hit targets and the camera paths.
export function addWarmFurniture(scene) {
 const fabric=new THREE.MeshStandardMaterial({color:'#b8aa8e',roughness:1});
 const bronze=new THREE.MeshStandardMaterial({color:'#66553b',metalness:.65,roughness:.42});
 const rubber=new THREE.MeshStandardMaterial({color:'#343a30',roughness:.85});
 const chair=new THREE.Group();chair.name='Warm upholstered task chair';chair.position.set(0,0,.72);scene.add(chair);
 function cushion(x,y,z,w,h,depth,seat=false){
  const shape=new THREE.Shape(),r=.10,left=-w/2,right=w/2,bottom=-h/2,top=h/2;
  shape.moveTo(left+r,bottom);shape.lineTo(right-r,bottom);shape.quadraticCurveTo(right,bottom,right,bottom+r);shape.lineTo(right,top-r);shape.quadraticCurveTo(right,top,right-r,top);shape.lineTo(left+r,top);shape.quadraticCurveTo(left,top,left,top-r);shape.lineTo(left,bottom+r);shape.quadraticCurveTo(left,bottom,left+r,bottom);
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1,curveSegments:8});geo.translate(0,0,-depth/2);
  const m=new THREE.Mesh(geo,fabric);m.position.set(x,y,z);if(seat)m.rotation.x=-Math.PI/2;m.castShadow=true;m.receiveShadow=true;chair.add(m);
 }
 function rod(a,b,r,mat=bronze){a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b),12),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());m.castShadow=true;chair.add(m);}
 cushion(0,.55,0,.64,.58,.065,true);cushion(0,.97,.23,.62,.65,.065);
 rod([0,.13,0],[0,.52,0],.035);rod([-.23,.5,.22],[-.23,.91,.25],.018);rod([.23,.5,.22],[.23,.91,.25],.018);
 for(const x of [-.37,.37]){rod([x,.55,.08],[x,.77,.08],.014);rod([x,.77,-.19],[x,.77,.20],.024);}
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*.34,z=Math.sin(a)*.34;rod([0,.18,0],[x,.09,z],.018);const wheel=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),rubber);wheel.position.set(x,.06,z);wheel.scale.z=.6;chair.add(wheel);}
 // Recessed strips run beneath the two aligned shelves.
 const diffuser=new THREE.MeshStandardMaterial({color:'#fff1d4',emissive:'#ffe0aa',emissiveIntensity:1.2});
 for(const side of [-1,1]){const strip=new THREE.Mesh(new THREE.BoxGeometry(.025,.012,4.55),diffuser);strip.position.set(side*3.13,2.911,-.05);scene.add(strip);const light=new THREE.PointLight('#ffe5bc',1.4,3.5,2);light.position.set(side*3.12,2.80,-.5);scene.add(light);}
}
