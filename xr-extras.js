(function () {
  if (window.__xrExtras) return; window.__xrExtras = true;
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  // Cookie consent
  function banner(force) {
    if (!force && get('xr-consent')) return;
    if (document.getElementById('xr-consent')) return;
    const d = document.createElement('div');
    d.id = 'xr-consent'; d.dir = get('xr-lang') === 'ar' ? 'rtl' : 'ltr'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie preferences');
    d.style.cssText = "position:fixed;left:16px;right:16px;bottom:calc(16px + var(--xr-bar,0px));z-index:9999;max-width:560px;margin-inline:auto;background:#0A0A0A;color:#E6E6E6;border:1px solid rgba(255,145,0,.35);border-radius:14px;padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;font:400 14px/1.5 'Hanken Grotesk',system-ui,sans-serif;box-shadow:0 24px 48px -16px rgba(0,0,0,.5)";
    d.innerHTML = "<span style='flex:1 1 260px'>We use cookies to improve your experience and measure site performance. <a href='https://www.xrealty.ae/privacy-policy/' style='color:#FFFFFF;text-decoration:underline'>Privacy policy</a></span>" +
      "<span style='display:flex;gap:8px'><button data-v='essential' style='height:42px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:transparent;color:#FFFFFF;font:600 13px inherit;cursor:pointer'>Essential only</button>" +
      "<button data-v='all' style='height:42px;padding:0 18px;border-radius:999px;border:none;background:#FF9100;color:#0A0A0A;font:700 13px inherit;cursor:pointer'>Accept all</button></span>";
    d.addEventListener('click', e => { const v = e.target && e.target.getAttribute('data-v'); if (v) { set('xr-consent', v); d.remove(); } });
    document.body.appendChild(d);
  }
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href="#cookie-settings"]'); if (a) { e.preventDefault(); banner(true); } });
  const start = () => { if (window.innerWidth < 1180) document.documentElement.style.setProperty('--xr-bar', '72px'); setTimeout(() => banner(false), 900); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();

  // Lead source capture — ready for CRM hookup.
  // Set window.XR_CRM_ENDPOINT = 'https://…' to POST each lead as JSON.
  const q = new URLSearchParams(location.search);
  if (!get('xr-first-touch')) set('xr-first-touch', JSON.stringify({ landing: location.pathname, referrer: document.referrer || null, utm: Object.fromEntries([...q].filter(([k]) => k.startsWith('utm_'))), at: new Date().toISOString() }));
  document.addEventListener('submit', e => {
    const f = e.target; if (!f || f.getAttribute('role') === 'search' || f.querySelector('input[type="search"]')) return;
    const fields = {};
    f.querySelectorAll('input,select,textarea').forEach((el, i) => { if (el.type === 'radio' && !el.checked) return; const k = el.getAttribute('aria-label') || el.getAttribute('autocomplete') || el.name || el.type || 'field' + i; if (el.value) fields[k] = el.value; });
    const pressed = [...f.querySelectorAll('[aria-pressed="true"]')].map(b => b.textContent.trim());
    if (!Object.keys(fields).length) return;
    const lead = { page: document.title || location.pathname, path: location.pathname, property: q.get('p'), community: q.get('c'), interest: pressed, fields, firstTouch: JSON.parse(get('xr-first-touch') || 'null'), lang: document.documentElement.lang, at: new Date().toISOString() };
    let all = []; try { all = JSON.parse(get('xr-leads') || '[]'); } catch (err) {}
    all.push(lead); set('xr-leads', JSON.stringify(all.slice(-50)));
    window.dispatchEvent(new CustomEvent('xr-lead', { detail: lead }));
    if (window.XR_CRM_ENDPOINT) fetch(window.XR_CRM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }).catch(() => {});
  }, true);

  // ---- Full-page Arabic translation ----
  const lang = () => get('xr-lang') === 'ar' ? 'ar' : 'en';
  const fontCss = "html[lang=ar] body,html[lang=ar] input,html[lang=ar] button,html[lang=ar] select,html[lang=ar] textarea{font-family:'IBM Plex Sans Arabic','Hanken Grotesk',sans-serif!important}html[lang=ar] [style*='Instrument Serif']{font-family:'Noto Naskh Arabic','Instrument Serif',serif!important;letter-spacing:0!important;line-height:1.25!important}html[lang=ar] [style*='letter-spacing']{letter-spacing:0!important}html[lang=ar] [style*='uppercase']{text-transform:none!important}";
  function addHead() {
    if (document.getElementById('xr-ar-font')) return;
    const l = document.createElement('link'); l.id = 'xr-ar-font'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;600&display=swap'; document.head.appendChild(l);
    const st = document.createElement('style'); st.textContent = fontCss; document.head.appendChild(st);
  }
  let dictP = null;
  const loadDict = () => dictP || (dictP = new Promise(res => { if (window.XR_AR) return res(window.XR_AR); const sc = document.createElement('script'); sc.src = './xr-i18n-ar.js'; sc.onload = () => res(window.XR_AR || {}); sc.onerror = () => res({}); document.head.appendChild(sc); }));
  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const norm = s => s.replace(/\s+/g, ' ').trim();
  let D = null, busy = false;
  function trText(n) {
    if (n.__xrSet === n.data) return;
    const k = norm(n.data); if (!k) return;
    let v = D[k];
    if (!v) { const m = k.match(/^(WhatsApp|Call|Email|Meet|View|Save|Book with|Message) (.+)$/); if (m && D[m[1]]) v = D[m[1]] + ' ' + m[2]; }
    if (!v) { const m = k.match(/^Showing (\d+) of (\d+) (projects?|properties|articles?)(.*)$/); if (m) v = 'عرض ' + m[1] + ' من ' + m[2] + ' ' + (/article/.test(m[3]) ? 'مقالات' : 'مشاريع') + (m[4] ? ' ' + (D[norm(m[4])] || m[4].trim()) : ''); }
    if (!v) { const m = k.match(/^(\d+) (projects?|properties|articles?|results?|saved)(.*)$/); if (m) v = m[1] + ' ' + ({ project: 'مشروع', projects: 'مشاريع', property: 'عقار', properties: 'عقارات', article: 'مقال', articles: 'مقالات', result: 'نتيجة', results: 'نتائج', saved: 'محفوظ' }[m[2]] || m[2]) + (m[3] ? ' ' + (D[norm(m[3])] || m[3].trim()) : ''); }
    if (!v) return;
    if (/^(WhatsApp|Call|Email|Message)\s*$/.test(n.data) && D[k]) v = D[k];
    n.__xrOrig = n.data; const lead = n.data.match(/^\s*/)[0], trail = n.data.match(/\s*$/)[0];
    n.data = lead + v + trail; n.__xrSet = n.data;
  }
  function trEl(el) {
    for (const a of ATTRS) { const cur = el.getAttribute(a); if (!cur) continue; const store = 'xrO' + a.replace('-', ''); if (el.dataset[store + 'S'] === cur) continue; const v = D[norm(cur)]; if (v) { el.dataset[store] = cur; el.setAttribute(a, v); el.dataset[store + 'S'] = v; } }
  }
  function walk(root) {
    if (!D || !root) return;
    if (root.nodeType === 3) return trText(root);
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|svg)$/.test(root.nodeName)) return;
    trEl(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeType === 1 && /^(SCRIPT|STYLE)$/.test(n.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let n; while ((n = w.nextNode())) n.nodeType === 3 ? trText(n) : trEl(n);
  }
  function restore() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (n.__xrOrig != null && n.data === n.__xrSet) { n.data = n.__xrOrig; } n.__xrSet = null; }
      else for (const a of ATTRS) { const s = 'xrO' + a.replace('-', ''); if (n.dataset && n.dataset[s] != null) { if (n.getAttribute(a) === n.dataset[s + 'S']) n.setAttribute(a, n.dataset[s]); delete n.dataset[s]; delete n.dataset[s + 'S']; } }
    }
  }
  const mo = new MutationObserver(ms => {
    if (lang() !== 'ar' || !D || busy) return; busy = true;
    for (const m of ms) { if (m.type === 'characterData') trText(m.target); else if (m.type === 'attributes') trEl(m.target); else m.addedNodes.forEach(walk); }
    busy = false;
  });
  async function apply() {
    const L = lang(), d = document.documentElement;
    if (d.lang !== L) d.lang = L; const dir = L === 'ar' ? 'rtl' : 'ltr'; if (d.dir !== dir) d.dir = dir;
    if (L === 'ar') { addHead(); D = await loadDict(); walk(document.body); } else if (D) restore();
    syncBtn();
  }
  // Language button for pages whose header lacks one
  function syncBtn() {
    const b = document.getElementById('xr-lang-btn'); if (b) { b.textContent = lang() === 'ar' ? 'EN' : 'ع'; b.setAttribute('aria-label', lang() === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); }
  }
  function ensureBtn() {
    const header = document.querySelector('header'); if (!header) return;
    const native = [...header.querySelectorAll('button')].some(b => b !== document.getElementById('xr-lang-btn') && /^(ع|EN|AR|عربي)$/i.test(b.textContent.trim()));
    if (native || document.getElementById('xr-lang-btn')) return;
    const theme = [...header.querySelectorAll('button')].find(b => /mode|الوضع/i.test(b.getAttribute('aria-label') || '') || /mode|الوضع/i.test(b.dataset.xrOarialabel || ''));
    if (!theme) return;
    const b = document.createElement('button'); b.id = 'xr-lang-btn'; b.type = 'button';
    b.style.cssText = "min-width:44px;height:44px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#FFFFFF;font:600 15px 'IBM Plex Sans Arabic','Hanken Grotesk',sans-serif;cursor:pointer";
    b.onmouseenter = () => { b.style.borderColor = '#FF9100'; b.style.color = '#FF9100'; }; b.onmouseleave = () => { b.style.borderColor = 'rgba(255,255,255,.3)'; b.style.color = '#FFFFFF'; };
    b.onclick = () => { set('xr-lang', lang() === 'ar' ? 'en' : 'ar'); apply(); window.dispatchEvent(new CustomEvent('xr-lang')); };
    theme.parentNode.insertBefore(b, theme); syncBtn();
  }
  // Pages using XR shell set <html lang> from state — follow it
  new MutationObserver(() => { const L = document.documentElement.lang === 'ar' ? 'ar' : 'en'; if (L !== lang()) { set('xr-lang', L); } if ((L === 'ar') !== !!(D && document.body.__xrAr)) { document.body.__xrAr = L === 'ar'; apply(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  const boot = () => {
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    document.body.__xrAr = lang() === 'ar'; apply();
    let tries = 0; const t = setInterval(() => { ensureBtn(); if (++tries > 40) clearInterval(t); }, 250);
    new MutationObserver(() => { if (!document.getElementById('xr-lang-btn')) ensureBtn(); }).observe(document.body, { childList: true, subtree: true });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
