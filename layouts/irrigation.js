/*
  "Smart irrigation" has its own look, taken from the research report:
  white paper, Tinos headings, small diamonds and the teal, green and lime of the cover.

  The page opens on the header collage (projects.js → banner). Scrolling plays one chapter at a time:
  the collage fades away, one of its pieces stays in colour and moves to its place in the chapter,
  the chapter's content comes in, and before the next chapter the piece goes back and the collage returns.
  Chapters: cover → theory → study of the region → prototype → conclusion → awards and full report.
  Texts and images come from projects.js; this file only draws and animates them.
*/
(function () {
  // Where each piece sits in the banner (a) and in its chapter (b): [left, top, width] in % of the banner box.
  // f = font size (in % of the box width) for the pieces that are text.
  const MOVES = [
    { a: [79, 6, 18.3], b: [68, 12, 22] },             // cover: the pencil sketch beside the title
    { a: [23.5, 74, 22.5], b: [6, 40, 46] },           // theory: the evapotranspiration diagram
    { a: [0, 0, 100], b: [0, 0, 100] },                // study: some of the banner's diamonds stay where they are
    { a: [-5, 42, 33], b: [62, 4, 30] },               // prototype: the working prototype beside the text
    { a: [16, 2, 30], b: [8, 16, 60], f: [3.6, 8] },   // conclusion: «Cada gota compta!»
    { a: [30, 8, 18], b: [6, 14, 16] },                // awards: the components
  ];
  // Diamonds of the banner shown in the study chapter (centres in banner pixels, 2000 × 1000):
  // only the ones around the content, so they never cover it.
  const SQUARES = [[1333, 52], [1450, 350], [1300, 533]];
  const HEAD = 0.5; // screens of scroll on the header before the first chapter
  const LEN = 1.8;  // screens of scroll per chapter

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (p, a, b) => ease(Math.min(1, Math.max(0, (p - a) / (b - a))));
  const lerp = (a, b, t) => a + (b - a) * t;

  const fig = (m, esc, cls) =>
    '<figure class="irr-fig' + (cls ? " " + cls : "") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">' +
    (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";
  const heading = (colour, title) =>
    '<header class="irr-chh"><span class="irr-dia" aria-hidden="true" style="--c:' + colour + '"></span><h3>' + title + "</h3></header>";
  const part = (k, cls, body) => '<div class="irr-part ' + cls + '" data-ch="' + k + '">' + body + "</div>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.irrigation = function (d, esc) {
    const th = d.theory, st = d.study, pr = d.prototype;
    const tile = (name) => (d.tiles || []).find((t) => t.indexOf(name) >= 0);
    const banner = d.banner;
    let h = '<div class="irr"><div class="irr-stage"><div class="irr-box">';

    h += '<img class="irr-banner" src="' + esc(banner.src) + '" alt="' + esc(banner.alt || "") + '">';

    // The pieces that travel from the banner, one per chapter.
    h += '<img class="irr-obj" data-ch="0" src="' + esc(d.sketch.src) + '" alt="' + esc(d.sketch.alt || "") + '">';
    h += '<img class="irr-obj" data-ch="1" src="' + esc(th.main.src) + '" alt="' + esc(th.main.alt || "") + '">';
    h += '<div class="irr-obj irr-squares" data-ch="2" aria-hidden="true">' + SQUARES.map(([x, y]) => {
      const cx = x / 20, cy = y / 10, hx = 2.9, hy = 5.8;
      return '<img src="' + esc(banner.src) + '" alt="" style="clip-path:polygon(' + (cx - hx) + "% " + cy + "%," + cx + "% " + (cy - hy) + "%," +
        (cx + hx) + "% " + cy + "%," + cx + "% " + (cy + hy) + '%)">';
    }).join("") + "</div>";
    h += '<img class="irr-obj" data-ch="3" src="' + esc(pr.working.src) + '" alt="' + esc(pr.working.alt || "") + '">';
    h += '<div class="irr-obj irr-hand" data-ch="4" aria-hidden="true">' + esc(d.headline) + "</div>";
    h += '<div class="irr-obj irr-parts" data-ch="5">' +
      '<img class="irr-p-mcu" src="' + esc(tile("nodemcu")) + '" alt="NodeMCU board">' +
      '<img class="irr-p-water" src="' + esc(tile("water-sensor")) + '" alt="Water level sensor">' +
      '<img class="irr-p-temp" src="' + esc(tile("tile-temperature.png")) + '" alt="Temperature sensor">' +
      "</div>";

    // Cover
    h += part(0, "irr-cover", '<h2 class="irr-title">' + esc(d.headline || d.title) + '</h2><p class="irr-lead">' + esc(d.goal) + "</p>");

    // Theory: text across the top, the diagram (the travelling piece) left, the four factors right
    h += part(1, "irr-th-text", heading("#45818e", "Theory") + '<p class="irr-text">' + esc(th.text) + "</p>");
    h += part(1, "irr-th-cap", '<span class="irr-cap">' + esc(th.main.caption || "") + "</span>");
    h += part(1, "irr-th-quad", '<figure class="irr-fig"><div class="irr-quad">' +
      th.factors.map((f) => '<img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy">').join("") +
      "</div><figcaption>" + esc(th.factorsCaption) + "</figcaption></figure>");

    // Study of the region
    h += part(2, "irr-study", heading("#3e917e", "Study of the region") + '<p class="irr-text">' + esc(st.text) + "</p>" +
      '<div class="irr-nums">' + st.numbers.map(([n, label], k) =>
        '<div class="irr-num" style="--c:' + ["#134f5c", "#45818e", "#88d671"][k % 3] + '"><b>' + esc(n) + "</b><span>" + esc(label) + "</span></div>").join("") +
      "</div>");

    // Prototype: text beside the working prototype, then the row of photos
    h += part(3, "irr-pr-text", heading("#88d671", "Prototype") + '<p class="irr-text">' + esc(pr.text) + "</p>");
    h += part(3, "irr-row", fig(pr.row[0], esc) + fig(pr.diagram, esc) + fig(pr.row[pr.row.length - 1], esc));

    // Conclusion
    h += part(4, "irr-concl", '<p class="irr-close">' + esc(d.conclusion) + "</p>");

    // Awards and the full report
    let aw = heading("#134f5c", "Awards") + '<div class="irr-awards">' + (d.awards || []).map((a) =>
      '<figure class="irr-award"><img src="' + esc(a.src) + '" alt="' + esc(a.alt || "") + '" loading="lazy"' +
      (a.position ? ' style="object-position:' + esc(a.position) + '"' : "") + "><figcaption>" + esc(a.name) + "</figcaption></figure>").join("") + "</div>";
    if (d.link) {
      aw += '<div class="irr-report"><a class="irr-pdf" href="' + esc(d.link) + '" target="_blank" rel="noopener"><span class="irr-dia" aria-hidden="true"></span>' +
        esc(d.linkLabel || "Read the full report") + "</a>" + (d.linkNote ? '<span class="irr-note">' + esc(d.linkNote) + "</span>" : "") + "</div>";
    }
    h += part(5, "irr-aw", aw);

    h += '</div><div class="irr-bar"></div></div><div class="irr-spacer"></div></div>';

    // The animation follows the panel's scroll once the panel is on screen.
    requestAnimationFrame(() => {
      const root = document.querySelector(".irr");
      const scroller = document.getElementById("panel");
      if (!root || !scroller) return;
      if (scroller._irrOff) scroller._irrOff();
      const objs = root.querySelectorAll(".irr-obj");
      const parts = root.querySelectorAll(".irr-part");
      const bannerEl = root.querySelector(".irr-banner");
      const bar = root.querySelector(".irr-bar");
      const spacer = root.querySelector(".irr-spacer");
      const total = HEAD + MOVES.length * LEN;
      let queued = false;

      function update() {
        queued = false;
        if (!root.isConnected) return off();
        const vh = scroller.clientHeight || 1;
        spacer.style.height = total * vh + "px";
        const s = scroller.scrollTop / vh;
        let shown = 1;
        const text = [];
        MOVES.forEach((m, i) => {
          const p = (s - HEAD - i * LEN) / LEN;
          const on = step(p, 0, 0.22) - step(p, 0.86, 1);         // the collage fades, the piece stays
          const mv = step(p, 0.18, 0.48) - step(p, 0.8, 0.98);    // the piece travels to its place and back
          const settled = step(p, 0.3, 0.48) - step(p, 0.8, 0.9); // in place: the collage is gone
          text[i] = step(p, 0.42, 0.58) - step(p, 0.74, 0.84);    // the chapter's content
          shown = Math.min(shown, Math.max(0, 1 - 0.93 * on - 0.07 * settled));
          const o = objs[i].style;
          o.left = lerp(m.a[0], m.b[0], mv) + "%";
          o.top = lerp(m.a[1], m.b[1], mv) + "%";
          o.width = lerp(m.a[2], m.b[2], mv) + "%";
          if (m.f) o.fontSize = lerp(m.f[0], m.f[1], mv) + "cqw";
          o.opacity = on > 0.001 ? 1 : 0;
        });
        parts.forEach((el) => {
          const t = text[+el.dataset.ch];
          el.style.opacity = t;
          el.style.transform = "translateY(" + (1 - t) * 24 + "px)";
          el.style.pointerEvents = t > 0.5 ? "auto" : "none";
          el.style.visibility = t > 0.001 ? "visible" : "hidden";
        });
        bannerEl.style.opacity = shown;
        bannerEl.style.filter = "grayscale(" + Math.min(1, (1 - shown) * 1.07) + ")";
        bar.style.width = Math.min(100, (s / total) * 100) + "%";
      }
      const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
      function off() {
        scroller.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        scroller._irrOff = null;
      }
      scroller.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      scroller._irrOff = off;
      update();
    });

    return h;
  };
})();
