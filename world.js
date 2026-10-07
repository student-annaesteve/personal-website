(function () {
  "use strict";

  const PROJECTS = window.PROJECTS || [];
  const ABOUT = window.ABOUT || {};
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = () => innerWidth <= 720;
  const isTouch = matchMedia("(pointer: coarse)").matches;

  // ---------------------------------------------------------------------------
  // Stops on the route: one per project, then the summit (About me).
  // ---------------------------------------------------------------------------
  const n = PROJECTS.length;
  const stops = PROJECTS.map((p, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5;
    return {
      kind: "project",
      data: p,
      id: "peak-" + (i + 1),
      x: -72 + 144 * t,
      z: 10 - 20 * Math.sin(t * Math.PI) + (i % 2 ? -9 : 7),
      h: 25 + 15 * t,
      r: 17,
      color: p.color || "#d8402f",
    };
  });
  stops.push({
    kind: "about",
    data: ABOUT,
    id: "summit",
    x: 8,
    z: -62,
    h: 52,
    r: 28,
    color: "#ffffff",
  });

  const toMetres = (y) => Math.round((800 + y * 68) / 10) * 10;
  const fmt = (m) => m.toLocaleString("en-US") + " m";

  // ---------------------------------------------------------------------------
  // DOM: trail sign, header, panel. Works even if WebGL is unavailable.
  // ---------------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  $("name").textContent = ABOUT.name || "";
  $("tagline").textContent = ABOUT.tagline || "";
  if (isTouch) $("hint").textContent = "Drag to look around · Pinch to zoom · Pick a summit";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const list = $("trail-list");
  stops.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sign" + (s.kind === "about" ? " summit" : "");
    b.innerHTML =
      '<span class="sign-name">' + esc(s.kind === "about" ? "Summit · About me" : s.data.title) + "</span>" +
      '<span class="sign-alt"></span>';
    b.addEventListener("click", () => open(i));
    s.signEl = b;
    li.appendChild(b);
    list.appendChild(li);
  });
  $("about-btn").addEventListener("click", () => open(stops.length - 1));

  const panel = $("panel");
  const panelBody = $("panel-body");
  let current = -1;

  function placeholderFrames(color, count) {
    let html = "";
    for (let k = 0; k < count; k++) {
      const a = 18 + k * 22;
      html +=
        '<div class="frame" style="background:linear-gradient(' + (135 + k * 40) + "deg," +
        esc(color) + ", hsl(" + a + " 35% 22%))\">Image " + (k + 1) + "</div>";
    }
    return html;
  }

  function renderPanel(i) {
    const s = stops[i];
    const d = s.data;
    const alt = s.metres ? "▲ " + fmt(s.metres) : "";
    let html = "";
    if (s.kind === "project") {
      const imgs = (d.images || [])
        .map((im) => '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || "") + '" loading="lazy">')
        .join("");
      html +=
        '<p class="panel-alt">' + alt + " · Summit " + (i + 1) + " of " + n + "</p>" +
        "<h2>" + esc(d.title) + "</h2>" +
        '<div class="meta">' + (d.year ? "<span>" + esc(d.year) + "</span>" : "") +
        (d.tags || []).map((t) => '<span class="chip">' + esc(t) + "</span>").join("") + "</div>" +
        '<div class="gallery">' + (imgs || placeholderFrames(s.color, 3)) + "</div>" +
        "<p>" + esc(d.description) + "</p>" +
        (d.link ? '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">View the full project →</a>' : "");
    } else {
      const initials = (d.name || "").split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2);
      html +=
        '<p class="panel-alt">' + alt + " · The summit</p>" +
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
    const prev = i > 0 ? stops[i - 1] : null;
    const next = i < stops.length - 1 ? stops[i + 1] : null;
    const label = (st) => (st.kind === "about" ? "Summit" : st.data.title);
    html +=
      '<nav class="panel-nav">' +
      (prev ? '<button type="button" data-go="' + (i - 1) + '">↓ ' + esc(label(prev)) + "</button>" : "<span></span>") +
      (next ? '<button type="button" data-go="' + (i + 1) + '">' + esc(label(next)) + " ↑</button>" : "") +
      "</nav>";
    panelBody.innerHTML = html;
    panelBody.querySelectorAll("[data-go]").forEach((b) =>
      b.addEventListener("click", () => open(+b.dataset.go))
    );
    const copy = $("copy-email");
    if (copy) {
      copy.addEventListener("click", () => {
        const done = () => (copy.textContent = "Copied");
        try {
          navigator.clipboard.writeText(d.email).then(done, selectEmail);
        } catch (e) {
          selectEmail();
        }
      });
    }
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
    renderPanel(i);
    panel.hidden = false;
    panel.classList.remove("closing");
    panel.scrollTop = 0;
    stops.forEach((s, k) => s.signEl.setAttribute("aria-current", k === i ? "true" : "false"));
    try { history.replaceState(null, "", "#" + stops[i].id); } catch (e) {}
    hideHint();
    if (world) world.flyTo(i);
  }
  function close() {
    if (current < 0) return;
    current = -1;
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
  if (window.THREE && webglOK()) {
    try {
      world = buildWorld();
    } catch (e) {
      console.error(e);
      world = null;
    }
  }
  if (!world) {
    document.body.classList.add("no-webgl");
    stops.forEach((s) => {
      s.metres = toMetres(s.h);
      s.signEl.querySelector(".sign-alt").textContent = fmt(s.metres);
    });
  }

  const startId = location.hash.slice(1);
  const startIdx = stops.findIndex((s) => s.id === startId);
  if (startIdx >= 0) setTimeout(() => open(startIdx), world && !reduceMotion ? 1200 : 0);

  // ---------------------------------------------------------------------------
  function buildWorld() {
    const T = window.THREE;
    const canvas = $("world");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);

    const scene = new T.Scene();
    const HORIZON = 0xf0b48c;
    scene.fog = new T.Fog(HORIZON, 140, 380);

    // Sky: a vertical gradient from deep blue to the golden-hour horizon.
    const sky = document.createElement("canvas");
    sky.width = 4;
    sky.height = 512;
    const g = sky.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#16223d");
    grad.addColorStop(0.38, "#3f5684");
    grad.addColorStop(0.68, "#a99bb3");
    grad.addColorStop(0.86, "#f0b48c");
    grad.addColorStop(1, "#f6cfa3");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 512);
    scene.background = new T.CanvasTexture(sky);

    const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 900);

    // Light: low warm sun from the left-back, cool sky fill.
    scene.add(new T.HemisphereLight(0xb9c8ff, 0x4a3b30, 0.75));
    const sun = new T.DirectionalLight(0xffd2a6, 1.35);
    sun.position.set(-120, 70, -60);
    scene.add(sun);
    const rim = new T.DirectionalLight(0x8fa6ff, 0.25);
    rim.position.set(80, 40, 120);
    scene.add(rim);

    // ---- Noise -------------------------------------------------------------
    const SEED = 7;
    function hash(x, y) {
      let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(SEED, 1442695041);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }
    function noise(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y) {
      let s = 0, a = 0.5, f = 1;
      for (let i = 0; i < 4; i++) { s += a * noise(x * f, y * f); f *= 2; a *= 0.5; }
      return s;
    }
    function ridged(x, y) {
      let s = 0, a = 0.55, f = 1;
      for (let i = 0; i < 4; i++) {
        const k = 1 - Math.abs(noise(x * f, y * f) * 2 - 1);
        s += a * k * k; f *= 2.03; a *= 0.5;
      }
      return s;
    }
    const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

    function baseHeight(x, z) {
      let h = ridged(x * 0.011 + 11.3, z * 0.011 + 4.1) * 30 - 8;
      h += fbm(x * 0.05 + 2, z * 0.05 + 9) * 5;
      return h;
    }
    // Each stop gets a lift so its top lands at its planned height.
    stops.forEach((s) => (s.lift = s.h - baseHeight(s.x, s.z)));
    function heightAt(x, z) {
      let h = baseHeight(x, z);
      for (const s of stops) {
        const d = Math.hypot(x - s.x, z - s.z) / s.r;
        h += s.lift * Math.exp(-Math.pow(d, 1.5)) * (0.9 + 0.2 * noise(x * 0.08 + s.x, z * 0.08));
      }
      // Open valley towards the viewer, with room for a lake.
      const valley = smooth(30, 100, z);
      h = h * (1 - valley * 0.8) + valley * -0.5;
      return h;
    }

    // ---- Terrain -----------------------------------------------------------
    const SIZE = 420;
    const SEG = isSmall() ? 120 : 180;
    let geo = new T.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const cell = SIZE / SEG;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), z = pos.getZ(i);
      if (Math.abs(x) < SIZE / 2 - 1 && Math.abs(z) < SIZE / 2 - 1) {
        x += (hash(i, 1) - 0.5) * cell * 0.5;
        z += (hash(i, 2) - 0.5) * cell * 0.5;
      }
      pos.setXYZ(i, x, heightAt(x, z), z);
    }
    // Flag spot = highest vertex near each planned summit.
    stops.forEach((s) => {
      let best = -1e9, bx = s.x, bz = s.z;
      const lim = s.r * 0.6;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        if (Math.abs(x - s.x) > lim || Math.abs(z - s.z) > lim) continue;
        const y = pos.getY(i);
        if (y > best) { best = y; bx = x; bz = z; }
      }
      s.top = new T.Vector3(bx, best, bz);
      s.metres = toMetres(best);
      s.signEl.querySelector(".sign-alt").textContent = fmt(s.metres);
    });

    geo = geo.toNonIndexed();
    const p = geo.attributes.position;
    const colors = new Float32Array(p.count * 3);
    const cMeadow = new T.Color("#7d8f4a"), cForest = new T.Color("#2c4632"), cForest2 = new T.Color("#3b5a3a");
    const cRock = new T.Color("#7b6f66"), cRock2 = new T.Color("#5a524e"), cSnow = new T.Color("#f4f0ea");
    const cShore = new T.Color("#a49a72");
    const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), nrm = new T.Vector3();
    const col = new T.Color();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      nrm.subVectors(c, b).cross(b.clone().sub(a)).normalize();
      const up = Math.abs(nrm.y);
      const y = (a.y + b.y + c.y) / 3;
      const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
      const j = hash(Math.floor(cx * 3), Math.floor(cz * 3));
      const snowLine = 24 + noise(cx * 0.05, cz * 0.05) * 8;
      if (y > snowLine && up > 0.62) col.copy(cSnow).offsetHSL(0, 0, -j * 0.05);
      else if (up < 0.68 || y > snowLine - 4) col.copy(j > 0.5 ? cRock : cRock2).offsetHSL(0, 0, (j - 0.5) * 0.06);
      else if (y < 1.6) col.copy(cShore);
      else if (y < 6) col.copy(cMeadow).lerp(cForest2, j * 0.5);
      else col.copy(j > 0.4 ? cForest : cForest2);
      for (let k = 0; k < 3; k++) { colors[(i + k) * 3] = col.r; colors[(i + k) * 3 + 1] = col.g; colors[(i + k) * 3 + 2] = col.b; }
    }
    geo.setAttribute("color", new T.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const terrain = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 }));
    scene.add(terrain);

    // Lake in the valley.
    const lake = new T.Mesh(
      new T.CircleGeometry(SIZE / 2, 48),
      new T.MeshStandardMaterial({ color: 0x5f86a8, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.88, flatShading: true })
    );
    lake.rotation.x = -Math.PI / 2;
    lake.position.y = 0.9;
    scene.add(lake);

    // ---- Pine trees (instanced cones) -------------------------------------
    const TREES = isSmall() ? 700 : 1500;
    const treeGeo = new T.ConeGeometry(0.9, 3.2, 5);
    treeGeo.translate(0, 1.4, 0);
    const trees = new T.InstancedMesh(treeGeo, new T.MeshStandardMaterial({ flatShading: true, roughness: 1 }), TREES);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), tp = new T.Vector3();
    const tc = new T.Color();
    let placed = 0, tries = 0;
    while (placed < TREES && tries < TREES * 20) {
      tries++;
      const x = (hash(tries, 11) - 0.5) * 300, z = (hash(tries, 12) - 0.5) * 300 + 20;
      const y = heightAt(x, z);
      if (y < 2 || y > 15) continue;
      const slope = Math.abs(heightAt(x + 1, z) - y) + Math.abs(heightAt(x, z + 1) - y);
      if (slope > 1.4) continue;
      if (fbm(x * 0.04 + 50, z * 0.04) < 0.42) continue; // clustered forests
      const s = 0.7 + hash(tries, 13) * 0.8;
      tp.set(x, y - 0.4, z);
      q.setFromAxisAngle(new T.Vector3(0, 1, 0), hash(tries, 14) * 6.28);
      sc.set(s, s * (0.9 + hash(tries, 15) * 0.5), s);
      m4.compose(tp, q, sc);
      trees.setMatrixAt(placed, m4);
      trees.setColorAt(placed, tc.set(hash(tries, 16) > 0.5 ? "#21382a" : "#2f4b30"));
      placed++;
    }
    trees.count = placed;
    scene.add(trees);

    // ---- Clouds ------------------------------------------------------------
    const cloudMat = new T.MeshStandardMaterial({ color: 0xfff4ea, flatShading: true, roughness: 1, transparent: true, opacity: 0.92 });
    const puff = new T.IcosahedronGeometry(1, 0);
    const clouds = [];
    for (let k = 0; k < 9; k++) {
      const grp = new T.Group();
      const parts = 4 + Math.floor(hash(k, 21) * 4);
      for (let j = 0; j < parts; j++) {
        const m = new T.Mesh(puff, cloudMat);
        const s = 3 + hash(k * 9 + j, 22) * 4;
        m.scale.set(s * 1.4, s * 0.8, s);
        m.position.set(j * 4.5 - parts * 2, hash(k * 9 + j, 23) * 2, (hash(k * 9 + j, 24) - 0.5) * 5);
        grp.add(m);
      }
      grp.position.set((hash(k, 25) - 0.5) * 360, 58 + hash(k, 26) * 22, -150 + hash(k, 27) * 220);
      grp.userData.speed = 1.2 + hash(k, 28) * 1.8;
      scene.add(grp);
      clouds.push(grp);
    }

    // ---- Flags -------------------------------------------------------------
    const poleMat = new T.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 });
    const poleGeo = new T.CylinderGeometry(0.13, 0.13, 6, 6);
    poleGeo.translate(0, 3, 0);
    const cairnMat = new T.MeshStandardMaterial({ color: 0x8a8079, flatShading: true });
    const flags = stops.map((s) => {
      const grp = new T.Group();
      grp.position.copy(s.top);
      grp.add(new T.Mesh(poleGeo, poleMat));
      for (let k = 0; k < 3; k++) {
        const st = new T.Mesh(new T.DodecahedronGeometry(0.9 - k * 0.22, 0), cairnMat);
        st.position.y = k * 0.75 - 0.2;
        st.rotation.y = k;
        grp.add(st);
      }
      const big = s.kind === "about";
      const cloth = new T.PlaneGeometry(big ? 4 : 3.2, big ? 2.4 : 1.9, 8, 1);
      cloth.translate(big ? 2 : 1.6, big ? 4.7 : 5, 0);
      const flag = new T.Mesh(cloth, new T.MeshStandardMaterial({ color: s.color, side: T.DoubleSide, flatShading: true, roughness: 0.8 }));
      grp.add(flag);
      grp.userData.base = Float32Array.from(cloth.attributes.position.array);
      grp.userData.cloth = cloth;
      scene.add(grp);
      s.labelPos = s.top.clone().add(new T.Vector3(0, big ? 8.5 : 8, 0));
      return grp;
    });

    // ---- Floating tags -----------------------------------------------------
    const labelsEl = $("labels");
    stops.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "peak-tag";
      b.innerHTML = '<span class="tag-alt">▲ ' + fmt(s.metres) + '</span><span class="tag-name">' +
        esc(s.kind === "about" ? "About me" : s.data.title) + "</span>";
      b.addEventListener("click", () => open(i));
      labelsEl.appendChild(b);
      s.tagEl = b;
    });

    // ---- Camera rig --------------------------------------------------------
    // Portrait screens see less of the range, so step back and widen the lens.
    const portrait = () => innerWidth / innerHeight < 1;
    const overviewRadius = () => (portrait() ? 158 * Math.pow(innerHeight / innerWidth, 0.6) : 158);
    function fitLens() {
      camera.fov = portrait() ? 54 : 42;
      const r = overviewRadius();
      scene.fog.near = r * 0.9;
      scene.fog.far = r + 240;
    }
    fitLens();
    const OVERVIEW = { target: new T.Vector3(0, 12, -14), radius: overviewRadius(), theta: 0.08, phi: 1.2 };
    const want = { target: OVERVIEW.target.clone(), radius: OVERVIEW.radius, theta: OVERVIEW.theta, phi: OVERVIEW.phi, offX: 0, offY: 0 };
    const cur = reduceMotion
      ? { target: want.target.clone(), radius: want.radius, theta: want.theta, phi: want.phi, offX: 0, offY: 0 }
      : { target: new T.Vector3(0, 30, 10), radius: 260, theta: -0.5, phi: 1.42, offX: 0, offY: 0 };
    let lastInput = performance.now();
    let focus = -1;

    function setOffsets() {
      if (focus < 0) { want.offX = 0; want.offY = 0; return; }
      if (isSmall()) { want.offX = 0; want.offY = innerHeight * 0.24; }
      else { want.offX = Math.min(440, innerWidth) / 2; want.offY = 0; }
    }
    function nearestAngle(from, to) {
      while (to - from > Math.PI) to -= Math.PI * 2;
      while (to - from < -Math.PI) to += Math.PI * 2;
      return to;
    }
    function flyTo(i) {
      focus = i;
      const s = stops[i];
      want.target.copy(s.top).add(new T.Vector3(0, s.kind === "about" ? 2 : 1, 0));
      want.radius = (s.kind === "about" ? 60 : 44) * (portrait() ? 1.35 : 1);
      want.theta = nearestAngle(cur.theta, Math.atan2(s.top.x * 0.45, 100) + 0.25);
      want.phi = 1.18;
      setOffsets();
      stops.forEach((st, k) => st.tagEl.classList.toggle("dim", k !== i));
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
      stops.forEach((st) => st.tagEl.classList.remove("dim"));
      if (reduceMotion) snap();
    }
    function snap() {
      cur.target.copy(want.target);
      cur.radius = want.radius; cur.theta = want.theta; cur.phi = want.phi; cur.offX = want.offX; cur.offY = want.offY;
    }

    // Pointer: drag to orbit, wheel / pinch to zoom.
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
      hideHint();
      if (pointers.size === 1) {
        want.theta -= dx * 0.005;
        want.phi = Math.min(1.45, Math.max(0.45, want.phi - dy * 0.004));
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
      if (moved < 6 && pointers.size === 1) pick(e.clientX, e.clientY);
      endPointer(e);
    });
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoom(1 + Math.max(-0.3, Math.min(0.3, e.deltaY * 0.0012)));
      lastInput = performance.now();
      hideHint();
    }, { passive: false });
    function zoom(f) {
      want.radius = Math.min(OVERVIEW.radius * 1.5, Math.max(22, want.radius * f));
    }

    // Click a flag or near a summit to open it.
    const ray = new T.Raycaster();
    const ndc = new T.Vector2();
    function pick(x, y) {
      ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(flags, true);
      if (hits.length) {
        const g = hits[0].object.parent;
        const i = flags.indexOf(g);
        if (i >= 0) return open(i);
      }
      const th = ray.intersectObject(terrain);
      if (!th.length) return;
      const pt = th[0].point;
      let best = -1, bd = 1e9;
      stops.forEach((s, i) => {
        const d = Math.hypot(pt.x - s.top.x, pt.z - s.top.z);
        if (d < s.r * 0.45 && d < bd) { bd = d; best = i; }
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
    const tmp = new T.Vector3();
    let last = performance.now();
    let appliedOffset = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      if (!reduceMotion && focus < 0 && !pointers.size && now - lastInput > 5000) want.theta += dt * 0.025;

      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.6);
      cur.target.lerp(want.target, k);
      cur.radius += (want.radius - cur.radius) * k;
      cur.theta += (want.theta - cur.theta) * k;
      cur.phi += (want.phi - cur.phi) * k;
      cur.offX += (want.offX - cur.offX) * k;
      cur.offY += (want.offY - cur.offY) * k;

      const sp = Math.sin(cur.phi);
      camera.position.set(
        cur.target.x + cur.radius * sp * Math.sin(cur.theta),
        cur.target.y + cur.radius * Math.cos(cur.phi),
        cur.target.z + cur.radius * sp * Math.cos(cur.theta)
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

      // Flags wave in the wind.
      if (!reduceMotion) {
        flags.forEach((f, fi) => {
          const geo = f.userData.cloth, base = f.userData.base, arr = geo.attributes.position.array;
          for (let v = 0; v < arr.length; v += 3) {
            const along = base[v] - base[0];
            arr[v + 2] = Math.sin(t * 3.2 + along * 1.6 + fi) * 0.18 * along;
          }
          geo.attributes.position.needsUpdate = true;
        });
        clouds.forEach((cg) => {
          cg.position.x += cg.userData.speed * dt;
          if (cg.position.x > 200) cg.position.x = -200;
        });
      }

      renderer.render(scene, camera);

      // Position HTML tags over the flags.
      stops.forEach((s) => {
        tmp.copy(s.labelPos).project(camera);
        const el = s.tagEl;
        if (tmp.z > 1 || tmp.x < -1.2 || tmp.x > 1.2 || tmp.y < -1.2 || tmp.y > 1.2) {
          el.classList.add("hidden");
          return;
        }
        el.classList.remove("hidden");
        const x = (tmp.x * 0.5 + 0.5) * innerWidth;
        const y = (-tmp.y * 0.5 + 0.5) * innerHeight;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%, -100%)";
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return { flyTo, overview };
  }
})();
