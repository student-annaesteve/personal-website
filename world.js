(function () {
  "use strict";

  const PROJECTS = window.PROJECTS || [];
  const ABOUT = window.ABOUT || {};
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = () => innerWidth <= 720;
  const isTouch = matchMedia("(pointer: coarse)").matches;

  // ---------------------------------------------------------------------------
  // Stops on the route: one per project. The last project sits on the main summit;
  // "About me" lives in the round button in the top-right corner.
  // ---------------------------------------------------------------------------
  const stops = PROJECTS.map((p, i) => ({ kind: "project", data: p, id: "peak-" + (i + 1) }));
  const n = PROJECTS.length;
  const fmt = (m) => m.toLocaleString("en-US") + " m";

  // ---------------------------------------------------------------------------
  // Terrain: height map from terrain.js, plus the summits found on it.
  // ---------------------------------------------------------------------------
  const WIDTH = 300; // world units across the map
  const terrain = (function () {
    const D = window.TERRAIN;
    if (!D) return null;
    const G = D.size;
    const bin = atob(D.heights);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const raw = new Uint16Array(bytes.buffer);
    const HEIGHT = WIDTH * D.relief * 1.9; // the scan is fairly flat: stretch it into real mountains
    const H = new Float32Array(G * G);
    for (let i = 0; i < H.length; i++) H[i] = (raw[i] / 65535) * HEIGHT;
    const cell = WIDTH / (G - 1);
    const toX = (gx) => gx * cell - WIDTH / 2;

    // Beyond the height map the ground keeps the edge height and eases down into a flat plain.
    function heightAt(x, z) {
      let fx = (x + WIDTH / 2) / cell, fz = (z + WIDTH / 2) / cell;
      const outside = Math.hypot(Math.max(0, -fx, fx - (G - 1)), Math.max(0, -fz, fz - (G - 1))) * cell;
      fx = Math.min(G - 1, Math.max(0, fx));
      fz = Math.min(G - 1, Math.max(0, fz));
      const falloff = outside > 0 ? Math.exp(-outside / 18) : 1;
      const x0 = Math.floor(fx), z0 = Math.floor(fz), x1 = Math.min(G - 1, x0 + 1), z1 = Math.min(G - 1, z0 + 1);
      const tx = fx - x0, tz = fz - z0;
      const h0 = H[z0 * G + x0] * (1 - tx) + H[z0 * G + x1] * tx;
      const h1 = H[z1 * G + x0] * (1 - tx) + H[z1 * G + x1] * tx;
      return (h0 * (1 - tz) + h1 * tz) * falloff;
    }

    // Summits: local maxima, well apart, away from the edges.
    const R = Math.round(G * 0.06), margin = Math.round(G * 0.1);
    const cands = [];
    for (let gz = margin; gz < G - margin; gz++) for (let gx = margin; gx < G - margin; gx++) {
      const h = H[gz * G + gx];
      let isMax = true;
      for (let dz = -R; dz <= R && isMax; dz++) for (let dx = -R; dx <= R; dx++) {
        if ((dx || dz) && H[(gz + dz) * G + gx + dx] > h) { isMax = false; break; }
      }
      if (isMax && h > HEIGHT * 0.35) cands.push(gz * G + gx); // real summits only, not bumps on the plain
    }
    cands.sort((a, b) => H[b] - H[a]);
    const at = (i) => ({ x: toX(i % G), z: toX(Math.floor(i / G)), y: H[i] });
    let picked = [];
    for (let minDist = WIDTH * 0.17; minDist > 4 && picked.length < stops.length; minDist *= 0.8) {
      picked = [];
      for (const idx of cands) {
        const p = at(idx);
        if (picked.every((q) => Math.hypot(q.x - p.x, q.z - p.z) >= minDist)) picked.push(p);
        if (picked.length === stops.length) break;
      }
    }
    // Pad with spread-out points if the map has fewer summits than projects.
    for (let k = 0; picked.length < stops.length; k++) {
      const a = (k / stops.length) * Math.PI * 2, x = Math.cos(a) * WIDTH * 0.3, z = Math.sin(a) * WIDTH * 0.3;
      picked.push({ x, z, y: heightAt(x, z) });
    }
    // Projects climb from the lowest summit to the highest.
    const tops = picked.slice().sort((a, b) => a.y - b.y);
    const metres = (y) => Math.round((1200 + (y / HEIGHT) * 3150) / 10) * 10;
    return { G, H, HEIGHT, cell, toX, heightAt, tops, metres };
  })();

  // ---------------------------------------------------------------------------
  // DOM: trail sign, header, panel. Works even if WebGL is unavailable.
  // ---------------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  $("name").textContent = ABOUT.name || "";
  $("tagline").textContent = ABOUT.tagline || "";
  const hintText = isTouch
    ? "Drag to explore · Tap a summit"
    : "Drag to look around · Scroll to zoom · Pick a summit";
  $("hint").textContent = hintText;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const list = $("trail-list");
  stops.forEach((s, i) => {
    if (terrain) {
      s.top = terrain.tops[i];
      s.metres = terrain.metres(s.top.y);
    }
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sign" + (s.kind === "about" ? " summit" : "");
    b.innerHTML =
      '<span class="sign-num">' + (s.kind === "about" ? "▲" : String(i + 1).padStart(2, "0")) + "</span>" +
      '<span class="sign-name">' + esc(s.kind === "about" ? "About me" : s.data.title) + "</span>" +
      '<span class="sign-alt">' + (s.metres ? fmt(s.metres) : "") + "</span>";
    b.addEventListener("click", () => open(i));
    s.signEl = b;
    li.appendChild(b);
    list.appendChild(li);
  });
  const initials = (ABOUT.name || "").split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2);
  if (ABOUT.photo) $("about-initials").outerHTML = '<img src="' + esc(ABOUT.photo) + '" alt="">';
  else $("about-initials").textContent = initials;
  $("about-btn").addEventListener("click", () => openAbout());

  const panel = $("panel");
  const panelBody = $("panel-body");
  let current = -1;
  let aboutOpen = false;

  function placeholderFrames(color, count) {
    let html = "";
    for (let k = 0; k < count; k++) {
      html +=
        '<div class="frame" style="background:linear-gradient(' + (135 + k * 40) + "deg," +
        esc(color) + ", " + ["#efe6d8", "#e5d7c4", "#ddcdb3"][k % 3] + ')">Image ' + (k + 1) + "</div>";
    }
    return html;
  }

  function renderPanel(i) {
    const s = i < 0 ? aboutStop : stops[i];
    const d = s.data;
    const alt = s.metres ? "▲ " + fmt(s.metres) : "";
    let html = "";
    panel.classList.toggle("panel--wide", !!(s.kind === "project" && d.levels));
    if (s.kind === "project" && d.levels) {
      html += renderCase(d, alt, i);
    } else if (s.kind === "project") {
      const imgs = (d.images || [])
        .map((im) => '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || "") + '" loading="lazy">')
        .join("");
      html +=
        '<p class="panel-alt">' + alt + " · Summit " + (i + 1) + " of " + n + "</p>" +
        "<h2>" + esc(d.title) + "</h2>" +
        '<div class="meta">' + (d.year ? "<span>" + esc(d.year) + "</span>" : "") +
        (d.tags || []).map((t) => '<span class="chip">' + esc(t) + "</span>").join("") + "</div>" +
        '<div class="gallery">' + (imgs || placeholderFrames(d.color || "#767154", 3)) + "</div>" +
        "<p>" + esc(d.description) + "</p>" +
        (d.link ? '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">View the full project →</a>' : "");
    } else {
      const initials = (d.name || "").split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2);
      html +=
        (d.photo
          ? '<img class="about-photo" src="' + esc(d.photo) + '" alt="Photo of ' + esc(d.name) + '">'
          : '<div class="about-photo" aria-hidden="true">' + esc(initials) + "</div>") +
        "<h2>About me</h2>" +
        (d.bio || []).map((p) => "<p>" + esc(p) + "</p>").join("") +
        '<div class="contact-row"><span class="email">' + esc(d.email) + "</span>" +
        '<button type="button" class="copy-btn" id="copy-email">Copy email</button></div>' +
        '<ul class="socials">' +
        (d.links || []).map((l) => '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a></li>").join("") +
        "</ul>";
    }
    if (s.kind === "project") {
      const prev = i > 0 ? stops[i - 1] : null;
      const next = i < stops.length - 1 ? stops[i + 1] : null;
      html +=
        '<nav class="panel-nav">' +
        (prev ? '<button type="button" data-go="' + (i - 1) + '">↓ ' + esc(prev.data.title) + "</button>" : "<span></span>") +
        (next ? '<button type="button" data-go="' + (i + 1) + '">' + esc(next.data.title) + " ↑</button>" : "") +
        "</nav>";
    }
    panelBody.innerHTML = html;
    panelBody.querySelectorAll("[data-go]").forEach((b) =>
      b.addEventListener("click", () => open(+b.dataset.go))
    );
    const copy = $("copy-email");
    if (copy) {
      copy.addEventListener("click", () => {
        try {
          navigator.clipboard.writeText(d.email).then(() => (copy.textContent = "Copied"), selectEmail);
        } catch (e) {
          selectEmail();
        }
      });
    }
  }
  // ---- Case study layout (projects with `levels`) ---------------------------
  // A device mockup holding an image or a looping video. A video shows its poster
  // (the screenshot) until it loads, so a missing video file still looks finished.
  function device(m) {
    if (!m) return "";
    if (!m.src && !m.video) {
      return '<figure class="photo-slot"><div class="photo-slot-inner"><span>' + esc(m.placeholder || "Photo") + "</span></div></figure>";
    }
    const media = m.video
      ? '<video autoplay muted loop playsinline preload="metadata" poster="' + esc(m.poster || m.src || "") + '" aria-label="' + esc(m.alt || "") + '">' +
        '<source src="' + esc(m.video) + '" type="video/mp4"></video>'
      : '<img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">';
    return '<figure class="device device--' + esc(m.device || "monitor") + '"><div class="device-body"><div class="device-screen">' +
      media + "</div></div></figure>";
  }
  function renderCase(d, alt, i) {
    const hero = d.hero || [];
    let h =
      '<div class="case-meta">' + (d.year ? "<span>" + esc(d.year) + "</span>" : "") +
      (d.tags || []).map((t) => '<span class="chip">' + esc(t) + "</span>").join("") + "</div>" +
      '<h2 class="case-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.subtitle ? '<p class="case-sub">' + esc(d.subtitle) + "</p>" : "") +
      (d.goal ? '<p class="case-goal">' + esc(d.goal) + "</p>" : "") +
      '<p class="case-lead">' + esc(d.description) + "</p>" +
      (hero.length ? '<div class="mock-hero">' + hero.map(device).join("") + "</div>" : "");
    // The levels hang off a small road that runs down the panel: structure, not content.
    h += '<div class="road">' + d.levels.map((L) =>
      '<section class="stop">' +
      '<header class="stop-head"><h3 class="stop-title">' + esc(L.title || "Level " + String(L.code).replace(/^L/i, "")) + "</h3></header>" +
      '<div class="stop-ps">' +
      '<div><span class="stop-label stop-label--challenge">' + esc((L.labels || [])[0] || "Challenge") + "</span><p>" + esc(L.challenge) + "</p></div>" +
      '<div><span class="stop-label stop-label--solution">' + esc((L.labels || [])[1] || "Our solution") + '</span><p class="stop-solution">' + esc(L.solution) + "</p></div>" +
      "</div>" +
      (L.stats ? '<dl class="stop-stats">' + L.stats.map(([v, k]) => "<div><dt>" + esc(v) + "</dt><dd>" + esc(k) + "</dd></div>").join("") + "</dl>" : "") +
      (L.rules ? '<div class="rules"><span class="stop-label stop-label--challenge">' + esc(L.rules.title) + '</span><ol class="rules-list">' +
        L.rules.items.map(([cond, act, on]) => '<li class="rule' + (on ? " rule--on" : "") + '"><span class="rule-cond">' + esc(cond) + '</span><span class="rule-act">' + esc(act) + "</span></li>").join("") +
        "</ol></div>" : "") +
      device(L.media) +
      "</section>").join("") + "</div>";
    if (d.link) h += '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Open the simulator →") + "</a>";
    return h;
  }

  function selectEmail() {
    const el = panelBody.querySelector(".email");
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  let closeTimer = 0;
  function open(i) {
    clearTimeout(closeTimer);
    current = i;
    aboutOpen = false;
    $("about-btn").removeAttribute("aria-current");
    renderPanel(i);
    panel.hidden = false;
    panel.classList.remove("closing");
    panel.scrollTop = 0;
    stops.forEach((s, k) => s.signEl.setAttribute("aria-current", k === i ? "true" : "false"));
    try { history.replaceState(null, "", "#" + stops[i].id); } catch (e) {}
    hideHint();
    if (world) world.flyTo(i);
  }
  // About me opens in the same panel, from the round button; the map goes back to the overview.
  const aboutStop = { kind: "about", data: ABOUT, id: "about" };
  function openAbout() {
    clearTimeout(closeTimer);
    current = -1;
    aboutOpen = true;
    renderPanel(-1);
    panel.hidden = false;
    panel.classList.remove("closing");
    panel.scrollTop = 0;
    stops.forEach((s) => s.signEl.setAttribute("aria-current", "false"));
    $("about-btn").setAttribute("aria-current", "true");
    try { history.replaceState(null, "", "#about"); } catch (e) {}
    hideHint();
    if (world) world.overview();
  }
  function close() {
    if (current < 0 && !aboutOpen) return;
    current = -1;
    aboutOpen = false;
    $("about-btn").removeAttribute("aria-current");
    stops.forEach((s) => s.signEl.setAttribute("aria-current", "false"));
    panel.classList.add("closing");
    closeTimer = setTimeout(() => (panel.hidden = true), reduceMotion ? 0 : 450);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (world) world.overview();
  }
  $("panel-close").addEventListener("click", close);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (current >= 0 && (e.key === "ArrowRight" || e.key === "ArrowUp") && current < stops.length - 1) open(current + 1);
    if (current >= 0 && (e.key === "ArrowLeft" || e.key === "ArrowDown") && current > 0) open(current - 1);
  });

  let hintGone = false;
  function hideHint() {
    if (hintGone) return;
    hintGone = true;
    $("hint").classList.add("gone");
  }

  // ---------------------------------------------------------------------------
  // WebGL world
  // ---------------------------------------------------------------------------
  let world = null;
  function webglOK() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }
  if (window.THREE && terrain && webglOK()) {
    try {
      world = buildWorld();
    } catch (e) {
      console.error(e);
      world = null;
    }
  }
  if (!world) document.body.classList.add("no-webgl");

  const startIdx = stops.findIndex((s) => s.id === location.hash.slice(1));
  if (startIdx >= 0) open(startIdx);
  else if (location.hash === "#about") openAbout();

  // ---------------------------------------------------------------------------
  function buildWorld() {
    const T = window.THREE;
    const { G, H, HEIGHT, heightAt } = terrain;
    const HALF = WIDTH / 2;
    const EXT = HALF * 1.4; // the mesh reaches past the height map so the ground can run out into a flat plain

    // Build timeline (seconds): grid draws outward → terrain rises in a wave →
    // contours trace by elevation → summit beacons switch on.
    const GRID_END = 1.3, RISE_START = 1.2, RISE_SPREAD = 1.6, RISE_DUR = 0.9;
    const CONTOUR_START = 3.2, BEACON_START = 4.6, BUILD_END = 5.6;
    let buildT = reduceMotion ? BUILD_END : 0;
    let built = reduceMotion;

    const canvas = $("world");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 1500);

    const SEED = 7;
    function hash(x, y) {
      let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(SEED, 1442695041);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }
    // The map fades out along a soft, rounded outline (a gently wavy circle) instead of a square.
    // The outline bulges out towards the first project so its summit has open terrain around it,
    // but never past the edge of the height map.
    const first = terrain.tops[0];
    const firstA = Math.atan2(first.z, first.x);
    const edgeFade = (x, z) => {
      const a = Math.atan2(z, x);
      let da = Math.abs(a - firstA);
      if (da > Math.PI) da = Math.PI * 2 - da;
      const bulge = 1 + 0.6 * Math.exp(-(da * da) / 0.3);
      const mapEdge = EXT / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      const rim = Math.min(mapEdge, HALF * 0.9 * bulge * (1 + 0.05 * Math.sin(3 * a + 1) + 0.035 * Math.sin(5 * a + 2) + 0.02 * Math.sin(9 * a + 0.5)));
      const m = Math.hypot(x, z) / rim;
      const t = Math.min(1, Math.max(0, (1 - m) / 0.45));
      return t * t * (3 - 2 * t);
    };
    const sweepAt = (x, z) => (x + HALF) / WIDTH * 0.75 + (HALF - z) / WIDTH * 0.25;

    const uniforms = { uT: { value: buildT }, uMaxH: { value: HEIGHT } };

    // Shared GLSL: where the build wave is at this point of the map.
    const RISE_GLSL = `
      uniform float uT;
      uniform float uMaxH;
      attribute float aH;
      attribute float aSweep;
      float riseK() { return (uT - ${RISE_START.toFixed(2)} - aSweep * ${RISE_SPREAD.toFixed(2)}) / ${RISE_DUR.toFixed(2)}; }
      float riseAmt(float k) { return smoothstep(0.0, 1.0, clamp(k, 0.0, 1.0)); }
    `;

    // ---- Survey mesh: a jittered triangulated grid, densest at the summit --
    // The grid is built in a normalised square u,v ∈ [-1, 1] centred on the highest summit, then
    // pulled towards that centre: r' = r · (0.18 + 0.82 · r). Cells there are ~5.5× smaller than
    // in a plain grid and grow steadily to ~1.8× larger at the edges of the map.
    const N = isSmall() ? 140 : 200;
    const peak = terrain.tops[terrain.tops.length - 1];
    const warpAxis = (u, c) => (u >= 0 ? c + u * (EXT - c) : c + u * (EXT + c));
    const verts = [];
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      let u = (i / N) * 2 - 1, v = (j / N) * 2 - 1;
      if (i > 0 && i < N && j > 0 && j < N) {
        u += (hash(i, j * 3 + 1) - 0.5) * (2 / N) * 0.55;
        v += (hash(i, j * 3 + 2) - 0.5) * (2 / N) * 0.55;
      }
      const r = Math.max(Math.abs(u), Math.abs(v));
      if (r > 0) {
        const k = 0.18 + 0.82 * r; // r' / r
        u *= k;
        v *= k;
      }
      const x = warpAxis(u, peak.x), z = warpAxis(v, peak.z);
      verts.push({ x, z, h: heightAt(x, z) });
    }
    const vid = (i, j) => j * (N + 1) + i;

    const lp = [], lh = [], ls = [], lr = [], le = [];
    function pushVert(v) {
      lp.push(v.x, 0, v.z);
      lh.push(v.h);
      ls.push(sweepAt(v.x, v.z));
      lr.push(Math.hypot(v.x, v.z) / (HALF * 1.42));
      le.push(edgeFade(v.x, v.z));
    }
    function edge(a, b) { pushVert(verts[a]); pushVert(verts[b]); }
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      if (i < N) edge(vid(i, j), vid(i + 1, j));
      if (j < N) edge(vid(i, j), vid(i, j + 1));
      if (i < N && j < N) {
        if (hash(i, j + 999) > 0.5) edge(vid(i, j), vid(i + 1, j + 1));
        else edge(vid(i + 1, j), vid(i, j + 1));
      }
    }
    const wireGeo = new T.BufferGeometry();
    wireGeo.setAttribute("position", new T.Float32BufferAttribute(lp, 3));
    wireGeo.setAttribute("aH", new T.Float32BufferAttribute(lh, 1));
    wireGeo.setAttribute("aSweep", new T.Float32BufferAttribute(ls, 1));
    wireGeo.setAttribute("aRad", new T.Float32BufferAttribute(lr, 1));
    wireGeo.setAttribute("aEdge", new T.Float32BufferAttribute(le, 1));
    const wire = new T.LineSegments(wireGeo, new T.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: T.NormalBlending,
      vertexShader: RISE_GLSL + `
        attribute float aRad;
        attribute float aEdge;
        varying vec3 vC;
        varying float vA;
        void main() {
          float grid = clamp((uT - aRad * ${GRID_END.toFixed(2)}) / 0.3, 0.0, 1.0);
          float k = riseK();
          float rise = riseAmt(k);
          vec3 p = position;
          p.y = aH * rise;
          float hn = aH / uMaxH;
          // elevation ramp through the palette: tan valleys -> moss slopes -> kombu ridges -> café noir summits
          vec3 c = mix(vec3(0.812, 0.733, 0.600), vec3(0.533, 0.565, 0.388), smoothstep(0.02, 0.25, hn));
          c = mix(c, vec3(0.208, 0.251, 0.141), smoothstep(0.25, 0.6, hn));
          c = mix(c, vec3(0.298, 0.239, 0.098), smoothstep(0.6, 0.95, hn));
          c = mix(vec3(0.812, 0.733, 0.600), c, smoothstep(0.15, 0.85, aEdge)); // turn tan towards the map's rim
          float front = 1.0 - clamp(abs(k - 0.5) * 2.0, 0.0, 1.0);
          c = mix(mix(vec3(0.812, 0.733, 0.600), c, rise), vec3(0.208, 0.251, 0.141), front * 0.8);
          vA = grid * aEdge * (0.45 + 0.35 * rise + 0.3 * front);
          vC = c;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vC;
        varying float vA;
        void main() { gl_FragColor = vec4(vC, vA); }`,
    }));
    wire.renderOrder = 2;
    scene.add(wire);

    // Dark surface under the lines so the far side of the mountain doesn't show through.
    const sp = [], sh = [], ss = [], idx = [];
    verts.forEach((v) => { sp.push(v.x, 0, v.z); sh.push(v.h); ss.push(sweepAt(v.x, v.z)); });
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = vid(i, j), b = vid(i + 1, j), c = vid(i + 1, j + 1), d = vid(i, j + 1);
      if (hash(i, j + 999) > 0.5) idx.push(a, d, c, a, c, b);
      else idx.push(a, d, b, b, d, c);
    }
    const surfGeo = new T.BufferGeometry();
    surfGeo.setAttribute("position", new T.Float32BufferAttribute(sp, 3));
    surfGeo.setAttribute("aH", new T.Float32BufferAttribute(sh, 1));
    surfGeo.setAttribute("aSweep", new T.Float32BufferAttribute(ss, 1));
    surfGeo.setIndex(idx);
    const surface = new T.Mesh(surfGeo, new T.ShaderMaterial({
      uniforms,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 2,
      colorWrite: false, // only fills the depth buffer: the lines behind it disappear
      vertexShader: RISE_GLSL + `
        void main() {
          vec3 p = position;
          p.y = aH * riseAmt(riseK()) - 0.25;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.0); }`,
    }));
    surface.renderOrder = 1;
    scene.add(surface);

    // ---- Contour lines (marching squares on the height map) ---------------
    const LEVELS = 16;
    const cp = [], cl = [], cs = [], ce = [];
    const CASES = [[], [3, 0], [0, 1], [3, 1], [1, 2], [3, 0, 1, 2], [0, 2], [3, 2], [2, 3], [0, 2], [0, 1, 2, 3], [1, 2], [1, 3], [0, 1], [3, 0], []];
    const { toX } = terrain;
    for (let li = 1; li < LEVELS; li++) {
      const L = (li / LEVELS) * HEIGHT;
      for (let gz = 0; gz < G - 1; gz++) for (let gx = 0; gx < G - 1; gx++) {
        const ha = H[gz * G + gx], hb = H[gz * G + gx + 1], hc = H[(gz + 1) * G + gx + 1], hd = H[(gz + 1) * G + gx];
        const c = (ha > L) | ((hb > L) << 1) | ((hc > L) << 2) | ((hd > L) << 3);
        const segs = CASES[c];
        if (!segs.length) continue;
        const pt = (e) => {
          const [x1, z1, h1, x2, z2, h2] =
            e === 0 ? [gx, gz, ha, gx + 1, gz, hb] :
            e === 1 ? [gx + 1, gz, hb, gx + 1, gz + 1, hc] :
            e === 2 ? [gx + 1, gz + 1, hc, gx, gz + 1, hd] : [gx, gz + 1, hd, gx, gz, ha];
          const t = (L - h1) / (h2 - h1);
          return [toX(x1 + (x2 - x1) * t), toX(z1 + (z2 - z1) * t)];
        };
        for (let s = 0; s < segs.length; s += 2) {
          for (const e of [segs[s], segs[s + 1]]) {
            const [x, z] = pt(e);
            cp.push(x, 0, z);
            cl.push(li / LEVELS);
            cs.push(sweepAt(x, z));
            ce.push(edgeFade(x, z));
          }
        }
      }
    }
    const contourGeo = new T.BufferGeometry();
    contourGeo.setAttribute("position", new T.Float32BufferAttribute(cp, 3));
    contourGeo.setAttribute("aLevel", new T.Float32BufferAttribute(cl, 1));
    contourGeo.setAttribute("aSweep", new T.Float32BufferAttribute(cs, 1));
    contourGeo.setAttribute("aEdge", new T.Float32BufferAttribute(ce, 1));
    const contours = new T.LineSegments(contourGeo, new T.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: T.NormalBlending,
      vertexShader: `
        uniform float uT;
        uniform float uMaxH;
        attribute float aLevel;
        attribute float aSweep;
        attribute float aEdge;
        varying float vA;
        void main() {
          float k = (uT - ${CONTOUR_START.toFixed(2)} - aLevel * 1.1 - aSweep * 0.3) / 0.35;
          float on = clamp(k, 0.0, 1.0);
          float flash = 1.0 - clamp(abs(k - 0.6) * 1.6, 0.0, 1.0);
          float index = mod(floor(aLevel * ${LEVELS}.0 + 0.5), 4.0) < 0.5 ? 0.32 : 0.15; // every 4th line is an index contour
          vA = aEdge * (on * index + flash * 0.35);
          vec3 p = position;
          p.y = aLevel * uMaxH + 0.35;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        varying float vA;
        void main() { gl_FragColor = vec4(0.298, 0.239, 0.098, vA); } // café noir #4c3d19`,
    }));
    contours.renderOrder = 3;
    scene.add(contours);

    // ---- Summit beacons ---------------------------------------------------
    // One tag is active at a time: the hovered one, otherwise the selected one.
    let hovered = -1;
    function refreshActive() {
      const a = hovered >= 0 ? hovered : current;
      stops.forEach((st, k) => st.tagEl && st.tagEl.classList.toggle("active", k === a));
    }
    const beacons = stops.map((s, i) => {
      const grp = new T.Group();
      grp.position.set(s.top.x, s.top.y, s.top.z);
      const col = s.kind === "about" ? 0x4c3d19 : 0x354024;
      const ringPts = [];
      for (let k = 0; k < 48; k++) {
        const a1 = (k / 48) * Math.PI * 2, a2 = ((k + 1) / 48) * Math.PI * 2;
        if (k % 4 === 3) continue; // dashed ring
        ringPts.push(Math.cos(a1) * 3, 0.4, Math.sin(a1) * 3, Math.cos(a2) * 3, 0.4, Math.sin(a2) * 3);
      }
      const ringMat = new T.LineBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false });
      const ring = new T.LineSegments(new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute(ringPts, 3)), ringMat);
      grp.add(ring);
      grp.userData = { ringMat, ring, start: BEACON_START + i * 0.12 };
      scene.add(grp);
      s.labelPos = new T.Vector3(s.top.x, s.top.y, s.top.z);

      // Marker (always visible) + side label (only while active).
      const num = s.kind === "about" ? "▲" : String(i + 1).padStart(2, "0");
      const name = s.kind === "about" ? "About me" : s.data.title;
      const line1 = (s.kind === "about" ? "SUMMIT" : num) + " — " + fmt(s.metres).toUpperCase();
      const tag = document.createElement("div");
      tag.className = "peak-tag hidden";
      tag.innerHTML =
        '<button type="button" class="tag-marker" aria-label="' + esc((s.kind === "about" ? "" : num + " ") + name) + '">' +
        '<span class="tag-num" aria-hidden="true">' + esc(num) + "</span></button>" +
        '<a class="tag-label" href="#' + esc(s.id) + '" tabindex="-1"><span class="tag-alt">' + esc(line1) + '</span>' +
        '<span class="tag-name">' + esc(name) + "</span></a>";
      tag.querySelector(".tag-marker").addEventListener("click", () => open(i));
      tag.querySelector(".tag-label").addEventListener("click", (e) => { e.preventDefault(); open(i); });
      tag.addEventListener("pointerenter", () => { hovered = i; refreshActive(); });
      tag.addEventListener("pointerleave", () => { if (hovered === i) hovered = -1; refreshActive(); });
      tag.querySelector(".tag-marker").addEventListener("focus", () => { hovered = i; refreshActive(); });
      tag.querySelector(".tag-marker").addEventListener("blur", () => { if (hovered === i) hovered = -1; refreshActive(); });
      $("labels").appendChild(tag);
      s.tagEl = tag;
      return grp;
    });

    // ---- Camera rig --------------------------------------------------------
    const portrait = () => innerWidth / innerHeight < 1;
    const baseRadius = WIDTH * 0.8;
    const overviewRadius = () => (portrait() ? baseRadius * Math.pow(innerHeight / innerWidth, 0.6) : baseRadius);
    function fitLens() { camera.fov = portrait() ? 54 : 42; }
    // Frame the whole route: aim at the middle of all the summits, not the middle of the map.
    const mid = stops.reduce((m, s) => ({ x: m.x + s.top.x / stops.length, z: m.z + s.top.z / stops.length }), { x: 0, z: 0 });
    const OVERVIEW = { target: new T.Vector3(mid.x, HEIGHT * 0.4, mid.z), radius: overviewRadius(), theta: 0.12, phi: 1.08 };
    fitLens();
    const want = { target: OVERVIEW.target.clone(), radius: OVERVIEW.radius, theta: OVERVIEW.theta, phi: OVERVIEW.phi, offX: 0, offY: 0 };
    const cur = reduceMotion
      ? { target: want.target.clone(), radius: want.radius, theta: want.theta, phi: want.phi, offX: 0, offY: 0 }
      : { target: OVERVIEW.target.clone(), radius: OVERVIEW.radius * 1.12, theta: -0.75, phi: 0.78, offX: 0, offY: 0 };
    let lastInput = performance.now();
    let focus = -1;

    function setOffsets() {
      if (focus < 0) { want.offX = 0; want.offY = 0; return; }
      if (isSmall()) { want.offX = 0; want.offY = innerHeight * 0.2; }
      else { want.offX = Math.min($("panel").getBoundingClientRect().width || 440, innerWidth) / 2; want.offY = 0; }
    }
    function nearestAngle(from, to) {
      while (to - from > Math.PI) to -= Math.PI * 2;
      while (to - from < -Math.PI) to += Math.PI * 2;
      return to;
    }
    function flyTo(i) {
      skipBuild();
      focus = i;
      const s = stops[i];
      want.target.set(s.top.x, s.top.y + 3, s.top.z);
      want.radius = (s.kind === "about" ? 95 : 85) * (portrait() ? 1.3 : 1);
      // Look down on the summit from high above, like reading a map, so no ridge can hide it.
      want.theta = nearestAngle(cur.theta, OVERVIEW.theta + (s.top.x / WIDTH) * 0.6);
      want.phi = 0.5;
      setOffsets();
      refreshActive();
      lastInput = performance.now();
      if (reduceMotion) snap();
    }
    function overview() {
      focus = -1;
      want.target.copy(OVERVIEW.target);
      want.radius = OVERVIEW.radius;
      want.phi = OVERVIEW.phi;
      want.theta = nearestAngle(cur.theta, OVERVIEW.theta);
      setOffsets();
      refreshActive();
      if (reduceMotion) snap();
    }
    function snap() {
      cur.target.copy(want.target);
      cur.radius = want.radius; cur.theta = want.theta; cur.phi = want.phi; cur.offX = want.offX; cur.offY = want.offY;
    }
    function skipBuild() {
      if (built) return;
      buildT = BUILD_END;
      built = true;
    }

    // ---- Input: drag to orbit, wheel / pinch to zoom; any input skips the build.
    const pointers = new Map();
    let pinchDist = 0, moved = 0;
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      canvas.classList.add("dragging");
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      prev.x = e.clientX; prev.y = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastInput = performance.now();
      if (moved > 6) { skipBuild(); hideHint(); }
      if (pointers.size === 1) {
        want.theta -= dx * 0.005;
        want.phi = Math.min(1.45, Math.max(0.35, want.phi - dy * 0.004));
      } else if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (pinchDist) zoom(pinchDist / d);
        pinchDist = d;
      }
    });
    const endPointer = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (!pointers.size) canvas.classList.remove("dragging");
    };
    canvas.addEventListener("pointerup", (e) => {
      if (moved < 6 && pointers.size === 1) {
        if (!built) skipBuild();
        else pick(e.clientX, e.clientY);
      }
      endPointer(e);
    });
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      skipBuild();
      zoom(1 + Math.max(-0.3, Math.min(0.3, e.deltaY * 0.0012)));
      lastInput = performance.now();
      hideHint();
    }, { passive: false });
    addEventListener("keydown", skipBuild);
    function zoom(f) {
      want.radius = Math.min(OVERVIEW.radius * 1.5, Math.max(22, want.radius * f));
    }

    // Click near a summit to open it: march along the ray until it dips below the terrain.
    const ray = new T.Raycaster();
    const ndc = new T.Vector2();
    const probe = new T.Vector3();
    function pick(x, y) {
      ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      let hit = null;
      for (let d = 1; d < 900; d += 1.5) {
        probe.copy(ray.ray.direction).multiplyScalar(d).add(ray.ray.origin);
        if (probe.y < heightAt(probe.x, probe.z)) { hit = probe; break; }
      }
      if (!hit) return;
      let best = -1, bd = 1e9;
      stops.forEach((s, i) => {
        const d = Math.hypot(hit.x - s.top.x, hit.z - s.top.z);
        if (d < 14 && d < bd) { bd = d; best = i; }
      });
      if (best >= 0) open(best);
    }

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      fitLens();
      OVERVIEW.radius = overviewRadius();
      if (focus < 0) want.radius = OVERVIEW.radius;
      camera.updateProjectionMatrix();
      setOffsets();
    }
    addEventListener("resize", resize);

    // ---- Loop --------------------------------------------------------------
    const hintEl = $("hint");
    const tmp = new T.Vector3();
    let last = performance.now();
    let appliedOffset = false;
    function frame(now) {
      const realDt = Math.max(0, (now - last) / 1000);
      const dt = Math.min(0.05, realDt);
      last = now;
      const t = now / 1000;

      if (!built) {
        buildT += Math.min(0.1, realDt);
        if (buildT >= BUILD_END) { buildT = BUILD_END; built = true; }
        const stage = buildT < RISE_START ? "Laying out the survey grid" : buildT < CONTOUR_START ? "Mapping the terrain" : buildT < BEACON_START ? "Tracing contour lines" : "Marking summits";
        if (!hintGone) hintEl.textContent = stage + " · " + Math.round((buildT / BUILD_END) * 100) + "%";
      } else if (!hintGone && hintEl.textContent !== hintText) {
        hintEl.textContent = hintText;
      }
      uniforms.uT.value = buildT;

      beacons.forEach((g, i) => {
        const u = g.userData;
        const on = Math.min(1, Math.max(0, (buildT - u.start) / 0.4));
        u.ringMat.opacity = on * (0.6 + 0.4 * Math.sin(t * 2.4 + i));
        u.ring.rotation.y = t * 0.6;
        const pulse = 1 + 0.15 * Math.sin(t * 2.4 + i);
        u.ring.scale.set(pulse, 1, pulse);
        stops[i].tagEl.classList.toggle("hidden", on < 0.5 || stops[i].offscreen);
      });

      if (!reduceMotion && built && focus < 0 && !pointers.size && now - lastInput > 5000) want.theta += dt * 0.025;

      // During the build the camera drifts slowly into place; afterwards it follows input briskly.
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * (built ? 2.6 : 0.7));
      cur.target.lerp(want.target, k);
      cur.radius += (want.radius - cur.radius) * k;
      cur.theta += (want.theta - cur.theta) * k;
      cur.phi += (want.phi - cur.phi) * k;
      cur.offX += (want.offX - cur.offX) * k;
      cur.offY += (want.offY - cur.offY) * k;

      const sphi = Math.sin(cur.phi);
      camera.position.set(
        cur.target.x + cur.radius * sphi * Math.sin(cur.theta),
        cur.target.y + cur.radius * Math.cos(cur.phi),
        cur.target.z + cur.radius * sphi * Math.cos(cur.theta)
      );
      const ground = heightAt(camera.position.x, camera.position.z) + 4;
      if (camera.position.y < ground) camera.position.y = ground;
      camera.lookAt(cur.target);

      if (Math.abs(cur.offX) > 0.5 || Math.abs(cur.offY) > 0.5) {
        camera.setViewOffset(innerWidth, innerHeight, cur.offX, cur.offY, innerWidth, innerHeight);
        appliedOffset = true;
      } else if (appliedOffset) {
        camera.clearViewOffset();
        appliedOffset = false;
      }

      renderer.render(scene, camera);

      stops.forEach((s) => {
        tmp.copy(s.labelPos).project(camera);
        s.offscreen = tmp.z > 1 || tmp.x < -1.2 || tmp.x > 1.2 || tmp.y < -1.2 || tmp.y > 1.2;
        if (s.offscreen) return;
        const x = (tmp.x * 0.5 + 0.5) * innerWidth;
        const y = (-tmp.y * 0.5 + 0.5) * innerHeight;
        s.tagEl.style.transform = "translate(" + (x - 12).toFixed(1) + "px," + (y - 34).toFixed(1) + "px)";
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return { flyTo, overview };
  }
})();
