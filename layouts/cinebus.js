/*
  "CineBus" has its own look: a cinema ticket for the header and a drawn bus map of the route,
  in TMB red, night blue and paper. Texts come from projects.js; this file only draws them.
*/
(function () {
  const head = (n, title) => '<header class="cb-head"><span class="cb-num">' + n + "</span><h3>" + title + "</h3></header>";

  // A stylised route: walk to the stop, bus with one change, walk to the cinema.
  function routeMap() {
    let grid = "";
    for (let x = 20; x < 600; x += 40) grid += '<line x1="' + x + '" y1="0" x2="' + (x - 60) + '" y2="260"/>';
    for (let y = 20; y < 260; y += 40) grid += '<line x1="0" y1="' + y + '" x2="600" y2="' + (y + 18) + '"/>';
    const stop = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#fff" stroke="#c8102e" stroke-width="3"/>';
    return (
      '<svg class="cb-map" viewBox="0 0 600 260" role="img" aria-label="Route on a map of Barcelona: walk to a bus stop, take two buses with one change, then walk to the cinema">' +
      '<rect width="600" height="260" fill="#f4efe6"/>' +
      '<g stroke="#e2d9c8" stroke-width="2">' + grid + "</g>" +
      '<path d="M0 230 Q 160 200 300 240 T 600 220 V260 H0Z" fill="#cfe0ea"/>' +
      '<path class="cb-walk" d="M60 70 L 120 92" fill="none" stroke="#1b2a4a" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>' +
      '<path class="cb-bus" d="M120 92 C 200 120, 230 60, 310 90 S 380 160, 430 150" fill="none" stroke="#c8102e" stroke-width="6" stroke-linecap="round"/>' +
      '<path class="cb-bus cb-bus--2" d="M430 150 L 500 120" fill="none" stroke="#f2a900" stroke-width="6" stroke-linecap="round"/>' +
      '<path class="cb-walk" d="M500 120 L 545 98" fill="none" stroke="#1b2a4a" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>' +
      stop(120, 92) + stop(310, 90) + stop(430, 150) + stop(500, 120) +
      '<circle cx="60" cy="70" r="9" fill="#1b2a4a"/><circle cx="60" cy="70" r="16" fill="none" stroke="#1b2a4a" stroke-opacity=".3" stroke-width="2"/>' +
      '<g transform="translate(545 98)"><path d="M0 0 C -12 -14 -12 -30 0 -34 C 12 -30 12 -14 0 0Z" fill="#c8102e"/><rect x="-6" y="-26" width="12" height="9" rx="1.5" fill="#fff"/></g>' +
      '<g class="cb-label"><text x="60" y="48" text-anchor="middle">You</text><text x="545" y="40" text-anchor="middle">Cinema</text>' +
      '<text x="215" y="66">Bus</text><text x="470" y="160">Change</text></g>' +
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
