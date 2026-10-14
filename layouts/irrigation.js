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
  const fig = (m, esc, cls) =>
    '<figure class="irr-fig' + (cls ? " " + cls : "") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">' +
    (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";
  const heading = (colour, title) =>
    '<header class="irr-chh irr-rv"><span class="irr-dia" aria-hidden="true" style="--c:' + colour + '"></span><h3>' + title + "</h3></header>";
  const chapter = (cls, body) => '<section class="irr-ch ' + cls + '">' + body + "</section>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.irrigation = function (d, esc) {
    const th = d.theory, st = d.study, pr = d.prototype;
    const tile = (name) => (d.tiles || []).find((t) => t.indexOf(name) >= 0);
    let h = '<div class="irr">';

    h += '<div class="irr-banner-wrap"><img class="irr-banner" src="' + esc(d.banner.src) + '" alt="' + esc(d.banner.alt || "") + '"></div>';

    // Cover: title and goal, the pencil sketch beside them
    h += chapter("irr-cover",
      '<div class="irr-rv"><h2 class="irr-title">' + esc(d.headline || d.title) + '</h2><p class="irr-lead">' + esc(d.goal) + "</p></div>" +
      '<img class="irr-piece irr-from-right irr-sketch" src="' + esc(d.sketch.src) + '" alt="' + esc(d.sketch.alt || "") + '">');

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
      let queued = false;
      function drift() {
        queued = false;
        if (!root.isConnected) return off();
        const box = scroller.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        pieces.forEach((el) => {
          const r = el.getBoundingClientRect();
          const k = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / box.height));
          el.style.setProperty("--drift", (k * 18).toFixed(1) + "px");
        });
      }
      const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(drift); } };
      function off() {
        io.disconnect();
        scroller.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        scroller._irrOff = null;
      }
      scroller.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      scroller._irrOff = off;
      drift();
    });

    return h;
  };
})();
