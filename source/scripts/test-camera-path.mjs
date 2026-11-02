import {views,viewPose,cameraPath} from '../cockpit-views.js';
import assert from 'node:assert/strict';
for(const [w,h] of [[1440,900],[390,844],[844,390],[2560,1440]]){
 const wood=viewPose('wood',w,h),lab=viewPose('lab',w,h);
 assert.ok(Math.abs(wood.p[0]+lab.p[0])<1e-9);
 for(const i of [1,2])assert.equal(wood.p[i],lab.p[i]);
 assert.equal(wood.fov,lab.fov);assert.equal(wood.fov,viewPose('room',w,h).fov);
 for(const from of Object.keys(views))for(const to of Object.keys(views)){
  const a=viewPose(from,w,h),b=viewPose(to,w,h);
  for(let n=0;n<=20;n++){
   const pose=cameraPath(a.p,a.t,b.p,b.t,n/20);
   assert.ok([...pose.p,...pose.t].every(Number.isFinite));
   for(let i=0;i<3;i++){
    assert.ok(pose.p[i]>=Math.min(a.p[i],b.p[i])-1e-8&&pose.p[i]<=Math.max(a.p[i],b.p[i])+1e-8);
    if(n===20){assert.ok(Math.abs(pose.p[i]-b.p[i])<1e-8);assert.ok(Math.abs(pose.t[i]-b.t[i])<1e-8);}
   }
  }
 }
}
console.log('Camera routes: mirrored benches, finite samples, exact endpoints, no position overshoot.');
