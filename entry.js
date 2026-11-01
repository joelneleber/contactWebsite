// No static 3D imports. The main route opens the room; data-saving visitors get a choice first.
const entry=document.getElementById('entry'),button=document.getElementById('enter-workshop');
let starting=false;
async function startWorkshop(){
 if(starting)return;starting=true;button.disabled=true;
 document.body.classList.add('workshop-started');entry.hidden=true;
 try{
  const css=document.createElement('link');css.rel='stylesheet';css.href='cockpit.css?v=23';document.head.append(css);
  await new Promise((resolve,reject)=>{css.onload=resolve;css.onerror=reject;});
  for(const src of ['projects.js','portfolio-stories.js?v=8','deep-case-data.js?v=20'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});
  await import('./cockpit.bundle.js?v=23');
 }catch(error){document.body.classList.remove('workshop-started');entry.hidden=false;document.getElementById('entry-note').textContent='The workshop couldn’t load. You can still browse every project in the lightweight site.';starting=false;button.disabled=false;console.warn('Workshop unavailable',error);}
}
button.addEventListener('click',startWorkshop);
const connection=navigator.connection;
if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType))document.getElementById('entry-note').textContent='On a slow connection? Browse projects to keep downloads small. Photos are optional.';
const explicit3D=new URLSearchParams(location.search).get('mode')==='3d';
const saveData=connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType);
if(explicit3D||(document.body.dataset.defaultView==='workshop'&&!saveData))startWorkshop();

// Loading screen life: rotating workshop captions and a hand-drawn "line boil".
(()=>{const loading=document.getElementById('loading'),quip=document.getElementById('load-quip'),noise=document.getElementById('sketch-noise');if(!loading||!quip)return;
 const lines=['Sweeping up the sawdust…','Tiptoeing past the sleeping cats…','Warming up the soldering iron…','Zeroing the CNC…','Untangling the extension cords…','Finding you a stool…','Topping up the coffee…','Dusting off the projects…'];
 const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;let i=0,seed=1;
 const active=()=>document.body.classList.contains('workshop-started')&&!loading.hidden;
 const words=setInterval(()=>{if(!document.body.contains(loading)||(document.body.classList.contains('workshop-started')&&loading.hidden)){clearInterval(words);clearInterval(boil);return;}if(!active())return;quip.classList.add('fading');setTimeout(()=>{i=(i+1)%lines.length;quip.textContent=lines[i];quip.classList.remove('fading');},350);},2600);
 const boil=calm||!noise?0:setInterval(()=>{if(active())noise.setAttribute('seed',String(seed=seed%4+1));},140);
})();
