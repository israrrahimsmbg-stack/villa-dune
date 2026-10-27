#!/usr/bin/env python3
"""Re-apply the Villa Dune speed and phone fixes to a fresh Claude Design export.

Run from the repository root after uploading a new index.html from Claude Design:

    python3 tools/optimize_export.py

It is safe to run more than once. It:
  * makes 320/640/960 px copies of every photo in assets/photos (and a WebP copy of any PNG/JPEG),
  * points the page at those copies with srcset so phones download small files,
  * loads React from the repository instead of unpkg.com,
  * shows the hero instantly while the page starts, with the phone layout fixes,
  * brings back the language selector (assets/languages.js),
"""
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'index.html')
PHOTOS = os.path.join(ROOT, 'assets', 'photos')
WIDTHS = (320, 640, 960)
REACT = 'assets/runtime-6822817c-e6b8-45c4-a57b-46001611e526.js'
REACT_DOM = 'assets/runtime-d49d45d7-2421-4760-bce4-e94dc5e9f9f8.js'

RESPONSIVE_CSS = """<style id="responsive-fixes">
/* Phones: the whole photograph, uncropped, directly above a solid caption panel with no empty band. */
@media(max-width:760px){
html body :is(#top,#initial-hero){min-height:0!important;height:auto!important;display:grid!important;grid-template-rows:auto auto!important;padding-top:72px;background:oklch(0.22 0.03 235)!important}
html body :is(#top,#initial-hero)>img{position:relative!important;inset:auto!important;grid-row:1;width:100%!important;height:auto!important;min-height:0;aspect-ratio:1672/941!important;object-fit:cover!important;object-position:center!important;align-self:start}
html body :is(#top,#initial-hero) .hero-shade{display:none!important}
html body :is(#top,#initial-hero) .hero-content{grid-row:2;justify-content:flex-start!important;gap:18px!important;padding:30px 24px max(36px,env(safe-area-inset-bottom))!important}
html body .hero-metrics>div{padding-right:10px!important}
html body .hero-metrics strong{font-size:20px!important;line-height:1.15!important;text-wrap:balance}
html body .floor-thumbs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px!important}
html body .floor-thumbs>div{width:auto!important;height:auto!important;aspect-ratio:1}
}
/* Tablets: keep the three wellness rooms on one row and let an odd last offer card span the row. */
@media(min-width:700px) and (max-width:1099px){
html body .wellness-gallery{grid-template-columns:repeat(3,minmax(0,1fr))!important}
html body .wellness-gallery>*{height:300px!important}
html body .offer-grid>:last-child:nth-child(odd){grid-column:1/-1}
}
@media(max-width:1099px){html body .offer-grid>article{min-height:0!important}html body .offer-grid>article>ul{margin-top:8px!important}}
/* Photo viewer: fades in, the page behind it cannot be dragged, and the photo uses the whole screen. */
.photo-viewer{background:#0c1417!important;animation:viewer-in .28s ease-out;touch-action:pinch-zoom;overscroll-behavior:contain}
.photo-viewer>img{animation:viewer-img .35s ease-out}
@keyframes viewer-in{from{opacity:0}to{opacity:1}}
@keyframes viewer-img{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:none}}
@media(max-width:760px){.photo-viewer{padding:56px 0 64px!important}.photo-viewer>img{max-height:calc(100svh - 120px)!important}.photo-viewer>p{bottom:max(20px,env(safe-area-inset-bottom))!important;padding:0 24px}}
@media(prefers-reduced-motion:reduce){.photo-viewer,.photo-viewer>img{animation:none}}
/* Landscape phones and short screens: the hero fits in the viewport instead of a 640px minimum. */
@media(min-width:761px) and (max-height:620px){html body #top,html body #initial-hero{min-height:100svh!important}html body :is(#top,#initial-hero) .hero-shade{height:70%!important}}
#initial-view header{position:absolute;inset:0 0 auto;z-index:20;padding:20px 24px;color:#fffaf2;font:24px Georgia,serif}#initial-view{position:relative}
</style>"""

