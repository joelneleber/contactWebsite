import html2canvas from './vendor/html2canvas.esm.js';
import * as THREE from 'three';
import {addDetails} from './cockpit-details.js?v=13.1';
import { MeshoptDecoder } from './vendor/libs/meshopt_decoder.module.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projects=window.PROJECTS||[],byId=new Map(projects.map(p=>[p.id,p]));
const archivedIds=new Set(['cryptornal','gcal','flipper','ballot','discord','checkers']);
const softwareProjects=projects.filter(p=>p.group==='code'||p.id==='desktop');
const storyData=new Map((window.PORTFOLIO_STORIES||[]).map(p=>[p.id,p]));
const deepCases=new Map((window.DEEP_CASES||[]).map(p=>[p.id,p]));
// Small preview for station lists: first photo, else first screenshot, as its optimized webp.
function zoneThumb(p){const d=deepCases.get(p.id);const src=d?.thumbnail||p.photos?.[0]?.src||storyData.get(p.id)?.screenshots?.[0]?.src;if(!src)return '';return /^assets\/optimized\/|\.svg$/i.test(src)?src:'assets/optimized/'+src.replace(/\.\w+$/,'').replace(/[^a-zA-Z0-9_-]/g,'-')+'.webp';}
const featuredCopy={
 avaron:['AVARON','Training software that connects athlete sessions, body visualization, and coaching.'],
 hirebolt:['Hiregrove','A job-search workspace for explainable matches and evidence-backed applications.'],
 cockfights:['Cockfights Online','A browser-playable 3D fighting game, from movement feel to multiplayer.'],
 leads:['LeadsByMail','Turning aerial imagery into a pipeline for property visualization and printed mailers.'],
 amazon:['Amazon Business Compare','Comparing offers and tracking prices with a collaborative monitoring dashboard.']
};
const activePrograms=softwareProjects.filter(p=>!archivedIds.has(p.id));
const groupNames={all:'Programs',recycle:'Recycle Bin'};
const state={view:'room',ready:false,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,filter:'all',query:'',open:new Map(),top:10,active:null,transitioning:false,failed:false};
const colors=['#6b9382','#9e805d','#63879c','#9a726f','#7a8f64','#7d7b9a'];
const iconPaths={avaron:'M5 17l5-12 4 8 3-5 3 9M4 21h16',hirebolt:'M14 2L5 14h7l-2 8 10-13h-7z',cockfights:'M6 20V9l6-6 6 6v11M9 13h6M9 17h6',reels:'M4 5h16v14H4zM10 8l6 4-6 4z',hueprint:'M5 8h14v10H5zM8 3h8v5M8 15h8v6H8z',navier:'M3 7q4-6 9 0t9 0M3 12q4-6 9 0t9 0M3 17q4-6 9 0t9 0',maps:'M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2zM9 3v16M15 5v16',desktop:'M3 4h18v13H3zM8 21h8M12 17v4'};
Object.assign(iconPaths,{
 reelforge:'M3 4h18v16H3zM8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5',
 videos:'M3 6h18v14H3zM9 10l6 3-6 3zM6 3h12',
 umiviz:'M12 3a9 9 0 1 0 .01 0M12 7v10M7 12h10M8 8l8 8M8 16l8-8',
 leads:'M3 9l9-6 9 6v12H3zM3 9l9 6 9-6',
 zommie:'M4 20V8h16v12M2 8l3-5h14l3 5M8 20v-7h8v7',
 defuzz:'M4 10l8-7 8 7v11H4zM9 14h6v7M17 3v5',
 cs770:'M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10',
 amazon:'M3 4h3l3 12h10l3-9H7M10 20h.01M18 20h.01',
 checkers:'M4 4h16v16H4zM4 12h16M12 4v16M7 8h2M15 16h2',
 cryptornal:'M5 3h14v18H5zM8 8h8M8 12h6M8 16h8',
 discord:'M3 5h18v12H8l-5 4zM8 10h.01M16 10h.01',
 flipper:'M4 8h14l-4-4M20 16H6l4 4',
 ballot:'M3 8h18v11H3zM6 8l2-4h8l2 4M6 21h.01M18 21h.01',
 gcal:'M4 5h16v16H4zM4 10h16M8 2v6M16 2v6M8 15h3'
});
const icon=p=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(iconPaths[p.id]||'M8 5L2 12l6 7M16 5l6 7-6 7M14 3l-4 18')+'"/></svg>';
function appCover(p){
 const data=deepCases.get(p.id),images=data.coverImages||[data.thumbnail],label={avaron:'BODY-AWARE TRAINING',amazon:'PRICE INTELLIGENCE',leads:'FROM MAP TO MAILBOX',hirebolt:'A CLEARER JOB SEARCH',cockfights:'REAL BIRDS. WILD FIGHTS.'}[p.id];
 const shot=(n,cls)=>`<span class="cover-device ${cls}"><img src="${esc(images[n])}" alt="" decoding="async"></span>`;
 let content=p.id==='avaron'?shot(1,'phone phone-left')+shot(2,'phone phone-right')+shot(0,'phone phone-main'):p.id==='amazon'?shot(0,'browser-screen')+shot(1,'chart-detail'):p.id==='leads'?shot(0,'map-sheet')+'<span class="cover-arrow">↗</span>'+shot(1,'postcard'):shot(0,'browser-screen');
 return `<span class="app-cover cover-${p.id}" aria-hidden="true"><span class="cover-category">${label}</span><span class="cover-orbit"></span>${content}<span class="cover-caption">${p.id==='leads'?'Pipeline demo':p.id==='cockfights'?'Unity · playable in the browser':p.id==='avaron'?'Athletes + coaches':'App preview · demo data'}</span></span>`;
}
const initials=p=>p.name.replace(/[^A-Za-z0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
const appColor=p=>colors[projects.indexOf(p)%colors.length];
function legacyStory(p){const photos=p.photos||[];return `<article class="project-showcase" data-project="${esc(p.id)}"><header><p class="project-kind">${esc(p.group==='wood'?'FROM THE WOODSHOP':p.kind)}</p><h2>${esc(p.name)}</h2><p class="purpose">${esc(p.purpose)}</p></header>${photos.length?`<div class="showcase-gallery" data-index="0"><figure><img class="showcase-image" src="${esc(photos[0].src)}" alt="${esc(photos[0].caption)}"><figcaption>${esc(photos[0].caption)}</figcaption></figure><div class="gallery-toolbar"><button data-gallery-step="-1" aria-label="Previous photo">←</button><span class="gallery-count">1 / ${photos.length}</span><button data-gallery-step="1" aria-label="Next photo">→</button></div><div class="gallery-thumbnails">${photos.map((f,i)=>`<button data-gallery-index="${i}" aria-label="View photo ${i+1}" aria-pressed="${i===0}"><img src="${esc(f.src)}" alt="" loading="lazy"></button>`).join('')}</div></div>`:''}<section class="showcase-notes"><h3>Inside the build</h3><div class="project-tech">${String(p.tech||'').split('·').map(t=>`<span>${esc(t.trim())}</span>`).join('')}</div><p>${esc(({lamp:"I made this wedding gift with photographic lithophane panels, a wooden top and base, and a personalized engraving. It is one of my favorite projects. The photos follow the assembly, finish, and the moment the light brings the pictures to life.",mirror:"A geometric arrangement of wood and mirror, with the repeated shapes becoming the frame itself.",woodarchive:"Objects made to be used and shared: games, table numbers, and cutting boards. Browse the photos for a closer look at each build.",fabrication:"The workshop is a project of its own. These photos bring together the CNC router, furniture, storage, and vehicle woodwork."})[p.id]||p.purpose)}</p></section></article>`;}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-gallery-step],[data-gallery-index]');if(!b)return;const gallery=b.closest('.showcase-gallery'),p=byId.get(b.closest('[data-project]').dataset.project),photos=p.photos;let n=b.dataset.galleryIndex!==undefined?Number(b.dataset.galleryIndex):(Number(gallery.dataset.index)+Number(b.dataset.galleryStep)+photos.length)%photos.length;gallery.dataset.index=n;gallery.querySelector('.showcase-image').src=photos[n].src;gallery.querySelector('.showcase-image').alt=photos[n].caption;gallery.querySelector('figcaption').textContent=photos[n].caption;gallery.querySelector('.gallery-count').textContent=(n+1)+' / '+photos.length;gallery.querySelectorAll('[data-gallery-index]').forEach(x=>x.setAttribute('aria-pressed',Number(x.dataset.galleryIndex)===n));});

function deepStory(p,data){
 const picture=f=>`<figure><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`;
 return `<article class="deep-case"><header class="case-heading"><p class="project-kind">FEATURED PROJECT · CASE STUDY</p><h2>${esc(featuredCopy[p.id][0])}</h2><p class="purpose">${esc(data.summary)}</p><div class="project-tech">${String(p.tech||'').split('·').map(t=>`<span>${esc(t.trim())}</span>`).join('')}</div>${p.id==='avaron'?'<a class="project-source" href="https://avaronsports.com/" target="_blank" rel="noopener noreferrer">Visit AVARON Sports ↗</a>':''}</header>${data.screenshots?.length?`<div class="deep-images case-lead">${picture(data.screenshots[0])}</div>`:''}<nav class="case-contents" aria-label="Case study chapters">${data.chapters.map((c,i)=>`<button data-chapter="chapter-${esc(p.id)}-${esc(c.id)}"><small>${String(i+1).padStart(2,'0')}</small>${esc(c.title)}</button>`).join('')}</nav>${data.chapters.map((c,i)=>`<section class="deep-chapter" id="chapter-${esc(p.id)}-${esc(c.id)}"><p class="project-kind">${String(i+1).padStart(2,'0')} / ${data.chapters.length}</p><h3>${esc(c.title)}</h3>${c.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}<div class="deep-images">${data.screenshots.filter(f=>f.chapter===c.id).map(picture).join('')}</div></section>`).join('')}</article>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-chapter]');if(b)document.getElementById(b.dataset.chapter)?.scrollIntoView({block:'start',behavior:'instant'});});
function story(p){if(deepCases.has(p.id))return deepStory(p,deepCases.get(p.id));const data=storyData.get(p.id);if(!data||!softwareProjects.includes(p))return legacyStory(p);const shots=data.screenshots||[];const section=(title,items)=>items?.length?`<section class="case-section"><h3>${title}</h3>${items.map(x=>`<article><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></article>`).join('')}</section>`:'';return `<div class="case-heading"><p class="project-kind">${archivedIds.has(p.id)?'RECYCLE BIN · ARCHIVED PROJECT':'SOFTWARE PROJECT'}</p><h2>${esc(p.name)}</h2><p class="purpose">${esc(p.purpose)}</p><div class="project-tech">${String(p.tech).split('·').map(t=>`<span>${esc(t.trim())}</span>`).join('')}</div></div>${shots.length?`<div class="case-gallery">${shots.map(f=>`<figure><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"><figcaption>${esc(f.caption)}</figcaption></figure>`).join('')}</div>`:''}<section class="case-section"><h3>The idea</h3><p>${esc(data.aspiration)}</p></section>${data.usage?.length?`<section class="case-section"><h3>How it works</h3><ol>${data.usage.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>`:''}${section('Inside the build',data.technology)}${section('What the project explores',data.learning)}${p.url&&/^https:\/\//.test(p.url)?`<a class="project-source" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View source ↗</a>`:''}`;}
function drawPrograms(){
 const list=softwareProjects.filter(p=>(state.filter==='recycle'?archivedIds.has(p.id):!archivedIds.has(p.id))&&`${p.name} ${p.purpose} ${p.tech} ${featuredCopy[p.id]?.[0]||''}`.toLowerCase().includes(state.query.toLowerCase()));
 $('#folder-title').textContent=groupNames[state.filter];$('#program-count').textContent=`${list.length} ${list.length===1?'program':'programs'} · click to explore`;
 const featured=[...deepCases.keys()].map(id=>list.find(p=>p.id===id)).filter(Boolean);
 const regular=list.filter(p=>!deepCases.has(p.id));
 $('#program-grid').innerHTML=(featured.length?`<section class="featured-programs" aria-label="Featured projects"><div class="program-section-heading"><h3>Start here</h3><p>Five projects to spend some time with.</p></div><div class="featured-grid">${featured.map(p=>`<button class="program featured-program" data-program="${esc(p.id)}" aria-label="Open ${esc(p.name)}">${appCover(p)}<span class="featured-body"><span class="featured-title"><span class="app-icon" style="--app-color:${appColor(p)}" aria-hidden="true">${icon(p)}</span><span class="program-name">${esc(featuredCopy[p.id][0])}</span></span><span class="program-summary">${esc(featuredCopy[p.id][1])}</span><span class="program-tags">${String(p.tech||'').split('·').slice(0,3).map(t=>`<span>${esc(t.trim())}</span>`).join('')}</span><span class="case-link">Explore the case study <span>↗</span></span></span></button>`).join('')}</div></section>`:'')+(featured.length&&regular.length?'<div class="program-section-heading other-programs-heading"><h3>More from my computer</h3></div>':'')+regular.map(p=>`<button class="program" data-program="${esc(p.id)}" title="${esc(p.purpose)}" aria-label="Open ${esc(p.name)}"><span class="app-icon" style="--app-color:${appColor(p)}" aria-hidden="true">${icon(p)}</span><span class="program-info"><span class="program-name">${esc(p.name)}</span><span class="program-summary">${esc(p.purpose)}</span><span class="program-tags">${String(p.tech||'').split('·').slice(0,3).map(t=>`<span>${esc(t.trim())}</span>`).join('')}</span></span></button>`).join('')||'<p class="program-empty">No programs match that search.</p>';if(state.filter==='all'&&!state.query)$('#program-grid').insertAdjacentHTML('beforeend',`<button class="program recycle-program" id="open-recycle" aria-label="Open Recycle Bin, ${archivedIds.size} items"><span class="app-icon recycle-icon">♲<b>${archivedIds.size}</b></span><span class="program-info"><span class="program-name">Recycle Bin (${archivedIds.size})</span><span class="program-summary">Earlier experiments and projects I’ve set aside. Still here to explore.</span><span class="program-tags"><span>Archive</span></span></span></button>`);
 $$('[data-filter]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.filter===state.filter);b.querySelector('span').textContent=softwareProjects.filter(p=>b.dataset.filter==='recycle'?archivedIds.has(p.id):!archivedIds.has(p.id)).length;});
}
drawPrograms();$('#program-search').addEventListener('input',e=>{state.query=e.target.value;drawPrograms();});
$$('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;drawPrograms();});
$('#program-grid').onclick=e=>{if(e.target.closest('#open-recycle')){state.filter='recycle';drawPrograms();return;}const b=e.target.closest('[data-program]');if(b)openProgram(b.dataset.program);};
function taskbar(){
 $('#running-apps').innerHTML=[...state.open].map(([id,w])=>`<button data-running="${id}" aria-pressed="${state.active===id&&!w.hidden}" title="${esc(byId.get(id).name)}">${esc(byId.get(id).name)}</button>`).join('');
}
function focusProgram(id){const win=state.open.get(id);if(!win)return;win.hidden=false;win.style.zIndex=++state.top;state.active=id;taskbar();}
function closeProgram(id){const win=state.open.get(id);if(!win)return;win.remove();state.open.delete(id);state.active=[...state.open.keys()].at(-1)||null;if(state.active)focusProgram(state.active);else taskbar();$(`[data-program="${id}"]`)?.focus({preventScroll:true});history.replaceState(null,'','#computer');}
function openProgram(id){
 const p=byId.get(id);if(!p||!softwareProjects.includes(p))return;
 if(state.open.has(id)){focusProgram(id);return;}
 const win=document.createElement('section');win.className='app-window'+(deepCases.has(id)?' deep-case-window':'');win.dataset.app=id;win.setAttribute('role','region');win.setAttribute('aria-label',`${p.name} project window`);
 const n=state.open.size%4;const desktopWidth=$('#desktop').clientWidth;const windowWidth=Math.min(deepCases.has(id)?1100:900,desktopWidth-32);win.style.left=Math.max(12,Math.min(desktopWidth-windowWidth-12,(desktopWidth-windowWidth)/2+n*20))+'px';win.style.top=65+Math.min(n*12,30)+'px';if(deepCases.has(id))win.style.width=windowWidth+'px';
 win.innerHTML=`<div class="window-header"><strong>${esc(p.name)}</strong><button data-action="minimize" aria-label="Minimize ${esc(p.name)}">−</button><button data-action="maximize" aria-label="Maximize ${esc(p.name)}" aria-pressed="false">□</button><button data-action="close" aria-label="Close ${esc(p.name)}">×</button></div><div class="window-content">${story(p)}</div>`;
 $('#windows').append(win);state.open.set(id,win);focusProgram(id);history.replaceState(null,'',`#computer/${id}`);
 {const wc=win.querySelector('.window-content');addChapterNav(wc,wc.querySelector('article'),'.deep-chapter > h3, .case-section > h3, section.chapter > h2');}
 win.querySelector('h2').tabIndex=-1;win.querySelector('h2').focus({preventScroll:true});win.addEventListener('pointerdown',()=>focusProgram(id));
 win.addEventListener('click',e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(action==='close')closeProgram(id);if(action==='minimize'){win.hidden=true;state.active=null;taskbar();$('#show-desktop').focus();}if(action==='maximize'){win.classList.toggle('window-maximized');e.target.setAttribute('aria-pressed',win.classList.contains('window-maximized'));e.target.setAttribute('aria-label',(win.classList.contains('window-maximized')?'Restore ':'Maximize ')+p.name);}});
 const bar=win.querySelector('.window-header');let drag=null;
 bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||innerWidth<=900||win.classList.contains('window-maximized'))return;const scale=$('#computer').getBoundingClientRect().width/$('#desktop').offsetWidth;drag={x:e.clientX,y:e.clientY,left:win.offsetLeft,top:win.offsetTop,scale};bar.setPointerCapture(e.pointerId);e.preventDefault();});
 bar.addEventListener('pointermove',e=>{if(!drag)return;win.style.left=Math.max(0,Math.min($('#desktop').offsetWidth-200,drag.left+(e.clientX-drag.x)/drag.scale))+'px';win.style.top=Math.max(44,Math.min($('#desktop').offsetHeight-100,drag.top+(e.clientY-drag.y)/drag.scale))+'px';});
 bar.addEventListener('pointerup',()=>drag=null);bar.addEventListener('pointercancel',()=>drag=null);
}
$('#running-apps').onclick=e=>{const b=e.target.closest('[data-running]');if(b)focusProgram(b.dataset.running);};
$('#show-desktop').onclick=()=>{for(const win of state.open.values())win.hidden=true;state.active=null;taskbar();$('#program-search').focus();};
const readingList=['What Every BODY Is Saying','How to Win Friends and Influence People','The Tipping Point','Becoming the Best','David and Goliath','Atomic Habits','Outliers','Dracula','Calculating the Cosmos — Ian Stewart'];
const zoneConfig={
 sign:{kicker:'FROM DESIGN TO THE WEDDING DAY',title:'Welcome sign.',text:'CNC design, laser cutting, staining, micro-glueups and mounting—all in one build.',list:()=>projects.filter(p=>p.id==='sign')},
 books:{kicker:'ON THE SHELF',title:'Books & ideas.',text:'A few books I’ve read. People, habits, unexpected ideas—and the occasional vampire.',list:()=>[]},
 scope:{kicker:'SIGNALS / SENSORS / ELECTRONICS',title:'Following the signal.',text:'Hardware experiments, sensor recordings and the software that makes sense of them.',list:()=>projects.filter(p=>p.group==='electronics')},
 cnc:{kicker:'DIGITAL DESIGN / PHYSICAL OBJECTS',title:'At the CNC.',text:'Designing, cutting and building things for the real world.',list:()=>projects.filter(p=>['fabrication','sign'].includes(p.id))},
 book:{kicker:'WOODSHOP PROJECTS',title:'Made by hand.',text:'A few things from the workshop.',list:()=>[]},
 wood:{kicker:'WOODWORKING / CNC / THINGS MADE BY HAND',title:'Over at the woodshop.',text:'Wedding gifts, furniture, workshop builds, and objects made for the people around me.',list:()=>projects.filter(p=>p.group==='wood')},
 lab:{kicker:'ELECTRONICS / HARDWARE / EXPERIMENTS',title:'At the electronics bench.',text:'My electronics lab brings together boards, instruments, computers, and a lot of figuring things out.',photo:'assets/electronics-lab.jpg',photoAlt:'Joey’s real electronics lab with parts drawers, microscope and computers',list:()=>projects.filter(p=>p.group==='electronics')},
 printer:{kicker:'IDEAS INTO OBJECTS',title:'From screen to something real.',text:'A place for projects that connect digital tools with physical things.',list:()=>projects.filter(p=>['lamp','fabrication','sensor'].includes(p.id))},
 lamp:{kicker:'A WEDDING GIFT / ONE OF MY FAVORITES',title:'A gift that glows.',text:'I made this photographic lithophane lamp as a wedding gift, with a wooden top and base and personalized engraving.',list:()=>projects.filter(p=>p.id==='lamp')}
};
function zonePanel(view){
 $('#zone-panel').classList.remove('project-book','project-focus');document.body.classList.remove('reading');details?.setBook(view==='book');const bookOverlay=$('#book-ui');if(bookOverlay&&view!=='book'){bookOverlay.hidden=true;bookOverlay.classList.remove('ready');}
 if(view==='book'){showBook();return;}
 if(view==='sign'||view==='lamp'){$('#zone-panel').hidden=false;$('#zone-content').innerHTML=`<button class="project-expand" data-zone-project="${view}">⤢ Expand project</button>`+story(byId.get(view));$('#zone-panel').scrollTop=0;return;}
 const config=zoneConfig[view];if(view==='wood'||view==='lab'){$('#zone-panel').hidden=true;return;}if(!config){$('#zone-panel').hidden=true;return;}
 $('#zone-panel').hidden=false;
 $('#zone-content').innerHTML=`<p class="zone-kicker">${config.kicker}</p><h2 class="zone-title" tabindex="-1">${config.title}</h2><p class="zone-description">${config.text}</p>${config.photo?`<img class="zone-photo" src="${config.photo}" alt="${config.photoAlt}"><p class="zone-description">The real lab behind this room.</p>`:''}${view==='lamp'?'<img class="zone-photo" src="assets/lamp-lit.jpg" alt="The actual wedding lithophane lamp, illuminated">':''}${view==='books'?'<ol class="reading-list">'+readingList.map((title,i)=>`<li><span class="reading-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(title)}</strong><small>Read</small></li>`).join('')+'</ol>':''}${config.list().map(p=>`<button class="zone-card${zoneThumb(p)?' has-thumb':''}" data-zone-project="${p.id}">${zoneThumb(p)?`<img class="zone-thumb" src="${esc(zoneThumb(p))}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}<span><strong>${esc(p.name)} ↗</strong><small>${esc(p.purpose)}</small></span></button>`).join('')}`;
 $('#zone-panel').scrollTop=0;
}
// Projects open as a large reading sheet holding the full writeup from read/<id>.html (the same
// page the lightweight site uses), so the project, not the room, has the screen.
const readerCache=new Map();
function readerArticle(id){if(!readerCache.has(id))readerCache.set(id,fetch(`read/${id}.html`).then(r=>r.ok?r.text():Promise.reject(r.status)).then(t=>{const a=new DOMParser().parseFromString(t,'text/html').querySelector('main article');if(!a)throw new Error('no article');
 a.querySelectorAll('[src],[href]').forEach(el=>{for(const at of ['src','href']){const v=el.getAttribute(at);if(v?.startsWith('../'))el.setAttribute(at,v.slice(3));}});a.querySelectorAll('a[href^="http"]').forEach(l=>{l.target='_blank';l.rel='noopener';});return a.innerHTML;}).catch(err=>{readerCache.delete(id);throw err;}));return readerCache.get(id);}
