/* Shared navigation behavior and a direct link to the hero's YouTube video. */
(() => {
  'use strict';
  if (window.__xrSiteUi) return;
  window.__xrSiteUi = true;
  let shell, header, lastY = window.scrollY, queued = false, keyboard = false;
  function reveal() { shell?.classList.remove('xr-nav-hidden'); }
  function setupDisclosure(group, toggleSelector, panelSelector) {
    if (!group || group.__xrActionsBound) return;
    group.__xrActionsBound = true;
    const toggle = group.querySelector(toggleSelector);
    const panel = group.querySelector(panelSelector);
    panel.hidden = true; panel.inert = true;
    let pinned = false;
    const setOpen = open => {
      panel.hidden = !open; panel.inert = !open;
      group.classList.toggle('xr-actions-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    group.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch' && matchMedia('(hover:hover)').matches) setOpen(true); });
    group.addEventListener('pointerleave', () => { if (!pinned && !group.contains(document.activeElement)) setOpen(false); });
    toggle.addEventListener('click', () => { pinned = !pinned; setOpen(pinned); });
    panel.addEventListener('click', e => { if (group.classList.contains('xr-header-tools') && e.target.closest('button,a')) { pinned = false; setOpen(false); if (keyboard) toggle.focus(); } });
    group.addEventListener('focusin', e => { if (panel.contains(e.target)) setOpen(true); });
    group.addEventListener('focusout', e => { if (!pinned && !group.contains(e.relatedTarget) && !group.matches(':hover')) setOpen(false); });
    document.addEventListener('pointerdown', e => { if (!group.contains(e.target)) { pinned = false; setOpen(false); } }, {passive:true});
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && group.classList.contains('xr-actions-open')) { pinned = false; setOpen(false); if (group.contains(document.activeElement)) toggle.focus(); } });
  }
  function attach() {
    const next = document.querySelector('#dc-root header');
    if (next && next !== header) {
      header = next;
      const parent = header.parentElement;
      shell = getComputedStyle(parent).position === 'fixed' ? parent : header;
      shell.classList.add('xr-scroll-header');
      lastY = window.scrollY;
    }
    const hero = document.querySelector('#dc-root [data-screen-label="Hero"]');
    if (hero && !hero.querySelector('.xr-hero-youtube')) {
      const a = document.createElement('a');
      a.className = 'xr-hero-youtube';
      a.href = window.XR_MEDIA.hero.youtube;
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label','Watch more on YouTube');
      a.title = 'Watch more on YouTube';
      a.innerHTML = '<svg viewBox="0 0 32 24" width="30" height="23" aria-hidden="true" focusable="false"><path fill="#FF9100" d="M31.3 4.1a4 4 0 0 0-2.8-2.8C26 .6 16 .6 16 .6s-10 0-12.5.7A4 4 0 0 0 .7 4.1C0 6.6 0 12 0 12s0 5.4.7 7.9a4 4 0 0 0 2.8 2.8c2.5.7 12.5.7 12.5.7s10 0 12.5-.7a4 4 0 0 0 2.8-2.8c.7-2.5.7-7.9.7-7.9s0-5.4-.7-7.9Z"/><path fill="#FFFFFF" d="m12.8 16.9 8.4-4.9-8.4-4.9Z"/></svg>';
      hero.append(a);
    }
    if (header) setupDisclosure(header.querySelector('.xr-header-tools'), '.xr-header-tools-toggle', '.xr-header-tools-panel');
  }
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!shell || !header) return;
      const y = Math.max(0, window.scrollY), delta = y - lastY;
      if (y < 24 || header.querySelector('[aria-expanded="true"]') || document.querySelector('[role="dialog"]') || (keyboard && header.contains(document.activeElement))) {
        reveal(); lastY = y; return;
      }
      if (Math.abs(delta) < 8) return;
      shell.classList.toggle('xr-nav-hidden', delta > 0 && y > shell.offsetHeight + 24);
      lastY = y;
    });
  }, {passive:true});
  document.addEventListener('keydown', e => { if (e.key === 'Tab') { keyboard = true; reveal(); } });
  document.addEventListener('pointerdown', () => { keyboard = false; }, {passive:true});
  document.addEventListener('focusin', () => { if (keyboard && header?.contains(document.activeElement)) reveal(); });
  attach();
  new MutationObserver(attach).observe(document.getElementById('dc-root') || document.body, {childList:true,subtree:true});
})();
