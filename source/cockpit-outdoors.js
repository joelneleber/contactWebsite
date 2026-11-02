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
 // A few windborne leaves outside the rear glazing add depth without moving the panorama.
 const leafShape=new THREE.Shape();leafShape.moveTo(0,-.5);leafShape.quadraticCurveTo(.45,0,0,.5);leafShape.quadraticCurveTo(-.45,0,0,-.5);
 const geometry=new THREE.ShapeGeometry(leafShape,8);
 const materials=['#81905b','#aa9158','#687d4b'].map(color=>new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
 const leaves=[];
 for(let i=0;i<7;i++){const leaf=new THREE.Mesh(geometry,materials[i%3]);leaf.name='Outdoor drifting leaf '+i;leaf.scale.setScalar(.055+(i%3)*.013);scene.add(leaf);leaves.push(leaf);}
 // Time comes from the room's motion clock, so reduced motion / Motion off freezes the scene.
 return {update(t){for(let i=0;i<leaves.length;i++){const phase=(t/42000+i/7)%1;const leaf=leaves[i];leaf.position.set(-2.7+i*.77+Math.sin(phase*Math.PI*2+i)*.24,3.85-phase*2.45,-4.4-(i%3)*.28);leaf.rotation.set(Math.sin(t*.0007+i)*.45,Math.sin(t*.0005+i)*.8,phase*3+i);}}};
}