function readerStyles(){if(!document.querySelector('link[data-reader]')){const l=document.createElement('link');l.rel='stylesheet';l.href='reader.css?v=2';l.dataset.reader='';document.head.append(l);}}
async function openProject(id,{fromBook=false}={}){
 readerStyles();const panel=$('#zone-panel'),content=$('#zone-content');panel.hidden=false;panel.classList.add('project-focus');document.body.classList.add('reading');
 content.innerHTML=`<div class="reader-bar"><button class="zone-back">← ${fromBook?'Back to the book':'Back to the bench'}</button><span class="reader-actions"><a class="reader-page" href="read/${esc(id)}.html" target="_blank" rel="noopener">Open as a page ↗</a><button class="reader-close" aria-label="Close the project">×</button></span></div><article class="reader" aria-busy="true"><p class="reader-loading">Opening the project…</p></article>`;panel.scrollTop=0;
 const art=content.querySelector('.reader');try{art.innerHTML=await readerArticle(id);}catch(e){art.innerHTML=story(byId.get(id));}art.removeAttribute('aria-busy');
 const project=byId.get(id),photos=project?.photos||storyData.get(id)?.screenshots||[];
 if(photos.length&&!art.querySelector('img')){const gallery=document.createElement('div');gallery.className='reader-photos';gallery.innerHTML=photos.map((f,i)=>`<figure><img src="${esc(f.src)}" alt="${esc(f.caption||project.name)}" loading="${i?'lazy':'eager'}"><figcaption>${esc(f.caption||'')}</figcaption></figure>`).join('');const intro=art.querySelector('.lede,.purpose');if(intro)intro.after(gallery);else art.prepend(gallery);}
 art.querySelectorAll('a[href$="-photos.html"]').forEach(a=>a.remove());
 addChapterNav(content,art,'section.chapter > h2, .deep-chapter > h3',{top:content.querySelector('.reader-bar')?.offsetHeight||0});
 // Chapter links scroll inside the sheet.
 art.querySelectorAll('a[href^="#"]').forEach(l=>l.addEventListener('click',ev=>{const t=art.querySelector(l.getAttribute('href'));if(t){ev.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}}));
 const h=art.querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}

