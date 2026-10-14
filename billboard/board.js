// Scale the board to the window, and a seeded random so every render is identical.
function fit() { const b = document.querySelector(".board"); b.style.transform = "scale(" + Math.min(innerWidth / 2400, innerHeight / 1200) + ")"; }
addEventListener("resize", fit); addEventListener("load", fit);
function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
// Fill a field that is dense on the left and thins out towards the middle; `shape(x, y, colour)` draws one tile.
function field({ step, rowStep = step, offset = true, width = 1300, keep = 420, seed = 7, colours, shape, front = 0.3, bulgeY = 560 }) {
  const rnd = seeded(seed); let back = "", top = "";
  for (let r = 0; r * rowStep < 1300; r++) {
    for (let x = offset ? (r % 2) * step : 0; x < width; x += offset ? 2 * step : step) {
      const y = r * rowStep, edge = Math.min(1, x / (width + 150)), bulge = Math.abs(y - bulgeY) / 700;
      if (x < keep || rnd() < 1 - edge * edge * 1.15 - bulge * 0.9) {
        const t = shape(x, y, colours[Math.floor(rnd() * colours.length)], rnd);
        if (rnd() < front) top += t; else back += t;
      }
    }
  }
  return [back, top];
}
