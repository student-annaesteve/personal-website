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
    const MODEL_URL = "models/mountain.glb";
    const lin = (hex) => new T.Color(hex).convertSRGBToLinear();

    const canvas = $("world");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new T.Scene();
    scene.fog = new T.Fog(lin(0xb9a3ad), 160, 420); // dusky haze, matches the sky just above the horizon

    // Sky: a vertical gradient from deep blue to the golden-hour horizon.
    const sky = document.createElement("canvas");
    sky.width = 4;
    sky.height = 512;
    const g = sky.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#16223d");
    grad.addColorStop(0.38, "#3f5684");
    grad.addColorStop(0.62, "#a99bb3");
    grad.addColorStop(0.78, "#e8b08e");
    grad.addColorStop(0.9, "#b9a3ad");
    grad.addColorStop(1, "#b9a3ad");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 512);
    const skyTex = new T.CanvasTexture(sky);
    skyTex.encoding = T.sRGBEncoding;
    scene.background = skyTex;

    const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 1200);

    // Light: low warm sun from the left-back, cool sky fill.
    scene.add(new T.HemisphereLight(lin(0xc4d0ff), lin(0x5a4636), 0.9));
    const sun = new T.DirectionalLight(lin(0xffd2a6), 2.1);
    sun.position.set(-120, 90, -40);
    scene.add(sun);
    const rim = new T.DirectionalLight(lin(0x8fa6ff), 0.35);
    rim.position.set(80, 40, 120);
    scene.add(rim);

    // ---- Noise (used by the fallback range and for scattering) -------------
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

    // ---- Terrain A: the Sketchfab model -----------------------------------
    function loadModel(onProgress) {
      return new Promise((resolve, reject) => {
        if (!T.GLTFLoader) return reject(new Error("GLTFLoader missing"));
        new T.GLTFLoader().load(
          MODEL_URL,
          (gltf) => {
            try { resolve(modelTerrain(gltf.scene)); } catch (e) { reject(e); }
          },
          (e) => { if (e.total) onProgress(e.loaded / e.total); },
          reject
        );
      });
    }

    function modelTerrain(root) {
      const WIDTH = 300;
      root.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(root);
      const size = box.getSize(new T.Vector3());
      root.scale.multiplyScalar(WIDTH / Math.max(size.x, size.z));
      root.scale.y *= 1.9; // the scan is fairly flat: stretch it into real mountains
      root.updateMatrixWorld(true);
      box.setFromObject(root);
      const c = box.getCenter(new T.Vector3());
      root.position.set(-c.x, -box.min.y, -c.z);
      root.updateMatrixWorld(true);
      box.setFromObject(root);

      // Height map: the highest vertex in each grid cell.
      const G = 200;
      const minX = box.min.x, minZ = box.min.z;
      const sx = (box.max.x - minX) / (G - 1), sz = (box.max.z - minZ) / (G - 1);
      const H = new Float32Array(G * G).fill(-Infinity);
      const PX = new Float32Array(G * G), PZ = new Float32Array(G * G);
      const v = new T.Vector3();
      root.traverse((o) => {
        if (!o.isMesh) return;
        o.material.roughness = 0.95;
        o.material.metalness = 0;
        const attr = o.geometry.attributes.position;
        const a = attr.array;
        const k = !attr.normalized ? 1 : a instanceof Int16Array ? 1 / 32767 : a instanceof Int8Array ? 1 / 127 :
          a instanceof Uint16Array ? 1 / 65535 : a instanceof Uint8Array ? 1 / 255 : 1;
        const st = attr.isInterleavedBufferAttribute ? attr.data.stride : attr.itemSize;
        const off = attr.isInterleavedBufferAttribute ? attr.offset : 0;
        for (let i = 0; i < attr.count; i++) {
          const j = i * st + off;
          v.set(Math.max(a[j] * k, -1), Math.max(a[j + 1] * k, -1), Math.max(a[j + 2] * k, -1));
          if (k === 1) v.set(a[j], a[j + 1], a[j + 2]);
          v.applyMatrix4(o.matrixWorld);
          const gx = Math.round((v.x - minX) / sx), gz = Math.round((v.z - minZ) / sz);
          if (gx < 0 || gz < 0 || gx >= G || gz >= G) continue;
          const idx = gz * G + gx;
          if (v.y > H[idx]) { H[idx] = v.y; PX[idx] = v.x; PZ[idx] = v.z; }
        }
      });
      // Fill empty cells from their neighbours.
      for (let pass = 0; pass < 8; pass++) {
        let empty = 0;
        for (let gz = 0; gz < G; gz++) for (let gx = 0; gx < G; gx++) {
          const idx = gz * G + gx;
          if (H[idx] > -Infinity) continue;
          let s = 0, n = 0;
          for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = gx + dx, z = gz + dz;
            if (x < 0 || z < 0 || x >= G || z >= G) continue;
            const h = H[z * G + x];
            if (h > -Infinity) { s += h; n++; }
          }
          if (n) { H[idx] = s / n; PX[idx] = minX + gx * sx; PZ[idx] = minZ + gz * sz; } else empty++;
        }
        if (!empty) break;
      }
      for (let i = 0; i < H.length; i++) if (H[i] === -Infinity) H[i] = 0;

      function heightAt(x, z) {
        const fx = (x - minX) / sx, fz = (z - minZ) / sz;
        if (fx < 0 || fz < 0 || fx > G - 1 || fz > G - 1) return 0;
        const x0 = Math.floor(fx), z0 = Math.floor(fz), x1 = Math.min(G - 1, x0 + 1), z1 = Math.min(G - 1, z0 + 1);
        const tx = fx - x0, tz = fz - z0;
        const h0 = H[z0 * G + x0] * (1 - tx) + H[z0 * G + x1] * tx;
        const h1 = H[z1 * G + x0] * (1 - tx) + H[z1 * G + x1] * tx;
        return h0 * (1 - tz) + h1 * tz;
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
        if (isMax) cands.push(gz * G + gx);
      }
      cands.sort((a, b) => H[b] - H[a]);
      let picked = [];
      for (let minDist = WIDTH * 0.17; minDist > 4 && picked.length < stops.length; minDist *= 0.8) {
        picked = [];
        for (const idx of cands) {
          if (picked.every((p) => Math.hypot(PX[p] - PX[idx], PZ[p] - PZ[idx]) >= minDist)) picked.push(idx);
          if (picked.length === stops.length) break;
        }
      }
      if (picked.length < stops.length) throw new Error("Not enough summits in the model");
      const highest = picked[0];
      const rest = picked.slice(1).sort((a, b) => H[a] - H[b]);
      const tops = rest.concat([highest]).map((i) => new T.Vector3(PX[i], H[i], PZ[i]));

      scene.add(root);
      const maxY = box.max.y;
      addDistantRange(WIDTH * 0.47, maxY);
      return {
        heightAt,
        tops,
        metres: (y) => Math.round((1200 + (y / maxY) * 3150) / 10) * 10,
        overview: { target: new T.Vector3(0, maxY * 0.3, 0), radius: WIDTH * 0.62, phi: 1.12 },
        cloudHeight: maxY + 18,
      };
    }

    // A hazy ring of far-off mountains so the model's square edges never meet the sky.
    function addDistantRange(inner, maxY) {
      const RINGS = 40, SEGS = 160, OUTER = 800;
      const geo = new T.RingGeometry(inner, OUTER, SEGS, RINGS);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const near = lin("#4a5468"), far = lin("#7d7f98"), snow = lin("#e4e2ea");
      const col = new T.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
        const rise = smooth(inner * 1.3, inner * 3, r) * (1 - smooth(640, OUTER, r));
        const h = rise * (ridged(x * 0.007 + 3, z * 0.007 + 1) * maxY * 0.95 + fbm(x * 0.03, z * 0.03) * 6) - 2 * (1 - rise);
        pos.setY(i, h);
        col.copy(near).lerp(far, smooth(inner, 500, r));
        if (h > maxY * 0.6) col.lerp(snow, smooth(maxY * 0.6, maxY * 0.95, h) * 0.8);
        colors.set([col.r, col.g, col.b], i * 3);
      }
      geo.setAttribute("color", new T.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      scene.add(new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 })));
    }

    // ---- Terrain B: generated low-poly range (fallback) --------------------
    function baseHeight(x, z) {
      return ridged(x * 0.011 + 11.3, z * 0.011 + 4.1) * 30 - 8 + fbm(x * 0.05 + 2, z * 0.05 + 9) * 5;
    }
    function proceduralTerrain() {
      stops.forEach((s) => (s.lift = s.h - baseHeight(s.x, s.z)));
      function heightAt(x, z) {
        let h = baseHeight(x, z);
        for (const s of stops) {
          const d = Math.hypot(x - s.x, z - s.z) / s.r;
          h += s.lift * Math.exp(-Math.pow(d, 1.5)) * (0.9 + 0.2 * noise(x * 0.08 + s.x, z * 0.08));
        }
        const valley = smooth(30, 100, z);
        return h * (1 - valley * 0.8) + valley * -0.5;
      }

      const SIZE = 420, SEG = isSmall() ? 120 : 180;
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
      const tops = stops.map((s) => {
        let best = -1e9, bx = s.x, bz = s.z;
        const lim = s.r * 0.6;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), z = pos.getZ(i);
          if (Math.abs(x - s.x) > lim || Math.abs(z - s.z) > lim) continue;
          const y = pos.getY(i);
          if (y > best) { best = y; bx = x; bz = z; }
        }
        return new T.Vector3(bx, best, bz);
      });

      geo = geo.toNonIndexed();
      const p = geo.attributes.position;
      const colors = new Float32Array(p.count * 3);
      const cMeadow = lin("#7d8f4a"), cForest = lin("#2c4632"), cForest2 = lin("#3b5a3a");
      const cRock = lin("#7b6f66"), cRock2 = lin("#5a524e"), cSnow = lin("#f4f0ea"), cShore = lin("#a49a72");
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
        if (y > snowLine && up > 0.62) col.copy(cSnow);
        else if (up < 0.68 || y > snowLine - 4) col.copy(j > 0.5 ? cRock : cRock2);
        else if (y < 1.6) col.copy(cShore);
        else if (y < 6) col.copy(cMeadow).lerp(cForest2, j * 0.5);
        else col.copy(j > 0.4 ? cForest : cForest2);
        for (let k = 0; k < 3; k++) colors.set([col.r, col.g, col.b], (i + k) * 3);
      }
      geo.setAttribute("color", new T.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      scene.add(new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })));

      const lake = new T.Mesh(
        new T.CircleGeometry(SIZE / 2, 48),
        new T.MeshStandardMaterial({ color: lin(0x5f86a8), roughness: 0.25, transparent: true, opacity: 0.88 })
      );
      lake.rotation.x = -Math.PI / 2;
      lake.position.y = 0.9;
      scene.add(lake);

      const TREES = isSmall() ? 700 : 1500;
      const treeGeo = new T.ConeGeometry(0.9, 3.2, 5);
      treeGeo.translate(0, 1.4, 0);
      const trees = new T.InstancedMesh(treeGeo, new T.MeshStandardMaterial({ flatShading: true, roughness: 1 }), TREES);
      const m4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), tp = new T.Vector3(), up = new T.Vector3(0, 1, 0);
      let placed = 0, tries = 0;
      while (placed < TREES && tries < TREES * 20) {
        tries++;
        const x = (hash(tries, 11) - 0.5) * 300, z = (hash(tries, 12) - 0.5) * 300 + 20;
        const y = heightAt(x, z);
        if (y < 2 || y > 15) continue;
        if (Math.abs(heightAt(x + 1, z) - y) + Math.abs(heightAt(x, z + 1) - y) > 1.4) continue;
        if (fbm(x * 0.04 + 50, z * 0.04) < 0.42) continue;
        const s = 0.7 + hash(tries, 13) * 0.8;
        m4.compose(tp.set(x, y - 0.4, z), q.setFromAxisAngle(up, hash(tries, 14) * 6.28), sc.set(s, s * (0.9 + hash(tries, 15) * 0.5), s));
        trees.setMatrixAt(placed, m4);
        trees.setColorAt(placed, lin(hash(tries, 16) > 0.5 ? "#21382a" : "#2f4b30"));
        placed++;
      }
      trees.count = placed;
      scene.add(trees);

      return {
        heightAt,
        tops,
        metres: toMetres,
        overview: { target: new T.Vector3(0, 12, -14), radius: 158, phi: 1.2 },
        cloudHeight: 60,
      };
    }

    // ---- Clouds: soft sprites ---------------------------------------------
    const puffCanvas = document.createElement("canvas");
    puffCanvas.width = puffCanvas.height = 128;
    const pg = puffCanvas.getContext("2d");
    const rg = pg.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, "rgba(255,246,236,0.9)");
    rg.addColorStop(0.5, "rgba(255,236,220,0.45)");
    rg.addColorStop(1, "rgba(255,230,210,0)");
    pg.fillStyle = rg;
    pg.fillRect(0, 0, 128, 128);
    const puffTex = new T.CanvasTexture(puffCanvas);
    puffTex.encoding = T.sRGBEncoding;
    const clouds = [];
    function addClouds(baseY) {
      for (let k = 0; k < 10; k++) {
        const grp = new T.Group();
        const parts = 5 + Math.floor(hash(k, 21) * 5);
        for (let j = 0; j < parts; j++) {
          const sp = new T.Sprite(new T.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0.55 + hash(k * 9 + j, 29) * 0.3 }));
          const s = 14 + hash(k * 9 + j, 22) * 16;
          sp.scale.set(s * 1.6, s, 1);
          sp.position.set(j * 7 - parts * 3.5, hash(k * 9 + j, 23) * 4, (hash(k * 9 + j, 24) - 0.5) * 10);
          grp.add(sp);
        }
        grp.position.set((hash(k, 25) - 0.5) * 400, baseY + hash(k, 26) * 20, -170 + hash(k, 27) * 240);
        grp.userData.speed = 1.5 + hash(k, 28) * 2;
        scene.add(grp);
        clouds.push(grp);
      }
    }

    // ---- Flags and floating tags ------------------------------------------
    const flags = [];
    const poleMat = new T.MeshStandardMaterial({ color: lin(0x3a3a3a), roughness: 0.6 });
    const poleGeo = new T.CylinderGeometry(0.13, 0.13, 6, 6);
    poleGeo.translate(0, 3, 0);
    const cairnMat = new T.MeshStandardMaterial({ color: lin(0x8a8079), flatShading: true });
    function plantFlags() {
      stops.forEach((s, i) => {
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
        grp.add(new T.Mesh(cloth, new T.MeshStandardMaterial({ color: lin(s.color), side: T.DoubleSide, roughness: 0.8 })));
        grp.userData.base = Float32Array.from(cloth.attributes.position.array);
        grp.userData.cloth = cloth;
        scene.add(grp);
        flags.push(grp);
        s.labelPos = s.top.clone().add(new T.Vector3(0, big ? 8.5 : 8, 0));

        const b = document.createElement("button");
        b.type = "button";
        b.className = "peak-tag";
        b.innerHTML = '<span class="tag-alt">▲ ' + fmt(s.metres) + '</span><span class="tag-name">' +
          esc(s.kind === "about" ? "About me" : s.data.title) + "</span>";
        b.addEventListener("click", () => open(i));
        $("labels").appendChild(b);
        s.tagEl = b;
      });
    }

    // ---- Camera rig --------------------------------------------------------
    const portrait = () => innerWidth / innerHeight < 1;
    let baseRadius = 180;
    const overviewRadius = () => (portrait() ? baseRadius * Math.pow(innerHeight / innerWidth, 0.6) : baseRadius);
    function fitLens() {
      camera.fov = portrait() ? 54 : 42;
      const r = overviewRadius();
      scene.fog.near = r * 0.8;
      scene.fog.far = r + 650;
    }
    const OVERVIEW = { target: new T.Vector3(0, 12, 0), radius: overviewRadius(), theta: 0.08, phi: 1.15 };
    fitLens();
    const want = { target: OVERVIEW.target.clone(), radius: OVERVIEW.radius, theta: OVERVIEW.theta, phi: OVERVIEW.phi, offX: 0, offY: 0 };
    const cur = reduceMotion
      ? { target: want.target.clone(), radius: want.radius, theta: want.theta, phi: want.phi, offX: 0, offY: 0 }
      : { target: new T.Vector3(0, 30, 10), radius: 280, theta: -0.5, phi: 1.4, offX: 0, offY: 0 };
    let lastInput = performance.now();
    let focus = -1;
    let ready = false;
    let heightAt = () => 0;

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
      if (!ready) return;
      const s = stops[i];
      want.target.copy(s.top).add(new T.Vector3(0, s.kind === "about" ? 2 : 1, 0));
      want.radius = (s.kind === "about" ? 64 : 48) * (portrait() ? 1.35 : 1);
      // Look at the summit from the outside of the range, slightly from the side.
      want.theta = nearestAngle(cur.theta, Math.atan2(s.top.x, s.top.z + 60) * 0.6 + 0.25);
      want.phi = 1.15;
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
      if (ready) stops.forEach((st) => st.tagEl.classList.remove("dim"));
      if (reduceMotion) snap();
    }
    function snap() {
      cur.target.copy(want.target);
      cur.radius = want.radius; cur.theta = want.theta; cur.phi = want.phi; cur.offX = want.offX; cur.offY = want.offY;
    }

    function onTerrain(t) {
      heightAt = t.heightAt;
      stops.forEach((s, i) => {
        s.top = t.tops[i];
        s.metres = t.metres(s.top.y);
        s.signEl.querySelector(".sign-alt").textContent = fmt(s.metres);
      });
      plantFlags();
      addClouds(t.cloudHeight);
      OVERVIEW.target.copy(t.overview.target);
      OVERVIEW.phi = t.overview.phi;
      baseRadius = t.overview.radius;
      OVERVIEW.radius = overviewRadius();
      fitLens();
      camera.updateProjectionMatrix();
      ready = true;
      $("hint").textContent = isTouch
        ? "Drag to look around · Pinch to zoom · Pick a summit"
        : "Drag to look around · Scroll to zoom · Pick a summit";
      if (focus >= 0) { renderPanel(focus); flyTo(focus); } else overview();
    }

    const hintEl = $("hint");
    hintEl.textContent = "Loading the mountains…";
    loadModel((f) => (hintEl.textContent = "Loading the mountains… " + Math.round(f * 100) + "%"))
      .then(onTerrain)
      .catch((e) => {
        console.warn("Using the generated range instead of the model:", e);
        onTerrain(proceduralTerrain());
      });

    // ---- Input: drag to orbit, wheel / pinch to zoom ----------------------
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
      if (ready) hideHint();
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
      if (ready) hideHint();
    }, { passive: false });
    function zoom(f) {
      want.radius = Math.min(OVERVIEW.radius * 1.5, Math.max(22, want.radius * f));
    }

    // Click a flag, or the ground near a summit, to open it.
    const ray = new T.Raycaster();
    const ndc = new T.Vector2();
    const probe = new T.Vector3();
    function pick(x, y) {
      if (!ready) return;
      ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(flags, true);
      if (hits.length) {
        const i = flags.indexOf(hits[0].object.parent);
        if (i >= 0) return open(i);
      }
      // March along the ray until it dips below the height map.
      let hit = null;
      for (let d = 1; d < 700; d += 1.5) {
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
    const tmp = new T.Vector3();
    let last = performance.now();
    let appliedOffset = false;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      if (!reduceMotion && ready && focus < 0 && !pointers.size && now - lastInput > 5000) want.theta += dt * 0.025;

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
          if (cg.position.x > 220) cg.position.x = -220;
        });
      }

      renderer.render(scene, camera);

      if (ready) {
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
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    return { flyTo, overview };
  }
})();
