const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
require('../scripts/normalize-proxy.cjs');
test('proxy headers produce valid launch URLs without changing ordinary requests', async()=>{
 const server=http.createServer((req,res)=>res.end(JSON.stringify({scheme:req.headers['x-forwarded-proto']??null})));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  for(const [header,expected] of [['https, https','https'],['http, https','http'],['https','https'],[undefined,null],['untrusted, https','untrusted, https']]){
   const value=await new Promise((resolve,reject)=>{
    const req=http.get({host:'127.0.0.1',port:server.address().port,headers:header?{'x-forwarded-proto':header}:{}},res=>{
     let data='';res.on('data',chunk=>data+=chunk);res.on('end',()=>resolve(JSON.parse(data).scheme));
    });req.on('error',reject);
   });
   assert.equal(value,expected);
   if(expected==='https'||expected==='http')assert.equal(new URL(`${value}://example.com/entry.bundle`).protocol,`${expected}:`);
  }
 } finally {await new Promise(resolve=>server.close(resolve));}
});
