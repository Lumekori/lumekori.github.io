
(function(){'use strict';
var $=function(s){return document.querySelector('#nao-experience '+s)},reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduce)document.documentElement.classList.add('js');
var delay=function(ms){return new Promise(function(r){setTimeout(r,reduce?0:ms)})};

/* Sonido: el ruido se convierte en un tono limpio, igual que las líneas */
var Snd=(function(){var c,m,on=true;try{on=localStorage.getItem('nao-sound')!=='0'}catch(e){}
function unlock(){if(c){if(c.state==='suspended')c.resume();return}var A=window.AudioContext||window.webkitAudioContext;if(!A)return;c=new A();m=c.createGain();m.gain.value=.5;m.connect(c.destination)}
['pointerdown','keydown'].forEach(function(e){addEventListener(e,unlock,{passive:true})});
function ok(){return on&&c&&c.state==='running'}
function tone(f,t,d,ty,v,to){var s=c.currentTime+t,o=c.createOscillator(),g=c.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f,s);if(to)o.frequency.exponentialRampToValueAtTime(to,s+d);
g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.01);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(m);o.start(s);o.stop(s+d+.05)}
function noise(t,d,f0,f1,v,q){var n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0),i;for(i=0;i<n;i++)a[i]=Math.random()*2-1;
var s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),st=c.currentTime+t;s.buffer=b;f.type='bandpass';f.Q.value=q||1;f.frequency.setValueAtTime(f0,st);f.frequency.exponentialRampToValueAtTime(f1,st+d);
g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(v,st+d*.4);g.gain.exponentialRampToValueAtTime(.0001,st+d);s.connect(f);f.connect(g);g.connect(m);s.start(st)}
function p(fn){return function(){if(ok())try{fn()}catch(e){}}}
return{click:p(function(){tone(1500,0,.05,'triangle',.08,800)}),
key:p(function(){tone(1000+Math.random()*600,0,.03,'square',.02)}),
send:p(function(){tone(520,0,.1,'sine',.15);tone(780,.07,.13,'sine',.15)}),
think:p(function(){noise(0,1,250,1400,.09,.8)}),
resolve:p(function(){noise(0,.65,1800,880,.08,6);tone(880,.4,.5,'sine',.1);tone(1320,.48,.6,'sine',.05)}),
receive:p(function(){tone(660,0,.16,'sine',.12);tone(880,.1,.22,'sine',.12);tone(1320,.2,.32,'sine',.05)}),
cut:p(function(){noise(0,.14,4000,900,.07,1.5)}),
ding:p(function(){tone(988,0,.3,'sine',.09);tone(1480,.08,.4,'sine',.05)}),
isOn:function(){return on},
toggle:function(){on=!on;try{localStorage.setItem('nao-sound',on?'1':'0')}catch(e){}if(on){unlock();setTimeout(function(){Snd.send()},60)}return on}}})();
var sb=$('#sndBtn');sb.addEventListener('click',function(){Snd.toggle();var o=Snd.isOn();sb.setAttribute('aria-pressed',o);sb.setAttribute('aria-label',o?'Mute sound':'Enable sound')});
sb.setAttribute('aria-pressed',Snd.isOn());sb.setAttribute('aria-label',Snd.isOn()?'Mute sound':'Enable sound');
document.addEventListener('click',function(e){if(e.target.closest('.chip,.tab,.btn,.pill,.again,.nav a'))Snd.click()});