// Chapter navigation for long writeups (reading sheet and computer windows): a reading-progress line,
// a sticky contents list beside the text when there's room, and a chapter bar with ‹ › and a
// drop-down list when there isn't. Short writeups (fewer than three chapters) are left alone.
function scrollParent(el){while(el&&el!==document.body){const o=getComputedStyle(el).overflowY;if(o==='auto'||o==='scroll')return el;el=el.parentElement;}return document.scrollingElement;}
function addChapterNav(host,article,selector,{top=0}={}){
 if(!host||!article||host.querySelector('.chapter-layout'))return;
 const sections=[...article.querySelectorAll(selector)].map(h=>h.closest('section')).filter((s,i,a)=>s&&a.indexOf(s)===i);if(sections.length<3)return;
 const titles=sections.map((s,i)=>s.querySelector('h2,h3')?.textContent.trim()||`Part ${i+1}`),num=i=>String(i+1).padStart(2,'0');
 const items=titles.map((t,i)=>`<li><button type="button" data-ci="${i}"><small>${num(i)}</small><span>${esc(t)}</span></button></li>`).join('');
 host.classList.add('chapter-host');host.style.setProperty('--chapter-top',top+'px');
 const progress=document.createElement('div');progress.className='chapter-progress';progress.innerHTML='<span></span>';
 const bar=document.createElement('div');bar.className='chapter-bar';bar.innerHTML=`<button type="button" class="cb-step" data-step="-1" aria-label="Previous chapter">‹</button><button type="button" class="cb-current" aria-expanded="false"><small></small><span></span><i aria-hidden="true">▾</i></button><button type="button" class="cb-step" data-step="1" aria-label="Next chapter">›</button><ol class="cb-list" hidden>${items}</ol>`;
 const layout=document.createElement('div');layout.className='chapter-layout';const toc=document.createElement('aside');toc.className='chapter-toc';toc.setAttribute('aria-label','Contents');toc.innerHTML=`<p>Contents</p><ol>${items}</ol><button type="button" class="chapter-top">↑ Back to top</button>`;
 article.before(progress,bar,layout);layout.append(toc,article);
 const scroller=scrollParent(host);let current=null;
 // Sticky offsets are measured inside the scroller's padding; cancel it so the line sits on the top edge,
 // and size the contents list to the scroller rather than the screen.
 const fit=()=>{host.style.setProperty('--chapter-pad',(parseFloat(getComputedStyle(scroller).paddingTop)||0)+'px');host.style.setProperty('--scroller-h',scroller.clientHeight+'px');};fit();new ResizeObserver(fit).observe(scroller);
 const go=i=>{const s=sections[Math.max(0,Math.min(sections.length-1,i))];const y=s.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-top-(bar.offsetHeight||0)-12;scroller.scrollTo({top:y,behavior:state.motion?'smooth':'auto'});};
 const update=()=>{const st=scroller.scrollTop,max=scroller.scrollHeight-scroller.clientHeight;progress.firstChild.style.transform=`scaleX(${max>0?Math.min(1,st/max):0})`;
  const line=scroller.getBoundingClientRect().top+top+(bar.offsetHeight||0)+40;let idx=-1;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=line)idx=i;});if(st>=max-4)idx=sections.length-1;
  if(idx!==current){current=idx;host.querySelectorAll('[data-ci]').forEach(b=>b.classList.toggle('on',+b.dataset.ci===idx));const on=toc.querySelector('[data-ci].on');if(on&&toc.scrollHeight>toc.clientHeight){const t=on.offsetTop-toc.offsetTop,b=t+on.offsetHeight;if(t<toc.scrollTop+40)toc.scrollTop=Math.max(0,t-40);else if(b>toc.scrollTop+toc.clientHeight-40)toc.scrollTop=b-toc.clientHeight+40;}const shown=Math.max(0,idx);bar.querySelector('.cb-current small').textContent=idx<0?'Contents':`${num(shown)} / ${num(sections.length-1)}`;bar.querySelector('.cb-current span').textContent=idx<0?`${sections.length} chapters`:titles[shown];bar.querySelector('[data-step="-1"]').disabled=idx<=0;bar.querySelector('[data-step="1"]').disabled=idx>=sections.length-1;}
  host.classList.toggle('chapter-scrolled',st>40);};
 let queued=0;scroller.addEventListener('scroll',()=>{if(!queued)queued=requestAnimationFrame(()=>{queued=0;update();});},{passive:true});
 host.addEventListener('click',e=>{const b=e.target.closest('[data-ci]');if(b&&host.contains(b)){e.preventDefault();e.stopPropagation();go(+b.dataset.ci);bar.querySelector('.cb-list').hidden=true;bar.querySelector('.cb-current').setAttribute('aria-expanded','false');return;}
  const st=e.target.closest('.cb-step');if(st&&host.contains(st)){go(current+ +st.dataset.step);return;}
  if(e.target.closest('.cb-current')){const l=bar.querySelector('.cb-list');l.hidden=!l.hidden;bar.querySelector('.cb-current').setAttribute('aria-expanded',String(!l.hidden));return;}
  if(e.target.closest('.chapter-top')){scroller.scrollTo({top:0,behavior:state.motion?'smooth':'auto'});}},true);
 update();}
