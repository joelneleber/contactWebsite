import * as THREE from 'three';
// A real, inexpensive desk prop, animated by the room's existing render loop.
export function contactCard(scene,camera,motion,draw){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=600;const c=canvas.getContext('2d');
 c.fillStyle='#eee2c5';c.fillRect(0,0,1024,600);c.fillStyle='#293a30';c.font='italic 72px Georgia';c.fillText('jn',65,110);c.font='56px Georgia';c.fillText('Joey Neleber',65,270);c.font='27px sans-serif';c.fillText('Software engineer · Tinkerer · Maker',65,330);c.fillText('joelneleber@gmail.com',65,470);c.fillStyle='#9b7950';c.fillRect(65,380,894,2);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const card=new THREE.Group();card.name='Contact_business_card';
 const body=new THREE.Mesh(new THREE.BoxGeometry(.36,.211,.003),new THREE.MeshStandardMaterial({color:'#e3d6b7',roughness:.85}));
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.36,.211),new THREE.MeshBasicMaterial({map:texture}));face.position.z=.002;card.add(body,face);card.position.set(1.26,1.085,-.62);card.rotation.set(-Math.PI/2,0,-.12);scene.add(card);
 const home=card.position.clone(),rotation=card.quaternion.clone();let flight=null,opener=null,closing=false;
 const dialog=document.createElement('dialog');dialog.className='contact-sheet';dialog.setAttribute('aria-label','Contact Joey');dialog.innerHTML='<header><button type="button">← Back to workshop</button><span>LET’S KEEP IN TOUCH</span></header><iframe title="Joey’s contact card and links"></iframe>';document.body.append(dialog);
 const frame=dialog.querySelector('iframe'),button=dialog.querySelector('button');
 function animateSheet(out=false){return motion()?dialog.animate(out?[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(24px) scale(.96)'}]:[{opacity:0,transform:'translateY(32px) scale(.92)'},{opacity:1,transform:'none'}],{duration:out?180:360,easing:'cubic-bezier(.2,.75,.2,1)'}).finished.catch(()=>{}):Promise.resolve();}
 function show(){card.visible=false;dialog.showModal();animateSheet();button.focus();}
 async function close(){if(closing||!dialog.open)return;closing=true;await animateSheet(true);dialog.close();card.visible=true;card.position.copy(home);card.quaternion.copy(rotation);closing=false;draw();opener?.focus({preventScroll:true});}
 button.onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data==='close-workshop-contact')close();});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('/contact.html'))return;e.preventDefault();if(flight||dialog.open)return;opener=a;if(!frame.src)frame.src='contact.html?embedded=1';
  // The software surface is already full-screen: expand directly there.
  if(!motion()||document.body.classList.contains('desktop-full')){show();return;}
  const target=new THREE.Vector3(0,0,-.72).applyQuaternion(camera.quaternion).add(camera.position);flight={start:performance.now(),target,rotation:camera.quaternion.clone()};draw();
 });
 return {get busy(){return !!flight;},get active(){return !!flight||dialog.open;},update(t){if(!flight)return;const k=Math.min(1,(t-flight.start)/740),e=k*k*(3-2*k);card.position.lerpVectors(home,flight.target,e);card.position.y+=Math.sin(k*Math.PI)*.16;card.quaternion.slerpQuaternions(rotation,flight.rotation,e);if(k===1){flight=null;show();}}};
}
