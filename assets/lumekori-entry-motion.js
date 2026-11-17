/* Lumekori - limited reuse of Claude's logo drawing and scroll reveal animations.
   No flow-field, gradients, theme switching, forms, auth or page logic are modified. */
(()=>{'use strict';
  const root=document.documentElement;
  if(root.classList.contains('lmk-entry-init'))return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const logo=document.querySelector('.lmk-site-header .lk');
  if(logo)logo.classList.add('lmk-entry-logo');
  const gamesLogo=document.querySelector('.lmk-games-ui .games-logo');
  if(gamesLogo)gamesLogo.classList.add('lmk-entry-games-logo');
  const seen=new Set(), targets=[];
  const add=(el,kind)=>{
    if(!el||seen.has(el)||el.closest('.lmk-auth-dialog,[hidden]'))return;
    seen.add(el);targets.push(el);
    if(kind==='soft')el.classList.add('lmk-entry-soft');
    if(kind!=='text')el.classList.add('lmk-entry-block');
  };
  // Reuse Claude's word-by-word appearance without changing complex nested headlines.
  const splitWords=(el)=>{
    if(!el||el.dataset.lmkEntrySplit)return false;
    const nodes=Array.from(el.childNodes);
    if(!nodes.length||!nodes.every(n=>n.nodeType===3||n.nodeName==='BR'))return false;
    const label=el.textContent.replace(/\s+/g,' ').trim();
    if(!label)return false;
    const fragment=document.createDocumentFragment();let i=0;
    for(const node of nodes){
      if(node.nodeName==='BR'){fragment.appendChild(node.cloneNode());continue}
      for(const piece of node.textContent.split(/(\s+)/)){
        if(!piece)continue;
        if(/^\s+$/.test(piece)){fragment.appendChild(document.createTextNode(piece));continue}
        const wrapper=document.createElement('span');wrapper.className='lmk-entry-word';
        wrapper.setAttribute('aria-hidden','true');
        const word=document.createElement('span');word.textContent=piece;
        word.style.setProperty('--lmk-word-i',String(i++));wrapper.appendChild(word);
        fragment.appendChild(wrapper);
      }
    }
    el.replaceChildren(fragment);
    if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',label);
    el.dataset.lmkEntrySplit='1';el.classList.add('lmk-entry-text');
    return true;
  };
  const titles=document.querySelectorAll('main .pagehero h1,main .hero h1,main .hero h2,main .contentbox h2,main .section-head h2,.lk-end-title');
  titles.forEach(el=>{
    if(splitWords(el))add(el,'text');
    else if(el.matches('.pagehero h1,.hero h1,.hero h2,.section-head h2'))add(el,'soft');
  });
  const selectors=[
    'main .pagehero .eyebrow','main .pagehero p',
    'main .hero p','main .hero .actions','main .hero .quick',
    'main .contentbox',
    'main .contentbox > :is(h3,h4,p,ul,ol,.notice,.listlinks,.actions,details,table,blockquote)',
    'main .section-head','main .kicker',
    'main .steps > .step',
    'main :is(.card,.tile,.mode-card,.region-item,.quick-item,.command,.product-feature,.signal,.stack,.project-card,.rule)',
    'main .naofb-card',
    '.lk-end-intro','.lk-end-group','.lk-end-bottom'
  ];
  selectors.forEach(selector=>document.querySelectorAll(selector).forEach(el=>{
    if(el.closest('.lmk-site-header,#mobile-site-menu'))return;
    // Preserve transforms on animated components and unusual Games imagery.
    add(el,el.matches('p,.eyebrow,.lk-end-intro,.lk-end-group')?'soft':undefined);
  }));
  if(!targets.length){root.classList.add('lmk-entry-init');return}
  const delays=new Map();
  targets.forEach(el=>{
    const siblings=Array.from(el.parentElement?.children||[]).filter(node=>seen.has(node));
    delays.set(el,Math.min(5,Math.max(0,siblings.indexOf(el)))*65);
  });
  if(!('IntersectionObserver' in window)){
    targets.forEach(el=>{el.classList.add('lmk-entry-on')});
    root.classList.add('lmk-entry-init');return;
  }
  const observer=new IntersectionObserver(entries=>{
    for(const item of entries){
      if(!item.isIntersecting)continue;
      const el=item.target;
      el.style.setProperty('--lmk-enter-delay',delays.get(el)+'ms');
      el.classList.add('lmk-entry-on');
      observer.unobserve(el);
    }
  },{threshold:.07,rootMargin:'0px 0px -5% 0px'});
  targets.forEach(el=>observer.observe(el));
  root.classList.add('lmk-entry-init');
})();
