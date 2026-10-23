(() => {
  'use strict';
  const languages = { en: 'English', de: 'Deutsch', ru: 'Русский', zh: '简体中文', pt: 'Português', ar: 'العربية', es: 'Español' };
  const labels = { en: 'Language', de: 'Sprache', ru: 'Язык', zh: '语言', pt: 'Idioma', ar: 'اللغة', es: 'Idioma' };
  const normalize = text => text.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  let locale = 'en', dictionary = {}, pending = false, observer;
  const initial = new URL(location.href).searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem('potb-language'); } catch (_) { /* Private browsing can disable storage. */ }
  locale = Object.hasOwn(languages, initial) ? initial : Object.hasOwn(languages, saved) ? saved : 'en';

  function translate(value) {
    if (locale === 'en') return value;
    const key = normalize(value);
    const row = dictionary[key];
    if (row?.[locale]) return value.replace(value.trim(), row[locale]);
    const caption = value.match(/^(.*?)\s*(·\s*\d+\s*\/\s*\d+)\s*$/);
    if (caption && dictionary[normalize(caption[1])]?.[locale]) return dictionary[normalize(caption[1])][locale] + ' ' + caption[2];
    return value;
  }

  function localize(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || node.parentElement.closest('script,style,noscript,[data-language-control]')) continue;
      const prior = originals.get(node);
      const source = prior && node.data === prior.translated ? prior.source : node.data;
      const translated = translate(source);
      originals.set(node, { source, translated });
      if (node.data !== translated) node.data = translated;
    }
    for (const element of root.querySelectorAll('[alt],[title],[aria-label],[placeholder]')) {
      if (element.closest('[data-language-control]')) continue;
      const prior = attributeOriginals.get(element) || {};
      for (const attr of ['alt', 'title', 'aria-label', 'placeholder']) {
        if (!element.hasAttribute(attr)) continue;
        const value = element.getAttribute(attr), old = prior[attr];
        const source = old && value === old.translated ? old.source : value;
        const translated = translate(source);
        prior[attr] = { source, translated };
        if (value !== translated) element.setAttribute(attr, translated);
      }
      attributeOriginals.set(element, prior);
    }
  }

  function mount() {
    const header = document.querySelector('header > div');
    if (!header || header.querySelector('[data-language-control]')) return;
    const control = document.createElement('div');
    control.dataset.languageControl = '';
    control.className = 'language-control';
    const select = document.createElement('select');
    select.id = 'site-language';
    for (const [code, name] of Object.entries(languages)) {
      const option = document.createElement('option');
      option.value = code; option.textContent = name; option.lang = code;
      select.append(option);
    }
    select.value = locale;
    select.addEventListener('change', () => setLanguage(select.value, true));
    control.append(select);
    header.append(control);
  }

  function apply() {
    pending = false;
    observer.disconnect();
    mount();
    document.documentElement.lang = locale === 'zh' ? 'zh-Hans' : locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.locale = locale;
    localize(document.body);
    const select = document.getElementById('site-language');
    if (select) { select.value = locale; select.setAttribute('aria-label', labels[locale]); select.title = labels[locale]; }
    document.title = 'Villa Dune — ' + (dictionary[normalize('Private Residence')]?.[locale] || 'Private Residence') + ', Pampelonne';
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['alt', 'title', 'aria-label', 'placeholder'] });
  }

  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }

  function setLanguage(code, updateUrl) {
    locale = Object.hasOwn(languages, code) ? code : 'en';
    try { localStorage.setItem('potb-language', locale); } catch (_) { /* Language still works without storage. */ }
    if (updateUrl) {
      const url = new URL(location.href);
      if (locale === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', locale);
      history.replaceState(null, '', url);
    }
    apply();
  }

  const style = document.createElement('style');
  style.textContent = `
    .language-control{flex:0 0 auto;display:flex;align-items:center}
    .language-control select{font:500 12px/1.4 Jost,Arial,sans-serif;color:inherit;background:transparent;border:1px solid currentColor;border-radius:0;padding:10px 6px;min-height:44px;max-width:110px;cursor:pointer}
    .language-control option{background:#faf8f3;color:#292c28}
    .language-control select:focus-visible{outline:2px solid #b7855a;outline-offset:4px}
    html[data-locale=ar] body{font-family:Tahoma,Arial,sans-serif!important}
    html[data-locale=ar] h1,html[data-locale=ar] h2,html[data-locale=ar] h3,html[data-locale=zh] h1,html[data-locale=zh] h2,html[data-locale=zh] h3{font-family:Georgia,'Noto Serif',serif!important;line-height:1.35!important}
    html[data-locale=ar] header,html[data-locale=ar] section,html[data-locale=ar] footer{letter-spacing:normal!important}
    html[data-locale=ar] p,html[data-locale=ar] h2,html[data-locale=ar] h3{text-align:start}
    html[data-locale=ar] section span,html[data-locale=ar] section div,html[data-locale=ar] a{letter-spacing:normal!important}
    html[data-locale=ar] .residence-facts>div{text-align:start}
    html[data-locale=ar] #architecture button{text-align:start!important}
    html[data-locale=ar] header>a,html[data-locale=ar] .language-control{direction:ltr}
    html[data-locale=zh] body{font-family:Arial,'Microsoft YaHei','PingFang SC',sans-serif!important}
    #top .hero-content p{overflow-wrap:break-word}
    @media(min-width:980px) and (max-width:1250px){header nav{gap:12px!important;font-size:10px!important;letter-spacing:.08em!important}header>div{gap:12px!important}}
    @media(max-width:979px){header>div{gap:8px!important}header>div>a{min-width:0;flex:1 1 auto}header>div>a>span:first-child{font-size:20px!important}header>div>a>span:last-child{font-size:8px!important;letter-spacing:.12em!important;white-space:normal!important}.language-control select{max-width:88px;font-size:11px}header button[aria-label]{min-width:40px!important;font-size:10px!important}}
    @media(max-width:359px){header>div{padding-inline:12px!important}header>div>a>span:first-child{font-size:18px!important}.language-control select{max-width:78px}}
    @media(max-width:760px){#top{min-height:100svh!important;height:auto!important}#top h1{overflow-wrap:break-word}#top .hero-content{padding-top:24px!important;padding-bottom:24px!important}}
  `;
  document.head.append(style);
  // A single local dictionary keeps translation private and independent of third-party services.
  fetch(new URL('assets/translations.json', document.baseURI)).then(response => {
    if (!response.ok) throw new Error('Language dictionary unavailable');
    return response.json();
  }).then(data => {
    dictionary = data;
    observer = new MutationObserver(schedule);
    apply();
    window.addEventListener('popstate', () => setLanguage(new URL(location.href).searchParams.get('lang') || 'en', false));
  }).catch(error => { console.warn('[languages]', error.message); });
})();
