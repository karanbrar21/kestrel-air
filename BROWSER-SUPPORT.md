# Browser support (Kestrel Air prototype)

Target: current and previous major versions of Chrome, Edge and Firefox on desktop and Android;
Safari and iOS Safari 15.4 or later (released 2022).

| Feature | Why it matters | Support / fallback |
|---|---|---|
| `<dialog>` login | Modal with focus trap | Chrome 37+, Firefox 98+, Safari 15.4+. Older: JS fallback in main.js + `.fallback` CSS |
| `:focus-visible` | Keyboard focus ring | Safari 15.4+. Older: `:focus` ring still shown |
| `100dvh` | Mobile menu height | Falls back to `100vh` on the line before it |
| `inset:0` | Hero video position | `top/left/right/bottom` written first |
| `aspect-ratio` | Offer image shape | Safari 15+. Images carry width/height attributes, so shape holds anyway |
| `clamp()`, `min()` | Fluid type and grids | Chrome 79+, Firefox 75+, Safari 13.1+ |
| `accent-color` | Slider colour | Cosmetic only; default colour if unsupported |
| `navigator.connection` | Choose 1080p or 4K video | Safari/Firefox lack it; code defaults safely to the 1080p file |
| `type="date"` | Date picker | Falls back to a text box (placeholder yyyy-mm-dd) in very old browsers |
| H.264 MP4 video | Hero loop | Plays in all four browsers; poster image + pause button if autoplay is blocked |

JavaScript is compiled (esbuild) for Chrome/Edge/Firefox 90+ and Safari 14+.

## Manual test log (fill in as you test)
| Browser | Version | OS | Menu | Search | Routes | Login | Video | Notes |
|---|---|---|---|---|---|---|---|---|
| Chrome | | | | | | | | |
| Edge | | | | | | | | |
| Firefox | | | | | | | | |
| Safari (Mac) | | | | | | | | |
| Safari (iPhone) | | | | | | | | |
