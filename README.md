# Personal website

A minimal projects-showcase site in plain HTML and CSS with no build step.

- `index.html`: the content. Search for `EDIT:` to find the parts to change.
- `styles.css`: the design. Change the colors and fonts at the top.
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
