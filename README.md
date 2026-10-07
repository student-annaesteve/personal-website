# Personal website

A design portfolio set in a 3D mountain range (three.js, no build step).
Every project is a flagged summit on the trail; the highest peak is "About me".

- `projects.js`: **your content**. Add, remove or reorder projects here; the range rebuilds itself.
- `world.js`: the 3D scene (mountain, clouds, flags, camera) and the project panel. Flags are planted
  automatically on the highest peaks of the model. If the model can't load, a generated low-poly range is used.
- `models/mountain.glb`: [“Rugged mountain landscape”](https://sketchfab.com/3d-models/rugged-mountain-landscape-61f68892e8b34f8a9fbd57a5243ea142)
  by [teej_fbx](https://sketchfab.com/Tom.Jansen1), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  Simplified for the web (fewer triangles, unused data removed, textures resized). Keep the credit line on the page.
- `styles.css`: the interface (trail sign, peak tags, panel). Colours and fonts are at the top.
- `images/`: put your photo and project images here.

## Preview locally

Browsers block loading the 3D model from a file opened directly, so run a small local server:

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
