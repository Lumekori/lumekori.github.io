/* Global Lumekori background selector: original canvas, aurora or flowing arrows.
   Does not replace page animations, logotypes, login, navigation or the light/dark setting. */
(()=>{'use strict';
if(window.__lmkBackgroundThemesLoaded)return;
window.__lmkBackgroundThemesLoaded=true;
const root=document.documentElement,es=(root.lang||'').toLowerCase().startsWith('es');
const options=['original','aurora','flechas'],storageKey='lumekori-background-v1';
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let mode=root.dataset.lmkBackground||'original';
if(!options.includes(mode))mode='original';
let aurora,auroraCtx,world,tools,flowTiles=[],particles=[],dots=[],W=0,H=0,docH=0,dpr=1,flowDPR=1,last=0,mouseX=-1000,mouseY=-1000,scheduled=false,raf=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function dark(){
 const str=getComputedStyle(document.body).backgroundColor;
 const rgb=str.match(/[\d.]+/g);
 if(rgb&&rgb.length>=3){
  const r=+rgb[0],g=+rgb[1],b=+rgb[2];
  return (.2126*r+.7152*g+.0722*b)<135;
 }
 return root.classList.contains('lmk-games-page')||root.dataset.theme==='dark';
}
function create(){
 const a=document.createElement('div');a.id='lmk-bg-aurora';a.setAttribute('aria-hidden','true');
 a.innerHTML='<div class="lmk-bg-glows"><i class="lmk-bg-blob a"></i><i class="lmk-bg-blob b"></i><i class="lmk-bg-blob c"></i><i class="lmk-bg-blob d"></i></div><canvas></canvas>';
 document.body.prepend(a);
 aurora=a.querySelector('canvas');auroraCtx=aurora.getContext('2d',{alpha:true});
 world=document.createElement('div');world.id='lmk-bg-flow';world.setAttribute('aria-hidden','true');document.body.insertBefore(world,a.nextSibling);
 tools=document.createElement('div');tools.id='lmk-bg-controls';tools.setAttribute('role','group');
 tools.setAttribute('aria-label',es?'Elegir animación de fondo':'Choose background animation');
 const label=document.createElement('span');label.className='lmk-bg-caption';label.textContent=es?'Fondo':'Background';
 const group=document.createElement('div');group.className='lmk-bg-options';group.id='lmk-bg-options';
 for(const key of options){
  const b=document.createElement('button');b.type='button';b.dataset.mode=key;
  b.textContent=key==='original'?(es?'Original':'Original'):key==='aurora'?'Aurora':es?'Flechitas':'Arrows';
  b.setAttribute('aria-pressed',String(mode===key));b.addEventListener('click',()=>choose(key));
  group.append(b);
 }
 const toggle=document.createElement('button');toggle.type='button';toggle.className='lmk-bg-toggle';
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','lmk-bg-options');
 toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="2" fill="currentColor" stroke="none"/></svg>';
 const closeMenu=()=>{tools.classList.remove('lmk-bg-open');toggle.setAttribute('aria-expanded','false')};
 toggle.addEventListener('click',()=>{const open=tools.classList.toggle('lmk-bg-open');toggle.setAttribute('aria-expanded',String(open))});
 document.addEventListener('pointerdown',e=>{if(!tools.contains(e.target))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 window.addEventListener('resize',()=>{if(innerWidth>600)closeMenu()},{passive:true});
 tools.append(label,toggle,group);document.body.append(tools);
 window.addEventListener('pointermove',e=>{mouseX=e.clientX;mouseY=e.clientY},{passive:true});
 window.addEventListener('pointerleave',()=>{mouseX=mouseY=-1000});
 window.addEventListener('resize',()=>{docH=0;resize()},{passive:true});
 window.addEventListener('scroll',()=>{if(mode==='flechas')scheduleHeight()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=0;if(!raf&&!reduced)raf=requestAnimationFrame(frame)}});
 if('ResizeObserver' in window){
  const ob=new ResizeObserver(()=>scheduleHeight());
  for(const e of [document.querySelector('main'),document.querySelector('footer')])if(e)ob.observe(e);
 }
 if(document.fonts?.ready)document.fonts.ready.then(scheduleHeight);
 resize();apply();if(reduced){drawAurora(0);drawFlow(0,1)}else raf=requestAnimationFrame(frame);
}
function choose(key){
 if(!options.includes(key))return;
 mode=key;
 try{localStorage.setItem(storageKey,key)}catch(e){}
 root.dataset.lmkBackground=key;tools.classList.remove('lmk-bg-open');const toggle=tools.querySelector('.lmk-bg-toggle');if(toggle)toggle.setAttribute('aria-expanded','false');apply();
}
function apply(){
 root.dataset.lmkBackground=mode;
 for(const b of tools.querySelectorAll('button[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
 const toggle=tools.querySelector('.lmk-bg-toggle');
 if(toggle)toggle.setAttribute('aria-label',(es?'Cambiar fondo. Actual: ':'Change background. Current: ')+(mode==='original'?'Original':mode==='aurora'?'Aurora':es?'Flechitas':'Arrows'));
 if(mode==='flechas')scheduleHeight();
}
function resize(){
 W=innerWidth;H=innerHeight;
 dpr=Math.min(1.65,devicePixelRatio||1);
 aurora.width=Math.max(1,Math.round(W*dpr));aurora.height=Math.max(1,Math.round(H*dpr));
 auroraCtx.setTransform(dpr,0,0,dpr,0,0);
 dots=Array.from({length:Math.round(clamp(W*H/25000,24,72))},()=>({x:rand(0,W),y:rand(0,H),r:rand(.9,3.2),pulse:rand(0,Math.PI*2),speed:rand(.08,.27),alpha:rand(.09,.26)}));
 rebuild();
}
function currentX(y){
 const period=W<700?930:1390;
 return W*(.50+.26*Math.sin(y*2*Math.PI/period-.50)+.065*Math.sin(y*4*Math.PI/period+1.13));
}
function place(){
 const y=rand(0,docH),near=Math.random()<.43;
 const x=near?clamp(currentX(y)+(Math.random()+Math.random()+Math.random()-1.5)*W*.245,0,W):rand(0,W);
 return {x,y,b:Math.floor(rand(0,4)),rx:0,ry:0,vx:0,vy:0};
}
function rebuild(){
 const actual=Math.ceil(Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));
 if(W<1||actual<100)return;
 if(actual===docH&&flowTiles.length)return;
 const oldH=docH,previous=particles;
 docH=actual;world.style.height=docH+'px';
 const tileH=Math.max(580,Math.min(920,Math.round(H*.94)));
 flowDPR=Math.min(1.4,devicePixelRatio||1);
 flowTiles=[];world.replaceChildren();
 for(let top=0;top<docH;top+=tileH){
  const c=document.createElement('canvas'),h=Math.min(tileH,docH-top);
  c.width=Math.max(1,Math.round(W*flowDPR));c.height=Math.max(1,Math.round(h*flowDPR));
  c.style.top=top+'px';c.style.height=h+'px';c.style.width=W+'px';world.append(c);
  const ctx=c.getContext('2d',{alpha:true});ctx.setTransform(flowDPR,0,0,flowDPR,0,-top*flowDPR);
  flowTiles.push({ctx,top,bottom:top+h});
 }
 const viewportCount=Math.max(24,Math.min(210,W*H/7600));
 const target=Math.round(clamp(viewportCount*(docH/Math.max(H,1))*1.5,180,1500));
 particles=oldH?previous.filter(p=>p.y<docH).slice(0,target):[];
 while(particles.length<target)particles.push(place());
}
function scheduleHeight(){
 if(scheduled)return;
 scheduled=true;requestAnimationFrame(()=>{scheduled=false;const h=Math.ceil(Math.max(document.documentElement.scrollHeight,document.body.scrollHeight));if(Math.abs(h-docH)>4)rebuild()});
}
function drawAurora(t){
 const c=auroraCtx;c.clearRect(0,0,W,H);
 const isDark=dark();
 for(const p of dots){
  p.x+=Math.sin(t*.00021+p.pulse)*.06+p.speed*.10;
  p.y+=Math.cos(t*.00019+p.pulse)*.08-p.speed*.13;
  if(p.x>W+20)p.x=-20;if(p.y< -20)p.y=H+20;
  const x=p.x+(mouseX>=0?(mouseX-W/2)/W*5:0),y=p.y+(mouseY>=0?(mouseY-H/2)/H*5:0);
  const pulse=.7+.3*Math.sin(t*.0009+p.pulse),r=p.r*(.9+.3*pulse);
  c.beginPath();c.arc(x,y,r*5,0,Math.PI*2);
  const g=c.createRadialGradient(x,y,0,x,y,r*5);
  g.addColorStop(0,isDark?'rgba(165,200,255,'+(p.alpha*pulse*.8)+')':'rgba(100,151,212,'+(p.alpha*pulse*.65)+')');
  g.addColorStop(1,'rgba(120,155,200,0)');c.fillStyle=g;c.fill();
 }
}
function drawFlow(t,step){
 if(!flowTiles.length)return;
 const top=clamp(scrollY-100,0,Math.max(0,docH-1));
 const bottom=Math.min(docH,scrollY+H+120);if(bottom<=top)return;
 const isDark=dark(),pointerY=mouseY+scrollY,pointerOn=mouseX>=0&&mouseY>=0;
 const bandWidth=Math.max(140,W*.225),damping=Math.pow(.84,step);
 const strokes=[[],[],[],[]];
 for(const p of particles){
  const a=(Math.sin(p.x*.0028+t*.000012)+Math.cos(p.y*.0035-t*.00001))*Math.PI;
  let dx=Math.cos(a)*1.1,dy=Math.sin(a)*1.1;
  const center=currentX(p.y),away=p.x-center,strength=Math.exp(-.5*(away/bandWidth)**2);
  const tangent=(currentX(p.y+22)-currentX(p.y-22))/44;
  dx+=clamp((-away*.00165+tangent*.52)*strength,-.68,.68);
  dy+=.13*strength;
  const ox=p.x,oy=p.y,orx=p.rx,ory=p.ry;
  p.x+=dx*step;p.y+=dy*step;
  let fx=0,fy=0;
  if(pointerOn){
   const rx=p.x+p.rx-mouseX,ry=p.y+p.ry-pointerY,d=Math.hypot(rx,ry);
   if(d<165){
    const f=4.8*(1-d/165)**1.45;
    fx=(d>1?rx/d:Math.cos(a))*f;fy=(d>1?ry/d:Math.sin(a))*f;
   }
  }
  p.vx=(p.vx+(fx-p.rx*.046)*step)*damping;
  p.vy=(p.vy+(fy-p.ry*.046)*step)*damping;
  p.rx=clamp(p.rx+p.vx*step,-120,120);
  p.ry=clamp(p.ry+p.vy*step,-120,120);
  if(p.x<-30||p.x>W+30||p.y<-30||p.y>docH+30){Object.assign(p,place());continue}
  if(p.y<top-120||p.y>bottom+120)continue;
  strokes[p.b].push(ox+orx,oy+ory,p.x+p.rx,p.y+p.ry);
 }
 for(const tile of flowTiles){
  if(tile.bottom<top||tile.top>bottom)continue;
  const c=tile.ctx,start=Math.max(top,tile.top),end=Math.min(bottom,tile.bottom);
  c.save();c.globalCompositeOperation='destination-out';c.fillStyle='rgba(0,0,0,.065)';c.fillRect(0,start,W,end-start);
  c.globalCompositeOperation='source-over';c.lineWidth=1.35;
  for(let b=0;b<4;b++){
   c.beginPath();const path=strokes[b];
   for(let j=0;j<path.length;j+=4){
    if(Math.max(path[j+1],path[j+3])<tile.top-5||Math.min(path[j+1],path[j+3])>tile.bottom+5)continue;
    const dx=path[j+2]-path[j],dy=path[j+3]-path[j+1];
    c.moveTo(path[j]-dx*.22,path[j+1]-dy*.22);c.lineTo(path[j+2]+dx*.22,path[j+3]+dy*.22);
   }
   c.strokeStyle=isDark?'hsla('+(200+b*14)+',78%,70%,.39)':'hsla('+(43+b*14)+',78%,41%,.40)';
   c.stroke();
  }
  c.restore();
 }
}
function frame(t){
 raf=0;const dt=last?t-last:16.67;last=t;
 if(dt<120){if(mode==='aurora')drawAurora(t);else if(mode==='flechas')drawFlow(t,clamp(dt/16.67,.35,1.8))}
 if(!document.hidden)raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',create,{once:true});else create();
})();