LATE_SCRIPTS = (
    '<script src="assets/languages.js"></script>\n'
    "<script>(()=>{const ready=()=>{if(document.querySelector('#dc-root #top')){document.getElementById('initial-view')?.remove();observer.disconnect();}};"
    "const observer=new MutationObserver(ready);observer.observe(document.body,{childList:true,subtree:true});ready();})();</script>"
    '<noscript><p>Please enable JavaScript for the complete residence tour.</p></noscript>\n'
)


def make_copies():
    """Create WebP copies and smaller widths; return {photo path: full width}."""
    widths = {}
    for name in sorted(os.listdir(PHOTOS)):
        stem, ext = os.path.splitext(name)
        if re.search(r'-(320|640|960)$', stem) or ext.lower() not in ('.webp', '.png', '.jpg', '.jpeg'):
            continue
        if ext.lower() != '.webp' and os.path.exists(os.path.join(PHOTOS, stem + '.webp')):
            continue  # a WebP copy is already used instead
        image = Image.open(os.path.join(PHOTOS, name)).convert('RGB')
        full = os.path.join(PHOTOS, stem + '.webp')
        if ext.lower() != '.webp':
            image.save(full, 'WEBP', quality=80, method=6)
        for w in WIDTHS:
            out = os.path.join(PHOTOS, f'{stem}-{w}.webp')
            if image.width > w and not os.path.exists(out):
                image.resize((w, round(image.height * w / image.width)), Image.LANCZOS).save(out, 'WEBP', quality=78, method=6)
        widths[f'assets/photos/{stem}.webp'] = image.width
    return widths


def sub_once(pattern, repl, text, label, flags=0):
    new, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if not n:
        print(f'  ! could not find {label}; skipped')
    return new


