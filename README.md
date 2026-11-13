# Kestrel Air prototype (UED100 Assessment 2)
Open index.html in a browser (fictional brand; redesign responding to Assessment 1 findings on qantas.com).

- index.html: markup (loads the minified CSS/JS)
- css/styles.css, js/main.js: readable, commented sources
- css/styles.min.css, js/main.min.js: minified builds (esbuild). Rebuild after editing sources:
  npx esbuild css/styles.css --minify --outfile=css/styles.min.css
  npx esbuild js/main.js --minify --outfile=js/main.min.js
- BROWSER-SUPPORT.md: target browsers, fallbacks and a manual test log
- assets/: SVG logo, three offer illustrations (offer-*.svg), hero-loop-1080.mp4 and hero-loop-4k.mp4 (generated 12 s looping video, no audio; 4K loads only on large fast screens) and hero-poster.jpg
