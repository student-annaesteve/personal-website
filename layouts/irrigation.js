/*
  "Smart irrigation" has its own look, taken from the research report:
  white paper, Tinos headings, small diamonds and the teal, green and lime of the cover.

  One continuous page that scrolls normally: the header collage, then the chapters one under the other
  (cover → theory → study of the region → prototype → conclusion → awards and full report).
  Small animations only: each block fades and rises in as it enters the panel, and the pieces taken
  from the collage (sketch, diagram, prototype, components, motto) slide in from the side and drift a little with the scroll.
  Texts and images come from projects.js; this file only draws and animates them.
*/
(function () {
  // Where the sketch sits in the banner: [left, top, width, height] as fractions of the banner.
  const SKETCH = [0.79, 0.05, 0.18, 0.45];
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const fig = (m, esc, cls) =>
    '<figure class="irr-fig' + (cls ? " " + cls : "") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">' +
    (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";
  const heading = (colour, title) => // colour kept for the call sites; the headings no longer show a diamond
    '<header class="irr-chh irr-rv"><h3>' + title + "</h3></header>";
  const chapter = (cls, body) => '<section class="irr-ch ' + cls + '">' + body + "</section>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.irrigation = function (d, esc) {
    const th = d.theory, st = d.study, pr = d.prototype;
    const tile = (name) => (d.tiles || []).find((t) => t.indexOf(name) >= 0);
    let h = '<div class="irr">';

    h += '<div class="irr-banner-wrap"><img class="irr-banner" src="' + esc(d.banner.src) + '" alt="' + esc(d.banner.alt || "") + '">' +
      '<span class="irr-hole" aria-hidden="true"></span></div>';

    // Cover: title and goal, the pencil sketch beside them
    h += chapter("irr-cover",
      '<div class="irr-rv"><h2 class="irr-title">' + esc(d.headline || d.title) + '</h2><p class="irr-lead">' + esc(d.goal) + "</p></div>" +
      '<img class="irr-sketch" src="' + esc(d.sketch.src) + '" alt="' + esc(d.sketch.alt || "") + '">');

    // Theory: text across, the diagram left, the four factors right
    h += chapter("irr-theory",
      heading("#45818e", "Theory") + '<p class="irr-text irr-rv">' + esc(th.text) + "</p>" +
      '<div class="irr-th-grid">' + fig(th.main, esc, "irr-piece irr-from-left") +
      '<figure class="irr-fig irr-rv"><div class="irr-quad">' +
      th.factors.map((f) => '<img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy">').join("") +
      "</div><figcaption>" + esc(th.factorsCaption) + "</figcaption></figure></div>");

    // Study of the region: text and big numbers, three diamonds beside them
    h += chapter("irr-study",
      '<div>' + heading("#3e917e", "Study of the region") + '<p class="irr-text irr-rv">' + esc(st.text) + "</p>" +
      '<div class="irr-nums irr-rv">' + st.numbers.map(([n, label], k) =>
        '<div class="irr-num" style="--c:' + ["#134f5c", "#45818e", "#88d671"][k % 3] + '"><b>' + esc(n) + "</b><span>" + esc(label) + "</span></div>").join("") +
      "</div></div>" +
      '<div class="irr-piece irr-from-right irr-diamonds" aria-hidden="true"><i style="--c:#3e917e"></i><i style="--c:#88d671"></i><i style="--c:#45818e"></i></div>');

    // Prototype: text beside the working prototype, then the row of photos
    h += chapter("irr-proto",
      '<div class="irr-pr-top"><div>' + heading("#88d671", "Prototype") + '<p class="irr-text irr-rv">' + esc(pr.text) + "</p></div>" +
      '<img class="irr-piece irr-from-right" src="' + esc(pr.working.src) + '" alt="' + esc(pr.working.alt || "") + '"></div>' +
      '<div class="irr-row irr-rv">' + fig(pr.row[0], esc) + fig(pr.diagram, esc) + fig(pr.row[pr.row.length - 1], esc) + "</div>");

    // Conclusion: the components left, the text right
    h += chapter("irr-concl",
      '<div class="irr-piece irr-from-left irr-parts">' +
      '<img class="irr-p-mcu" src="' + esc(tile("nodemcu")) + '" alt="NodeMCU board">' +
      '<img class="irr-p-water" src="' + esc(tile("water-sensor")) + '" alt="Water level sensor">' +
      '<img class="irr-p-temp" src="' + esc(tile("tile-temperature.png")) + '" alt="Temperature sensor">' +
      "</div>" + '<p class="irr-close irr-rv">' + esc(d.conclusion) + "</p>");

    // Awards and the full report, the motto in the top right corner
    let aw = '<div class="irr-aw-head">' + heading("#134f5c", "Awards") +
      '<span class="irr-piece irr-from-right irr-hand" aria-hidden="true">' + esc(d.headline) + "</span></div>" +
      '<div class="irr-awards irr-rv">' + (d.awards || []).map((a) =>
        '<figure class="irr-award"><img src="' + esc(a.src) + '" alt="' + esc(a.alt || "") + '" loading="lazy"' +
        (a.position ? ' style="object-position:' + esc(a.position) + '"' : "") + "><figcaption>" + esc(a.name) + "</figcaption></figure>").join("") + "</div>";
    if (d.link) {
      aw += '<div class="irr-report irr-rv"><a class="irr-pdf" href="' + esc(d.link) + '" target="_blank" rel="noopener"><span class="irr-dia" aria-hidden="true"></span>' +
        esc(d.linkLabel || "Read the full report") + "</a>" + (d.linkNote ? '<span class="irr-note">' + esc(d.linkNote) + "</span>" : "") + "</div>";
    }
    h += chapter("irr-aw", aw);

    h += "</div>";

    // Once the panel is on screen: reveal blocks as they scroll in, and let the pieces drift a little.
    requestAnimationFrame(() => {
      const root = document.querySelector(".irr");
      const scroller = document.getElementById("panel");
      if (!root || !scroller) return;
      if (scroller._irrOff) scroller._irrOff();
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const items = root.querySelectorAll(".irr-rv, .irr-piece");
      if (reduce || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-in"));
        return;
      }
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }), { root: scroller, rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      items.forEach((el) => io.observe(el));

      const pieces = root.querySelectorAll(".irr-piece");
      // The sketch starts at its place in the banner and travels down to the cover as the page scrolls.
      const sketch = root.querySelector(".irr-sketch");
      const banner = root.querySelector(".irr-banner");
      const hole = root.querySelector(".irr-hole");
      let fly = null;
      function measure() {
        sketch.style.transform = "none";
        const rr = root.getBoundingClientRect(), b = banner.getBoundingClientRect(), n = sketch.getBoundingClientRect();
        if (!n.width || !b.width) { fly = null; return; }
        const x0 = b.left + b.width * SKETCH[0] - rr.left, y0 = b.top + b.height * SKETCH[1] - rr.top, w0 = b.width * SKETCH[2];
        fly = { dx: x0 - (n.left - rr.left), dy: y0 - (n.top - rr.top), s: w0 / n.width };
        hole.style.cssText = "left:" + SKETCH[0] * 100 + "%;top:" + SKETCH[1] * 100 + "%;width:" + SKETCH[2] * 100 + "%;height:" + SKETCH[3] * 100 + "%";
      }
      function flyTo() {
        if (!fly) return;
        const t = ease(Math.min(1, Math.max(0, scroller.scrollTop / (scroller.clientHeight * 0.4))));
        const k = 1 - t;
        sketch.style.transform = "translate(" + (fly.dx * k).toFixed(1) + "px," + (fly.dy * k).toFixed(1) + "px) scale(" +
          (fly.s + (1 - fly.s) * t).toFixed(3) + ") rotate(" + (-10 * Math.sin(Math.PI * t)).toFixed(2) + "deg)";
        // Cross-fade with the drawing printed in the banner as the piece sets off.
        const f = Math.min(1, t * 5);
        hole.style.opacity = f;
        sketch.style.opacity = t < 0.98 ? f : 1;
      }
      if (sketch && banner && hole) {
        root.querySelectorAll("img").forEach((im) => { if (!im.complete) im.addEventListener("load", () => { measure(); flyTo(); }, { once: true }); });
        measure();
      }
      let queued = false;
      function drift() {
        queued = false;
        if (!root.isConnected) return off();
        flyTo();
        const box = scroller.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        pieces.forEach((el) => {
          const r = el.getBoundingClientRect();
          const k = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / box.height));
          el.style.setProperty("--drift", (k * 18).toFixed(1) + "px");
        });
      }
      const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(drift); } };
      const onResize = () => { if (sketch && banner && hole) measure(); onScroll(); };
      function off() {
        io.disconnect();
        scroller.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        scroller._irrOff = null;
      }
      scroller.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      scroller._irrOff = off;
      drift();
    });

    return h;
  };
})();
