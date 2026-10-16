/*
  "CineBus" has its own look: a cinema ticket for the header and a drawn bus map of the route,
  in TMB red, night blue and paper; the solution is shown as the Eixample from above with the bus on its route. Texts come from projects.js; this file only draws them.
*/
(function () {
  const head = (n, title) => '<header class="cb-head"><span class="cb-num">' + n + "</span><h3>" + title + "</h3></header>";

  // The city from above: Eixample blocks with cut corners, the streets between them, and the articulated
  // TMB bus seen from the roof, on its way along the route from you to the cinema.
  function routeMap() {
    const B = 74, S = 26, C = 18, P = B + S; // block, street, chamfer, pitch
    let blocks = "", trees = "";
    for (let gx = -1; gx < 7; gx++) for (let gy = -1; gy < 4; gy++) {
      const x = gx * P + 14, y = gy * P + 8;
      blocks += '<path d="M' + (x + C) + " " + y + "h" + (B - 2 * C) + "l" + C + " " + C + "v" + (B - 2 * C) + "l" + -C + " " + C + "h" + -(B - 2 * C) + "l" + -C + " " + -C + "v" + -(B - 2 * C) + 'z"/>';
      // an inner courtyard, as in every Eixample block
      blocks += '<rect x="' + (x + 22) + '" y="' + (y + 22) + '" width="' + (B - 44) + '" height="' + (B - 44) + '" rx="3" fill="#dcd6c8"/>';
      for (let k = 0; k < 3; k++) trees += '<circle cx="' + (x + 16 + k * 21) + '" cy="' + (y + B + 5) + '" r="3.2"/>';
    }
    const ys = 8 + B + S / 2;          // the street the bus drives along
    const zebra = (x, y) => { let z = ""; for (let i = 0; i < 5; i++) z += '<rect x="' + x + '" y="' + (y + i * 5) + '" width="12" height="2.6"/>'; return z; };
    // articulated bus from above, 2 coaches and the bellows, front to the right
    const bus = (x, y) =>
      '<g transform="translate(' + x + " " + y + ')">' +
      '<rect x="0" y="-8" width="58" height="16" rx="2.5" fill="#f4f1ea"/><rect x="66" y="-8" width="62" height="16" rx="2.5" fill="#f4f1ea"/>' +
      '<rect x="57" y="-6.5" width="10" height="13" fill="#3a3a3a"/>' +
      '<path d="M128 -8 h-9 v16 h9 a3 3 0 0 0 2.5 -2.5 v-11 a3 3 0 0 0 -2.5 -2.5z" fill="#c8102e"/><rect x="0" y="-8" width="5" height="16" rx="2" fill="#c8102e"/>' +
      '<rect x="12" y="-5" width="18" height="10" rx="1.5" fill="#cfcac0"/><rect x="80" y="-5" width="22" height="10" rx="1.5" fill="#cfcac0"/>' +
      '<rect x="36" y="-3" width="12" height="6" rx="1" fill="#bcb6ab"/><rect x="106" y="-3" width="8" height="6" rx="1" fill="#bcb6ab"/></g>';
    const vx = 14 + B + S / 2, youY = 8 + 2 * P + B / 2;   // you: on the side street, one block down
    const cx = 14 + 5 * P - S / 2, cy = ys;                  // the cinema: at the next crossing along the bus street
    const route = "M" + vx + " " + youY + " V" + ys + " H" + cx;
    return (
      '<svg class="cb-map" viewBox="0 0 600 300" role="img" aria-label="Barcelona from above: Eixample blocks, a red and white articulated bus on its way, and the route from you to the cinema">' +
      '<rect width="600" height="300" fill="#8f8a84"/>' +
      '<g fill="#e9e4d8">' + blocks + "</g>" +
      '<g fill="#5b8a4e" opacity=".85">' + trees + "</g>" +
      '<g fill="#f4f1ea">' + zebra(14 + 4 * P - S + 7, ys - 12) + zebra(14 + P - S + 7, ys - 12) + "</g>" +
      '<path d="' + route + '" fill="none" stroke="#c8102e" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round" opacity=".9"/>' +
      bus(190, ys) +
      '<circle cx="' + vx + '" cy="' + youY + '" r="8" fill="#1b2a4a" stroke="#f4f1ea" stroke-width="3"/>' +
      '<g transform="translate(' + cx + " " + cy + ')"><path d="M0 0 C -12 -14 -12 -30 0 -34 C 12 -30 12 -14 0 0Z" fill="#c8102e" stroke="#f4f1ea" stroke-width="2"/><rect x="-6" y="-26" width="12" height="9" rx="1.5" fill="#fff"/></g>' +
      "</svg>"
    );
  }

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.cinebus = function (d, esc) {
    let h =
      '<div class="cb">' +
      // Header: a cinema ticket with a perforated stub.
      '<section class="cb-ticket"><div class="cb-ticket-main">' +
      '<p class="cb-admit">Admit one · ' + esc(d.year || "") + "</p>" +
      '<h2 class="cb-title">' + esc(d.headline || d.title) + "</h2>" +
      '<p class="cb-sub">' + esc(d.subtitle || "") + "</p>" +
      '<div class="cb-tags">' + (d.tags || []).map((t) => "<span>" + esc(t) + "</span>").join("") + "</div>" +
      '</div><div class="cb-stub" aria-hidden="true"><span>CINE</span><b>BUS</b><span>' + esc(d.credit || "") + "</span></div></section>";

    h += '<section class="cb-sec">' + head("01", "The problem") +
      '<p class="cb-lead">' + esc(d.problem) + "</p>" +
      '<p class="cb-text">' + esc(d.goal) + "</p></section>";

    h += '<section class="cb-sec">' + head("02", "The solution") + routeMap() +
      '<ol class="cb-steps">' + (d.steps || []).map(([t, x, tool], k) =>
        '<li><span class="cb-step-n">' + (k + 1) + '</span><div><strong>' + esc(t) + "</strong><p>" + esc(x) + '</p><em>' + esc(tool) + "</em></div></li>").join("") +
      "</ol></section>";

    h += '<section class="cb-sec">' + head("03", "The result") +
      '<dl class="cb-facts">' + (d.facts || []).map(([v, k]) => "<div><dt>" + esc(v) + "</dt><dd>" + esc(k) + "</dd></div>").join("") + "</dl>" +
      '<p class="cb-text">' + esc(d.result) + "</p></section>";

    if (d.link) h += '<a class="panel-link cb-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "View the code →") + "</a>";
    return h + "</div>";
  };
})();
