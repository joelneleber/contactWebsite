import {batchStatic} from './cockpit-static.js';
import {walnutMaterial} from './cockpit-wood.js';
import * as THREE from 'three';

// One coherent shell: full-height walls, closed corners and joined window casings.
export function addRoomShell(scene){
 const before=new Set(scene.children);
 const plaster=new THREE.MeshStandardMaterial({color:'#bcb09b',roughness:.95});
 const ceiling=new THREE.MeshStandardMaterial({color:'#c4bba8',roughness:.95});
 const trim=new THREE.MeshStandardMaterial({color:'#786b52',roughness:.78});
 const oak=walnutMaterial();
 const accent=new THREE.MeshStandardMaterial({color:'#747f82',roughness:.95});
 const floor=new THREE.MeshStandardMaterial({color:'#b0a08a',roughness:.9});
 function box(name,x,y,z,w,h,d,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
 // Side window opening is z=1.72..3.48 and y=1.68..3.02.
 box('Shell left rear',-3.75,1.95,-.73,.16,3.9,4.90,plaster);
 box('Shell left front',-3.75,1.95,5.84,.16,3.9,4.72,plaster);
 box('Shell left window apron',-3.75,.84,2.6,.16,1.68,1.76,plaster);
 box('Shell left window lintel',-3.75,3.46,2.6,.16,.88,1.76,plaster);
 box('Shell right',3.75,1.95,2.51,.16,3.9,11.38,accent);
 box('Shell rear apron',0,.8,-3.18,7.66,1.6,.16,accent);
 box('Shell rear lintel',0,3.735,-3.18,7.66,.33,.16,accent);
 for(const x of [-3.56,3.56])box('Shell rear pier',x,2.585,-3.18,.46,1.97,.16,accent);
 box('Shell ceiling',0,3.96,2.51,7.66,.12,11.54,ceiling);
 box('Shell front',0,1.95,8.2,7.66,3.9,.16,plaster);
 // A continuous crown and baseboard meet the corner posts without dangling ends.
 for(const x of [-3.64,3.64]){
  box('Side crown',x,3.82,2.51,.10,.16,11.18,trim);
  box('Side skirting',x,.085,2.51,.055,.17,11.18,trim);
  for(const z of [-3.07,8.08])box('Corner post',x,1.95,z,.075,3.74,.075,trim);
 }
 for(const z of [-3.07,8.08])box('End crown',0,3.82,z,7.20,.16,.10,trim);
 box('Rear skirting',0,.085,-3.075,7.20,.17,.055,trim);
 // Slim common casings around one broad rear opening.
 for(const x of [-3.36,3.36])box('Rear window jamb',x,2.585,-3.055,.085,2.055,.14,oak);
 for(const y of [1.60,3.57])box('Rear window rail',0,y,-3.055,6.805,.085,.14,oak);
 for(const x of [-1.12,1.12])box('Rear glazing mullion',x,2.585,-3.06,.045,1.885,.075,trim);
 box('Rear window sill',0,1.56,-2.98,6.95,.055,.30,oak);
 for(const z of [1.72,3.48])box('Side window jamb',-3.625,2.35,z,.15,1.42,.075,oak);
 for(const y of [1.68,3.02])box('Side window rail',-3.625,y,2.6,.15,.075,1.835,oak);
 box('Side window sill',-3.55,1.64,2.6,.30,.055,1.92,oak);
 // Recessed dark sashes, inner gaskets and jamb returns give the glass depth.
 const sash=new THREE.MeshStandardMaterial({color:'#55594e',roughness:.5,metalness:.15});
 const gasket=new THREE.MeshStandardMaterial({color:'#292f29',roughness:.85});
 for(const cx of [-2.24,0,2.24]){
  for(const x of [cx-1.09,cx+1.09]){
   box('Rear recessed sash',x,2.585,-3.16,.045,1.86,.12,sash);
   box('Rear glazing seal',x+(x<cx?.027:-.027),2.585,-3.09,.012,1.78,.014,gasket);
  }
  for(const y of [1.68,3.49])box('Rear recessed sash rail',cx,y,-3.16,2.18,.05,.12,sash);
 }
 box('Rear sill apron',0,1.49,-3.04,6.77,.08,.055,oak);
 for(const z of [1.79,3.41])box('Side recessed sash',-3.74,2.35,z,.17,1.25,.045,sash);
 for(const y of [1.75,2.95])box('Side recessed sash rail',-3.74,y,2.6,.17,.045,1.66,sash);
 box('Side sill apron',-3.63,1.57,2.6,.055,.08,1.79,oak);
 box('Side window handle base',-3.64,2.20,3.39,.035,.095,.03,sash);
 box('Side window handle',-3.60,2.24,3.34,.035,.025,.13,sash);
 // Fresnel sheen stays subtle face-on, stronger at grazing angles; no transmission blur.
 const glass=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'varying vec3 vN;varying vec3 vV;varying vec2 vUv;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);vUv=uv;gl_Position=projectionMatrix*p;}',
  fragmentShader:'varying vec3 vN;varying vec3 vV;varying vec2 vUv;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);float band=1.-smoothstep(.0,.045,abs(vUv.x*.45+vUv.y-.86));gl_FragColor=vec4(.72,.81,.78,.012+f*.09+band*.022);}' });
 for(const cx of [-2.24,0,2.24]){const pane=new THREE.Mesh(new THREE.PlaneGeometry(2.12,1.75),glass);pane.name='Rear window glass';pane.position.set(cx,2.585,-3.13);scene.add(pane);}
 const side=new THREE.Mesh(new THREE.PlaneGeometry(1.57,1.15),glass);side.name='Side window glass';side.rotation.y=Math.PI/2;side.position.set(-3.76,2.35,2.6);scene.add(side);
 // Floor extension beyond the modeled oak boards, hidden behind the camera in the main view.
 box('Front floor extension',0,-.07,6.6,7.66,.14,3.5,floor);
 batchStatic(scene,scene.children.filter(o=>!before.has(o)));
}
