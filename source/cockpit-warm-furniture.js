import * as THREE from 'three';
import labLayout from './lab-layout.json';

// Furniture stays out of workstation hit targets and the camera paths.
export function addWarmFurniture(scene) {
 const fabric=new THREE.MeshStandardMaterial({color:'#b8aa8e',roughness:1});
 const bronze=new THREE.MeshStandardMaterial({color:'#66553b',metalness:.65,roughness:.42});
 const rubber=new THREE.MeshStandardMaterial({color:'#343a30',roughness:.85});
 const chair=new THREE.Group();chair.name='Warm upholstered task chair';chair.position.fromArray(labLayout.chair.position);chair.rotation.y=labLayout.chair.rotationY;scene.add(chair);
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
 // A matched nearfield pair flanks the main monitor on isolation pads.
 const speakerCase=new THREE.MeshStandardMaterial({color:'#30352f',roughness:.72});
 const cone=new THREE.MeshStandardMaterial({color:'#1b211f',roughness:.9});
 const ring=new THREE.MeshStandardMaterial({color:'#77715d',metalness:.4,roughness:.6});
 for(const side of [-1,1]){
  const speaker=new THREE.Group();speaker.name=side<0?'Studio speaker left':'Studio speaker right';speaker.position.set(side*1.38,1.413,-1.50);speaker.rotation.y=-side*.12;scene.add(speaker);
  const pad=new THREE.Mesh(new THREE.BoxGeometry(.34,.025,.31),rubber);pad.position.y=.0125;speaker.add(pad);
  const cabinet=new THREE.Mesh(new THREE.BoxGeometry(.32,.48,.28),speakerCase);cabinet.position.y=.265;cabinet.castShadow=true;speaker.add(cabinet);
  for(const [y,r] of [[.20,.095],[.405,.037]]){
   const surround=new THREE.Mesh(new THREE.TorusGeometry(r,.009,8,32),ring);surround.position.set(0,y,.145);speaker.add(surround);
   const driver=new THREE.Mesh(new THREE.ConeGeometry(r,.025,32),cone);driver.rotation.x=Math.PI/2;driver.position.set(0,y,.144);speaker.add(driver);
   const cap=new THREE.Mesh(new THREE.SphereGeometry(r*.29,16,8),cone);cap.scale.z=.35;cap.position.set(0,y,.16);speaker.add(cap);
  }
  const led=new THREE.Mesh(new THREE.SphereGeometry(.005,8,6),new THREE.MeshBasicMaterial({color:'#b2c195'}));led.position.set(.11,.08,.146);speaker.add(led);
 }
 // Recessed strips run beneath the two aligned shelves.
 const diffuser=new THREE.MeshStandardMaterial({color:'#fff1d4',emissive:'#ffe0aa',emissiveIntensity:1.2});
 for(const side of [-1,1]){const strip=new THREE.Mesh(new THREE.BoxGeometry(.025,.012,side<0?3.65:3.75),diffuser);strip.position.set(side*3.13,3.011,side<0?-.40:-.10);scene.add(strip);const light=new THREE.PointLight('#ffe5bc',.16,3.5,2);light.position.set(side*3.12,2.90,-.5);scene.add(light);}
}
