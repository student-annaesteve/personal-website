# Personal website

A design portfolio drawn as a survey map of a mountain (three.js, no build step). The map builds itself
on every visit: a survey grid draws out, the terrain rises in a scanning wave, contour lines trace by
elevation and the summit beacons switch on.
Every project is a numbered summit on the trail; the last project sits on the main summit. "About me"
opens from the round button in the top-right corner.

- `projects.js`: **your content**. Add, remove or reorder projects here; the range rebuilds itself.
- `world.js`: the survey map (wireframe mesh that is densest at the summit and opens up towards the
  edges, contour lines, summit beacons, build animation, camera)
  and the project panel. Summits are found automatically on the height map.
- `terrain.js`: a 160×160 height map converted from [“Rugged mountain landscape”](https://sketchfab.com/3d-models/rugged-mountain-landscape-61f68892e8b34f8a9fbd57a5243ea142)
  by [teej_fbx](https://sketchfab.com/Tom.Jansen1), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  Keep the credit line on the page.
- `styles.css`: the interface (trail sign, peak tags, panel). Colours and fonts are at the top.
- `images/`: put your photo and project images here.

## Preview locally

Open `index.html` in your browser, or run a small local server:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publish on GitHub Pages

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch** and pick the branch and `/ (root)`.
3. The site goes live at `https://student-annaesteve.github.io/personal-website/`.
   To use the shorter `https://student-annaesteve.github.io`, rename the repo to `student-annaesteve.github.io`.

## Custom domain (later)

In **Settings → Pages → Custom domain**, enter your domain. At your domain provider, point the DNS records at GitHub:

- `A` records for the apex domain: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` record for `www`: `student-annaesteve.github.io`

Then turn on **Enforce HTTPS**.
