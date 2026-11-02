export const views={
 sign:{p:[-.3,2.65,5.0],t:[-3.53,2.35,4.45],label:'WELCOME SIGN / design, layers & tiny details'},
 books:{p:[1.1,3.1,1.8],t:[3.38,3.28,.25],label:'BOOKS & IDEAS'},
 scope:{p:[.7,2.05,.15],t:[3.05,1.78,-.72],label:'SIGNALS / electronics projects'},
 cnc:{p:[-.8,2.3,.35],t:[-2.72,1.55,-1.3],label:'CNC / digital fabrication'},
 book:{p:[-2.10,3.05,2.78],t:[-2.65,1.2,2.78],label:'WOODSHOP PROJECTS / turn a page'},
 room:{p:[0,2.6,6.6],t:[0,1.45,-1.2],label:'A room for all the things I make.'},
 computer:{p:[0,2.02,.0],t:[0,2.02,-1.548],label:'SOFTWARE PROJECTS / open a program to explore it'},
 wood:{p:[0,2.6,6.6],t:[-2.7,1.5,1.9],label:'WOODSHOP / CNC, craft, and things made by hand'},
 lab:{p:[0,2.6,6.6],t:[2.7,1.5,1.9],label:'ELECTRONICS LAB / from board to bench'},
 printer:{p:[1.1,2.35,4.1],t:[3.05,1.65,3.1],label:'3D PRINTER / ideas into objects'},
 lamp:{p:[-1.7,1.95,1.7],t:[-3.13,1.4,.35],label:'THE LAMP / a wedding gift'}
};
export const phoneViews={room:{p:[0,2.35,5.8],t:[0,1.55,-1.2],fov:72},wood:{p:[.9,2.55,5.4],t:[-2.7,1.4,1.2],fov:72},lab:{p:[-.9,2.55,5.4],t:[2.7,1.4,1.2],fov:72}};
export function viewPose(view,w,h){
 const aspect=w/h,mobile=w<=900,portrait=h>w,phone=mobile&&portrait,pose=views[view]||views.room,p=[...pose.p],t=[...pose.t];
 const baseFov=view==='computer'?38:43.8,widen=aspect<1.25?Math.min(2.4,1.25/aspect):Math.min(1,1.8/aspect);
 let fov=Math.min(view==='computer'?100:84,2*Math.atan(Math.tan(baseFov*Math.PI/360)*widen)*180/Math.PI);
 if(portrait&&view!=='computer')fov=phoneViews[view]?.fov||64;
 if(view==='computer')p[2]=-1.548+1.22/(2*Math.tan(fov*Math.PI/360));
 const scale=k=>p.forEach((v,i)=>p[i]=t[i]+(v-t[i])*k);
 if(!mobile&&!portrait&&['room','wood','lab'].includes(view))scale(Math.max(1,1.65/aspect));
 if(portrait&&phoneViews[view]){p.splice(0,3,...phoneViews[view].p);t.splice(0,3,...phoneViews[view].t);}
 else if(portrait&&view!=='computer')scale(({book:1.75,cnc:1.3})[view]||1.08);
 else if(mobile&&view!=='computer'){scale(view==='room'?1.3:view==='book'?1.35:['wood','lab'].includes(view)?1.12:1.4);if(view!=='room'&&view!=='book')t[1]-=.35;}
 // Bench navigation stays at the room's eye height and never retreats behind it.
 // Framing uses the existing lens, without the old distance multiplier lifting the camera.
 if(['wood','lab'].includes(view)){
  const room=viewPose('room',w,h);p.splice(0,3,...room.p);
 }
 p[0]=Math.min(3.3,Math.max(-3.25,p[0]));p[2]=Math.min(p[2],7.6);p[1]=Math.min(p[1],3.6);
 const offY=phone&&!phoneViews[view]&&!['computer','book'].includes(view)?h*.26:0,offX=!mobile&&['sign','lamp','cnc','scope','printer','books'].includes(view)?w*.23:0;
 return {p,t,fov,offX,offY};
}
// Interpolate yaw and pitch separately to preserve an upright horizon, including overhead views.
export function cameraPath(from,fromTarget,to,toTarget,k){
 const e=k*k*k*(k*(k*6-15)+10),mix=(a,b)=>a+(b-a)*e;
 const angles=(p,t)=>{const d=t.map((v,i)=>v-p[i]);return {yaw:Math.atan2(d[0],-d[2]),pitch:Math.atan2(d[1],Math.hypot(d[0],d[2])),distance:Math.hypot(...d)};};
 const a=angles(from,fromTarget),b=angles(to,toTarget),delta=Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw)),yaw=a.yaw+delta*e,pitch=mix(a.pitch,b.pitch),distance=mix(a.distance,b.distance);
 const p=from.map((v,i)=>mix(v,to[i])),d=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
 return {p,t:p.map((v,i)=>v+d[i]*distance),e};
}