function closeReader(){document.body.classList.remove('reading');$('#zone-panel').classList.remove('project-focus');}
$('#zone-content').onclick=e=>{const b=e.target.closest('[data-zone-project]');if(b){openProject(b.dataset.zoneProject);return;}if(e.target.closest('.reader-close')){$('.panel-close').click();return;}if(e.target.closest('.zone-back'))zonePanel(state.view);};
$('.panel-close').onclick=()=>{closeReader();if(state.view==='book'){$('#zone-panel').hidden=true;$('#zone-panel').classList.remove('project-focus');const ui=$('#book-ui');if(ui)ui.hidden=false;}else go(['sign','lamp','cnc'].includes(state.view)?'wood':['scope','printer','books'].includes(state.view)?'lab':'room');};
// Native scene coordinates are converted from Blender (X,Y,Z) to glTF (X,Z,-Y).
const views={
 sign:{p:[-.3,2.65,5.0],t:[-3.53,2.35,4.45],label:'WELCOME SIGN / design, layers & tiny details'},
 books:{p:[1.1,3.1,1.8],t:[3.38,3.28,.25],label:'BOOKS & IDEAS'},
 scope:{p:[.7,2.05,.15],t:[3.05,1.78,-.72],label:'SIGNALS / electronics projects'},
 cnc:{p:[-.8,2.3,.35],t:[-2.72,1.55,-1.3],label:'CNC / digital fabrication'},
 book:{p:[-2.10,3.05,2.78],t:[-2.65,1.2,2.78],label:'WOODSHOP PROJECTS / turn a page'},
 room:{p:[0,2.68,5.1],t:[0,1.45,-1.2],label:'A room for all the things I make.'},
 computer:{p:[0,2.02,.0],t:[0,2.02,-1.548],label:'SOFTWARE PROJECTS / open a program to explore it'},
 wood:{p:[.96,2.65,3.09],t:[-2.7,1.85,1.9],label:'WOODSHOP / CNC, craft, and things made by hand'},
 lab:{p:[-.63,2.6,2.18],t:[2.7,1.9,1.1],label:'ELECTRONICS LAB / from board to bench'},
 printer:{p:[1.1,2.35,4.1],t:[3.05,1.65,3.1],label:'3D PRINTER / ideas into objects'},
 lamp:{p:[-1.7,1.95,1.7],t:[-3.13,1.4,.35],label:'THE LAMP / a wedding gift'}
};
// GitHub Pages gzips the model, so the response's Content-Length is the compressed size while
// the loader counts uncompressed bytes. Measure against the real file size instead.
const ROOM_MODEL_BYTES=1986928;
// The loader only fades once the room has drawn itself behind it (see initRoom).
// Setup timings for diagnosing slow loads: cockpit.stages.
const stages=[];const stage=n=>stages.push([n,Math.round(performance.now())]);window.__stage=stage;
let roomWarm=false,revealing=false;const afterReveal=[];
const hideLoader=()=>{if(!roomWarm)return;window.__loadDone?window.__loadDone():($('#loading').hidden=true);};
// Wait for the browser to actually paint a frame between heavy setup steps. Waiting on a real frame
// (not a timer) keeps queued GPU work from piling up, and lets the loader animate in between.
// Background tabs don't paint, so they fall back to a short timer.
const breathe=()=>new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;setTimeout(r,0);}};if(document.hidden)setTimeout(go,30);else{requestAnimationFrame(go);setTimeout(go,4000);}});
// Resolve once frames are arriving at a normal pace again (the GPU has caught up).
const settled=async()=>{let calm=0,last=performance.now();const end=last+6000;while(calm<4&&performance.now()<end&&!document.hidden){await new Promise(r=>requestAnimationFrame(r));const now=performance.now();calm=now-last<40?calm+1:0;last=now;}};
let renderer,scene,camera,model,frame=0,transition=null,look=new THREE.Vector3(...views.room.t),baseLook=look.clone(),dragX=0,dragY=0;
let modelPromise,screenMesh,details;
const screenPosition={center:new THREE.Vector3(0,2.02,-1.548),w:2.15,h:1.22};
const mobile=()=>innerWidth<=900;
// Phones held upright get their own framing: a closer room shot, and stations lifted above the project sheet.
const viewW=()=>document.getElementById('world')?.clientWidth||innerWidth,viewH=()=>document.getElementById('world')?.clientHeight||innerHeight;
// Phone shots: the room from just behind the stool, each bench seen down its length.
const phoneViews={room:{p:[0,2.35,3.6],t:[0,1.55,-1.2],fov:72},wood:{p:[.9,2.55,5.4],t:[-2.7,1.35,1.2],fov:62},lab:{p:[-.9,2.55,5.4],t:[2.7,1.45,1.2],fov:62}};
// Any screen taller than wide (phones and vertical monitors) gets the portrait camera framing;
// only phones also get the bottom-sheet offset.
const portrait=()=>innerHeight>innerWidth;
const phone=()=>mobile()&&portrait();
function layoutDesktop(){
 const desktop=$('#desktop'),surface=$('#computer');
 const full=state.view==='computer'&&!state.transitioning;
 document.body.classList.toggle('desktop-full',full);document.body.classList.add('flat-desktop');
 surface.hidden=!full;surface.inert=!full;surface.setAttribute('aria-hidden',String(!full));
 surface.style.pointerEvents=full?'auto':'none';surface.style.cssText='inset:0!important;width:100vw!important;height:100vh!important';
 desktop.style.width=innerWidth+'px';desktop.style.height=innerHeight+'px';desktop.style.setProperty('transform','none','important');
}

