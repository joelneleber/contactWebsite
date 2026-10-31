// 2D workshop: station tabs, scene zoom, side panel and index filters.
// The project grid in the HTML is the single source of data; this script only reads it.
(() => {
  const stage = document.querySelector('.stage');
  const panel = document.querySelector('.panel');
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
  const pins = [...document.querySelectorAll('.pin-spot')];
  const back = document.querySelector('.back');
  const cards = [...document.querySelectorAll('.grid .p')];
  const chips = [...document.querySelectorAll('.chips button')];
  const $ = (k) => panel.querySelector(`[data-${k}]`);

  // Copy matches the stations in the 3D cockpit.
  const ZONES = {
    room: {k: 'A ROOM FOR ALL THE THINGS I MAKE', t: 'Three benches, one room.',
      x: 'Wood on the left, code in the middle, circuits on the right. Every station holds real projects. Pick one to step closer.'},
    wood: {k: 'WOODWORKING / CNC / MADE BY HAND', t: 'Over at the woodshop.',
      x: 'Wedding gifts, furniture, workshop builds, and objects made for the people around me.'},
    computer: {k: 'SOFTWARE & EXPERIMENTS', t: 'At my computer.',
      x: 'Apps, tools, games and simulations. Built, tested and tinkered with.'},
    lab: {k: 'ELECTRONICS / HARDWARE / EXPERIMENTS', t: 'At the electronics bench.',
      x: 'Boards, instruments, sensors and a lot of figuring things out.'},
  };
  const SPOTS = {
    cnc: {k: 'DIGITAL DESIGN / PHYSICAL OBJECTS', t: 'At the CNC.', x: 'Designing, cutting and building things for the real world.'},
    lamp: {k: 'A WEDDING GIFT / ONE OF MY FAVORITES', t: 'A gift that glows.', x: 'A photographic lithophane lamp with a wooden top and base and personalized engraving.'},
    monitor: {k: 'JOEY / WORKSPACE', t: 'Programs on the desktop.', x: 'Start with the five in-depth case studies, then dig into the rest.'},
    scope: {k: 'SIGNALS / SENSORS / ELECTRONICS', t: 'Following the signal.', x: 'Hardware experiments, sensor recordings and the software that makes sense of them.'},
    printer: {k: 'IDEAS INTO OBJECTS', t: 'From screen to something real.', x: 'Projects that connect digital tools with physical things.'},
  };

  const info = (li) => ({
    href: li.querySelector('a').getAttribute('href'),
    img: li.querySelector('img').getAttribute('src'),
    title: li.querySelector('h3').textContent,
    desc: li.querySelector('p').textContent,
  });
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function render(copy, items, zone) {
    $('k').textContent = copy.k;
    $('t').textContent = copy.t;
    $('x').textContent = copy.x;
    $('l').innerHTML = items.map((li) => {
      const p = info(li);
      return `<li><a href="${esc(p.href)}"><img src="${esc(p.img)}" alt="" loading="lazy" decoding="async"><span><strong>${esc(p.title)}</strong><small>${esc(p.desc)}</small></span><span aria-hidden="true">↗</span></a></li>`;
    }).join('');
    const more = $('m');
    if (zone === 'room') { more.textContent = `Browse all ${cards.length} projects ↓`; more.dataset.f = 'all'; }
    else { more.textContent = `See these in the index ↓`; more.dataset.f = zone; }
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  }

  let zone = 'room';
  function go(next, {spot = null, push = true} = {}) {
    if (!ZONES[next]) next = 'room';
    zone = next;
    stage.dataset.zone = next;
    back.hidden = next === 'room';
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.zone === next)));
    pins.forEach((p) => p.classList.toggle('is-on', p.dataset.spot === spot));
    let items = [];
    if (spot) items = cards.filter((c) => c.dataset.spots.split(' ').includes(spot));
    else if (next !== 'room') items = cards.filter((c) => c.dataset.zone === next);
    else items = cards.filter((c) => c.classList.contains('is-featured'));
    render(spot ? SPOTS[spot] : ZONES[next], items, next);
    if (push) history.replaceState(null, '', next === 'room' ? location.pathname : `#${next}`);
  }

  document.querySelectorAll('[data-zone]:is(button)').forEach((b) =>
    b.addEventListener('click', () => go(b.dataset.zone)));
  pins.forEach((p) => p.addEventListener('click', () => go(p.dataset.in, {spot: p.dataset.spot})));

  // Arrow keys move between tabs, like a native tab list.
  tabs.forEach((t, i) => t.addEventListener('keydown', (e) => {
    const d = {ArrowRight: 1, ArrowLeft: -1}[e.key];
    if (!d) return;
    const n = tabs[(i + d + tabs.length) % tabs.length];
    n.focus(); go(n.dataset.zone);
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && zone !== 'room') go('room'); });

  // Index filters.
  function filter(f) {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
    cards.forEach((c) => { c.hidden = f !== 'all' && c.dataset.zone !== f; });
  }
  chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter)));
  $('m').addEventListener('click', () => filter($('m').dataset.f || 'all'));

  const start = location.hash.slice(1);
  go(ZONES[start] ? start : 'room', {push: false});
})();

