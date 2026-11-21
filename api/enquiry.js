'use strict';
// Configure XR_CRM_WEBHOOK_URL and optional XR_CRM_TOKEN on the server, never in public JS.
const attempts = new Map();
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store'); res.setHeader('Content-Type','application/json');
  const reply=(status,body)=>res.status(status).json(body);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{ok:false,error:'method'});}
  const origin=req.headers.origin;
  try { if(origin && new URL(origin).host!==req.headers.host)return reply(403,{ok:false,error:'origin'}); } catch (_) { return reply(403,{ok:false,error:'origin'}); }
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return reply(415,{ok:false,error:'content_type'});
  let data;try{data=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch(_){return reply(400,{ok:false,error:'json'});}
  if(!data || Buffer.byteLength(JSON.stringify(data))>12000)return reply(413,{ok:false,error:'size'});
  const types=['enquiry','brochure','newsletter','document','alert'];
  if(!types.includes(data.type)||!data.fields||typeof data.fields!=='object'||Array.isArray(data.fields))return reply(400,{ok:false,error:'fields'});
  const fields={};for(const [key,value] of Object.entries(data.fields)){if(typeof value!=='string'||key.length>60||value.length>2000)return reply(400,{ok:false,error:'fields'});fields[key]=value.trim();}
  if(Object.keys(fields).length>15)return reply(400,{ok:false,error:'fields'});
  const email=fields.Email||'',phone=(fields.Phone||'').replace(/\D/g,'');
  const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),validPhone=phone.length>=7&&phone.length<=15;
  const emailOnly=['newsletter','document'].includes(data.type);
  if((emailOnly&&!validEmail)||(!emailOnly&&!validEmail&&!validPhone)||(['enquiry','brochure'].includes(data.type)&&String(fields.Name||'').length<2))return reply(400,{ok:false,error:'contact'});
  const key=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
  const now=Date.now(),recent=attempts.get(key);
  if((recent&&recent.until>now&&recent.count>=10)||(!recent&&attempts.size>=5000)){res.setHeader('Retry-After','60');return reply(429,{ok:false,error:'rate_limit'});}
  attempts.set(key,{until:recent&&recent.until>now?recent.until:now+60000,count:recent&&recent.until>now?recent.count+1:1});
  if(attempts.size>5000)for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
  const endpoint=process.env.XR_CRM_WEBHOOK_URL;if(!endpoint)return reply(503,{ok:false,error:'contact_handoff'});
  let upstream;try{upstream=new URL(endpoint);if(upstream.protocol!=='https:')throw new Error();}catch(_){return reply(503,{ok:false,error:'configuration'});}
  try{
    const response=await fetch(upstream,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(process.env.XR_CRM_TOKEN?{Authorization:'Bearer '+process.env.XR_CRM_TOKEN}:{})},body:JSON.stringify({type:data.type,subject:String(data.subject||'Website enquiry').slice(0,160),page:String(data.page||'').slice(0,500),fields,receivedAt:new Date().toISOString()}),signal:AbortSignal.timeout(8000)});
    if(!response.ok)return reply(502,{ok:false,error:'delivery'});
    return reply(200,{ok:true});
  }catch(_){return reply(502,{ok:false,error:'delivery'});}
};
