import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
if(!fs.existsSync(root)) throw new Error('Run node scripts/build.mjs first.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.json':'application/json','.zip':'application/zip','.apk':'application/vnd.android.package-archive','.mp4':'video/mp4'};
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
 if(path.extname(target)==='.mp4'){
  headers['Accept-Ranges']='bytes';
  const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if(range && (range[1] || range[2])){
   const start=range[1]?Number(range[1]):Math.max(0,stat.size-Number(range[2]));
   const end=range[1]&&range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;
   if(start>end){
    res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});
    return res.end();
   }
   headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
   headers['Content-Length']=end-start+1;
   res.writeHead(206,headers);
   if(req.method==='HEAD')return res.end();
   return fs.createReadStream(target,{start,end}).pipe(res);
  }
 }
 res.writeHead(200,headers);
 if(req.method==='HEAD')return res.end();
 fs.createReadStream(target).pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'127.0.0.1',()=>console.log(`FocusTether preview: http://127.0.0.1:${port}`));
