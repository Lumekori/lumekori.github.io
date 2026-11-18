/* Lumekori — shared inner-page header behavior. No dependence on page-specific scripts. */
(()=>{
"use strict";
const root=document.documentElement;
const button=document.getElementById("tm");
const menuButton=document.getElementById("site-menu-toggle");
const menu=document.getElementById("mobile-site-menu");
if(!button||!menuButton||!menu)return;
// The old pages can attach theme listeners; replace that button with a clean
// instance so the approved text-only Theme control is not converted to ◐.
const theme=button.cloneNode(true);
button.replaceWith(theme);
const label=root.lang.toLowerCase().startsWith("es")?"Tema":"Theme";
theme.textContent=label;
theme.addEventListener("click",()=>{
  const currentlyDark=root.dataset.theme==="dark"||
    (!root.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme=currentlyDark?"light":"dark";
  try{localStorage.setItem("lumekori-theme",root.dataset.theme)}catch(e){}
  theme.textContent=label;
});
// Animated mobile menu behavior is attached by lumekori-mobile-menu-motion.js.
})();