const fs=require('fs');
const path='work/peach-on-the-beach/index.html';
let html=fs.readFileSync(path,'utf8');
const re=/(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;
const m=html.match(re);let t=JSON.parse(m[2]);
const start=t.indexOf('<section id="outdoors"'); const end=t.indexOf('</section>',start)+10;
if(start<0)throw Error('Outdoors section missing');
let s=t.slice(start,end);
s=s.replace('<div sc-camel-on-drag-over=', '<div class="outdoors-gallery" sc-camel-on-drag-over=');
s=s.replace('<div draggable="{{ editing }}"','<div class="outdoors-photo" draggable="{{ editing }}"');
s=s.replace('<span style="position:absolute;left:16px;bottom:14px;color:#fff;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;background:oklch(0.2 0.03 235 / .45);padding:6px 9px">','<span class="outdoors-caption">');
if(!s.includes('outdoors-photo'))throw Error('Photo markup not matched');
t=t.slice(0,start)+s+t.slice(end);
const css=`
/* One panoramic view followed by photo pairs keeps the last row complete. */
.outdoors-gallery{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:28px 24px!important}
.outdoors-photo{grid-column:auto!important;height:auto!important;background:transparent!important;overflow:visible!important}
.outdoors-photo:first-child{grid-column:1/-1!important}
.outdoors-photo>img{height:auto!important;aspect-ratio:4/3;object-fit:cover}
.outdoors-photo:first-child>img{aspect-ratio:2.2/1}
.outdoors-caption{display:block;padding-top:12px;color:#514b43;font-size:12px;line-height:1.5;letter-spacing:.08em;text-transform:uppercase}
@media(max-width:600px){.outdoors-gallery{grid-template-columns:1fr!important;gap:24px!important}.outdoors-photo:first-child>img{aspect-ratio:4/3}}
`;
t=t.replace('</style>',css+'</style>');
html=html.replace(re,()=>m[1]+JSON.stringify(t).replace(/<\//g,'<\\/')+m[3]);
fs.writeFileSync(path,html);JSON.parse(html.match(re)[2]);
fs.copyFileSync(path,'outputs/index.html');
console.log('Outdoors grid updated: panoramic image + two pairs.');
