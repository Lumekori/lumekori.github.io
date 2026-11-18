/* Lumekori shared mobile navigation entrance/exit animation.
   Does not change links, page navigation, theme, auth or background animations. */
(()=>{"use strict";
 if(window.__lmkMobileMenuMotion)return;
 window.__lmkMobileMenuMotion=true;
 const init=()=>{
   const toggle=document.getElementById("site-menu-toggle");
   const panel=document.getElementById("mobile-site-menu");
   if(!toggle||!panel)return;
   const reduced=matchMedia("(prefers-reduced-motion: reduce)");
   let opened=!panel.hidden,run=null,items=[];
   const cancel=()=>{
     if(run){run.cancel();run=null}
     for(const a of items)a.cancel();
     items=[];
   };
   const setState=on=>{
     opened=on;
     toggle.setAttribute("aria-expanded",String(on));
     panel.inert=!on;
   };
   const show=()=>{
     if(opened)return;
     cancel();
     panel.hidden=false;setState(true);
     if(reduced.matches||!panel.animate)return;
     const a=panel.animate([
       {opacity:0,transform:"translate3d(0,-12px,0) scale(.965)"},
       {opacity:1,transform:"translate3d(0,0,0) scale(1)"}
     ],{duration:290,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
     run=a;
     a.onfinish=()=>{if(run===a){run=null;a.cancel()}};
     panel.querySelectorAll("a").forEach((link,i)=>{
       const effect=link.animate([
         {opacity:0,transform:"translate3d(0,-6px,0)"},
         {opacity:1,transform:"translate3d(0,0,0)"}
       ],{duration:205,delay:40+Math.min(i,12)*17,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
       items.push(effect);
       effect.onfinish=()=>effect.cancel();
     });
   };
   const hide=(instant=false)=>{
     if(!opened)return;
     cancel();setState(false);
     if(instant||reduced.matches||!panel.animate){panel.hidden=true;return}
     const a=panel.animate([
       {opacity:1,transform:"translate3d(0,0,0) scale(1)"},
       {opacity:0,transform:"translate3d(0,-8px,0) scale(.975)"}
     ],{duration:190,easing:"cubic-bezier(.4,0,.8,.3)",fill:"both"});
     run=a;
     a.onfinish=()=>{if(run===a){panel.hidden=true;run=null;a.cancel()}};
   };
   panel.inert=panel.hidden;
   toggle.addEventListener("click",()=>opened?hide():show());
   panel.addEventListener("click",e=>{if(e.target.closest("a"))hide()});
   document.addEventListener("pointerdown",e=>{
     if(opened&&!panel.contains(e.target)&&!toggle.contains(e.target))hide()
   });
   document.addEventListener("keydown",e=>{
     if(e.key==="Escape"&&opened){hide();toggle.focus()}
   });
   addEventListener("resize",()=>{if(innerWidth>1140)hide(true)},{passive:true});
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();