/*
  "SolMap" (Project Red Horizon) has its own look, taken from the app,
  set in the site's shared look (layouts/unified.css): Mars rust accents and the mission-patch logo.
  Texts and images come from projects.js; this file only draws them.
*/
(function () {
  const head = (n, title) => '<header class="sm-head"><span class="sm-num">' + n + "</span><h3>" + title + "</h3></header>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.solmap = function (d, esc) {
    const r = d.results || {};
    let h = '<div class="sm">';

    h += '<section class="sm-hero">' +
      '<img class="sm-logo" src="images/solmap/logo.png" alt="SolMap mission patch: Project Red Horizon, planetary mapping and navigation">' +
      '<h2 class="sm-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.subtitle ? '<p class="sm-sub">' + esc(d.subtitle) + "</p>" : "") +
      "</section>";

    h += '<section class="sm-sec">' + head("01", "The challenge") +
      '<p class="sm-lead">' + esc(d.goal) + "</p>" +
      '<ol class="sm-cards">' + (d.problems || []).map(([t, x]) =>
        '<li><span class="sm-dot" aria-hidden="true"></span><div><strong>' + esc(t) + "</strong><p>" + esc(x) + "</p></div></li>").join("") + "</ol>" +
      "</section>";

    h += '<section class="sm-sec">' + head("02", "The solution") +
      '<p class="sm-lead">' + esc(d.solution) + "</p>" +
      (d.landing ? '<figure class="sm-shot"><img src="' + esc(d.landing.src) + '" alt="' + esc(d.landing.alt || "") + '" loading="lazy"></figure>' : "") +
      '<ol class="sm-steps">' + (d.steps || []).map(([t, x], k) =>
        '<li><span class="sm-step-n">' + (k + 1) + "</span><div><strong>" + esc(t) + "</strong><p>" + esc(x) + "</p></div></li>").join("") + "</ol>" +
      "</section>";

    h += '<section class="sm-sec">' + head("03", "The data stack") +
      '<ul class="sm-layers">' + (d.layers || []).map(([t, x]) =>
        "<li><strong>" + esc(t) + "</strong><span>" + esc(x) + "</span></li>").join("") + "</ul>" +
      '<p class="sm-note">All open NASA data: MRO, Mars Odyssey, Mars 2020 and MSL archives.</p>' +
      "</section>";

    if (r.stats) h += '<section class="sm-sec">' + head("04", "The results") +
      '<dl class="sm-stats">' + r.stats.map(([v, k]) => "<div><dt>" + esc(v) + "</dt><dd>" + esc(k) + "</dd></div>").join("") + "</dl></section>";

    return h + "</div>";
  };
})();