function updateViewUI(){
 $$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===state.view||(['book','cnc','lamp','sign'].includes(state.view)&&b.dataset.view==='wood')||(['scope','printer','books'].includes(state.view)&&b.dataset.view==='lab')));$('#location').textContent=views[state.view].label;
 $('#hint').textContent=state.view==='computer'?'Open a program · minimize, move, or close its window':'Choose a workstation button to explore';
 $('#markers').hidden=!state.ready;document.body.dataset.view=state.view;$('#welcome').hidden=state.view!=='room';
}
function frameStation(){if(!camera)return;const baseFov=state.view==='wood'?60:state.view==='lab'?60:state.view==='computer'?38:43.8;const widen=camera.aspect<1.25?Math.min(2.4,1.25/camera.aspect):Math.min(1,1.8/camera.aspect);camera.fov=Math.min(state.view==='computer'?100:84,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(baseFov)/2)*widen))); if(portrait()&&state.view!=='computer')camera.fov=phoneViews[state.view]?.fov||64;camera.clearViewOffset();camera.userData.offY=phone()&&!phoneViews[state.view]&&!['computer','book'].includes(state.view)?innerHeight*.26:0;if(camera.userData.offY)camera.setViewOffset(innerWidth,innerHeight,0,camera.userData.offY,innerWidth,innerHeight);if(!mobile()&&zoneConfig[state.view]&&!['wood','lab','book','computer'].includes(state.view))camera.setViewOffset(innerWidth,innerHeight,innerWidth*.23,camera.userData.offY||0,innerWidth,innerHeight);camera.updateProjectionMatrix();}
function destination(view){const p=new THREE.Vector3(...views[view].p),t=new THREE.Vector3(...views[view].t);if(view==='computer'){const h=1.22;p.z=-1.548+h/(2*Math.tan(THREE.MathUtils.degToRad(camera?.fov||38)/2));}if(!mobile()&&!portrait()&&['room','wood'].includes(view)){p.sub(t).multiplyScalar(Math.max(1,1.65/(innerWidth/innerHeight))).add(t);}if(portrait()&&phoneViews[view]){p.set(...phoneViews[view].p);t.set(...phoneViews[view].t);}else if(portrait()&&view!=='computer'){p.sub(t).multiplyScalar({book:1.75,cnc:1.3}[view]||1.08).add(t);}else if(mobile()&&view!=='computer'){p.sub(t).multiplyScalar(view==='room'?1.3:view==='book'?1.35:['wood','lab'].includes(view)?1.12:1.4).add(t);if(view!=='room'&&view!=='book')t.y-=.35;}p.x=THREE.MathUtils.clamp(p.x,-3.25,3.3);p.z=Math.min(p.z,7.6);p.y=Math.min(p.y,3.6);return{p,t};}
function arrive(){
 state.transitioning=false;if(state.view==='book')details?.openBook();$('#computer').hidden=state.view!=='computer';layoutDesktop();
 if(state.view==='computer'){$('#program-search').focus({preventScroll:true});const id=location.hash.split('/')[1];if(byId.has(id))openProgram(id);}
 else if(state.view!=='room')$('#zone-content h2')?.focus({preventScroll:true});
}
function go(view,{preserveHash=false}={}){
 if(!views[view])return;if(roomWarm&&view!=='room')hideCoach();if(view==='computer'&&roomWarm)afterReveal.splice(0).forEach(f=>f());closeRoomSettings();const previousView=state.view;state.view=view;state.transitioning=state.ready;dragX=dragY=0;
 document.body.classList.remove('desktop-full');
 if(!preserveHash)history.replaceState(null,'',`#${view}`);
 const oldFov=camera?.fov,oldOffset=camera?.view?.enabled?camera.view.offsetX:0;const oldQ=camera?.quaternion.clone();frameStation();const newFov=camera?.fov,newOffset=camera?.view?.enabled?camera.view.offsetX:0;updateViewUI();zonePanel(view);layoutDesktop();
 if(!state.ready){$('#loading').hidden=view!=='room';if(view==='computer'){state.transitioning=false;$('#computer').hidden=false;layoutDesktop();}return;}
 hideLoader();const dest=destination(view);state.transitioning=true;
 const sideOf=v=>['wood','book','lamp','cnc','sign'].includes(v)?-1:['lab','scope','printer','books'].includes(v)?1:0;const crossBench=sideOf(previousView)*sideOf(view)===-1;const midCamera=camera.clone();midCamera.position.set(0,2.6,1.8);midCamera.lookAt(0,1.9,-2);
 const destinationCamera=camera.clone();destinationCamera.position.copy(dest.p);destinationCamera.lookAt(dest.t);transition={fromScreen:previousView==='computer',crossBench,midQ:midCamera.quaternion.clone(),elapsed:0,last:performance.now(),fromFov:oldFov,toFov:newFov,fromOffset:oldOffset,toOffset:newOffset,fromQ:oldQ,toQ:destinationCamera.quaternion.clone(),start:performance.now(),from:camera.position.clone(),look:look.clone(),to:dest.p,target:dest.t,arc:['wood','lab'].includes(view)?(view==='wood'?1:-1):0};
 if(state.motion){camera.fov=oldFov;camera.setViewOffset(innerWidth,innerHeight,oldOffset,camera.userData.offY||0,innerWidth,innerHeight);camera.updateProjectionMatrix();}if(!state.motion){camera.position.copy(dest.p);look.copy(dest.t);baseLook.copy(dest.t);camera.lookAt(look);transition=null;arrive();}
 requestFrame();
}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#room-settings-panel').hidden){closeRoomSettings();$('#room-settings').focus();return;}if(state.view==='computer'&&state.active&&state.open.has(state.active)&&!state.open.get(state.active).hidden){closeProgram(state.active);return;}if(state.view!=='room')go('room');});
function closeRoomSettings(){const p=$('#room-settings-panel');p.hidden=true;$('#room-settings').setAttribute('aria-expanded','false');}
$('#room-settings').onclick=()=>{const p=$('#room-settings-panel');p.hidden=!p.hidden;$('#room-settings').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)$('#motion').focus();};
document.addEventListener('click',e=>{if(!e.target.closest('#room-settings-panel,#room-settings'))closeRoomSettings();});
function updateMotion(){const b=$('#motion');b.textContent=state.motion?'Motion on':'Motion off';b.setAttribute('aria-pressed',state.motion);document.body.classList.toggle('motion-off',!state.motion);}
$('#motion').onclick=()=>{state.motion=!state.motion;updateMotion();if(!state.motion&&transition){camera.fov=transition.toFov;camera.setViewOffset(innerWidth,innerHeight,transition.toOffset,camera.userData.offY||0,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.position.copy(transition.to);look.copy(transition.target);baseLook.copy(look);camera.lookAt(look);transition=null;arrive();}requestFrame();};
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{state.motion=!e.matches;updateMotion();});updateMotion();
function projectMarkers(){
 if(!camera)return;const root=$('#markers');root.style.opacity=state.transitioning?'0':'1';root.style.pointerEvents=state.transitioning?'none':'';
 let svg=$('#marker-leaders');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='marker-leaders';root.prepend(svg);}svg.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);let lines='';const placed=[];
 const offsets={computer:[0,-25],wood:[-25,-45],lab:[75,-65],sign:[0,75],book:[0,65],lamp:[-75,-85],cnc:[20,-70],scope:[-55,-75],printer:[85,-115],books:[0,-45]};
 $$('#markers [data-point]').forEach(b=>{const p=new THREE.Vector3(...b.dataset.point.split(',').map(Number)).project(camera);b.hidden=!(b.dataset.context||'room').split(' ').includes(state.view)||p.z>1||Math.abs(p.x)>(mobile()?4:1.15);if(b.hidden)return;
 const ax=(p.x+1)*innerWidth/2,ay=(1-p.y)*innerHeight/2,[dx,dy]=offsets[b.dataset.view]||[0,-65],w=b.offsetWidth,h=b.offsetHeight;
 let x=THREE.MathUtils.clamp(ax+dx,w/2+18,innerWidth-w/2-18),y=THREE.MathUtils.clamp(ay+dy,105,innerHeight-125);
 for(let i=0;i<8;i++){const hit=placed.find(r=>Math.abs(x-r.x)<(w+r.w)/2+14&&Math.abs(y-r.y)<(h+r.h)/2+12);if(!hit)break;y=THREE.MathUtils.clamp(hit.y-(h+hit.h)/2-16,100,innerHeight-125);}
 placed.push({x,y,w,h});b.style.left=x+'px';b.style.top=y+'px';const endY=y+(ay>y?h/2:-h/2);lines+=`<path d="M${ax},${ay} L${x},${endY}"/><circle cx="${ax}" cy="${ay}" r="4"/>`;
 });svg.innerHTML=lines;
}

