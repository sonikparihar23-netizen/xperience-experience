(() => {
  'use strict';
  if (window.__xrEnhancements) return; window.__xrEnhancements=true;
  const money=window.XRCurrency;
  let queued=false, modal=null, opener=null;
  const focusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
  function visible(el){return el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';}
  function rateNote(){const p=document.createElement('p');p.className='xr-rate-note';const note=document.createElement('span');note.textContent=money.note+' · ';const a=document.createElement('a');a.href='https://www.exchangerate-api.com';a.textContent='Rates by ExchangeRate-API';a.target='_blank';a.rel='noopener noreferrer';p.append(note,a);return p;}
  function attach(){
    queued=false; const root=document.querySelector('#dc-root');if(!root)return;
    let skip=document.querySelector('.xr-skip-link');
    const main=root.querySelector('main')||root.querySelector('h1')?.closest('section')||root.querySelector('section');
    if(main){main.id='xr-main';main.setAttribute('tabindex','-1');if(!skip){skip=document.createElement('a');skip.href='#xr-main';skip.className='xr-skip-link';skip.textContent='Skip to content';document.body.prepend(skip);}}
    const panel=root.querySelector('.xr-header-tools-panel');
    if(panel&&!panel.querySelector('.xr-currency-control')){const label=document.createElement('label');label.className='xr-currency-control';label.append(document.createTextNode('Currency'));const select=document.createElement('select');select.setAttribute('aria-label','Display currency');for(const code of money.codes){const option=document.createElement('option');option.value=code;option.textContent=code;select.append(option);}select.value=money.selected;select.addEventListener('change',()=>money.set(select.value));label.append(select);panel.append(label);}
    document.querySelectorAll('.xr-currency-control select').forEach(el=>{if(el.value!==money.selected)el.value=money.selected;});
    const footer=root.querySelector('footer');
    if(footer&&!footer.querySelector('.xr-company-identifiers')){const info=window.XR_CONFIG.company;const parts=[info.orn?'RERA ORN '+info.orn:null,info.licence?'Trade licence '+info.licence:null].filter(Boolean);if(parts.length){const span=document.createElement('span');span.className='xr-company-identifiers';span.textContent=parts.join(' · ');footer.append(span);}}
    const calc=root.querySelector('[role="dialog"][aria-label="Currency and area calculator"]');
    for(const parent of [money.selected!=='AED'?footer:null,calc].filter(Boolean))if(!parent.querySelector('.xr-rate-note'))parent.append(rateNote());
    document.querySelectorAll('.xr-rate-note span').forEach(el=>{const text=money.note+' · ';if(el.textContent!==text)el.textContent=text;});
    if(money.selected==='AED'&&footer)footer.querySelector('.xr-rate-note')?.remove();
    const next=[...root.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible).at(-1)||null;
    if(next!==modal){const old=modal;modal=next;if(next){opener=document.activeElement;const first=[...next.querySelectorAll(focusable)].find(visible);(first||next).focus();}else if(old&&opener?.isConnected){opener.focus();opener=null;}}
  }
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(attach);}};
  document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!modal||document.querySelector('dialog[open]'))return;const controls=[...modal.querySelectorAll(focusable)].filter(visible);if(!controls.length){e.preventDefault();return;}const first=controls[0],last=controls.at(-1);if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus();}});
  // Consent-aware local events only. No external analytics script or destination is enabled.
  const consent=()=>{try{return localStorage.getItem('xr-consent')==='all';}catch(_){return false;}};
  window.XRTrack=(event,details={})=>{if(!consent())return;const safe={event,path:location.pathname,...Object.fromEntries(Object.entries(details).filter(([k,v])=>['type','action'].includes(k)&&typeof v==='string'))};window.dispatchEvent(new CustomEvent('xr-analytics',{detail:safe}));};
  document.addEventListener('click',e=>{const el=e.target.closest('a,button');if(!el)return;let action;if(el.matches('[aria-label*="shortlist"],[aria-label*="Save"]'))action='shortlist';else if(el.matches('[aria-label*="profile"]'))action='profile_view';else if(el.matches('a[href^="https://wa.me/"]'))action='whatsapp';else if(el.matches('a[href^="tel:"]'))action='call';if(action)window.XRTrack('site_action',{action});});
  document.addEventListener('submit',e=>{if(e.target.getAttribute('role')==='search')window.XRTrack('property_search');});
  window.addEventListener('xr-currency',schedule);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});attach();
})();
