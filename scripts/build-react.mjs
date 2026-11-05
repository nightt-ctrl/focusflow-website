import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';

const root=process.cwd();
const dist=path.join(root,'dist');
const windows=process.env.WINDOWS_DOWNLOAD_URL||'/downloads/FocusFlow-0.6.0.zip';
const android=process.env.ANDROID_DOWNLOAD_URL||'/downloads/FocusFlow-Parent-0.3.0-debug.apk';
for(const url of [process.env.WINDOWS_DOWNLOAD_URL,process.env.ANDROID_DOWNLOAD_URL].filter(Boolean)){
 if(new URL(url).protocol!=='https:')throw new Error('Public download URLs must use HTTPS.');
}
if(process.env.VERCEL&&!process.env.WINDOWS_DOWNLOAD_URL)throw new Error('Set WINDOWS_DOWNLOAD_URL to the hosted Windows release ZIP. See README.md.');
fs.mkdirSync(dist,{recursive:true});
fs.cpSync(path.join(root,'public'),dist,{recursive:true});
for(const name of ['react','react-dom'])fs.copyFileSync(path.join(root,'node_modules',name,'LICENSE'),path.join(dist,'assets',name+'-LICENSE.txt'));
fs.mkdirSync(path.join(dist,'downloads'),{recursive:true});
for(const url of [windows,android]){
 if(url.startsWith('/downloads/')){
  const from=path.join(root,url.slice(1));
  if(!fs.existsSync(from))throw new Error('Missing release file: '+from);
  fs.copyFileSync(from,path.join(dist,url.slice(1)));
 }
}
await build({entryPoints:['src/main.jsx'],outfile:'dist/assets/site.js',bundle:true,format:'esm',platform:'browser',target:'es2020',jsx:'automatic',minify:true,legalComments:'eof',define:{'process.env.NODE_ENV':'"production"'}});
fs.mkdirSync(path.join(root,'.cache'),{recursive:true});
await build({entryPoints:['src/server.jsx'],outfile:'.cache/server.cjs',bundle:true,format:'cjs',platform:'node',jsx:'automatic',external:['react','react-dom/server'],define:{'process.env.NODE_ENV':'"production"'}});
const require=createRequire(import.meta.url);
const {render}=require(path.join(root,'.cache/server.cjs'));
const metadata=JSON.parse(fs.readFileSync('src/metadata.json','utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const asset=name=>name+'?v='+createHash('sha256').update(fs.readFileSync(path.join(dist,name))).digest('hex').slice(0,10);
for(const [route,meta] of Object.entries(metadata)){
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#090a0b"><title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><link rel="icon" type="image/svg+xml" href="/assets/logo.svg"><link rel="preload" as="font" type="font/woff2" href="/assets/inter-latin.woff2" crossorigin><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/motion.css"><script src="/assets/site.js" type="module"></script></head><body><div id="root" data-react-site="true" data-route="${esc(route)}" data-windows="${esc(windows)}" data-android="${esc(android)}">${render(route,{windows,android})}</div></body></html>`;
 const fresh=html.replace('href="/styles.css"',`href="/${asset('styles.css')}"`).replace('href="/motion.css"',`href="/${asset('motion.css')}"`).replace('src="/assets/site.js"',`src="/${asset('assets/site.js')}"`);
 fs.writeFileSync(path.join(dist,route==='/'?'index.html':route.slice(1)+'.html'),fresh);
}
console.log('Built 6 React pages with prerendered HTML, hydrated controls and scroll animations.');
