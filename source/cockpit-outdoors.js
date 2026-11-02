import * as THREE from 'three';
export function addOutdoors(scene){
 // Distant photographic environment wraps the entire exterior, beyond the real window opening.
 const panorama=new THREE.TextureLoader().load('assets/optimized/assets-cockpit-forest-exterior-4k.webp');panorama.colorSpace=THREE.SRGBColorSpace;
 const sky=new THREE.Mesh(new THREE.SphereGeometry(45,48,24),new THREE.MeshBasicMaterial({map:panorama,side:THREE.BackSide,color:'#e6e4d6'}));sky.rotation.y=1.6;scene.add(sky);
 const cedar=new THREE.MeshStandardMaterial({color:'#877b61',roughness:.9});
 // A small deck and garden wall create near-field depth and perspective outside the glass.
 for(let i=0;i<22;i++){const board=new THREE.Mesh(new THREE.BoxGeometry(3.1,.07,.22),cedar);board.position.set(-5.3,.3,.1+i*.235);board.receiveShadow=true;scene.add(board);}
 const stone=new THREE.MeshStandardMaterial({color:'#7c8070',roughness:1});for(let i=0;i<14;i++){const rock=new THREE.Mesh(new THREE.BoxGeometry(.34,.5,.39),stone);rock.position.set(-7.05,.5,.05+i*.39);rock.rotation.y=.025*Math.sin(i);scene.add(rock);}
 const daylight=new THREE.HemisphereLight('#e3ece8','#87775a',.65);scene.add(daylight);
}
