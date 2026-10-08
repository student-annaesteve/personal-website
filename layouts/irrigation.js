/*
  "Smart irrigation" has its own look, taken from the cover of the research report:
  white paper, the pencil sketch, and diamond tiles in teal, green and lime.
  Goal → solution → results, drawn as visuals (illustration, phone, laptop, waffle chart).
  Texts and photos come from projects.js; this file only draws them.
*/
(function () {
  // Colours of the report's cover.
  const C = { ink: "#134f5c", teal: "#45818e", green: "#3e917e", sky: "#87b2bb", grey: "#929ea0", lime: "#88d671", mist: "#e3ecee" };

  // Small drawings for the light tiles, like the photos set in the cover's diamonds.
  const TILE_ICONS = {
    sensor: '<g fill="none" stroke="#1c282c" stroke-width="2.4" stroke-linecap="round"><rect x="-11" y="-20" width="22" height="12" rx="2"/><path d="M-6 -8v26M6 -8v26"/></g>',
    donut: '<circle r="17" fill="none" stroke="' + "#45818e" + '" stroke-width="9"/><path d="M0 -17 A17 17 0 0 1 16 6" fill="none" stroke="#88d671" stroke-width="9"/>',
    chip: '<g fill="none" stroke="#1c282c" stroke-width="2.2"><rect x="-13" y="-13" width="26" height="26" rx="3"/><path d="M-6 -19v6M0 -19v6M6 -19v6M-6 13v6M0 13v6M6 13v6M-19 -6h6M-19 6h6M13 -6h6M13 6h6"/></g>',
    plant: '<g fill="#3e917e"><path d="M0 18V-4" stroke="#134f5c" stroke-width="2.4"/><path d="M0 -2C-4 -16 -18 -16 -20 -12C-16 -4 -6 -2 0 -2z"/><path d="M0 4C4 -10 18 -12 20 -8C16 0 6 4 0 4z"/></g>',
    drop: '<path d="M0 -20C8 -8 13 -1 13 6a13 13 0 0 1-26 0c0-7 5-14 13-26z" fill="#45818e"/>',
  };

  // A strip of diamonds (squares turned 45°) in the cover colours, a few holding a drawing.
  // It is 250 units wide and runs off the bottom; the inner edge is ragged like on the cover.
  function diamonds(rows, seed, icons) {
    let r = seed;
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    const fills = [C.ink, C.teal, C.green, C.sky, C.grey, C.lime, C.teal, C.ink, C.green, C.sky];
    const R = 50; // half diagonal
    const left = icons.slice();
    let out = "";
    for (let k = 0; k <= rows; k++) {
      const xs = k % 2 ? [50, 150, 250] : [100, 200];
      const iconHere = k % 3 === 1 && left.length ? left.shift() : null;
      xs.forEach((x, j) => {
        const isIcon = iconHere && x === (k % 2 ? 150 : 100);
        if (j === 0 && !isIcon && rnd() < 0.5) return;
        const y = k * R;
        const fill = isIcon ? C.mist : fills[Math.floor(rnd() * fills.length)];
        out += '<path d="M' + x + " " + (y - R) + "L" + (x + R) + " " + y + "L" + x + " " + (y + R) + "L" + (x - R) + " " + y + 'Z" fill="' + fill + '" stroke="#fff" stroke-width="5"/>';
        if (isIcon) out += '<g transform="translate(' + x + " " + y + ')">' + TILE_ICONS[iconHere] + "</g>";
      });
    }
    return '<svg class="irr-tiles" viewBox="0 0 250 ' + rows * R + '" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">' + out + "</svg>";
  }

  function photo(m, cls, esc) {
    if (m && m.src) return '<figure class="' + cls + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || "") + '" loading="lazy"></figure>';
    return '<figure class="' + cls + ' irr-slot"><span>' + esc((m && m.placeholder) || "Photo") + "</span></figure>";
  }

  const head = (n, title) =>
    '<header class="irr-head"><span class="irr-num" aria-hidden="true">' + n + "</span><h3>" + title + "</h3></header>";

  // Rain falling on a lawn while a sprinkler is still spraying.
  function rainScene() {
    let rain = "";
    for (let k = 0; k < 34; k++) {
      const x = 40 + ((k * 53) % 540), y = 70 + ((k * 37) % 120);
      rain += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 6) + '" y2="' + (y + 16) + '"/>';
    }
    let spray = "";
    [[-1, 150], [-1, 230], [1, 170], [1, 260]].forEach(([dir, reach]) => {
      spray += '<path d="M300 214 Q ' + (300 + dir * reach * 0.5) + " " + (110 + reach * 0.08) + " " + (300 + dir * reach) + ' 232"/>';
    });
    return (
      '<svg class="irr-scene" viewBox="0 0 600 260" role="img" aria-label="Rain falling on a lawn while a sprinkler keeps watering it">' +
      '<rect width="600" height="260" fill="#eef4f5"/>' +
      '<g fill="#c4d9dd"><circle cx="150" cy="58" r="30"/><circle cx="190" cy="44" r="38"/><circle cx="236" cy="60" r="28"/><rect x="120" y="58" width="146" height="30" rx="15"/></g>' +
      '<g fill="#87b2bb"><circle cx="400" cy="52" r="26"/><circle cx="438" cy="40" r="34"/><circle cx="478" cy="56" r="24"/><rect x="374" y="52" width="128" height="28" rx="14"/></g>' +
      '<g class="irr-rain" stroke="#45818e" stroke-width="2.4" stroke-linecap="round">' + rain + "</g>" +
      '<g class="irr-spray" fill="none" stroke="#134f5c" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="2 9">' + spray + "</g>" +
      '<polygon points="0,232 600,232 600,260 0,260" fill="#3e917e"/>' +
      '<polygon points="0,232 40,222 80,232 130,220 180,232 240,224 300,232 360,221 420,232 480,223 540,232 600,224 600,232" fill="#88d671"/>' +
      '<rect x="294" y="206" width="12" height="26" rx="3" fill="#134f5c"/><rect x="288" y="200" width="24" height="9" rx="4" fill="#134f5c"/>' +
      "</svg>"
    );
  }

  const ICONS = {
    Sense: '<path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    Decide: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    Water: '<path d="M4 9h9a3 3 0 0 1 3 3v1"/><path d="M4 6v6"/><path d="M16 17c-1 1.5-1.5 2.4-1.5 3a1.5 1.5 0 0 0 3 0c0-.6-.5-1.5-1.5-3z"/>',
  };

  function steps(list, esc) {
    return '<ol class="irr-steps">' + list.map(([name, text], k) =>
      '<li><span class="irr-step-tile"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg></span>" +
      "<strong>" + esc(name) + "</strong><span>" + esc(text) + "</span></li>").join("") + "</ol>";
  }

  // How the automatic mode decides, drawn as a soil-humidity scale.
  function scale() {
    return (
      '<div class="irr-scale" role="img" aria-label="Automatic mode: under 20% soil humidity it waters; between 20 and 60% it waters only below 10 °C; over 60% it does not water">' +
      '<div class="irr-scale-bar"><span style="flex:20">Water</span><span style="flex:40">Water if it is under 10 °C</span><span style="flex:40">No water needed</span></div>' +
      '<div class="irr-scale-ticks"><span style="left:0">0%</span><span style="left:20%">20%</span><span style="left:60%">60%</span><span style="left:100%">100%</span></div>' +
      '<p class="irr-scale-cap">Soil humidity · automatic mode</p></div>'
    );
  }

  // The Telegram bot, drawn on a phone.
  function phone() {
    const me = (t) => '<div class="tg-msg tg-me">' + t + "</div>";
    const bot = (t) => '<div class="tg-msg tg-bot">' + t + "</div>";
    return (
      '<figure class="device device--phone irr-phone"><div class="device-body"><div class="device-screen tg" role="img" aria-label="Telegram chat with the irrigation bot: status, then manual watering">' +
      '<div class="tg-top"><span class="tg-avatar"></span><span><b>Irrigation bot</b><small>online</small></span></div>' +
      '<div class="tg-chat">' +
      me("/status") +
      bot("Soil humidity <b>18%</b><br>Temperature <b>7 °C</b><br>Automatic mode: <b>watering now</b>") +
      me("/manual") +
      bot("Manual mode on. Water now?") +
      '<div class="tg-keys"><span>Water</span><span>Stop</span></div>' +
      bot("Tap open · 2 min") +
      "</div></div></div><figcaption>Control from Telegram</figcaption></figure>"
    );
  }

  // ThingSpeak-style live chart on a laptop: humidity drops, the device waters, it rises again.
  function laptop() {
    const hum = [44, 41, 37, 33, 29, 25, 21, 19, 58, 55, 51, 47, 43, 39, 35, 31, 27, 23, 19, 61, 57, 53];
    const tmp = [9, 8, 7, 7, 6, 6, 7, 8, 10, 12, 14, 15, 16, 16, 15, 13, 11, 9, 8, 7, 7, 6];
    const X = (k) => 34 + k * (300 / (hum.length - 1)), Y = (v) => 150 - v * 1.9;
    const line = (a) => a.map((v, k) => X(k).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
    const drops = [8, 19].map((k) => '<circle cx="' + X(k) + '" cy="' + Y(hum[k]) + '" r="4.5" fill="#3e917e" stroke="#fff" stroke-width="1.5"/>').join("");
    return (
      '<figure class="device device--laptop irr-laptop"><div class="device-body"><div class="device-screen irr-chart">' +
      '<svg viewBox="0 0 350 196" role="img" aria-label="Live chart: soil humidity falls to 20%, the device waters and it rises again">' +
      '<rect width="350" height="196" fill="#fff"/>' +
      '<text x="16" y="20" class="irr-chart-t">Field 1 · Soil humidity (%)</text>' +
      '<g stroke="#e3eef7">' + [0, 20, 40, 60].map((v) => '<line x1="34" x2="334" y1="' + Y(v) + '" y2="' + Y(v) + '"/>').join("") + "</g>" +
      '<g class="irr-chart-a">' + [0, 20, 40, 60].map((v) => '<text x="28" y="' + (Y(v) + 3) + '" text-anchor="end">' + v + "</text>").join("") + "</g>" +
      '<line x1="34" x2="334" y1="' + Y(20) + '" y2="' + Y(20) + '" stroke="#45818e" stroke-dasharray="4 4"/>' +
      '<text x="38" y="' + (Y(20) + 10) + '" class="irr-chart-a">water below 20%</text>' +
      '<polyline points="' + line(tmp.map((v) => v * 2.2)) + '" fill="none" stroke="#88d671" stroke-width="2"/>' +
      '<polygon points="' + X(0) + "," + Y(0) + " " + line(hum) + " " + X(hum.length - 1) + "," + Y(0) + '" fill="rgba(69,129,142,0.14)"/>' +
      '<polyline points="' + line(hum) + '" fill="none" stroke="#134f5c" stroke-width="2.6" stroke-linejoin="round"/>' + drops +
      '<g class="irr-chart-a"><rect x="40" y="172" width="10" height="3" fill="#134f5c"/><text x="54" y="176">humidity</text>' +
      '<rect x="112" y="172" width="10" height="3" fill="#88d671"/><text x="126" y="176">temperature</text>' +
      '<circle cx="200" cy="173.5" r="3.5" fill="#3e917e"/><text x="208" y="176">watering</text></g>' +
      "</svg></div></div><figcaption>Every reading logged to ThingSpeak</figcaption></figure>"
    );
  }

  // 100 people, one square each.
  function waffle(s) {
    let cells = "";
    for (let k = 0; k < s.total; k++) {
      const c = k < s.sensors ? C.ink : k < s.sensors + s.timer ? C.green : C.mist;
      cells += '<rect x="' + (k % 10) * 11 + '" y="' + Math.floor(k / 10) * 11 + '" width="9" height="9" rx="1.5" fill="' + c + '"/>';
    }
    return (
      '<figure class="irr-waffle"><svg viewBox="0 0 108 108" role="img" aria-label="' + s.total + " people surveyed: " + s.timer + " use a timer, " + s.sensors + ' use sensors">' + cells + "</svg>" +
      '<figcaption><b>' + s.total + "</b> people surveyed" +
      '<span><i style="background:#3e917e"></i>' + s.timer + " water on a timer</span>" +
      '<span><i style="background:#134f5c"></i>only ' + s.sensors + " use sensors</span></figcaption></figure>"
    );
  }

  function ring(p) {
    const C = 2 * Math.PI * 52;
    return (
      '<figure class="irr-ring"><svg viewBox="0 0 120 120" role="img" aria-label="' + p + '% expect irrigation to change">' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="#e3ecee" stroke-width="12"/>' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="#45818e" stroke-width="12" stroke-dasharray="' + (C * p / 100).toFixed(1) + " " + C.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
      '<text x="60" y="68" text-anchor="middle">' + p + "%</text></svg>" +
      "<figcaption>expect irrigation<br>to change</figcaption></figure>"
    );
  }

  window.CASE_LAYOUTS = window.CASE_LAYOUTS || {};
  window.CASE_LAYOUTS.irrigation = function (d, esc) {
    const ph = d.photos || {};
    const facts = (d.facts || []).map((f) => "<li>" + esc(f) + "</li>").join("");
    let h =
      '<div class="irr">' +
      '<section class="irr-hero">' + diamonds(18, 11, ["sensor", "donut", "chip", "plant", "drop", "sensor"]) +
      '<div class="irr-hero-in">' +
      '<h2 class="irr-title">' + esc(d.headline || d.title) + "</h2>" +
      (d.subtitle ? '<p class="irr-sub">' + esc(d.subtitle) + "</p>" : "") +
      (d.sketch ? '<img class="irr-sketch" src="' + esc(d.sketch.src) + '" alt="' + esc(d.sketch.alt || "") + '">' : "") +
      (facts ? '<ul class="irr-facts">' + facts + "</ul>" : "") +
      "</div></section>";

    h += '<section class="irr-sec">' + head("01", "The goal") +
      '<p class="irr-hook">' + esc(d.goal.hook) + "</p>" +
      '<p class="irr-text">' + esc(d.goal.text) + "</p>" + rainScene() + "</section>";

    h += '<section class="irr-sec">' + head("02", "The solution") +
      '<p class="irr-text irr-text--lead">' + esc(d.solution.text) + "</p>" +
      steps(d.solution.steps, esc) + scale() +
      '<div class="irr-devices">' + laptop() + phone() + "</div>" +
      '<div class="irr-photos">' + photo(ph.hero, "irr-photo", esc) + photo(ph.build, "irr-photo", esc) + "</div></section>";

    h += '<section class="irr-sec irr-sec--results">' + diamonds(12, 23, []) +
      '<div class="irr-results-in">' + head("03", "The results") +
      '<div class="irr-figs">' + waffle(d.results.survey) + ring(d.results.survey.expect) + "</div>" +
      '<p class="irr-text">' + esc(d.results.text) + "</p></div></section>";

    if (d.link) h += '<a class="panel-link" href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Read the full research →") + "</a>";
    return h + "</div>";
  };
})();
