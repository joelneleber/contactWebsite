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