def main():
    html = open(PAGE, encoding='utf-8').read()
    widths = make_copies()

    # Use the WebP copy of any PNG/JPEG photo.
    html = re.sub(r"assets/photos/([a-z0-9-]+)\.(?:png|jpe?g)", r'assets/photos/\1.webp', html)

    # srcset for every bundled photo; uploads made later in the editor keep their single file.
    table = json.dumps(widths, separators=(',', ':'))
    sized = ("const sized = src => { const w = " + table + "[src]; if (!w) return ''; "
             "return [320, 640, 960].filter(x => x < w).map(x => src.replace('.webp', '-' + x + '.webp') + ' ' + x + 'w').concat(src + ' ' + w + 'w').join(', '); };")
    html = sub_once(r'const sized = [^\n]*;', lambda _: sized, html, 'sized()')
    html = html.replace(r"/^assets\/view-[0-9a-f]+\.webp$/.test(it.src) ? it.src.replace('.webp', '-320.webp')",
                        "sized(it.src) ? it.src.replace('.webp', '-320.webp')")

    # Template images: add srcset/sizes where the export left them out.
    def add(src_expr, srcset_expr, sizes):
        nonlocal html
        html = re.sub(r'src="\{\{ ' + re.escape(src_expr) + r' \}\}"(?! srcset)',
                      f'src="{{{{ {src_expr} }}}}" srcset="{{{{ {srcset_expr} }}}}" sizes="{sizes}"', html)
    add('p.src', 'p.srcset', '(max-width: 760px) 100vw, 50vw')
    add('levelImg.src', 'levelImg.srcset', '(max-width: 760px) 100vw, (max-width: 1400px) 50vw, 660px')
    add('lb.src', 'lb.srcset', '100vw')
    add('single.hero.src', 'single.hero.srcset', '100vw')
    add('single.poolbar.src', 'single.poolbar.srcset', '(max-width: 760px) 100vw, 1240px')
    for key in ('bbq', 'celebrate', 'film', 'village', 'club'):
        add(f'single.{key}.src', f'single.{key}.srcset', '(max-width: 760px) 100vw, 50vw')

    # React from the repository instead of unpkg.com, and the runtime deferred.
    if 'window.__resources' not in html:
        resources = json.dumps({'https://unpkg.com/react@18.3.1/umd/react.production.min.js': REACT,
                                'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js': REACT_DOM})
        html = sub_once(r'<script src="support\.js"></script>',
                        lambda _: f'<script>window.__resources={resources};</script><script defer src="support.js"></script>',
                        html, 'support.js tag')

    # Hero photo: preload it and show a static copy until the page has started.
    hero = re.search(r"hero: '(assets/photos/[a-z0-9-]+\.webp)'", html)
    hero_src = hero.group(1) if hero else 'assets/photos/hero-pool-gardens.webp'
    w = widths.get(hero_src, 1672)
    hero_set = ', '.join([hero_src.replace('.webp', f'-{x}.webp') + f' {x}w' for x in WIDTHS if x < w] + [f'{hero_src} {w}w'])
    if 'id="responsive-fixes"' in html:
        html = re.sub(r'<style id="responsive-fixes">.*?</style>', lambda _: RESPONSIVE_CSS, html, count=1, flags=re.S)
    else:
        preload = f'<link rel="preload" as="image" href="{hero_src}" imagesrcset="{hero_set}" imagesizes="100vw">\n'
        html = sub_once(r'</head>', lambda _: preload + RESPONSIVE_CSS + '\n</head>', html, '</head>')

    if 'id="initial-view"' not in html:
        top = re.search(r'<section id="top".*?</section>', html, re.S)
        tagline = re.search(r'<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>', top.group(0), re.S).group(1) if top else ''
        place = re.search(r'<span style="width:28px[^>]*></span>([^<]+)</div>\s*<h1', top.group(0)) if top else None
        initial = f'''<div id="initial-view"><header>Villa Dune</header><section id="initial-hero" data-screen-label="Hero" style="position:relative;min-height:max(640px,100svh);display:flex;flex-direction:column;justify-content:flex-end;color:oklch(0.98 0.005 80);overflow:hidden;background:oklch(0.22 0.03 235)">
  <img fetchpriority="high" decoding="async" srcset="{hero_set}" sizes="100vw" src="{hero_src}" alt="Villa Dune — residence, pool and Mediterranean gardens" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div class="hero-shade" style="position:absolute;inset:auto 0 0;height:38%;background:linear-gradient(180deg,oklch(0.16 0.03 235 / 0) 0%,oklch(0.16 0.03 235 / .38) 55%,oklch(0.14 0.03 235 / .66) 100%)"></div>
  <div class="hero-content" style="position:relative;max-width:1320px;width:100%;margin:0 auto;padding:0 clamp(18px,4vw,48px) clamp(22px,3vw,34px);display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px 40px;text-shadow:0 1px 2px oklch(0.14 0.03 235 / .5)">
    <div style="display:flex;flex-direction:column;gap:10px;flex:1 1 420px">
      <div style="display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:oklch(0.93 0.05 60)"><span style="width:28px;height:1px;background:currentColor"></span>{place.group(1).strip() if place else 'Saint-Tropez · Pampelonne'}</div>
      <h1 style="font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(40px,5.2vw,80px);line-height:.95;letter-spacing:-.015em;margin:0">Villa Dune</h1>
      <p style="max-width:460px;font-size:15px;line-height:1.6;margin:0;color:oklch(0.96 0.01 80)">{tagline}</p>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;text-shadow:none">
      <a href="#residence" style="background:oklch(0.98 0.005 80);color:oklch(0.24 0.02 60);padding:15px 24px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;white-space:nowrap">Enter the residence</a>
    </div>
  </div>
</section></div>
'''
        html = sub_once(r'<body>\n?', lambda m: m.group(0) + initial, html, '<body>')

    if 'assets/languages.js' not in html:
        html = sub_once(r'</body>', lambda _: LATE_SCRIPTS + '</body>', html, '</body>')

    open(PAGE, 'w', encoding='utf-8').write(html)
    print(f'index.html updated; {len(widths)} photos have small copies.')


if __name__ == '__main__':
    sys.exit(main())
