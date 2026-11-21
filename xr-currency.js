(() => {
  const codes=['AED','USD','GBP','EUR','INR','SAR','CNY','RUB'];
  const reference={AED:1,USD:1/3.6725,GBP:1/4.90,EUR:1/4.25,INR:1/0.0425,SAR:1/0.979,CNY:1/0.515,RUB:1/0.045};
  let rates={...reference},asOf=null,next=0,pending,lastAttempt=0;
  const read=k=>{try{return localStorage.getItem(k);}catch(_){return null;}};
  const write=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
  let selected=codes.includes(read('xr-currency'))?read('xr-currency'):'AED';
  const emit=()=>{if(typeof window.dispatchEvent==='function')window.dispatchEvent(new CustomEvent('xr-currency'));};
  function accept(data){if(data?.result!=='success'||data.base_code!=='AED'||!codes.every(c=>Number.isFinite(data.rates?.[c])&&data.rates[c]>0)||!Number.isFinite(data.time_last_update_unix))return false;rates=Object.fromEntries(codes.map(c=>[c,data.rates[c]]));asOf=data.time_last_update_unix;next=data.time_next_update_unix||asOf+86400;return true;}
  function inr(n){const v=Math.round(n),abs=Math.abs(v);const f=x=>x.toLocaleString('en-IN',{maximumFractionDigits:2});if(abs>=1e7||abs>=1e5&&Math.abs(+(v/1e5).toFixed(2))>=100)return '₹'+f(v/1e7)+' crore';if(abs>=1e5)return '₹'+f(v/1e5)+' lakh';return '₹'+f(v);}
  function format(aed,{currency=selected,compact=false}={}){const code=codes.includes(currency)?currency:'AED';const value=Number(aed)*rates[code];if(code==='INR')return inr(value);const prefix={AED:'AED ',USD:'$',GBP:'£',EUR:'€',SAR:'SAR ',CNY:'¥',RUB:'₽'}[code];if(compact&&Math.abs(value)>=1e6)return prefix+ +(value/1e6).toFixed(2)+'M';if(compact&&Math.abs(value)>=1000)return prefix+ +(value/1000).toFixed(1)+'K';return prefix+Math.round(value).toLocaleString('en-US');}
  async function refresh(){if(pending)return pending;if(next>Date.now()/1000||Date.now()-lastAttempt<60000)return;lastAttempt=Date.now();pending=(async()=>{try{const response=await fetch('https://open.er-api.com/v6/latest/AED',{signal:AbortSignal.timeout(6000)});if(!response.ok)return;const data=await response.json();if(accept(data)){write('xr-fx',JSON.stringify(data));emit();}}catch(_){}finally{pending=null;}})();return pending;}
  try{accept(JSON.parse(read('xr-fx')||'null'));}catch(_){}
  window.XRCurrency={codes,format,inr,rate:code=>1/(rates[code]||1),get selected(){return selected;},get note(){return asOf?'Indicative rates · '+new Date(asOf*1000).toISOString().slice(0,10):'Indicative reference rates · confirm a current quote';},set(code){if(codes.includes(code)){selected=code;write('xr-currency',code);emit();refresh();}},refresh};
  if(typeof document!=='undefined'&&document.addEventListener){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(selected!=='AED')refresh();});else if(selected!=='AED')refresh();}
})();
