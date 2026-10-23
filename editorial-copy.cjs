const fs=require('fs'),crypto=require('crypto');
const original='outputs/peach-on-the-beach-complete.html';
const hash=()=>crypto.createHash('sha256').update(fs.readFileSync(original)).digest('hex');const before=hash();
let html=fs.readFileSync('work/peach-on-the-beach/index.html','utf8');
const re=/(<script type="__bundler\/template">\s*)([\s\S]*?)(\s*<\/script>)/;const m=html.match(re);let t=JSON.parse(m[2]);
// Keep every gallery and photograph; change presentation and the enquiry ending.
t=t.replace("navLinks: [{ href: '#residence', label: 'Residence' }, { href: '#architecture', label: 'Architecture' }, { href: '#experience', label: 'Experience' }, { href: '#peninsula', label: 'Location' }, { href: '#arrangements', label: 'Arrangements' }]", "navLinks: [{ href: '#residence', label: 'Residence' }, { href: '#architecture', label: 'Interiors' }, { href: '#outdoors', label: 'Outdoors' }, { href: '#table', label: 'Dining' }, { href: '#experience', label: 'Occasions' }, { href: '#peninsula', label: 'Location' }, { href: '#arrangements', label: 'Private enquiries' }]");
t=t.replace('The position is described, never exposed.', 'Exact address shared privately through your advisor.');
const a=t.indexOf('<section id="arrangements"');const b=t.indexOf('</section>',a)+10;
const arrangements=`<section id="arrangements" class="private-enquiries" data-screen-label="Private enquiries">
<div class="enquiries-inner"><div class="enquiries-heading"><div class="editorial-label">By private introduction</div><h2>Your time at<br>Pampelonne.</h2><p>One residence, reserved in full for your party. Your advisor is your point of contact for availability, rates and the details of your stay.</p></div>
<div class="enquiries-details"><div class="editorial-label">The residence, exclusively yours</div><h3>A private stay, arranged around you.</h3><dl class="stay-details"><div><dt>Accommodation</dt><dd>One master and five en-suite guest rooms, a separate children’s floor, and staff accommodation sleeping four.</dd></div><div><dt>At the house</dt><dd>Pool, gardens, gym, spa and hammam. Sea-view terraces, outdoor kitchen, two bars and barbecue. Private beach access within the community.</dd></div><div><dt>Housekeeping</dt><dd>Daily housekeeping and caretaker. Dates, terms, inclusions and additional services are confirmed in writing.</dd></div><div><dt>Private occasions & productions</dt><dd>Intimate celebrations, film and photography are considered individually. Production usage, crew scope and access require written approval.</dd></div></dl>
<div class="advisor-note"><span class="editorial-label">Continue with your advisor</span><p>Reply to the agent who shared this presentation with your preferred dates, party size and any particular requirements.</p><span>Availability and rates on request.</span></div></div></div></section>`;
if(a<0)throw Error('Missing enquiry section');t=t.slice(0,a)+arrangements+t.slice(b);
const css=`
/* Alternative editorial direction, separate from the original presentation. */
body{background:#f6f3ed!important;color:#292c28!important;font-weight:400!important}
section[id]{scroll-margin-top:88px}
section:not(#top){padding-top:clamp(56px,7vw,104px)!important;padding-bottom:clamp(56px,7vw,104px)!important}
section h2{font-weight:400!important;line-height:1.08!important;letter-spacing:-.025em}
section p{font-weight:400!important;line-height:1.8!important}
section p:not([style*="0.96"]){color:#57574e!important}
header nav{gap:clamp(10px,1.2vw,20px)!important;letter-spacing:.09em!important;font-size:10px!important}
header nav a:last-child{border-bottom:1px solid currentColor;padding-bottom:5px}
a:focus-visible,button:focus-visible,[role="button"]:focus-visible{outline:2px solid #9a7857;outline-offset:5px}
#architecture{background:#eae8df!important}#outdoors{background:#f6f3ed!important}#table{background:#eeece4!important}
#experience{background:#f6f3ed!important}#peninsula{background:#eeece4!important}
#residence .residence-intro{gap:24px 64px}
#residence .residence-facts{border-color:#ccc8bb}
#architecture h3,#table h3{line-height:1.15!important}
.private-enquiries{background:#253b35!important;color:#f7f3e9!important;padding-left:clamp(22px,5vw,64px)!important;padding-right:clamp(22px,5vw,64px)!important}
.enquiries-inner{max-width:1320px;margin:auto;display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(36px,7vw,108px)}
.editorial-label{font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;line-height:1.6}
.enquiries-heading>.editorial-label{color:#d7c7ab}.enquiries-heading h2{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,6vw,84px);margin:24px 0;line-height:1.02!important}
.private-enquiries p{color:#e2e4db!important;font-size:16px;max-width:440px}.enquiries-details h3{font:400 32px/1.15 'Cormorant Garamond',serif;margin:16px 0 28px}
.stay-details{margin:0}.stay-details>div{border-top:1px solid #617169;padding:18px 0;display:grid;grid-template-columns:130px 1fr;gap:20px}.stay-details dt{font-size:13px;font-weight:500}.stay-details dd{font-size:14px;line-height:1.75;color:#e2e4db;margin:0}
.advisor-note{margin-top:28px;padding:26px;border:1px solid #819184}.advisor-note p{font-size:16px;max-width:none;margin:14px 0}.advisor-note>span:last-child{font-size:13px;color:#d7c7ab}
footer{padding-bottom:56px!important;background:#1d302b!important}
@media(max-width:900px){.enquiries-inner{grid-template-columns:1fr}.enquiries-heading p{max-width:600px}header nav{gap:10px!important;font-size:9px!important}}
@media(max-width:600px){.stay-details>div{grid-template-columns:1fr;gap:8px}.advisor-note{padding:22px}.private-enquiries p{font-size:15px}section h2{font-size:40px!important}section[id]{scroll-margin-top:80px}}
`;
t=t.replace('</style>',css+'</style>');
// All photo captions remain available, now on a legible solid backing.
t=t.replaceAll('font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;background:oklch(0.2 0.03 235 / .45);padding:6px 9px','font-size:12px;letter-spacing:.1em;text-transform:uppercase;background:oklch(0.2 0.03 235 / .85);padding:8px 11px');
html=html.replace(re,()=>m[1]+JSON.stringify(t).replace(/<\//g,'<\\/')+m[3]);
JSON.parse(html.match(re)[2]);
const root='work/peach-on-the-beach/';const refs=[...new Set(html.match(/assets\/[A-Za-z0-9_./-]+/g)||[])].sort((a,b)=>b.length-a.length);
const mime={jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',png:'image/png',woff2:'font/woff2',svg:'image/svg+xml'};
for(const ref of refs){const ext=ref.split('.').pop();const data='data:'+(mime[ext]||'application/octet-stream')+';base64,'+fs.readFileSync(root+ref).toString('base64');html=html.split(ref).join(data);}
fs.writeFileSync('outputs/peach-on-the-beach-editorial-copy.html',html);
if(hash()!==before)throw Error('Original changed');
const oldT=JSON.parse(m[2]);const images=x=>[...x.matchAll(/assets\/[A-Za-z0-9_./-]+/g)].map(v=>v[0]);
const missing=images(oldT).filter(x=>!t.includes(x));if(missing.length)throw Error('Photos removed: '+missing);
console.log(JSON.stringify({originalUnchanged:true,allPhotoReferencesPreserved:true,embeddedAssets:refs.length,newFileMB:(Buffer.byteLength(html)/1048576).toFixed(1)}));
