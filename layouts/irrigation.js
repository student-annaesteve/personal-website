/*
  "Smart irrigation" has its own look, taken from the research report:
  white paper, the pencil sketch, and a strip of diamond tiles in teal, green and lime
  (a few holding photos of the components, like the cover).
  Cover + goal → theory → study of the region → prototype → conclusion → awards → full report.
  Texts and images come from projects.js; this file only draws them.
*/
(function () {
  const COLOURS = ["#45818e", "#88d671", "#134f5c", "#3e917e", "#87b2bb", "#e3ecee", "#929ea0", "#3e917e", "#88d671", "#e3ecee", "#45818e", "#87b2bb"];
  const LIGHT = ["#e3ecee", "#88d671", "#87b2bb", "#e3ecee"]; // tiles that hold a photo stay light so it reads

  // One column of diamonds down the left edge of the cover, sized to its height.
  // The column next to the text is whole; the half column against the edge is cut.
  function drawTiles(svg, tiles, esc) {
    const w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    const H = w / 2, side = H * Math.SQRT2;
    let out = "", k = 0, p = 0;
    for (let i = 0, rows = Math.ceil(h / H) + 1; i < rows; i++) {
      const y = i * H;
      for (let x = w - H - (i % 2 ? H : 0); x > -H; x -= 2 * H) {
        const withPhoto = i % 2 === 0 && i % 6 === 2 && tiles.length && p < tiles.length * 3;
        const fill = withPhoto ? LIGHT[p % LIGHT.length] : COLOURS[(k * 7) % COLOURS.length];
        k++;
        out += '<rect x="' + -side / 2 + '" y="' + -side / 2 + '" width="' + side + '" height="' + side + '" fill="' + fill +
          '" stroke="#fff" stroke-width="1.5" transform="translate(' + x + " " + y + ') rotate(45)"/>';
        if (withPhoto) {
          const src = tiles[p++ % tiles.length];
          out += '<image href="' + esc(src) + '" x="' + (x - H * 0.62) + '" y="' + (y - H * 0.62) + '" width="' + H * 1.24 +
            '" height="' + H * 1.24 + '" preserveAspectRatio="xMidYMid meet"/>';
        }
      }
    }
    svg.innerHTML = out;
  }

  const fig = (m, esc, cls) =>
    '<figure class="irr-fig' + (cls ? " " + cls : "") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy">' +
    (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";

  const heading = (title) => '<header class="irr-chh"><span class="irr-dia" aria-hidden="true"></span><h3>' + title + "</h3></header>";
  const chapter = (colour, title, body) => '<section class="irr-ch" style="--c:' + colour + '">' + heading(title) + body + "</section>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.irrigation = function (d, esc) {
    const th = d.theory, st = d.study, pr = d.prototype;
    let h = '<div class="irr">';

    h += '<section class="irr-cover"><svg class="irr-tiles" aria-hidden="true"></svg>' +
      '<h2 class="irr-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.sketch ? '<img class="irr-sketch" src="' + esc(d.sketch.src) + '" alt="' + esc(d.sketch.alt || "") + '">' : "") +
      '<p class="irr-lead">' + esc(d.goal) + "</p></section>";

    h += chapter("#45818e", "Theory",
      '<p class="irr-text">' + esc(th.text) + "</p>" +
      '<div class="irr-et">' + fig(th.main, esc, "irr-et-main") +
      '<figure class="irr-fig irr-et-quad"><div class="irr-quad">' +
      th.factors.map((f) => '<img src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy">').join("") +
      "</div><figcaption>" + esc(th.factorsCaption) + "</figcaption></figure></div>");

    h += chapter("#3e917e", "Study of the region",
      '<p class="irr-text">' + esc(st.text) + "</p>" +
      '<div class="irr-nums">' + st.numbers.map(([n, label], k) =>
        '<div class="irr-num" style="--c:' + ["#134f5c", "#45818e", "#88d671"][k % 3] + '"><b>' + esc(n) + "</b><span>" + esc(label) + "</span></div>").join("") +
      "</div>");

    // The working-prototype photo sits beside the heading and the text, without a caption.
    h += '<section class="irr-ch" style="--c:#88d671"><div class="irr-intro"><div class="irr-intro-text">' + heading("Prototype") +
      '<p class="irr-text">' + esc(pr.text) + "</p></div>" + fig(Object.assign({}, pr.working, { caption: "" }), esc) + "</div>" +
      // The system diagram sits large in the middle of the row of photos.
      '<div class="irr-row">' + fig(pr.row[0], esc) + fig(pr.diagram, esc, "irr-wide") + fig(pr.row[pr.row.length - 1], esc) + "</div></section>";

    h += '<p class="irr-close">' + esc(d.conclusion) + "</p>";

    if (d.awards && d.awards.length) {
      h += chapter("#134f5c", "Awards",
        '<div class="irr-awards">' + d.awards.map((a) =>
          '<figure class="irr-award"><img src="' + esc(a.src) + '" alt="' + esc(a.alt || "") + '" loading="lazy"' +
          (a.position ? ' style="object-position:' + esc(a.position) + '"' : "") + "><figcaption>" + esc(a.name) + "</figcaption></figure>").join("") +
        "</div>");
    }

    if (d.link) {
      h += '<div class="irr-report"><a class="irr-pdf" href="' + esc(d.link) + '" target="_blank" rel="noopener"><span class="irr-dia" aria-hidden="true"></span>' +
        esc(d.linkLabel || "Read the full report") + "</a>" + (d.linkNote ? '<span class="irr-note">' + esc(d.linkNote) + "</span>" : "") + "</div>";
    }

    // The tile strip needs the cover's real size, so it is drawn once the panel is on screen.
    requestAnimationFrame(() => {
      const svg = document.querySelector(".irr .irr-tiles");
      if (!svg) return;
      const draw = () => drawTiles(svg, d.tiles || [], esc);
      draw();
      if (window.ResizeObserver) new ResizeObserver(draw).observe(svg);
    });

    return h + "</div>";
  };
})();
