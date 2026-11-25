/*
  "SolMap" (Project Red Horizon) uses the same page parts as the other projects (the ms-* blocks
  styled in mysonar.css and unified.css), recoloured in the app's Mars rust by layouts/solmap.css.
  Texts and images come from projects.js; this file only draws them.
*/
(function () {
  const head = (title) => '<header class="ms-head"><h3>' + title + "</h3></header>";
  const rows = (list, esc) => '<ol class="ms-steps">' + list.map(([t, x]) =>
    "<li><div><strong>" + esc(t) + "</strong><p>" + esc(x) + "</p></div></li>").join("") + "</ol>";

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.solmap = function (d, esc) {
    const r = d.results || {};
    let h =
      '<div class="ms sm">' +
      '<section class="ms-hero">' +
      '<h2 class="ms-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.subtitle ? '<p class="ms-sub">' + esc(d.subtitle) + "</p>" : "") +
      "</section>";

    h += '<section class="ms-sec">' + head("The challenge") +
      '<p class="ms-lead">' + esc(d.goal) + "</p>" +
      '<ol class="ms-cards">' + (d.problems || []).map(([t, x]) =>
        '<li class="ms-card"><strong>' + esc(t) + "</strong><p>" + esc(x) + "</p></li>").join("") + "</ol></section>";

    h += '<section class="ms-sec">' + head("The solution") +
      '<p class="ms-lead">' + esc(d.solution) + "</p>" +
      (d.landing ? '<figure class="ms-shot"><img src="' + esc(d.landing.src) + '" alt="' + esc(d.landing.alt || "") + '" loading="lazy"></figure>' : "") +
      rows(d.steps || [], esc) + "</section>";

    h += '<section class="ms-sec">' + head("The data") + rows(d.layers || [], esc) + "</section>";

    if (r.stats) h += '<section class="ms-sec ms-sec--results">' + head("The results") +
      '<dl class="ms-stats">' + r.stats.map(([v, k]) => '<div style="--v:100%"><dt>' + esc(v) + '</dt><i aria-hidden="true"></i><dd>' + esc(k) + "</dd></div>").join("") + "</dl></section>";

    return h + "</div>";
  };
})();
