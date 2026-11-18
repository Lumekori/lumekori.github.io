/* Lumekori: responsive Claude-inspired animated strokes, for interior pages only. */
(()=>{"use strict";
if(document.getElementById("lmk-motion-canvas"))return;
const root=document.documentElement,body=document.body,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const glow=document.createElement("div");glow.className="lmk-motion-glow";glow.setAttribute("aria-hidden","true");
const canvas=document.createElement("canvas");canvas.id="lmk-motion-canvas";canvas.className="lmk-motion-canvas";canvas.setAttribute("aria-hidden","true");
body.prepend(glow);body.prepend(canvas);
const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)return;
const low=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)||(navigator.hardwareConcurrency||8)<=4||innerWidth<700;
let w=1,h=1,p=[],t=0,px=-9999,py=-9999,y=scrollY,prevY=y,vel=0,hue=42,oldHue=-9999;
let raf=0,last=0,lastDraw=0,bad=0,quality=low?.65:1,resizeTimer=0;
function resize(){let d=Math.min(devicePixelRatio||1,low?1:1.5);w=Math.max(1,innerWidth);h=Math.max(1,innerHeight);
canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);
p=Array.from({length:Math.max(16,Math.floor(Math.min(210,w*h/7600)*quality))},()=>({x:Math.random()*w,y:Math.random()*h}))}
function scrollUpdate(){y=scrollY;hue=42+Math.max(0,Math.min(1,y/Math.max(1,root.scrollHeight-innerHeight)))*190;
if(Math.abs(hue-oldHue)>.5){oldHue=hue;root.style.setProperty("--lmk-motion-hue",hue.toFixed(1))}}
addEventListener("scroll",scrollUpdate,{passive:true});
addEventListener("pointermove",e=>{if(e.pointerType!=="touch"){px=e.clientX;py=e.clientY}},{passive:true});
addEventListener("pointerleave",()=>{px=py=-9999},{passive:true});
addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{resize();scrollUpdate()},120)},{passive:true});
function paint(k){let dark=root.dataset.theme==="dark"||(!root.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
t+=.003*k;ctx.globalCompositeOperation="destination-out";ctx.fillStyle="rgba(0,0,0,.085)";ctx.fillRect(0,0,w,h);
ctx.globalCompositeOperation="source-over";ctx.lineWidth=1.25;
const drift=Math.max(-2.2,Math.min(2.2,vel*.18));
for(let b=0;b<4;b++){ctx.beginPath();
for(let i=b;i<p.length;i+=4){const q=p[i],a=(Math.sin(q.x*.0028+t*4)+Math.cos(q.y*.0035-t*3))*Math.PI;
let dx=Math.cos(a)*1.08,dy=Math.sin(a)*1.08-drift,mx=q.x-px,my=q.y-py,dist2=mx*mx+my*my;
if(dist2<22500){const d=Math.sqrt(dist2)||1,f=(1-d/150)*2.3;dx+=mx/d*f-my/d*f*.8;dy+=my/d*f+mx/d*f*.8}
const ox=q.x,oy=q.y;q.x+=dx*k;q.y+=dy*k;
if(q.x<0||q.x>w||q.y<0||q.y>h){q.x=Math.random()*w;q.y=Math.random()*h;continue}
ctx.moveTo(ox,oy);ctx.lineTo(q.x,q.y)}
ctx.strokeStyle="hsla("+(hue+b*13)+",78%,"+(dark?65:36)+"%,.6)";ctx.stroke()}}
function backgroundIsOriginal(){return !root.dataset.lmkBackground||root.dataset.lmkBackground==="original"}
function tick(now){if(!backgroundIsOriginal()){raf=0;return}raf=requestAnimationFrame(tick);
const dt=Math.min(50,now-last||16.7);last=now;
vel+=((y-prevY)-vel)*.13;prevY=y;
if(now-lastDraw<30)return;
const k=Math.min(1.8,Math.max(.65,(now-lastDraw||33.3)/33.3));lastDraw=now;paint(k);
bad=dt>26?bad+1:Math.max(0,bad-1);
if(bad>40&&p.length>28){p.length=Math.floor(p.length*.8);bad=0}}
function start(){if(!raf&&!document.hidden&&!reduced&&backgroundIsOriginal()){last=lastDraw=0;raf=requestAnimationFrame(tick)}}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
new MutationObserver(()=>{if(backgroundIsOriginal())start();else stop()}).observe(root,{attributes:true,attributeFilter:["data-lmk-background"]});
resize();scrollUpdate();if(reduced){canvas.style.display="none";return}start();
})();
/* Load only the approved ink-logo and scroll-entrance effects. */
(()=>{if(document.querySelector("script[data-lmk-entry]"))return;const s=document.createElement("script");s.src="/assets/lumekori-entry-motion.js?v=1";s.dataset.lmkEntry="1";document.head.appendChild(s)})();