/* Contenido */
var A={'what is photosynthesis?':'Photosynthesis is how plants, algae and some bacteria use sunlight, water and carbon dioxide to make nutrients and release oxygen. It is how they make their own food.',
'how does short-term memory work?':'It holds a small amount of information for seconds or minutes so you can use it immediately, like remembering a phrase while finishing a paragraph.',
'summarize this concept in one sentence: focus':'Focus means deliberately choosing one priority and letting everything else wait.',
'what makes nao different?':'Nao prioritizes clear, fast responses and a quiet interface without unnecessary distractions.',
'give me 3 ideas to focus today':'1) Choose your most important task before opening messages. 2) Work in focused 25-minute sessions. 3) Close tabs that do not help your current task.',
'how can I organize my day better?':'Pick three key outcomes for the day, reserve your first two hours for the hardest one, and group emails and messages into designated windows.'};
var CHIPS=['How does short-term memory work?','Summarize this concept in one sentence: focus','What makes Nao different?','Give me 3 ideas to focus today'];
var FEATS=[['Answers','Direct explanations from the first line.','What makes Nao different?'],['Summarizes','Any concept condensed into one sentence.','Summarize this concept in one sentence: focus'],['Organizes','Your day organized into three clear priorities.','How can I organize my day better?'],['Explains','Simple words, without unnecessary jargon.','How does short-term memory work?']];
function answerFor(q){var n=q.toLowerCase().trim().replace(/\s+/g,' ');if(A[n])return A[n];
if(/^(hello|hi|hey|good morning|good evening)/.test(n))return 'Hi. How can I help today?';if(/thank(s| you)?/.test(n))return 'You are welcome. I am here whenever you need me.';
if(/(who are you|what is nao)/.test(n))return 'I am Nao, an intelligent assistant built by Lumekori Studio. I aim for clear, direct answers.';
return 'This is a preview with sample answers. Visit Nao Testers to learn how to access the Android app.'}
function typeTo(set,txt,step,sound,alive){return new Promise(function(res){var i=0;(function n(){if(alive&&!alive())return res(false);i=reduce?txt.length:Math.min(txt.length,i+step);set(txt.slice(0,i));if(sound&&i%3<step)Snd.key();if(i>=txt.length)return res(true);setTimeout(n,sound?55:18)})()})}

/* Hero: líneas de ruido que se alinean en una sola cuando Nao responde */
var cv=$('#cv'),g=cv.getContext('2d'),hero=$('#hero'),rule=$('#rule'),W,H,N=15,calm=.3,target=.3,turb=1,tt=0,vis=true,px=-999,ink,acc;
function cols(){var s=getComputedStyle(document.documentElement);ink=s.getPropertyValue('--ink').trim();acc=s.getPropertyValue('--acc').trim()}
function size(){var d=Math.min(2,devicePixelRatio||1),r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);cols()}
addEventListener('resize',size);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',cols);size();
if('IntersectionObserver'in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(hero);
hero.addEventListener('pointermove',function(e){px=e.clientX-cv.getBoundingClientRect().left});hero.addEventListener('pointerleave',function(){px=-999});
function frame(ts){requestAnimationFrame(frame);if(!vis||document.hidden)return;
calm+=(target-calm)*(reduce?1:.05);turb+=(tt-turb)*(reduce?1:.06);
var time=reduce?0:ts/1000,rr=rule.getBoundingClientRect(),hr=cv.getBoundingClientRect(),base=rr.top-hr.top+rr.height/2;
var k=Math.min(1,Math.max(0,(calm-.4)/.6)),s=k*k*(3-2*k),amp=(1-calm)*(12+turb*34),mid=N>>1,gap=H/(N+1);
g.clearRect(0,0,W,H);g.lineCap='round';g.lineJoin='round';
for(var i=0;i<N;i++){var home=gap*(i+1),y0=home+(base-home)*s,hot=i===mid;g.beginPath();
for(var x=0;x<=W+8;x+=8){var w=Math.sin(x*.006+time*.8+i*.7)*amp+Math.sin(x*.013-time*1.3+i*1.3)*amp*.5+Math.sin(x*.03+time*(2+turb*3)+i)*amp*turb*.35;
var b=px>-900?-16*(1-s)*Math.exp(-((x-px)*(x-px))/16200):0;x?g.lineTo(x,y0+w+b):g.moveTo(x,y0+w+b)}
g.globalAlpha=hot?.3+.7*s:.17*(1-s);g.strokeStyle=hot?acc:ink;g.lineWidth=hot?1.5+1.8*s:1.2;g.stroke()}
g.globalAlpha=1}
requestAnimationFrame(frame);

var inp=$('#q'),ans=$('#ans'),busy=false,used=false;
async function ask(q,viaType){if(busy||!q)return;busy=true;inp.readOnly=true;ans.textContent='';
if(viaType){inp.value='';await typeTo(function(v){inp.value=v},q,1,true)}else inp.value=q;
Snd.send();await delay(300);target=0;tt=1;Snd.think();await delay(1000);
target=1;tt=0;Snd.resolve();await delay(700);
Snd.receive();ans.classList.add('typing');await typeTo(function(v){ans.textContent=v},answerFor(q),2,false);ans.classList.remove('typing');
busy=false;inp.readOnly=false}
$('#ask').addEventListener('submit',function(e){e.preventDefault();used=true;var q=inp.value.trim();inp.value='';ask(q,false)});
inp.addEventListener('input',function(){Snd.key();if(!busy){target=.3;tt=0}});
CHIPS.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=c;b.addEventListener('click',function(){used=true;ask(c,true)});$('#chips').appendChild(b)});
addEventListener('pointerdown',function(){used=true},{once:true});addEventListener('keydown',function(){used=true},{once:true});
/* Apertura: caos → una línea → ondas suaves → demostración */
(async function(){if(reduce){calm=target=.3;ans.textContent=answerFor('What is photosynthesis?');return}
calm=0;turb=1;await delay(600);target=1;tt=0;await delay(1400);target=.3;await delay(1200);if(!used)ask('What is photosynthesis?',true)})();