// First-visit guide: shown once after the room appears; "?" in the bar brings it back.
const coach=$('#coach');let coachSeen=false;try{coachSeen=localStorage.getItem('jn-coach-seen')==='1';}catch(e){}
// The guide grows out of the "?" in the bar (the gear on phones) and shrinks back into it.
function coachAnchor(){const b=[$('#room-help'),$('#room-settings')].find(x=>x&&x.offsetParent&&getComputedStyle(x).display!=='none');if(!b)return;const r=b.getBoundingClientRect(),c=coach.getBoundingClientRect(),x=r.left+r.width/2-c.left;coach.style.setProperty('--ox',x+'px');coach.style.setProperty('--oy',(r.top+r.height/2-c.top)+'px');coach.style.setProperty('--tail',Math.max(24,Math.min(c.width-24,x))+'px');const gap=r.bottom<c.top?c.top-r.bottom:r.top-c.bottom;coach.classList.toggle('tail-up',r.bottom<c.top);coach.classList.toggle('no-tail',gap>140);}
function showCoach(){if(!coach)return;coach.hidden=false;coach.classList.remove('leaving','enter');document.body.classList.add('coaching');coachAnchor();void coach.offsetWidth;coach.classList.add('enter');}
function hideCoach(){if(!coach||coach.hidden||coach.classList.contains('leaving'))return;document.body.classList.remove('coaching');try{localStorage.setItem('jn-coach-seen','1');}catch(e){}
 if(!state.motion){coach.hidden=true;return;}coachAnchor();coach.classList.remove('enter');void coach.offsetWidth;coach.classList.add('leaving');const done=()=>{if(coach.classList.contains('leaving')){coach.hidden=true;coach.classList.remove('leaving');}};coach.addEventListener('animationend',done,{once:true});setTimeout(done,600);}
