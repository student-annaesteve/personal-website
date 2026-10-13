# Prompt: regenerate the Smart irrigation billboard

Copy everything below the line into a new chat with a coding assistant that can see this repository.

---

Build a single static HTML page, `billboard/smart-irrigation.html`, that renders a digital billboard collage for my project "Smart irrigation". Use only the images in `images/smart-irrigation/`. Follow every value exactly; don't add any text, lines or elements that aren't listed.

## Canvas
- A fixed 2400×1200 px board (`<main class="board">`, `position: relative; overflow: hidden`). Every child is `position: absolute`. The page body is `#1b1d1c`, a grid that centers the board. A resize handler scales the board with `transform: scale(min(innerWidth/2400, innerHeight/1200))`.
- Board background colour is paper `#efece4`.
- Colour tokens: ink `#134f5c`, teal `#45818e`, green `#3e917e`, sky `#87b2bb`, lime `#88d671`, pale `#e3ecee`, grey `#929ea0`, black `#141816`.
- Google Fonts: Anton, Caveat (weight 500).

## Texture (on top of everything)
- A paper fold at z 29 (pointer-events none):
  - Vertical: `linear-gradient(90deg, transparent 49.9%, rgba(0,0,0,.05) 50%, rgba(255,255,255,.25) 50.1%, transparent 50.3%)`.
  - Horizontal: `linear-gradient(0deg, transparent 49.8%, rgba(0,0,0,.04) 50%, transparent 50.2%)`.
- A grain at z 30:
  - An inline SVG `feTurbulence` fractalNoise, baseFrequency .9, numOctaves 2, 240px tile.
  - Colour matrix `0 0 0 0 .35  0 0 0 0 .33  0 0 0 0 .3  0 0 0 .55 0`.
  - `opacity .32; mix-blend-mode: multiply`.

## Diamond tiles (two SVG layers, viewBox 0 0 2400 1200)
- The back layer `#tiles` sits at z 2 and the front layer `#tiles-front` at z 5. Generate them with exactly this script, so the random pattern is identical:

```js
const C = ["#45818e", "#88d671", "#134f5c", "#3e917e", "#87b2bb", "#e3ecee", "#929ea0"];
const H = 70, S = H * Math.SQRT2;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const dia = (x, y, fill, extra = "") =>
  `<rect x="${-S / 2}" y="${-S / 2}" width="${S}" height="${S}" fill="${fill}" stroke="#efece4" stroke-width="3" transform="translate(${x} ${y}) rotate(45)" ${extra}/>`;
let out = "", front = "";
for (let r = 0; r * H < 1300; r++) {
  for (let x = (r % 2) * H; x < 1300; x += 2 * H) {
    const y = r * H, edge = Math.min(1, x / 1450);
    const bulge = Math.abs(y - 560) / 700;
    if (x < 420 || rnd() < 1 - edge * edge * 1.15 - bulge * 0.9) { let c = C[Math.floor(rnd() * C.length)];
      if (x > 560 && x < 1100 && y > 820) c = { "#88d671": "#134f5c", "#3e917e": "#929ea0", "#e3ecee": "#45818e" }[c] || c; // no greens behind the plant
      const d = dia(x, y, c); if (rnd() < .3) front += d; else out += d; }
  }
}
out += dia(1740, 420, "#88d671") + dia(1560, 640, "#45818e") + dia(1320, 160, "#134f5c") +
  dia(2050, 340, "#87b2bb") + dia(2240, 490, "#88d671") +
  dia(1180, 800, "#929ea0") + dia(1600, 60, "#3e917e");
document.getElementById("tiles").innerHTML = out;
document.getElementById("tiles-front").innerHTML = front;
```

## Drawn lines (behind everything, z 1)
- One SVG layer with `fill="none"`, `stroke-linecap="round"` and `stroke-linejoin="round"`, containing two paths:
  - White, stroke-width 2.5: `M-40 1010 C 260 930, 380 1000, 520 905 S 760 760, 900 820 S 1080 930, 1180 1020 S 1300 1180, 1340 1240`
  - Lime `#88d671`, stroke-width 2.5: `M560 -40 C 600 200, 680 380, 760 470 S 1010 500, 1130 590 S 1300 760, 1420 700 S 1600 560, 1800 620 S 2200 650, 2440 590`

## Images (all paths relative: `../images/smart-irrigation/…`)
- **Prototype photo**: `working.png`.
  - Position: left −150px, top 520px, width 820px, z 7.
  - `filter: saturate(.8) contrast(1.05)`, no border; it runs off the left edge.
- **Pencil sketch**: `sketch.png` as a div background.
  - Position: left 1900px, top 90px, 420×520px, `center top / contain no-repeat`, z 5.
  - `mix-blend-mode: multiply; transform: rotate(6deg)`.
- **Middle plant**: `plant-middle.png`. Position: left 720px, bottom −4px, width 390px, z 4, in colour.
- **Left plant**: `plant-left.png`. Position: left 564px, bottom −4px, width 240px, z 4, in colour.
  - Both plants sit between the two tile layers. Their ground lines line up on the bottom edge.
- **Components** (all z 8, `filter: drop-shadow(0 18px 18px rgba(0,0,0,.35))`):
  - `tile-nodemcu.png`: left 760px, top 120px, width 150px, rotate −14deg.
  - `tile-temperature.png`: left 960px, top 360px, width 160px.
  - `tile-water-sensor.png`: left 740px, top 440px, width 70px, rotate 18deg.

## Text (the only text on the board)
- **Title**: an `<h1>` in Anton, uppercase, at right 80px, bottom 70px.
  - Font-size 240px, line-height .9, letter-spacing −.01em, text-align right, colour `#141816`, z 6.
  - Markup: `Sm<span class="blue">a</span>rt<br>Irr<span class="ghost">i</span>gation`.
  - `.blue` is coloured `#87b2bb`. `.ghost` (the second I) is `color: transparent; -webkit-text-stroke: 1px #134f5c`.
- **Handwriting**: "Cada gota compta!" in Caveat.
  - Position: left 360px, top 30px, font-size 64px, line-height 1, colour `#134f5c`, `rotate(-3deg)`.
  - z 1, so the top-left tiles cover its start ("Ca") and the rest shows on bare paper.

## Source images to prepare (Python/Pillow, from `evapotranspiracio.png`)
For each crop below:
- Clear the listed boxes to transparent.
- Then make transparent every pixel with alpha < 110, or with min(r,g,b) > 185 and max−min < 40.

Crops:
- `plant-middle.png`: crop (120, 60, 420, 300).
  - Clear these boxes, in crop pixels: (0,0,31,180), (0,140,62,165), (27,127,46,142), (235,145,300,166), (262,165,300,175), (275,90,300,145), (72,47,95,72), (75,160,97,180), (256,128,275,146), (226,144,238,152).
- `plant-left.png`: crop (0, 60, 185, 300).
  - Clear (150,0,185,128) and (166,118,185,148).

Render it at 2400×1200 and check it against `billboard/preview.jpg`.
