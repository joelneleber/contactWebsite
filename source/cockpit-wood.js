import * as THREE from 'three';
let grain;
export function walnutMaterial(){
 if(!grain){grain=new THREE.TextureLoader().load('assets/cockpit/walnut-grain.jpg');grain.colorSpace=THREE.SRGBColorSpace;grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.anisotropy=4;}
 return new THREE.MeshStandardMaterial({map:grain,color:'#a58a70',roughness:.76});
}
