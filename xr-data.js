(function () {
  const B = 'https://www.xrealty.ae';
  const CL = (v, id, w = 1400) => `https://res.cloudinary.com/dkhns25jh/image/upload/w_${w},f_auto,q_auto/${v}/xr_media/${id}.webp`;
  const IMG = {
    valiaExt: CL('v1786024664', 'hf14iqghcjyalcrgr8rv'), valiaInt: CL('v1786024589', 'azldwpnaxgzt1hcqt9xi'), valia2: CL('v1786024596', 'tng4fvgqeipawfjdsdh3'),
    valia3: CL('v1786024607', 'fhn0x36pa0lu8qrw3qjf'), valiaCity: CL('v1786024414', 'yih9rhneuqhgovopmcjb'), valiaAmen: CL('v1786024547', 'c6shcktnp8peisklmv1u'),
    fiorExt: CL('v1783592590', 'xljqzm8fduxygd9lmhvy'), fiorLobby: CL('v1783592656', 'xgid55zsix2nhwyqaa1u'), fiorLiving: CL('v1783592664', 'eegv6rcdfjm5wmzsyfad'),
    fiorLiving2: CL('v1783592577', 'wvi2lddsjau1ya5kmihm'), fiorPool: CL('v1783592835', 'v26qtyo0vqwehgevvc4h'), hero: CL('v1783592438', 'sehvczef0ido9pytdygz', 2000),
  };
  const POOL = Object.values(IMG);
  const LOGO = 'https://res.cloudinary.com/dkhns25jh/image/upload/f_auto/v1733821293/xr_media/sqmxma6remiuh1mbv4x7.png';
  const P = {
    home: 'index.html', search: 'search.html', developers: 'developers.html', guides: 'guides.html',
    team: 'team.html', insights: 'insights.html', about: 'about.html', contact: 'contact.html', compare: 'compare.html', sell: 'sell.html',
    property: s => 'property.html?p=' + s, community: s => 'community.html' + (s ? '?c=' + s : ''),
  };
  const M = 'https://media.xrealty.ae/';
  const agents = [
    ['rakhi-megchiani', 'Rakhi Megchiani', 'Sales Director', '10 years', 'English, Hindi', 'large_Rakhi_72f9cbb2de.webp', '971554508979'],
    ['ankit-aujla', 'Ankit Aujla', 'Director of Sales', '5 years', 'English, Hindi', 'large_ankit_kumar_aujhla_4f54811558.webp', '971585754178'],
    ['hind-azzouzi', 'Hind Azzouzi', 'VP Asset Management', '12 years', 'Arabic, French, English', 'large_HIND_WEBSITE_7cb12439ca.webp', '971585958768'],
    ['ayaz-salman', 'Ayaz Salman', 'Director of Sales', '10 years', 'English, Urdu, Hindi', 'large_ayyaz_salman_2_f6c230a268.webp', '971527999193'],
    ['tarun-sharma', 'Tarun Sharma', 'Director Research & Strategy', '15 years', 'English, Hindi', 'large_Tarun_sharma_8ea57a02a7.webp', '971505987457'],
    ['asma-zerroukat', 'Asmaa Zerroukat', 'Associate Director', '5 years', 'French, Arabic, English', 'large_asma_5bce8500d7.webp', '971529270836'],
  ].map(([slug, name, role, exp, langs, img, wa]) => ({ slug, name, first: name.split(' ')[0], role, exp, langs, img: M + img, wa: 'https://wa.me/' + wa, tel: 'tel:+' + wa, href: B + '/agent/' + slug + '/' }));

  const C = (slug, name, tagline, img, from, psf, yld, lat, lng, agentIdx, about, highlights, travel) => ({ slug, name, tagline, img, from, psf, yld, lat, lng, agents: agentIdx.map(i => agents[i]), about, highlights, travel, href: P.community(slug) });
  const communities = [
    C('creek-harbour', 'Dubai Creek Harbour', 'Where the city meets the water', IMG.valiaCity, 1300000, 2350, 6.4, 25.197, 55.349, [0, 1], 'A 6 sq km waterfront district by Emaar beside the Ras Al Khor wildlife sanctuary, with skyline views and a planned Metro Blue Line station.', ['Waterfront promenade & marina', 'Ras Al Khor wildlife sanctuary', 'Creek Island beach', 'Metro Blue Line (planned)'], [['Downtown Dubai', 12], ['DXB Airport', 10], ['Dubai Mall', 14]]),
    C('rashid-yachts', 'Rashid Yachts & Marina', 'A new marina for Port Rashid', IMG.fiorExt, 2200000, 3100, 5.8, 25.268, 55.276, [1, 3], 'Emaar\'s marina-front redevelopment of historic Mina Rashid, next to the QE2 and the Dubai Cruise Terminal.', ['Superyacht marina', 'QE2 & cruise terminal', 'Heritage Bur Dubai', 'Beach & boardwalk'], [['Downtown Dubai', 15], ['DXB Airport', 18], ['DIFC', 14]]),
    C('palm-jebel-ali', 'Palm Jebel Ali', 'The next palm, twice the size', IMG.fiorPool, 18000000, 4200, 4.9, 25.005, 54.99, [3, 4], 'Nakheel\'s revived island, roughly twice the size of Palm Jumeirah, with beachfront villas on every frond.', ['110 km of coastline', 'Beachfront villas', 'Resort hotels', 'Water-sports clubs'], [['Dubai Marina', 20], ['DWC Airport', 25], ['Expo City', 22]]),
    C('maritime-city', 'Dubai Maritime City', 'Sea-facing living near the core', IMG.valia3, 1500000, 2500, 6.8, 25.27, 55.265, [1, 4], 'A peninsula between Port Rashid and Dubai Drydocks being reshaped into a residential waterfront.', ['Sea-view towers', 'Marina access', 'Close to Jumeirah', 'Business hubs nearby'], [['Downtown Dubai', 15], ['DXB Airport', 20], ['La Mer beach', 8]]),
    C('mbr-city', 'MBR City', 'Green, central and well connected', IMG.valia2, 1200000, 2100, 6.5, 25.17, 55.31, [0, 5], 'Mohammed Bin Rashid City spans parks, lagoons and family communities minutes from Downtown.', ['Crystal Lagoon', 'Meydan racecourse', 'Large parks', 'Top schools nearby'], [['Downtown Dubai', 10], ['DXB Airport', 15], ['Business Bay', 10]]),
    C('dubailand', 'Dubailand', 'Space, value and family living', IMG.valiaAmen, 900000, 1400, 7.2, 25.06, 55.33, [5, 3], 'A large inland district with master-planned family communities, golf, and some of the best entry prices in Dubai.', ['Golf & equestrian clubs', 'Family villa communities', 'Global Village', 'Value entry prices'], [['Downtown Dubai', 20], ['DXB Airport', 22], ['Al Qudra', 10]]),
    C('emaar-south', 'Emaar South', 'Golf-course homes near the new airport', IMG.fiorLiving2, 1000000, 1300, 7.0, 24.88, 55.17, [0, 2], 'A golf-course community beside Al Maktoum International, positioned for the airport\'s expansion.', ['18-hole golf course', 'Next to DWC Airport', 'Expo City nearby', 'Parks & cycle tracks'], [['DWC Airport', 8], ['Expo City', 12], ['Dubai Marina', 25]]),
    C('dubai-hills', 'Dubai Hills Estate', 'Where green living meets prestige', IMG.valiaInt, 1600000, 2400, 5.9, 25.107, 55.245, [1, 2], 'A 2,700-acre master community by Emaar and Meraas, built around an 18-hole championship golf course and Dubai Hills Mall.', ['Championship golf', 'Dubai Hills Mall', 'Dubai Hills Park', 'Leading schools'], [['Downtown Dubai', 15], ['DXB Airport', 25], ['Dubai Marina', 18]]),
    C('grand-polo', 'Grand Polo', 'Where elegance meets equestrian excellence', IMG.valiaAmen, 3500000, 1900, 5.2, 24.94, 55.36, [2, 0], 'An Emaar villa community designed around polo fields, stables and open landscape.', ['Polo fields & stables', 'Clubhouse', 'Low-density villas', 'Open landscape'], [['Downtown Dubai', 30], ['DXB Airport', 30], ['DWC Airport', 25]]),
    C('the-valley', 'The Valley', 'Curated for families, designed for the future', IMG.valia2, 1800000, 1250, 6.1, 24.98, 55.45, [5, 0], 'Townhouses and villas on the Dubai–Al Ain road with a focus on families and outdoor living.', ['Townhouses & villas', 'Sports village', 'Parks', 'Community retail'], [['Downtown Dubai', 25], ['DXB Airport', 25], ['Al Ain Road access', 2]]),
    C('al-marjan', 'Al Marjan Island', 'Where the sea shapes ambition', IMG.fiorPool, 1200000, 2200, 7.5, 25.66, 55.74, [3, 4], 'A coral-shaped set of islands in Ras Al Khaimah, home to the region\'s first integrated resort.', ['Wynn integrated resort', 'Beachfront living', 'Resort hotels', 'Strong rental demand'], [['RAK Airport', 25], ['Dubai Marina', 60], ['DXB Airport', 50]]),
    C('the-oasis', 'The Oasis', 'Designed for those who choose differently', IMG.fiorLobby, 9000000, 1800, 4.8, 25.03, 55.25, [2, 1], 'Emaar\'s ultra-luxury mansion community set around lagoons and lush landscaping.', ['Crystal lagoons', 'Mansions & villas', 'Low density', 'Wellness clubs'], [['Downtown Dubai', 25], ['Dubai Marina', 20], ['DXB Airport', 30]]),
  ];
  const cBy = Object.fromEntries(communities.map(c => [c.slug, c]));

  const pr = (slug, developer, short, name, cSlug, price, type, bMin, bMax, sMin, sMax, handover, plan, img, agent, desc, lat, lng) => {
    const c = cBy[cSlug];
    const units = [];
    for (let b = bMin; b <= bMax; b++) units.push({ label: b === 0 ? 'Studio' : b + ' bedroom' + (b > 1 ? 's' : ''), size: Math.round(sMin + (sMax - sMin) * (bMax === bMin ? 0 : (b - bMin) / (bMax - bMin))), price: Math.round(price * (1 + 0.55 * (b - bMin)) / 10000) * 10000 });
    const gi = POOL.indexOf(img);
    const gallery = [img, ...[1, 3, 5, 7].map(k => POOL[(gi + k) % POOL.length])];
    return { slug, developer, short, name, community: c.name, communitySlug: c.slug, price, priceLabel: aed(price), type, bedsMin: bMin, bedsMax: bMax, beds: bMin === bMax ? bedLabel(bMin) : `${bedLabel(bMin)} – ${bMax} BR`, size: `${fmt(sMin)} – ${fmt(sMax)} sq ft`, sizeMin: sMin, status: 'Off-plan', handover, handoverYear: +handover.slice(-4), plan, planLabel: plan.join('/'), img, gallery, agent: agents[agent], desc, units, lat: lat ?? c.lat, lng: lng ?? c.lng, href: P.property(slug), live: B + '/property/' };
  };
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const aed = n => 'AED ' + fmt(n);
  const aedShort = n => n >= 1e6 ? 'AED ' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 2).replace(/\.?0+$/, '') + 'M' : 'AED ' + Math.round(n / 1000) + 'K';
  const bedLabel = b => b === 0 ? 'Studio' : b + ' BR';
  const properties = [
    pr('valia', 'Emaar Properties', 'Emaar', 'Valia at Dubai Creek Harbour', 'creek-harbour', 1910000, 'Apartment', 1, 3, 760, 1720, 'Q4 2029', [80, 20], IMG.valiaExt, 0, 'Waterfront apartments in the heart of Dubai Creek Harbour with views of the Creek Tower plaza and the Downtown skyline, steps from the promenade and Creek Marina.', 25.199, 55.352),
    pr('fior-1', 'Emaar Properties', 'Emaar', 'Fior 1 at Rashid Yachts & Marina', 'rashid-yachts', 2200000, 'Apartment', 1, 4, 820, 2600, 'Q2 2029', [80, 20], IMG.fiorExt, 1, 'Marina-facing residences at Rashid Yachts & Marina with resort-style pools, a landscaped podium and direct access to the waterfront boardwalk.'),
    pr('frond-f', 'Nakheel', 'Nakheel', 'Frond F Beach & Coral Collections', 'palm-jebel-ali', 30000000, 'Villa', 5, 7, 9000, 15000, 'Q4 2028', [60, 40], IMG.fiorPool, 3, 'Beachfront signature villas on Frond F of Palm Jebel Ali, each with private beach access, infinity pools and panoramic sea views.'),
    pr('kanyon', 'Beyond', 'Beyond', 'Kanyon by Beyond', 'maritime-city', 2400000, 'Apartment', 1, 3, 780, 1850, 'Q3 2029', [70, 30], IMG.valia3, 4, 'Sculpted sea-view towers in Dubai Maritime City with residents\' lounges, wellness decks and a waterfront promenade.'),
    pr('everly', 'Ellington Properties', 'Ellington', 'Everly Place by Ellington', 'mbr-city', 1900000, 'Apartment', 1, 3, 800, 1900, 'Q1 2029', [60, 40], IMG.valia2, 5, 'Design-led residences by Ellington in MBR City with curated interiors, landscaped courtyards and close access to Downtown.'),
    pr('the-woods', 'Sobha Realty', 'Sobha', 'The Woods at Sobha Sanctuary', 'dubailand', 999000, 'Apartment', 0, 2, 420, 1250, 'Q4 2029', [60, 40], IMG.valiaAmen, 5, 'Low-rise residences surrounded by forest-inspired landscaping inside Sobha Sanctuary, built to Sobha\'s in-house standard.', 25.05, 55.32),
    pr('golf-trails', 'Emaar Properties', 'Emaar', 'Golf Trails at Emaar South', 'emaar-south', 1250000, 'Apartment', 1, 3, 700, 1600, 'Q3 2028', [80, 20], IMG.fiorLiving2, 0, 'Golf-course apartments in Emaar South with fairway views, cycle trails and quick access to Al Maktoum International.'),
    pr('arancia', 'Beyond', 'Beyond', 'Arancia Yards by Beyond', 'dubailand', 1000000, 'Apartment', 1, 2, 650, 1150, 'Q2 2029', [70, 30], IMG.fiorLiving, 3, 'Courtyard-style residences in Dubailand designed around shaded gardens, play areas and community retail.', 25.07, 55.34),
    pr('golf-vale', 'Emaar Properties', 'Emaar', 'Golf Vale at Emaar South', 'emaar-south', 1090000, 'Apartment', 1, 3, 680, 1550, 'Q1 2029', [80, 20], IMG.valiaInt, 2, 'Mid-rise apartments overlooking the Emaar South golf course with family amenities and landscaped walkways.', 24.885, 55.175),
    pr('golf-fields', 'Emaar Properties', 'Emaar', 'Golf Fields at Emaar South', 'emaar-south', 1260000, 'Townhouse', 3, 4, 1900, 2600, 'Q4 2028', [80, 20], IMG.fiorLobby, 0, 'Three and four-bedroom townhouses on the Emaar South greens with private gardens and community parks.', 24.876, 55.165),
  ];
  communities.forEach(c => { c.projects = properties.filter(p => p.communitySlug === c.slug); c.fromLabel = aedShort(c.from); });

  const I18N = {
    en: { properties: 'Properties', developers: 'Developers', communities: 'Communities', guides: 'Guides', team: 'XR Team', insights: 'Insights', about: 'About', contact: 'Contact us', call: 'Call', whatsapp: 'WhatsApp', enquire: 'Enquire', saved: 'Shortlist', from: 'From', lang: 'عربي', langAria: 'View in Arabic', register: 'Register interest', compare: 'Compare', viewAll: 'View all', home: 'Home' },
    ar: { properties: 'العقارات', developers: 'المطورون', communities: 'المجتمعات', guides: 'الأدلة', team: 'فريق XR', insights: 'رؤى', about: 'من نحن', contact: 'تواصل معنا', call: 'اتصال', whatsapp: 'واتساب', enquire: 'استفسار', saved: 'المفضلة', from: 'ابتداءً من', lang: 'EN', langAria: 'View in English', register: 'سجّل اهتمامك', compare: 'قارن', viewAll: 'عرض الكل', home: 'الرئيسية' },
  };
  const NAV = [['properties', P.search], ['developers', P.developers], ['communities', P.community()], ['guides', P.guides], ['team', P.team], ['insights', P.insights], ['about', P.about]];

  const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} window.dispatchEvent(new Event('xr-store')); };
  const store = {
    saved: () => read('xr-saved', []),
    isSaved: s => store.saved().includes(s),
    toggleSaved: s => { const a = store.saved(); write('xr-saved', a.includes(s) ? a.filter(x => x !== s) : [...a, s]); },
    compare: () => read('xr-compare', []),
    inCompare: s => store.compare().includes(s),
    toggleCompare: s => { const a = store.compare(); write('xr-compare', a.includes(s) ? a.filter(x => x !== s) : [...a, s].slice(-3)); },
    setCompare: a => write('xr-compare', a.slice(0, 3)),
  };
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const setRaw = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  function mount(c) {
    c.__xrU = () => c.setState({ xrTick: Date.now() });
    c.__xrR = () => c.setState(st => ({ vw: window.innerWidth, drawer: window.innerWidth >= 1180 ? false : st.drawer }));
    window.addEventListener('resize', c.__xrR); window.addEventListener('xr-store', c.__xrU); window.addEventListener('storage', c.__xrU);
    const theme = raw('xr-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    c.setState({ vw: window.innerWidth, theme, lang: raw('xr-lang') || 'en', xrReady: true });
  }
  function unmount(c) { window.removeEventListener('resize', c.__xrR); window.removeEventListener('xr-store', c.__xrU); window.removeEventListener('storage', c.__xrU); }
  function sync(c) {
    const d = document.documentElement, s = c.state;
    d.dataset.theme = s.theme || 'light'; d.dir = s.lang === 'ar' ? 'rtl' : 'ltr'; d.lang = s.lang || 'en';
    document.querySelectorAll('img.xr-lazy[data-src]').forEach(el => { const v = el.getAttribute('data-src'); if (v && v.indexOf('{{') < 0 && el.getAttribute('src') !== v) el.setAttribute('src', v); });
  }
  function shell(c, current, opts = {}) {
    const s = c.state, t = I18N[s.lang] || I18N.en, isMobile = (s.vw || 1280) < 1180;
    const nav = NAV.map(([key, href]) => ({ key, label: t[key], href, current: key === current ? 'page' : undefined, bar: key === current ? '#FF9100' : 'transparent' }));
    const savedCount = store.saved().length;
    const L = (label, href) => ({ label, href });
    return {
      t, nav, isMobile, isDesktop: !isMobile, rtl: s.lang === 'ar', logo: LOGO, homeHref: P.home, P,
      isDark: s.theme === 'dark', isLight: s.theme !== 'dark',
      themeAria: s.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      toggleTheme: () => { const theme = s.theme === 'dark' ? 'light' : 'dark'; setRaw('xr-theme', theme); c.setState({ theme }); },
      langBtn: t.lang, langAria: t.langAria,
      toggleLang: () => { const lang = s.lang === 'ar' ? 'en' : 'ar'; setRaw('xr-lang', lang); c.setState({ lang }); },
      savedCount, hasSaved: savedCount > 0, compareHref: P.compare, contactHref: P.contact,
      shortlistAria: savedCount ? `Shortlist, ${savedCount} saved` : 'Shortlist, empty',
      showDrawer: isMobile && !!s.drawer, drawerOpen: !!s.drawer, toggleDrawer: () => c.setState({ drawer: !s.drawer }),
      menuIconPath: s.drawer ? 'M3 3L15 15M15 3L3 15' : 'M2 5H16M2 9H16M2 13H16',
      enquireHref: opts.enquireHref || P.contact, footerPad: isMobile ? '76px' : '0px',
      footerCols: [
        { title: 'Explore', links: [L('Properties', P.search), L('Communities', P.community()), L('Developers', P.developers), L('Rent a home', 'rent.html'), L('Shortlist & compare', P.compare)] },
        { title: 'Popular searches', links: [L('Homes AED 1.25M – 2M', P.search + '?budget=mid'), L('Villas for sale', P.search + '?type=Villa'), L('Dubai Hills Estate', P.search + '?community=dubai-hills'), L('Golden Visa homes (AED 2M – 5M)', P.search + '?budget=gv'), L('Luxury AED 5M+', P.search + '?budget=lux')] },
        { title: 'Learn', links: [L('Guides', P.guides), L('Insights', P.insights), L('Dubai FAQs', 'faqs.html'), L('Dubai living', 'living.html')] },
        { title: 'Company', links: [L('About XR', P.about), L('Sell with XR', P.sell), L('XR Team', P.team), L('Careers', 'careers.html'), L('Contact us', P.contact)] },
        { title: 'Visit us', links: [L('+971 5 640 80888', 'tel:+971564080888'), L('info@xrealty.ae', 'mailto:info@xrealty.ae'), L('Dubai Hills Estate, Dubai', 'https://maps.app.goo.gl/ChpufZ9MafTGmcc47')] },
      ],
      socials: [['YouTube', 'https://www.youtube.com/@xrealtyae'], ['Instagram', 'https://www.instagram.com/xperience.realty'], ['LinkedIn', 'https://www.linkedin.com/company/xrealty-ae'], ['X', 'https://x.com/xrealty_ae']].map(([label, href]) => ({ label, href })),
    };
  }
  function boot(c, fn) { const go = () => window.XR ? (mount(c), fn && fn()) : setTimeout(go, 30); go(); }

  let leafletP = null;
  function leaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletP) return leafletP;
    leafletP = new Promise(res => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l);
      const sc = document.createElement('script'); sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; sc.onload = () => res(window.L); document.head.appendChild(sc);
    });
    return leafletP;
  }
  async function map(el, opts) { try { return await map_(el, opts); } catch (e) { console.warn('XR map', e && e.message); return null; } }
  async function map_(el, { center, zoom = 12, markers = [], dark = false, fit = false }) {
    const L = await leaflet();
    if (!el || !el.isConnected) return null;
    if (el.__map) { el.__map.remove(); }
    const m = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView(center, zoom);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri', maxZoom: 16 }).addTo(m);
    const pts = [];
    markers.forEach(k => {
      const icon = L.divIcon({ className: '', iconSize: [k.label ? 0 : 18, 18], html: k.label ? `<div style="transform:translate(-50%,-100%);white-space:nowrap;background:#0A0A0A;color:#fff;font:600 12px 'Hanken Grotesk',sans-serif;padding:6px 10px;border-radius:999px;border:2px solid ${k.active ? '#FF9100' : '#fff'};box-shadow:0 6px 16px rgba(0,0,0,.3)">${k.label}</div>` : `<div style="width:18px;height:18px;border-radius:999px;background:#FF9100;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,145,0,.25)"></div>` });
      const mk = L.marker([k.lat, k.lng], { icon }).addTo(m);
      if (k.popup) mk.bindPopup(k.popup);
      if (k.onClick) mk.on('click', k.onClick);
      pts.push([k.lat, k.lng]);
    });
    if (fit && pts.length > 1) m.fitBounds(pts, { padding: [50, 50] });
    el.__map = m;
    return m;
  }

  window.XR = { B, IMG, LOGO, P, agents, communities, cBy, properties, pBy: Object.fromEntries(properties.map(p => [p.slug, p])), I18N, store, mount, unmount, sync, shell, boot, map, fmt, aed, aedShort, param: k => new URLSearchParams(location.search).get(k) };
})();
