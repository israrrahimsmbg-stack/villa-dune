const fs = require('fs');
const path = 'work/peach-on-the-beach/index.html';
let html = fs.readFileSync(path, 'utf8');
const re = /(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;
const match = html.match(re);
let template = JSON.parse(match[2]);
const start = template.indexOf('<section id="residence"');
const end = template.indexOf('</section>', start) + 10;
let section = template.slice(start, end);
section = section.replace('<section id="residence"', '<section class="residence-redesign" id="residence"');
section = section.replace('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:24px 72px;align-items:end;margin-bottom:48px">', '<div class="residence-intro">');
section = section.replace('What separates this house is not spectacle but access: the gates close behind you, the garden meets the horizon, and Pampelonne waits at the end of a private path.', 'Sea-facing living spaces, private suites and gardens leading to Pampelonne. A house to settle into, with the beach at the end of your own path.');
section = section.replace('<div sc-camel-on-drag-over=', '<dl class="residence-facts"><div><dt>Interiors</dt><dd>600 m²</dd></div><div><dt>Bedrooms</dt><dd>1 master + 5 suites</dd></div><div><dt>Beach</dt><dd>Private path</dd></div></dl><div class="residence-gallery" sc-camel-on-drag-over=');
section = section.replace('<div draggable="{{ editing }}"', '<div class="residence-photo" draggable="{{ editing }}"');
section = section.replace('<span style="position:absolute;left:16px;bottom:14px;color:#fff;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;background:oklch(0.2 0.03 235 / .45);padding:6px 9px">', '<span class="residence-caption">');
section = section.replace(/\s*<\/div>\s*<\/section>$/, '\n    <a class="residence-next" href="#architecture">Explore the three floors <span aria-hidden="true">↓</span></a>\n  </div>\n</section>');
template = template.slice(0,start) + section + template.slice(end);
const css = `
/* Residence: a compact introduction and consistent, readable photo pairs. */
.residence-redesign{scroll-margin-top:88px;padding-top:72px!important;padding-bottom:72px!important}
.residence-intro{display:grid;grid-template-columns:1.1fr 1fr;gap:24px 64px;align-items:end;margin-bottom:32px}
.residence-intro h2{max-width:650px;font-size:clamp(38px,4.6vw,64px)!important;line-height:1.08!important}
.residence-intro p{font-size:16px!important;color:#514b43!important}
.residence-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;border-top:1px solid #d9d1c7;border-bottom:1px solid #d9d1c7;padding:22px 0;margin:0 0 32px}
.residence-facts dt{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#706255;margin-bottom:8px}
.residence-facts dd{margin:0;font-size:18px;color:#322d27}
.residence-gallery{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:28px 24px!important}
.residence-photo{grid-column:auto!important;height:auto!important;background:transparent!important;overflow:visible!important}
.residence-photo>img{height:auto!important;aspect-ratio:4/3;object-fit:cover}
.residence-caption{display:block;padding:12px 0 0;color:#514b43;font-size:12px;line-height:1.5;letter-spacing:.08em;text-transform:uppercase}
.residence-next{display:inline-flex;align-items:center;gap:24px;margin-top:32px;padding:14px 0;border-bottom:1px solid #84705b;font-size:13px;color:#514b43}
.residence-next:focus-visible{outline:2px solid #514b43;outline-offset:6px}
@media(max-width:760px){.residence-intro{grid-template-columns:1fr;gap:20px}.residence-redesign{padding-top:48px!important;padding-bottom:48px!important}.residence-intro h2{max-width:560px}.residence-facts{gap:12px}.residence-facts dd{font-size:15px}.residence-gallery{gap:24px 16px!important}}
@media(max-width:480px){.residence-gallery{grid-template-columns:1fr!important}.residence-facts{grid-template-columns:1fr;gap:12px}.residence-facts>div{display:flex;justify-content:space-between;gap:16px}.residence-facts dt{margin:0}.residence-caption{font-size:11px}}
`;
template=template.replace('</style>', css+'</style>');
html=html.replace(re,()=>match[1]+JSON.stringify(template).replace(/<\//g,'<\\/')+match[3]);
fs.writeFileSync(path,html);
JSON.parse(html.match(re)[2]);
if(!template.includes('residence-next') || !template.includes('residence-gallery')) throw Error('Missing redesign');
console.log('Residence redesign saved; embedded template parses successfully.');
