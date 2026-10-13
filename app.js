(() => {
  const root=document.documentElement;
  const stored=localStorage.getItem('lumekori-theme');
  if(stored){root.dataset.theme=stored}else if(matchMedia('(prefers-color-scheme: dark)').matches){root.dataset.theme='dark'}
  const updateIcon=()=>document.querySelectorAll('[data-theme]').forEach(b=>b.textContent=root.dataset.theme==='dark'?'☀':'☾');
  updateIcon();
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('lumekori-theme',root.dataset.theme);updateIcon()}));
  const mb=document.querySelector('[data-menu]'), mm=document.querySelector('.mobilemenu');
  if(mb&&mm){mb.addEventListener('click',()=>mm.classList.toggle('open'));mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')))}
})();