/* Sin relleno */
var fills=[].slice.call(document.querySelectorAll('.fill')),keeps=[].slice.call(document.querySelectorAll('.keep'));
var wd=function(el){return el.textContent.trim().split(/\s+/).length},nf=fills.map(wd),total=nf.reduce(function(a,b){return a+b},0)+keeps.map(wd).reduce(function(a,b){return a+b},0);
var wc=$('#wc'),pct=$('#pct'),run=0;
function setR(r){wc.textContent=Math.round(r);pct.textContent=Math.round((1-r/total)*100)}
function tween(a,b,ms,id){return new Promise(function(res){var t0=performance.now();(function t(n){if(id!==run)return res();var p=reduce?1:Math.min(1,(n-t0)/ms);setR(a+(b-a)*(1-Math.pow(1-p,3)));p<1?requestAnimationFrame(t):res()})(t0)})}
async function play(){var id=++run,r=total;fills.forEach(function(f){f.className='fill'});setR(total);await delay(500);
for(var i=0;i<fills.length;i++){if(id!==run)return;fills[i].classList.add('cut');Snd.cut();await delay(650);if(id!==run)return;fills[i].classList.add('gone');var to=r-nf[i];await tween(r,to,800,id);r=to;await delay(250)}
if(id===run)Snd.ding()}
$('#again').addEventListener('click',play);setR(total);
var seen=false;function once(el,fn,th){if(!('IntersectionObserver'in window)){fn();return}var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){o.disconnect();fn()}},{threshold:th});o.observe(el)}
once($('#txt'),function(){seen=true;play()},.5);

/* Funciones */
var tabs=[],fid=0,panel=$('#panel'),fq=$('#fq'),fa=$('#fa');
async function pick(i){var id=++fid;tabs.forEach(function(b,j){b.setAttribute('aria-pressed',j===i)});
panel.classList.remove('go');void panel.offsetWidth;panel.classList.add('go');fq.textContent=FEATS[i][2];fa.textContent='';fa.classList.remove('typing');Snd.send();
await delay(500);if(id!==fid)return;Snd.receive();fa.classList.add('typing');
var d=await typeTo(function(v){fa.textContent=v},answerFor(FEATS[i][2]),2,false,function(){return id===fid});if(d)fa.classList.remove('typing')}
FEATS.forEach(function(f,i){var b=document.createElement('button');b.type='button';b.className='tab';b.setAttribute('aria-pressed','false');b.innerHTML='<b>'+f[0]+'</b><span>'+f[1]+'</span>';b.addEventListener('click',function(){pick(i)});$('#tabs').appendChild(b);tabs.push(b)});
once(panel,function(){pick(0)},.4);

/* Aparición puntual de titulares de sección */
var rv=[].slice.call(document.querySelectorAll('.rv'));
if(reduce||!('IntersectionObserver'in window))rv.forEach(function(e){e.classList.add('in')});
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2});rv.forEach(function(e,i){e.style.transitionDelay=(i%3)*.08+'s';io.observe(e)})}
})();
