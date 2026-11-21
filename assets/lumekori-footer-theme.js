/* Subtle, shared footer-only light/dark control. No header button is generated. */
(()=>{
  "use strict";
  const init=()=>{
    const buttons=Array.from(document.querySelectorAll("[data-lmk-footer-theme-switch]"));
    if(!buttons.length)return;
    const root=document.documentElement;
    try{
      const saved=localStorage.getItem("lumekori-theme");
      if(saved==="dark"||saved==="light")root.dataset.theme=saved;
    }catch(e){}
    const currentlyDark=()=>root.dataset.theme==="dark"||
      (!root.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
    const sync=()=>buttons.forEach(button=>{
      const isDark=currentlyDark();
      button.setAttribute("aria-pressed",String(isDark));
      button.title=(root.lang||"").startsWith("es")?"Cambiar entre tema claro y oscuro":"Switch light and dark appearance";
    });
    for(const button of buttons){
      button.addEventListener("click",()=>{
        root.dataset.theme=currentlyDark()?"light":"dark";
        try{localStorage.setItem("lumekori-theme",root.dataset.theme)}catch(e){}
        sync();
      });
    }
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change",sync);
    sync();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
