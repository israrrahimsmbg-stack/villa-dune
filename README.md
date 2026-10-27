# Villa Dune

Private residence presentation shared through advisors.

Website: https://israrrahimsmbg-stack.github.io/villa-dune/

The main page is index.html. Responsive terrace images, the language selector and translations are in assets/.

## Updating the page from Claude Design

Upload the new export (index.html, support.js, assets/photos) to main. The "Optimize site after upload" GitHub Action then runs `tools/optimize_export.py`, which re-applies the phone layout fixes, small photo copies, local React and the language selector, and republishes the site. To run it by hand: `pip install pillow && python3 tools/optimize_export.py`.

New English wording needs a matching entry in `assets/translations.json`, or it stays in English when another language is chosen.
