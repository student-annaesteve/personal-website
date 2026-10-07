# Personal website

A design portfolio drawn as a 3D low-poly mountain range (three.js, no build step).
Every project is a flagged summit on the trail; the highest peak is "About me".

- `projects.js`: **your content**. Add, remove or reorder projects here; the range rebuilds itself.
- `world.js`: the 3D scene (terrain, trees, clouds, flags, camera) and the project panel.
- `styles.css`: the interface (trail sign, peak tags, panel). Colours and fonts are at the top.
- `images/`: put your photo and project images here.

## Preview locally

Open `index.html` in your browser, or run:

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