// Project viewer: the same stories, photos and case studies the 3D cockpit shows.
// Story data loads on first intent (hover/focus/tap), so the first page load stays small.
(() => {
  const dlg = document.querySelector('.viewer');
  if (!dlg || !dlg.showModal) return; // very old browsers keep plain links to read/*.html
  const body = dlg.querySelector('.v-body');
  const media = dlg.querySelector('.v-media');
  const stage = dlg.querySelector('.v-stage');
  const img = dlg.querySelector('.v-img');
  const bg = dlg.querySelector('.v-bg');
  const cap = dlg.querySelector('.v-cap');
  const count = dlg.querySelector('.v-count');
  const strip = dlg.querySelector('.v-strip');
  const cards = [...document.querySelectorAll('.grid .p')];
  const order = cards.map((c) => idOf(c.querySelector('a').getAttribute('href')));
  const zoneOf = Object.fromEntries(cards.map((c, i) => [order[i], c.dataset.zone]));

  // Same copy the 3D cockpit uses.
  const TITLES = {
    avaron: ['AVARON', 'Training software that connects athlete sessions, body visualization, and coaching.'],
    hirebolt: ['Hiregrove', 'A job-search workspace for explainable matches and evidence-backed applications.'],
    cockfights: ['Cockfights Online', 'A browser-playable 3D fighting game, from movement feel to multiplayer.'],
    leads: ['LeadsByMail', 'Turning aerial imagery into a pipeline for property visualization and printed mailers.'],
    amazon: ['Amazon Business Compare', 'Comparing offers and tracking prices with a collaborative monitoring dashboard.'],
  };
  const BUILD_NOTES = {
    lamp: 'I made this wedding gift with photographic lithophane panels, a wooden top and base, and a personalized engraving. It is one of my favorite projects. The photos follow the assembly, finish, and the moment the light brings the pictures to life.',
    mirror: 'A geometric arrangement of wood and mirror, with the repeated shapes becoming the frame itself.',
    woodarchive: 'Objects made to be used and shared: games, table numbers, and cutting boards. Browse the photos for a closer look at each build.',
    fabrication: 'The workshop is a project of its own. These photos bring together the CNC router, furniture, storage, and vehicle woodwork.',
  };
  const KICKER = {
    lamp: 'A WEDDING GIFT / ONE OF MY FAVORITES', sign: 'FROM DESIGN TO THE WEDDING DAY',
    wood: 'FROM THE WOODSHOP', lab: 'ELECTRONICS PROJECT', computer: 'SOFTWARE PROJECT',
  };

  function idOf(href) { const m = /read\/([\w-]+)\.html/.exec(href || ''); return m && m[1]; }
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  // Every photo has a compressed .webp twin in assets/optimized (GIF/SVG stay as-is).
  const opt = (src) => /^assets\/optimized\/|\.(gif|svg)$/i.test(src) ? src
    : 'assets/optimized/' + src.replace(/\.\w+$/, '').replaceAll('/', '-') + '.webp';

  let data = null;
  function load() {
    if (data) return data;
    const add = (src) => new Promise((ok, no) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s);
    });
    data = Promise.all(['projects.js', 'portfolio-stories.js?v=8', 'deep-case-data.js?v=20'].map(add)).then(() => ({
      P: new Map((window.PROJECTS || []).map((p) => [p.id, p])),
      S: new Map((window.PORTFOLIO_STORIES || []).map((s) => [s.id, s])),
      D: new Map((window.DEEP_CASES || []).map((d) => [d.id, d])),
    }));
    data.catch(() => { data = null; });
    return data;
  }
  const intent = (e) => { if (e.target.closest?.('a[href^="read/"]')) load(); };
  document.addEventListener('pointerover', intent, {passive: true});
  document.addEventListener('focusin', intent);
  document.addEventListener('touchstart', intent, {passive: true});

  // ---- Gallery ----
  let shots = [], at = 0, userMovedAt = 0;
  function show(i, byUser) {
    if (!shots.length) return;
    at = (i + shots.length) % shots.length;
    const s = shots[at];
    img.src = opt(s.src); img.alt = s.caption || '';
    bg.src = img.src;
    cap.textContent = s.caption || '';
    count.textContent = `${at + 1} / ${shots.length}`;
    strip.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === at)));
    strip.children[at]?.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
    if (byUser) userMovedAt = Date.now();
    // Warm the next image so arrowing through feels instant.
    const n = shots[(at + 1) % shots.length]; if (n) new Image().src = opt(n.src);
  }
  dlg.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => show(at + Number(b.dataset.step), true)));
  strip.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(Number(b.dataset.i), true); });
  dlg.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') { show(at + 1, true); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { show(at - 1, true); e.preventDefault(); }
  });
  // Swipe on touch screens.
  let sx = null;
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
  stage.addEventListener('pointerup', (e) => {
    if (sx === null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1), true);
  });

  // ---- Content ----
  const chips = (tech) => String(tech || '').split('·').map((t) => t.trim()).filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join('');
  const cards2 = (title, list) => list?.length
    ? `<section class="v-sec"><h3>${title}</h3>${list.map((x) => `<article><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></article>`).join('')}</section>` : '';

  function render(id, {P, S, D}) {
    const p = P.get(id); if (!p) return false;
    const deep = D.get(id), story = S.get(id), zone = zoneOf[id] || (p.group === 'wood' ? 'wood' : 'computer');
    const seen = new Set();
    const pick = (list) => (list || []).filter((s) => s?.src && !seen.has(s.src) && seen.add(s.src));
    shots = deep ? [...pick(p.photos), ...pick(deep.screenshots)] : [...pick(p.photos), ...pick(story?.screenshots)];

    const links = [];
    if (id === 'avaron') links.push(['https://avaronsports.com/', 'Visit AVARON Sports ↗']);
    if (/^https:\/\//.test(p.url || '')) links.push([p.url, 'View source ↗']);
    const linkRow = links.map(([h, t]) => `<a href="${esc(h)}" target="_blank" rel="noopener noreferrer">${t}</a>`).join('')
      + `<a href="read/${esc(id)}.html">Open as a page ↗</a>`;

    let html;
    if (deep) {
      const [title, line] = TITLES[id] || [p.name, p.purpose];
      html = `<header class="v-head"><p class="eyebrow">FEATURED PROJECT · CASE STUDY</p><h2 id="v-title">${esc(title)}</h2>
        <p class="v-lede">${esc(line)}</p><ul class="tags">${chips(p.tech)}</ul><p class="v-links">${linkRow}</p></header>
        <p class="v-summary">${esc(deep.summary)}</p>
        <nav class="v-toc" aria-label="Chapters"><p class="eyebrow">${deep.chapters.length} CHAPTERS</p><ol>${deep.chapters.map((c, i) =>
          `<li><a href="#ch-${esc(c.id)}" data-ch="${esc(c.id)}"><small>${String(i + 1).padStart(2, '0')}</small>${esc(c.title)}</a></li>`).join('')}</ol></nav>
        ${deep.chapters.map((c, i) => {
          const n = shots.findIndex((s) => s.chapter === c.id);
          const k = shots.filter((s) => s.chapter === c.id).length;
          return `<section class="v-chapter" id="ch-${esc(c.id)}" data-ch="${esc(c.id)}"><p class="eyebrow">${String(i + 1).padStart(2, '0')} / ${deep.chapters.length}</p>
            <h3>${esc(c.title)}</h3>${c.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}
            ${n >= 0 ? `<button class="v-see" data-show="${n}">See ${k === 1 ? 'the image' : `${k} images`} for this chapter ↗</button>` : ''}</section>`;
        }).join('')}`;
    } else if (zone === 'wood' || !story) {
      html = `<header class="v-head"><p class="eyebrow">${esc(KICKER[id] || KICKER[zone])}</p><h2 id="v-title">${esc(p.name)}</h2>
        <p class="v-lede">${esc(p.purpose)}</p><p class="v-links">${linkRow}</p></header>
        <section class="v-sec"><h3>Inside the build</h3><ul class="tags">${chips(p.tech)}</ul><p>${esc(BUILD_NOTES[id] || p.detail || p.purpose)}</p></section>`;
    } else {
      html = `<header class="v-head"><p class="eyebrow">${esc(KICKER[zone])}</p><h2 id="v-title">${esc(p.name)}</h2>
        <p class="v-lede">${esc(p.purpose)}</p><ul class="tags">${chips(p.tech)}</ul><p class="v-links">${linkRow}</p></header>
        <section class="v-sec"><h3>The idea</h3><p>${esc(story.aspiration)}</p></section>
        ${story.usage?.length ? `<section class="v-sec"><h3>How it works</h3><ol>${story.usage.map((u) => `<li>${esc(u)}</li>`).join('')}</ol></section>` : ''}
        ${cards2('Inside the build', story.technology)}${cards2('What the project explores', story.learning)}`;
    }

    // Next project at the same station.
    const same = order.filter((o) => zoneOf[o] === zone);
    const next = same[(same.indexOf(id) + 1) % same.length];
    if (next && next !== id && P.get(next)) {
      html += `<a class="v-nextp" href="read/${esc(next)}.html"><small>NEXT ON THIS BENCH</small><strong>${esc((TITLES[next] || [P.get(next).name])[0])}</strong><span aria-hidden="true">→</span></a>`;
    }
    body.innerHTML = html;
    body.scrollTop = 0; dlg.querySelector('.v-info').scrollTop = 0; dlg.scrollTop = 0;

    dlg.classList.toggle('no-media', !shots.length);
    strip.hidden = shots.length < 2;
    dlg.querySelectorAll('.v-step').forEach((b) => { b.hidden = shots.length < 2; });
    count.hidden = shots.length < 2;
    strip.innerHTML = shots.map((s, i) => `<button data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(opt(s.src))}" alt="" loading="lazy" decoding="async"></button>`).join('');
    at = 0; userMovedAt = 0; if (shots.length) show(0);
    watchChapters();
    return true;
  }

  // Case studies: the gallery follows the chapter you're reading.
  let io = null;
  function watchChapters() {
    io?.disconnect();
    const secs = body.querySelectorAll('.v-chapter');
    if (!secs.length || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver((entries) => {
      if (Date.now() - userMovedAt < 2500) return;
      const e = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!e) return;
      const n = shots.findIndex((s) => s.chapter === e.target.dataset.ch);
      if (n >= 0 && n !== at) show(n);
    }, {root: matchMedia('(min-width: 861px)').matches ? dlg.querySelector('.v-info') : dlg, rootMargin: '0px 0px -55% 0px'});
    secs.forEach((s) => io.observe(s));
  }
  body.addEventListener('click', (e) => {
    const see = e.target.closest('[data-show]');
    if (see) { show(Number(see.dataset.show), true); if (!matchMedia('(min-width: 861px)').matches) media.scrollIntoView({behavior: 'smooth'}); return; }
    const ch = e.target.closest('a[data-ch]');
    if (ch) { e.preventDefault(); body.querySelector(`.v-chapter[data-ch="${CSS.escape(ch.dataset.ch)}"]`)?.scrollIntoView({behavior: 'smooth', block: 'start'}); }
  });

  // ---- Open / close + history ----
  let pushed = false, returnFocus = null;
  async function open(id, {push = true} = {}) {
    let d;
    try { d = await load(); } catch { location.href = `read/${id}.html`; return; }
    if (!render(id, d)) { location.href = `read/${id}.html`; return; }
    if (!dlg.open) { returnFocus = document.activeElement; dlg.showModal(); document.documentElement.classList.add('v-lock'); }
    dlg.querySelector('.v-close').focus({preventScroll: true});
    if (push) { history.pushState({p: id}, '', `#p/${id}`); pushed = true; }
  }
  function close({fromHistory = false} = {}) {
    if (!dlg.open) return;
    dlg.close(); io?.disconnect();
    document.documentElement.classList.remove('v-lock');
    if (!fromHistory) {
      if (pushed) { pushed = false; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search);
    }
    returnFocus?.focus?.({preventScroll: true});
  }
  dlg.querySelector('.v-close').addEventListener('click', () => close());
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  addEventListener('popstate', () => {
    const m = /^#p\/([\w-]+)$/.exec(location.hash);
    if (m) open(m[1], {push: false}); else { pushed = false; close({fromHistory: true}); }
  });

  // Any project link on the page (grid, station panel, "next on this bench") opens the viewer.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="read/"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.closest('.v-links')) return; // "Open as a page" really navigates
    const id = idOf(a.getAttribute('href'));
    if (!id || !(id in zoneOf)) return;
    e.preventDefault();
    if (dlg.open) { open(id, {push: false}); history.replaceState({p: id}, '', `#p/${id}`); }
    else open(id);
  });

  const m = /^#p\/([\w-]+)$/.exec(location.hash);
  if (m) open(m[1], {push: false});
})();
