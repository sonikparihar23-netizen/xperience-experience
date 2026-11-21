(() => {
  'use strict';
  const cfg = window.XR_CONFIG;
  let active = null;
  function close() { if (!active) return; const {dialog, opener} = active; dialog.close(); dialog.remove(); active = null; if (opener?.isConnected) opener.focus(); }
  function show(payload, delivered) {
    if (active) close();
    const opener = document.activeElement, dialog = document.createElement('dialog');
    dialog.className = 'xr-request-dialog'; dialog.setAttribute('aria-labelledby','xr-request-title');
    const title = document.createElement('h2'); title.id = 'xr-request-title'; title.textContent = delivered ? 'Request received' : 'Complete your request';
    const message = document.createElement('p'); message.textContent = delivered ? 'Your request has been received. Keep your contact details available for our team’s reply.' : 'Your request has not been sent yet. Choose a contact option below, review the message, and send it to Xperience Realty.';
    const summary = document.createElement('pre');
    const text = [payload.subject, ...Object.entries(payload.fields).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`), `Page: ${payload.page}`].join('\n');
    summary.textContent = text;
    const actions = document.createElement('div'); actions.className = 'xr-request-actions';
    if (!delivered) {
      const wa = document.createElement('a'); wa.textContent = 'Continue to WhatsApp'; wa.href = 'https://wa.me/' + String(payload.agent || cfg.company.whatsapp).replace(/\D/g,'') + '?text=' + encodeURIComponent(text); wa.target = '_blank'; wa.rel = 'noopener noreferrer';
      const email = document.createElement('a'); email.textContent = 'Send by email'; email.href = 'mailto:' + cfg.company.email + '?subject=' + encodeURIComponent(payload.subject) + '&body=' + encodeURIComponent(text);
      if (payload.type !== 'newsletter') actions.append(wa); actions.append(email);
    }
    const done = document.createElement('button'); done.type='button'; done.textContent = delivered ? 'Close' : 'Back to form'; done.addEventListener('click', close); actions.append(done);
    dialog.append(title,message,summary,actions); document.body.append(dialog); active={dialog,opener};
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();}); dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
    dialog.showModal(); done.focus();
  }
  async function submit(form, input) {
    if (form?.dataset.xrSending) return;
    const fields = Object.fromEntries(Object.entries(input.fields || {}).map(([k,v]) => [k, String(v || '').trim().slice(0,2000)]));
    const payload = {...input, fields, page: location.pathname + location.search};
    const button = form?.querySelector('[type="submit"]'), label = button?.textContent;
    if (form) form.dataset.xrSending='true'; if(button){button.disabled=true;button.textContent='Preparing request…';}
    let delivered=false;
    try {
      if (location.protocol !== 'file:' && cfg.leadEndpoint) {
        const controller = new AbortController(), timer=setTimeout(()=>controller.abort(),10000);
        try { const response=await fetch(cfg.leadEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal}); const data=await response.json().catch(()=>null); delivered=response.ok && data?.ok===true; } finally {clearTimeout(timer);}
      }
    } catch (_) { /* The explicit contact handoff remains available after any delivery failure. */ }
    finally {if(form)delete form.dataset.xrSending;if(button){button.disabled=false;button.textContent=label;}}
    show(payload,delivered);
    if (delivered) window.XRTrack?.('lead_received',{type:payload.type});
    return delivered;
  }
  window.XRForms={submit,validPhone:value=>{const n=String(value||'').replace(/\D/g,'').length;return n>=7&&n<=15;}};
})();
