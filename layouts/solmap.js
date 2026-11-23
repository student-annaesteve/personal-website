/*
  "SolMap" (Project Red Horizon) has its own look, taken from the app:
  a starry black sky, Mars rust, the mission-patch logo and the app's data cards.
  Texts and images come from projects.js; this file only draws them.
*/
(function () {
  const head = (n, title) => '<header class="sm-head"><span class="sm-num">' + n + "</span><h3>" + title + "</h3></header>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.solmap = function (d, esc) {
    const r = d.results || {};
    let h = '<div class="sm">';

    // Head banner: shown once `banner` is set in projects.js.
    if (d.banner) h += '<figure class="sm-banner"><img src="' + esc(d.banner.src) + '" alt="' + esc(d.banner.alt || "") + '"></figure>';

    h += '<section class="sm-hero">' +
      '<img class="sm-logo" src="images/solmap/logo.png" alt="SolMap mission patch: Project Red Horizon, planetary mapping and navigation">' +
      '<div class="sm-tags">' + (d.year ? "<span>" + esc(d.year) + "</span>" : "") + (d.tags || []).map((t) => "<span>" + esc(t) + "</span>").join("") + "</div>" +
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

    if (d.link) h += '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Open the project →") + "</a>";
    return h + "</div>";
  };
})();
