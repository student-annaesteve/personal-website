/*
  "MySónar" has its own look, taken from the project's deck and app:
  black screens, Sónar yellow, pill cards and hazard-stripe rails.
  Texts and images come from projects.js; this file only draws them.
*/
(function () {
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';

  const head = (n, title) => '<header class="ms-head"><span class="ms-num">' + n + "</span><h3>" + title + "</h3></header>";

  // A problem as one of the app's day/night cards: dots for the day, sun or moon, the date.
  function card([title, text, when, date], k, esc) {
    const dots = [0, 1, 2].map((j) => "<i" + (j <= k ? ' class="on"' : "") + "></i>").join("");
    return (
      '<li class="ms-card' + (k === 0 ? " ms-card--on" : "") + '">' +
      "<strong>" + esc(title) + "</strong><p>" + esc(text) + "</p>" +
      '<div class="ms-card-foot"><span class="ms-pill">' + dots + '<span class="ms-ico">' + (when === "night" ? MOON : SUN) + "</span></span>" +
      "<span>" + esc(date) + "</span></div></li>"
    );
  }

  function phone(m, esc) {
    return (
      '<figure class="ms-phone"><div class="ms-phone-body"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy"></div>' +
      "<figcaption>" + esc(m.label) + "</figcaption></figure>"
    );
  }

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.mysonar = function (d, esc) {
    const r = d.results || {};
    let h =
      '<div class="ms">' +
      '<section class="ms-hero">' +
      '<div class="ms-tags">' + (d.year ? "<span>" + esc(d.year) + "</span>" : "") + (d.tags || []).map((t) => "<span>" + esc(t) + "</span>").join("") + "</div>" +
      '<img class="ms-skyline" src="images/mysonar/skyline.png" alt="Line drawing of the Barcelona skyline with music pins">' +
      '<h2 class="ms-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.subtitle ? '<p class="ms-sub">' + esc(d.subtitle) + "</p>" : "") +
      '<span class="ms-btn" aria-hidden="true">Start now ›</span>' +
      "</section>";

    h += '<section class="ms-sec">' + head("01", "The problem") +
      '<ol class="ms-cards">' + (d.problems || []).map((p, k) => card(p, k, esc)).join("") + "</ol>" +
      '<p class="ms-lead">' + esc(d.goal) + "</p></section>";

    h += '<section class="ms-sec">' + head("02", "The solution") +
      '<p class="ms-lead">' + esc(d.solution) + "</p>" +
      '<div class="ms-flow" tabindex="0" aria-label="The app, screen by screen">' + (d.flow || []).map((m) => phone(m, esc)).join("") + "</div>" +
      '<ol class="ms-steps">' + (d.steps || []).map(([t, x], k) =>
        '<li><span class="ms-step-n">' + (k + 1) + "</span><div><strong>" + esc(t) + "</strong><p>" + esc(x) + "</p></div></li>").join("") + "</ol>" +
      '<figure class="ms-shot"><img src="images/mysonar/embeddings.jpg" alt="3D embedding space: every artist is a ball, your taste is a point among them" loading="lazy"><figcaption>Every artist is a point; your swipes find where you are.</figcaption></figure>' +
      "</section>";

    h += '<section class="ms-sec ms-sec--results">' + head("03", "The results") +
      '<dl class="ms-stats">' + (r.stats || []).map(([v, k]) => "<div><dt>" + esc(v) + "</dt><dd>" + esc(k) + "</dd></div>").join("") + "</dl>" +
      (r.models ? '<div class="ms-models"><p class="ms-models-t">People who liked their schedule, by embedding model</p>' +
        r.models.map(([n, v]) => '<div class="ms-bar"><span>' + esc(n) + '</span><b style="--v:' + v + '%"><i>' + v + "%</i></b></div>").join("") + "</div>" : "") +
      '<p class="ms-text">' + esc(r.text || "") + "</p>" +
      '<figure class="ms-shot"><img src="images/mysonar/testing.jpg" alt="Students testing the app on campus" loading="lazy"></figure>' +
      "</section>";

    if (d.link) h += '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Open the project →") + "</a>";
    return h + "</div>";
  };
})();
