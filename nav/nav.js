/* Design study: five ways to reach the projects directly.
   Pick one with ?nav=1…5 (or the switcher at the bottom right). Remove this folder once a design is chosen. */
(function () {
  "use strict";
  const PROJECTS = window.PROJECTS || [];
  const DESIGNS = [
    ["1", "Linked list"],
    ["2", "Peak labels"],
    ["3", "Project index"],
    ["4", "Top bar"],
    ["5", "Card strip"],
  ];
  const q = new URLSearchParams(location.search).get("nav");
  const design = DESIGNS.some((d) => d[0] === q) ? q : "1";
  document.body.dataset.nav = design;

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (i) => String(i + 1).padStart(2, "0");
  const signs = () => document.querySelectorAll("#trail-list .sign");
  const tags = () => document.querySelectorAll("#labels .peak-tag");
  const open = (i) => { const b = signs()[i]; if (b) b.click(); };
  const alt = (i) => { const s = signs()[i]; return s ? s.querySelector(".sign-alt").textContent : ""; };
  // Light up the summit on the map while a project is hovered elsewhere on the page.
  function peak(i, on) {
    const t = tags()[i];
    if (t) t.dispatchEvent(new PointerEvent(on ? "pointerenter" : "pointerleave"));
  }
  function bindHover(el, i) {
    el.addEventListener("pointerenter", () => peak(i, true));
    el.addEventListener("pointerleave", () => peak(i, false));
    el.addEventListener("focus", () => peak(i, true));
    el.addEventListener("blur", () => peak(i, false));
  }
  // First picture the project has, for thumbnails.
  function thumb(p) {
    let found = "";
    (function walk(v) {
      if (found || v == null) return;
      if (typeof v === "string") { if (/\.(jpe?g|png|webp)$/i.test(v) && !/tile-/.test(v)) found = v; return; }
      if (typeof v === "object") Object.values(v).forEach(walk);
    })([p.hero, p.cover, p.images, p.levels, p.prototype, p.sketch, p]);
    return found;
  }
  const meta = (p) => [p.year, (p.tags || []).slice(0, 2).join(" · ")].filter(Boolean).join(" — ");
  const order = PROJECTS.map((_, i) => i).reverse(); // highest summit first, like the route list

  // ---- Design switcher -----------------------------------------------------
  const sw = document.createElement("div");
  sw.className = "nav-switch";
  sw.innerHTML = '<span>Design</span>' + DESIGNS.map(([k, name]) =>
    '<a href="?nav=' + k + '" title="' + esc(name) + '"' + (k === design ? ' aria-current="true"' : "") + ">" + k + "</a>").join("") +
    '<em>' + esc(DESIGNS.find((d) => d[0] === design)[1]) + "</em>";
  document.body.appendChild(sw);

  function whenReady(fn) {
    // The route list is filled by world.js; peak tags appear once the map is built.
    if (signs().length) fn(); else addEventListener("load", fn);
  }

  whenReady(() => {
    // 1 · Linked list: the route list and the summits highlight each other.
    if (design === "1") {
      signs().forEach((b, i) => {
        bindHover(b, i);
        b.insertAdjacentHTML("beforeend", '<span class="sign-go" aria-hidden="true">→</span>');
      });
      tags().forEach((t, i) => {
        t.addEventListener("pointerenter", () => signs()[i] && signs()[i].classList.add("linked"));
        t.addEventListener("pointerleave", () => signs()[i] && signs()[i].classList.remove("linked"));
      });
    }

    // 3 · Project index: a "Selected work" sheet that slides up from the bottom.
    if (design === "3") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-cta";
      btn.textContent = "View projects ↓";
      $(".brand").appendChild(btn);
      const sheet = document.createElement("section");
      sheet.className = "nav-index";
      sheet.setAttribute("aria-label", "Selected work");
      sheet.innerHTML = '<header><h2>Selected work</h2><button type="button" class="nav-index-close" aria-label="Close">✕</button></header>' +
        '<ol>' + order.map((i) => {
          const p = PROJECTS[i];
          return '<li><button type="button" data-i="' + i + '"><span class="ix-num">' + num(i) + '</span>' +
            '<span class="ix-name">' + esc(p.title) + '</span><span class="ix-meta">' + esc(meta(p)) + '</span>' +
            '<span class="ix-alt">' + esc(alt(i)) + '</span><span class="ix-go">→</span></button></li>';
        }).join("") + "</ol>";
      document.body.appendChild(sheet);
      const preview = document.createElement("img");
      preview.className = "nav-preview";
      preview.alt = "";
      document.body.appendChild(preview);
      const toggle = (on) => sheet.classList.toggle("open", on);
      btn.addEventListener("click", () => toggle(true));
      $(".nav-index-close", sheet).addEventListener("click", () => toggle(false));
      sheet.querySelectorAll("li button").forEach((b) => {
        const i = +b.dataset.i;
        const src = thumb(PROJECTS[i]);
        b.addEventListener("click", () => { toggle(false); open(i); });
        b.addEventListener("pointerenter", () => { if (src) { preview.src = src; preview.classList.add("on"); } });
        b.addEventListener("pointerleave", () => preview.classList.remove("on"));
        b.addEventListener("pointermove", (e) => { preview.style.transform = "translate(" + (e.clientX + 24) + "px," + (e.clientY - 70) + "px)"; });
      });
    }

    // 4 · Top bar: Work / About / Contact, Work opens a dropdown.
    if (design === "4") {
      const bar = document.createElement("nav");
      bar.className = "nav-bar";
      bar.setAttribute("aria-label", "Main");
      bar.innerHTML = '<div class="nav-work"><button type="button" aria-expanded="false">Work <span aria-hidden="true">▾</span></button>' +
        '<ul>' + order.map((i) => '<li><button type="button" data-i="' + i + '"><span class="ix-num">' + num(i) + '</span>' +
          '<span><b>' + esc(PROJECTS[i].title) + '</b><small>' + esc(meta(PROJECTS[i])) + '</small></span></button></li>').join("") + "</ul></div>" +
        '<button type="button" data-about>About</button><button type="button" data-about>Contact</button>';
      $(".top").insertBefore(bar, $("#about-btn"));
      const work = $(".nav-work", bar), wb = $("button", work);
      const set = (on) => { work.classList.toggle("open", on); wb.setAttribute("aria-expanded", on); };
      wb.addEventListener("click", (e) => { e.stopPropagation(); set(!work.classList.contains("open")); });
      addEventListener("click", (e) => { if (!work.contains(e.target)) set(false); });
      work.querySelectorAll("li button").forEach((b) => { bindHover(b, +b.dataset.i); b.addEventListener("click", () => { set(false); open(+b.dataset.i); }); });
      bar.querySelectorAll("[data-about]").forEach((b) => b.addEventListener("click", () => $("#about-btn").click()));
    }

    // 5 · Card strip: one card per project along the bottom.
    if (design === "5") {
      const strip = document.createElement("nav");
      strip.className = "nav-strip";
      strip.setAttribute("aria-label", "Projects");
      strip.innerHTML = PROJECTS.map((p, i) => {
        const src = thumb(p);
        return '<button type="button" data-i="' + i + '"><span class="card-img"' + (src ? ' style="background-image:url(\'' + esc(src) + '\')"' : "") + '></span>' +
          '<span class="card-txt"><span class="ix-num">' + num(i) + " · " + esc(alt(i)) + '</span><b>' + esc(p.title) + "</b></span></button>";
      }).join("");
      document.body.appendChild(strip);
      strip.querySelectorAll("button").forEach((b) => { bindHover(b, +b.dataset.i); b.addEventListener("click", () => open(+b.dataset.i)); });
    }
  });
})();
