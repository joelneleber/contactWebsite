import * as THREE from 'three';
import {batchStatic} from './cockpit-static.js';
// Different growth habits, sized for their actual shelf/counter footprint.
export function addPlants(scene){
 const materials=new Map();const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.78,side:THREE.DoubleSide}));return materials.get(c);};
 const greens=['#274b32','#446442','#64814b'].map(material),stem=material('#526340');
 function mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(.55,.35,.4,.8,0,1);shape.bezierCurveTo(-.4,.8,-.55,.35,0,0);
 const leaf=new THREE.ShapeGeometry(shape,8);const p=leaf.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getY(i)*Math.PI)*.13);leaf.computeVertexNormals();
 function foliage(g,x,y,z,w,h,a,tilt,i){const o=mesh(leaf,greens[i%3],g,x,y,z);o.scale.set(w,h,h);o.rotation.set(tilt,a,0);return o;}
 function curve(g,pts,r=.008){mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),12,r,5,false),stem,g);}
 function pot(name,x,y,z,r,h,color){const g=new THREE.Group();g.name='Plant '+name;g.position.set(x,y,z);scene.add(g);const m=material(color);mesh(new THREE.CylinderGeometry(r,r*.8,h,24),m,g,0,h/2);const rim=mesh(new THREE.TorusGeometry(r,.012,6,24),m,g,0,h);rim.rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(r*.92,r*.92,.008,24),material('#30291f'),g,0,h-.01);return {g,h};}
 // Upright snake plant: narrow, folded blades in a pale stoneware cylinder.
 {const {g,h}=pot('snake plant',-3.40,1.075,3.95,.15,.25,'#c5bea6');for(let i=0;i<9;i++){const a=i*2.4;foliage(g,Math.cos(a)*.07,h,Math.sin(a)*.07,.105,.38+(i%3)*.10,a,-.1-(i%3)*.08,i);}}
 // Rubber plant: a woody trunk and a few broad, dark, glossy leaves.
 {const {g,h}=pot('rubber plant',2.96,1.075,-2.64,.17,.27,'#a66746');curve(g,[[0,h,0],[.025,h+.25,0],[-.02,h+.6,.02]],.012);for(let i=0;i<7;i++){const a=i*2.4,y=h+.12+i*.065;curve(g,[[0,y,0],[Math.cos(a)*.10,y+.04,Math.sin(a)*.10]]);foliage(g,Math.cos(a)*.10,y+.04,Math.sin(a)*.10,.23,.26,a,-1.05,i);}}
 // Fern: spreading pinnate fronds in a low charcoal bowl.
 {const {g,h}=pot('fern',-3.33,3.085,-1.25,.17,.16,'#51584b');for(let i=0;i<9;i++){const a=i*2.4;const pts=[];for(let j=0;j<=7;j++){const t=j/7;pts.push([Math.cos(a)*t*.30,h+Math.sin(t*Math.PI*.85)*.25,Math.sin(a)*t*.30]);}curve(g,pts,.003);for(let j=1;j<7;j++){const [x,y,z]=pts[j];for(const s of [-1,1]){const o=foliage(g,x,y,z,.05,.10*(1-j/10),a+s*.8,-.9,j);o.rotation.z=s*.65;}}}}
 // Pothos drapes over the shelf edge instead of repeating an upright bouquet.
 {const {g,h}=pot('trailing pothos',3.32,3.085,-1.4,.15,.19,'#b6aa8f');for(let i=0;i<4;i++){const pts=[];for(let j=0;j<8;j++){const t=j/7;pts.push([-.08-t*.23,h+.10*Math.sin(t*6)-t*t*.45,(i-1.5)*.07+Math.sin(t*5+i)*.055]);}curve(g,pts,.004);for(let j=1;j<8;j++){const [x,y,z]=pts[j];foliage(g,x,y,z,.12,.13,j*2.4,-1.2,j+i);}}}
 // Compact succulent: thick rosette leaves in a muted clay bowl.
 {const {g,h}=pot('succulent',-3.38,3.085,.65,.12,.12,'#b47c61');for(let i=0;i<17;i++){const a=i*2.4;foliage(g,0,h,0,.09,.13+(i%3)*.035,a,-.6-(i%3)*.35,i);}}
 {const {g,h}=pot('small palm',3.38,3.085,1.50,.10,.15,'#747c68');for(let i=0;i<7;i++){const a=i*2.4;foliage(g,0,h,0,.065,.29,a,-.3-(i%3)*.25,i);}}
 batchStatic(scene,scene.children.filter(o=>o.name.startsWith('Plant ')));
}
