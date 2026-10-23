const fs=require('fs'),path=require('path');
const root=path.resolve('work/peach-on-the-beach');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const refs=[...new Set(html.match(/assets\/[A-Za-z0-9_./-]+/g)||[])].sort((a,b)=>b.length-a.length);
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4'};
let count=0;
for(const ref of refs){const file=path.join(root,ref);if(!fs.existsSync(file)) throw Error('Missing '+ref);const data='data:'+(mime[path.extname(file)]||'application/octet-stream')+';base64,'+fs.readFileSync(file).toString('base64');html=html.split(ref).join(data);count++;}
fs.writeFileSync('outputs/peach-on-the-beach-complete.html',html);
console.log(JSON.stringify({embeddedFiles:count,sizeMB:(Buffer.byteLength(html)/1048576).toFixed(1)}));
