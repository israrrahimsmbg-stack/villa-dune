# Villa Dune — site

Single-page presentation for Villa Dune, a private residence above Pampelonne (Ramatuelle · Saint-Tropez).

## Files
- `index.html` — the whole site. Markup is in `<x-dc>…</x-dc>` with inline styles; behaviour (galleries, floor tour, lightbox, owner photo editor, language switch) is the `class Component` in the `<script type="text/x-dc">` block at the bottom. Photo lists and captions live in `defaults()` inside that class.
- `support.js` — runtime that renders `index.html` (React + template engine). Do not edit.
- `assets/photos/` — photographs. `assets/photos/user/` holds the owner's uploaded replacements.
- `assets/fonts/` — self-hosted Cormorant Garamond (display) and Jost (text).

## Editing notes
- Change copy directly in the markup. Change photos/captions in `defaults().galleries` and `defaults().singles`.
- The on-page photo editor saves to the visitor's browser (IndexedDB `potb-photo-editor`) only; it overrides `defaults()` in that browser. Clear site data to see the file's defaults.
- Palette: warm paper oklch(0.975 0.008 80), ink oklch(0.24 0.02 60), terracotta accent oklch(0.52 0.12 45), night/sea blue oklch(0.22–0.3 0.03–0.045 235). Square corners, 1px warm hairlines, tracked-caps labels (11px, .18–.3em).
- Serve over HTTP (GitHub Pages works); opening via file:// may block the photo editor.
