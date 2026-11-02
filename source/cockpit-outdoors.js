import * as THREE from 'three';
export function addOutdoors(scene){
 const breeze={value:0};
 // Only the angular band visible through the rear and side windows is uploaded.
 // Two native-resolution crops replace the full 8192x4096 GPU texture.
 for(const [name,start,end,bottom] of [['rear',.30,.65,.72],['side',.65,.95,.78]]){
  let done;const ready=new Promise(resolve=>{done=resolve;});(window.__roomPending ||= []).push(ready);
  const map=new THREE.TextureLoader().load(`assets/cockpit/forest-window-${name}.webp`,done,undefined,done);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=2;
  const geometry=new THREE.SphereGeometry(45,40,18,start*Math.PI*2,(end-start)*Math.PI*2,.28*Math.PI,(bottom-.28)*Math.PI);
  const material=new THREE.MeshBasicMaterial({map,side:THREE.BackSide,color:'#dce4de'});
  material.onBeforeCompile=shader=>{shader.uniforms.breeze=breeze;shader.fragmentShader='uniform float breeze;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','texture2D( map, vMapUv + vec2(sin(breeze*.65 + vMapUv.y*13.)*.0012 * smoothstep(.45,.85,vMapUv.y) * sin(vMapUv.x*3.14159),0.) )') + '\ndiffuseColor.rgb=mix(pow(max(diffuseColor.rgb,vec3(0.)),vec3(.76)),vec3(.18,.25,.23),.12)*' + (name==='rear'?'0.62':'0.82') + ';');};
  material.customProgramCacheKey=()=>`forest-rain-${name}`;
  const sky=new THREE.Mesh(geometry,material);sky.name=`Window forest ${name}`;sky.rotation.y=1.6;scene.add(sky);
 }
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
 // Visible rain is one GPU-driven batch outside the walls, not per-drop objects.
 const count=850,positions=new Float32Array(count*6),ends=new Float32Array(count*2);
 for(let i=0;i<count;i++){const side=i>=500,seed=n=>{const v=Math.sin(i*127.1+n*311.7)*43758.5453;return v-Math.floor(v);};const x=side?-4.0-seed(1)*3.0:-5+seed(1)*10,z=side?-.5+seed(2)*6:-3.5-seed(2)*4,y=seed(3)*5;for(let j=0;j<2;j++){const k=i*6+j*3;positions.set([x,y,z],k);ends[i*2+j]=j;}}
 const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));rainGeo.setAttribute('end',new THREE.BufferAttribute(ends,1));
 const rainMat=new THREE.ShaderMaterial({uniforms:{rainTime:breeze},transparent:true,depthWrite:false,
 vertexShader:'uniform float rainTime;attribute float end;varying float fade;void main(){vec3 p=position;p.y=mod(position.y-rainTime*(2.4+fract(position.x*.71)) ,5.)+.25-end*.20;p.x+=end*.035;fade=.24+fract(position.z*2.31)*.25;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
 fragmentShader:'varying float fade;void main(){gl_FragColor=vec4(.75,.85,.88,fade);}' });
 const rain=new THREE.LineSegments(rainGeo,rainMat);rain.name='Forest rainfall';rain.frustumCulled=false;scene.add(rain);
 // Time comes from the room's motion clock, so reduced motion / Motion off freezes the scene.
 return {update(t){breeze.value=t*.001;for(let i=0;i<leaves.length;i++){const phase=(t/42000+i/7)%1;const leaf=leaves[i];leaf.position.set(-2.7+i*.77+Math.sin(phase*Math.PI*2+i)*.24,3.85-phase*2.45,-4.4-(i%3)*.28);leaf.rotation.set(Math.sin(t*.0007+i)*.45,Math.sin(t*.0005+i)*.8,phase*3+i);}}};
}
