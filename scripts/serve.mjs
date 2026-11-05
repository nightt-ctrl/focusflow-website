import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
if(!fs.existsSync(root)) throw new Error('Run node scripts/build.mjs first.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.zip':'application/zip','.apk':'application/vnd.android.package-archive'};
const server=http.createServer((req,res)=>{
 let name;
 try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 let target=path.resolve(root,'.'+name);
 if(target!==root && !target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(target===root)target=path.join(root,'index.html');
 if(!path.extname(target))target+='.html';
 if(!fs.existsSync(target) && name.startsWith('/downloads/'))target=path.join(path.resolve('downloads'),path.basename(name));
 if(!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return fs.createReadStream(path.join(root,'404.html')).pipe(res);}
 const stat=fs.statSync(target);
 const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':stat.size,'X-Content-Type-Options':'nosniff'};
 if(target.includes(path.sep+'downloads'+path.sep))headers['Content-Disposition']='attachment; filename="'+path.basename(target)+'"';
 res.writeHead(200,headers);
 if(req.method==='HEAD')return res.end();
 fs.createReadStream(target).pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'127.0.0.1',()=>console.log(`FocusFlow preview: http://127.0.0.1:${port}`));
