// No static 3D imports. The main route opens the room; data-saving visitors get a choice first.
const entry=document.getElementById('entry'),button=document.getElementById('enter-workshop');
let starting=false;
async function startWorkshop(){
 if(starting)return;starting=true;button.disabled=true;
 document.body.classList.add('workshop-started');entry.hidden=true;
 try{
  const css=document.createElement('link');css.rel='stylesheet';css.href='cockpit.css?v=21';document.head.append(css);
  await new Promise((resolve,reject)=>{css.onload=resolve;css.onerror=reject;});
  for(const src of ['projects.js','portfolio-stories.js?v=8','deep-case-data.js?v=20'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});
  await import('./cockpit.bundle.js?v=21');
 }catch(error){document.body.classList.remove('workshop-started');entry.hidden=false;document.getElementById('entry-note').textContent='The workshop couldn’t load. You can still browse every project in the lightweight site.';starting=false;button.disabled=false;console.warn('Workshop unavailable',error);}
}
button.addEventListener('click',startWorkshop);
const connection=navigator.connection;
if(connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType))document.getElementById('entry-note').textContent='On a slow connection? Browse projects to keep downloads small. Photos are optional.';
const explicit3D=new URLSearchParams(location.search).get('mode')==='3d';
const saveData=connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType);
if(explicit3D||(document.body.dataset.defaultView==='workshop'&&!saveData))startWorkshop();