$('#coach-done')?.addEventListener('click',()=>{hideCoach();$('.room-nav [data-view="room"]')?.focus({preventScroll:true});});
$$('#room-help,[data-help]').forEach(b=>b.addEventListener('click',()=>{closeRoomSettings();if(state.view!=='room')go('room');showCoach();$('#coach-done')?.focus({preventScroll:true});}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCoach();},true);
// The monitor itself opens the software projects: hovering it shows a tag and lifts the screen a
// touch; a click or tap (not a drag) goes to the computer.
const screenHint=document.createElement('div');screenHint.id='screen-hint';screenHint.setAttribute('aria-hidden','true');screenHint.innerHTML='Open my software projects <b>↗</b>';document.body.append(screenHint);
const screenRay=new THREE.Raycaster(),screenNdc=new THREE.Vector2();let screenDown=null,screenLit=false;
const uiTarget=e=>e.target.closest?.('a,button,input,label,#zone-panel,.room-nav,#computer,#loading,#entry,#room-settings-panel,#book-ui,.corner-tools,#markers');
function overScreen(e){if(!screenMesh||!state.ready||state.view==='computer'||transition||uiTarget(e))return false;const r=renderer.domElement.getBoundingClientRect();screenNdc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);screenRay.setFromCamera(screenNdc,camera);const sign=scene.getObjectByName('Software_sign');return screenRay.intersectObjects(sign?[screenMesh,sign]:[screenMesh],false).length>0;}
function lightScreen(on){if(on===screenLit)return;screenLit=on;document.body.classList.toggle('screen-hover',on);document.documentElement.style.cursor=on?'pointer':'';screenMesh?.material.color.setScalar(on?1.12:1);requestFrame();}
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const on=overScreen(e);lightScreen(on);if(on){screenHint.style.left=e.clientX+'px';screenHint.style.top=e.clientY+'px';}});
addEventListener('pointerdown',e=>{screenDown=[e.clientX,e.clientY];});
addEventListener('pointerup',e=>{const d=screenDown;screenDown=null;if(!d||Math.hypot(e.clientX-d[0],e.clientY-d[1])>6||!overScreen(e))return;lightScreen(false);go('computer');});
function requestFrame(){if(!frame)frame=requestAnimationFrame(render);}
function render(t){
 // Nothing draws until setup has finished and the GPU programs are ready (see initRoom).
 frame=0;if(!renderer||!scene||!camera||!state.ready||revealing||(state.view==='computer'&&!transition&&document.body.classList.contains('desktop-full')))return;
 if(transition){transition.elapsed=Math.max(0,t-transition.start);transition.last=t;const k=state.motion?Math.min(transition.elapsed/2100,1):1,e=k*k*k*(k*(k*6-15)+10);camera.position.lerpVectors(transition.from,transition.to,e);let turnEase=e;if(transition.arc){const a=transition.from,b=transition.to,c1=a.clone(),c2=b.clone();c1.z=a.z+(b.z-a.z)*.72;c1.y=a.y+(b.y-a.y)*.35;c2.x=a.x+(b.x-a.x)*.45;c2.z=b.z;c2.y=b.y;const q=1-e;camera.position.copy(a).multiplyScalar(q*q*q).addScaledVector(c1,3*q*q*e).addScaledVector(c2,3*q*e*e).addScaledVector(b,e*e*e);const r=Math.max(0,Math.min(1,(k-.10)/.90));turnEase=r*r*r*(r*(r*6-15)+10);}camera.fov=THREE.MathUtils.lerp(transition.fromFov,transition.toFov,e);camera.setViewOffset(innerWidth,innerHeight,THREE.MathUtils.lerp(transition.fromOffset,transition.toOffset,e),camera.userData.offY||0,innerWidth,innerHeight);camera.updateProjectionMatrix();if(state.view==='computer'||transition.fromScreen){const fit=state.view==='computer'?Math.max(0,Math.min(1,(k-.75)/.25)):1-Math.min(1,k/.25);const smooth=fit*fit*(3-2*fit);camera.projectionMatrix.elements[0]*=THREE.MathUtils.lerp(1,camera.aspect/(2.15/1.22),smooth);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();}if(transition.crossBench){if(e<.5)camera.quaternion.slerpQuaternions(transition.fromQ,transition.midQ,e*2);else camera.quaternion.slerpQuaternions(transition.midQ,transition.toQ,(e-.5)*2);}else camera.quaternion.slerpQuaternions(transition.fromQ,transition.toQ,turnEase);look.lerpVectors(transition.look,transition.target,e);baseLook.copy(look);if(k===1){transition=null;camera.lookAt(look);arrive();}}
 if(!transition)look.copy(baseLook);
 if(!transition)camera.lookAt(look);details?.update(t,state.motion);renderer.render(scene,camera);projectMarkers();if(state.view==='book')layoutBookUI();layoutDesktop();if(transition||details?.inspect().bookBusy)requestFrame();
}
function desktopTexture(){
 const c=document.createElement('canvas');c.width=innerWidth*2;c.height=innerHeight*2;
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;t.anisotropy=4;
 const fallback=new Image();fallback.onload=()=>{if(t.userData.exactDesktop)return;c.getContext('2d').drawImage(fallback,0,0,c.width,c.height);t.needsUpdate=true;requestFrame();};fallback.src='assets/optimized/assets-cockpit-desktop-first.webp?v=19';
 async function capture(){try{
  await document.fonts.ready;
  const w=innerWidth,h=innerHeight;
  const rendered=await html2canvas($('#desktop'),{width:w,height:h,windowWidth:w,windowHeight:h,scale:2,logging:false,backgroundColor:'#16262b',foreignObjectRendering:false,onclone:doc=>{
   doc.body.classList.add('workshop-started','desktop-full','flat-desktop');
   const surface=doc.querySelector('#computer');surface.hidden=false;surface.style.cssText=`position:fixed!important;inset:0!important;display:block!important;width:${w}px!important;height:${h}px!important`;
   const desktop=doc.querySelector('#desktop');desktop.style.cssText=`width:${w}px!important;height:${h}px!important;transform:none!important`;
   doc.querySelector('#windows').replaceChildren();doc.querySelector('.desktop-files').scrollTop=0;
   doc.querySelector('#entry').hidden=true;
  }});
  c.getContext('2d').drawImage(rendered,0,0,c.width,c.height);t.needsUpdate=true;t.userData.exactDesktop=true;requestFrame();
 }catch(error){console.warn('Desktop preview could not refresh:',error);}}
 // Snapshotting the live desktop is heavy; do it after the room is revealed.
 roomWarm?capture():afterReveal.push(capture);return t;
}

async function initRoom(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(viewW(),viewH(),false);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;$('#world').append(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color('#17201b');camera=new THREE.PerspectiveCamera(43.8,viewW()/viewH(),.04,70);const first=destination('room');camera.position.copy(first.p);look.copy(first.t);baseLook.copy(look);camera.lookAt(look);
  scene.add(new THREE.HemisphereLight('#fff6e5','#aa9270',.95));
  function spot(name,color,intensity,pos,target){const l=new THREE.SpotLight(color,intensity,15,Math.PI/2.8,.65,2);l.name=name;l.position.set(...pos);l.target.position.set(...target);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.bias=-.0003;l.shadow.normalBias=.015;scene.add(l,l.target);return l;}
  spot('Warm woodshop','#ffe8c4',20,[-2.5,3.3,-.45],[-2.5,1,0]);spot('Cool lab','#ffebcd',16,[2.6,3.35,-.4],[2.6,1,0]);spot('Central task light','#fff0d8',20,[0,3.5,-1.1],[0,1,-1]);
  const fill=new THREE.DirectionalLight('#fff4df',.7);fill.position.set(0,3,5);scene.add(fill);
  for(const z of [-.8,1.1,2.6]){const l=new THREE.PointLight('#dce7df',1.6,5,2);l.position.set(2.0,2.8,z);scene.add(l);}
  const glow=new THREE.PointLight('#ffb95c',3,2.5,2);glow.position.set(-3.13,1.5,.35);scene.add(glow);
  const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);stage('model-request');const gltf=await loader.loadAsync('assets/cockpit/command-center-warm.glb?v=1',e=>{window.__load?.set('room',e.loaded/ROOM_MODEL_BYTES);$('#load-message').textContent=e.loaded<ROOM_MODEL_BYTES?'Bringing the workshop into view…':'Setting out the projects…';});
  stage('model-parsed');window.__load?.set('room',1);await breathe();stage('traverse-start');model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.envMapIntensity=.45;if(o.name.startsWith('lab__')&&/graphite|smoked|component drawer/i.test(m.name)){m.roughness=.88;m.metalness=.08;}if(m.normalScale)m.normalScale.multiplyScalar(.55);if(/walnut|oak|powder|charcoal/i.test(m.name))m.roughness=Math.max(.58,m.roughness);if(/window|optical.*glass/i.test(m.name)){m.transparent=true;m.opacity=.22;m.depthWrite=false;o.castShadow=false;}if(m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}if(o.userData.desktopScreen||o.name==='Screen_Computer'){screenMesh=o;o.material=new THREE.MeshBasicMaterial({map:desktopTexture(),toneMapped:false});o.castShadow=false;}}});stage('model-added');scene.add(model);renderer.shadowMap.needsUpdate=true;window.__load?.set('setup',.2);await breathe();
  stage('details-start');details=addDetails(scene,model,camera);window.__load?.set('setup',.4);await breathe();
  // Wait for the pets and the sign so nothing pops in after the fade (but never forever).
  stage('pending-start');await Promise.race([Promise.all(window.__roomPending||[]),new Promise(r=>setTimeout(r,6000))]);window.__load?.set('setup',.6);await breathe();
  // Build GPU programs with real draws behind the loader: reveal a few objects at a time and draw
  // them, so each program is made with exactly the lights and shadows the room uses, in small steps.
  stage('compile-start');{const all=[],reps=[],seen=new Set();scene.traverse(o=>{if(!(o.isMesh||o.isLine||o.isPoints||o.isSprite))return;all.push([o,o.visible]);const mats=Array.isArray(o.material)?o.material:o.material?[o.material]:[];if(o.visible&&mats.some(m=>!seen.has(m))){mats.forEach(m=>seen.add(m));reps.push(o);}});
   const hideAll=()=>all.forEach(([o])=>o.visible=false);hideAll();
   for(let i=0;i<reps.length;i+=4){for(const o of reps.slice(i,i+4)){o.visible=true;for(let p=o.parent;p&&p!==scene;p=p.parent)p.visible=p.visible;}try{renderer.render(scene,camera);}catch(e){}for(const o of reps.slice(i,i+4))o.visible=false;window.__load?.set('setup',.75+.15*Math.min(1,(i+4)/reps.length));await breathe();}
   all.forEach(([o,v])=>o.visible=v);}
  window.__load?.set('setup',.9);await breathe();
  stage('compiled');state.ready=true;const initial=location.hash.slice(1).split('/')[0];if(views[initial]&&initial!==state.view)state.view=initial;go(state.view,{preserveHash:true});
  // Start already at the first view (no camera move behind the loader).
  if(transition){camera.fov=transition.toFov;camera.setViewOffset(innerWidth,innerHeight,transition.toOffset,camera.userData.offY||0,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.position.copy(transition.to);look.copy(transition.target);baseLook.copy(look);camera.lookAt(look);transition=null;arrive();}
  // Draw the room (with shadows) behind the loader, then hold that frame while the loader fades,
  // so the fade has the page to itself.
  stage('first-render');revealing=true;renderer.shadowMap.needsUpdate=true;details?.update(performance.now(),state.motion);renderer.render(scene,camera);projectMarkers();await breathe();renderer.render(scene,camera);await breathe();await settled();
  stage('warm');roomWarm=true;window.__load?.set('setup',1);hideLoader();
  (window.__load?.finish?.()||Promise.resolve()).then(()=>setTimeout(()=>{revealing=false;requestFrame();if(!coachSeen&&state.view==='room')setTimeout(showCoach,700);},1000));
  // The room view shows a placeholder desktop image; the exact snapshot is taken when someone heads to the computer.

 }catch(error){console.error('Command center could not load:',error);state.failed=true;$('#load-message').textContent='The 3D room could not load. Use the lightweight site below to explore every project.';$('#load-progress').style.width='100%';if(state.view==='computer'){$('#loading').hidden=true;$('#computer').hidden=false;layoutDesktop();}}
}
function onResize(){if(screenMesh){const old=screenMesh.material.map;screenMesh.material.map=desktopTexture();old?.dispose();}if(renderer){renderer.setSize(viewW(),viewH(),false);camera.aspect=viewW()/viewH();frameStation();if(state.ready){const d=destination(state.view);camera.position.copy(d.p);look.copy(d.t);baseLook.copy(d.t);camera.lookAt(look);transition=null;state.transitioning=false;$('#computer').hidden=state.view!=='computer';}}layoutDesktop();requestFrame();}
// Safari's toolbars resize the viewport while scrolling or rotating; follow every change.
let resizeQueued=0;const queueResize=()=>{cancelAnimationFrame(resizeQueued);resizeQueued=requestAnimationFrame(onResize);};addEventListener('resize',queueResize);addEventListener('orientationchange',queueResize);visualViewport?.addEventListener('resize',queueResize);
window.cockpit={get stages(){return stages;},get debug(){return {scene,camera,renderer,model,draw(){renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);}};},get details(){return details?.inspect();},get cameraPose(){return camera?{position:camera.position.toArray(),target:look.toArray(),fov:camera.fov,quaternion:camera.quaternion.toArray()}:null;},get ready(){return state.ready;},get view(){return state.view;},get transitioning(){return state.transitioning;},get desktopSnapshotReady(){return !!screenMesh?.material.map?.userData.exactDesktop;},get programCount(){return softwareProjects.length;},get recycleCount(){return archivedIds.size;},get openPrograms(){return [...state.open.keys()];},get renderInfo(){return renderer?{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}:null;},get failed(){return state.failed;}};
let ambientTick=0;setInterval(()=>{ambientTick++;if(state.ready&&!document.hidden&&(state.motion||ambientTick%20===0))requestFrame();},1000/20);
initRoom();

let bookPage=0;
// The book is its own control: click/tap the right page to turn forward and the left page to go back,
// swipe on touch screens, or use the arrow keys. Arrows, the "Explore" button and a page pill are
// placed around the book on screen each frame.
const bookEntries=()=>projects.filter(p=>p.group==='wood');
function turnBook(dir){const n=bookEntries().length,next=bookPage+dir;if(next<0||next>=n||details?.inspect().bookBusy)return;bookPage=next;showBook(true);}
function bookUI(){let ui=$('#book-ui');if(ui)return ui;ui=document.createElement('div');ui.id='book-ui';ui.hidden=true;
 ui.innerHTML=`<button class="book-zone prev" aria-label="Previous page"></button><button class="book-zone next" aria-label="Next page"></button>
 <button class="book-arrow prev" aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
 <button class="book-arrow next" aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
 <button class="book-explore">Read about this project <span aria-hidden="true">↗</span></button>
 <div class="book-pill"><span class="book-dots" aria-hidden="true"></span><span class="book-title" aria-live="polite"></span><button class="book-close" aria-label="Close the book">Close</button></div><div class="sr-only book-sr"></div>`;
 document.body.append(ui);
 ui.querySelectorAll('.prev').forEach(b=>b.onclick=()=>turnBook(-1));ui.querySelectorAll('.next').forEach(b=>b.onclick=()=>turnBook(1));
 ui.querySelector('.book-close').onclick=()=>go('wood');
 ui.querySelector('.book-explore').onclick=()=>{const p=bookEntries()[bookPage];$('#zone-panel').hidden=false;$('#zone-panel').classList.add('project-focus');openProject(p.id,{fromBook:true});ui.hidden=true;};
 let sx=null;ui.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')sx=e.clientX;});ui.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40){e.preventDefault();turnBook(dx<0?1:-1);}});
 addEventListener('keydown',e=>{if(state.view!=='book'||ui.hidden||e.target.closest?.('input,textarea'))return;if(e.key==='ArrowRight'){turnBook(1);e.preventDefault();}if(e.key==='ArrowLeft'){turnBook(-1);e.preventDefault();}});
 return ui;}
const bookCorner=new THREE.Vector3();
function layoutBookUI(){const ui=$('#book-ui');if(!ui||ui.hidden||!details?.bookObject)return;details.bookObject.updateWorldMatrix(true,false);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const corner of details.bookObject.userData.pageCorners){bookCorner.fromArray(corner).applyMatrix4(details.bookObject.matrixWorld).project(camera);const x=(bookCorner.x+1)/2*innerWidth,y=(1-bookCorner.y)/2*innerHeight;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}

 ui.style.setProperty('--bx',x0+'px');ui.style.setProperty('--by',y0+'px');ui.style.setProperty('--bw',(x1-x0)+'px');ui.style.setProperty('--bh',(y1-y0)+'px');ui.classList.toggle('ready',!details.inspect().bookBusy||ui.classList.contains('ready'));}
function showBook(animate=false){const entries=bookEntries(),p=entries[bookPage];$('#zone-panel').hidden=true;details?.setBook(true,p,bookPage,entries.length,animate&&state.motion);$('#physical-book-controls')?.remove();
 const ui=bookUI();ui.hidden=false;ui.querySelectorAll('.prev').forEach(b=>b.disabled=bookPage===0);ui.querySelectorAll('.next').forEach(b=>b.disabled=bookPage===entries.length-1);
 ui.querySelector('.book-dots').innerHTML=entries.map((_,i)=>`<i class="${i===bookPage?'on':''}"></i>`).join('');ui.querySelector('.book-title').textContent=`${bookPage+1} / ${entries.length} · ${p.name}`;ui.querySelector('.book-sr').textContent=`${p.purpose||''} ${p.tech||''}`;requestFrame();}
