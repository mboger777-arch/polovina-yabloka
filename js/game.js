'use strict';
// «Половина яблока» — урок 74. Рыжинка, Умка, Тоша и енот Хапун.
const W=1280,H=720,cv=document.getElementById('c'),cx=cv.getContext('2d');
const FT='"FairyLogo","Lobster",cursive',FU='"NunitoLogo","Nunito",system-ui,sans-serif';
let SC=1,OX=0,OY=0,DPR=1;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);cv.width=innerWidth*DPR;cv.height=innerHeight*DPR;SC=Math.min(cv.width/W,cv.height/H);OX=(cv.width-W*SC)/2;OY=(cv.height-H*SC)/2;}
addEventListener('resize',resize);resize();
const IMG={};['fox','owl','hog','villain','bg_title','bg_l1','bg_l2','bg_l3','bg_l4','bg_l5','bg_secret','bg_finale'].forEach(n=>{const i=new Image();i.onload=()=>IMG[n]=i;i.src='assets/'+n+(n.startsWith('bg')?'.jpg':'.png');});
function ico(n,x,y,h){const i=SP[n];if(!i)return false;const w=h*i.width/i.height;cx.drawImage(i,x-w/2,y-h/2,w,h);return true;}
const SP={};['fish_a','fish_b','fish_c','fish_d','rocket','apple','apple_gold','catapult','cart','flask','net','asteroid','star','shell','lock','quarter_icon'].forEach(n=>{const i=new Image();i.onload=()=>SP[n]=i;i.src='assets/sprites/'+n+'.png';});
// спрайт по центру шириной w
function spr(n,x,y,w,rot=0,flip=false,sy=1){const im=SP[n];if(!im)return false;const h=w*im.height/im.width;cx.save();cx.translate(x,y);cx.rotate(rot);cx.scale(flip?-1:1,sy);cx.drawImage(im,-w/2,-h/2,w,h);cx.restore();return true;}
function shadow(x,y,w,a=.25){cx.fillStyle=`rgba(0,0,0,${a})`;cx.beginPath();cx.ellipse(x,y,w/2,w/9,0,0,7);cx.fill();}
// ---------- состояние ----------
const S={got:[0,0,0,0,0],open:1,stars:0,secret:[0,0,0,0],seeds:0};
try{Object.assign(S,JSON.parse(localStorage.pol74||'{}'))}catch(e){}
const save=()=>{try{localStorage.pol74=JSON.stringify(S)}catch(e){}};
// ---------- звук / голос ----------
let AC=null,curA=null,voiceOn=true;
function unlock(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function beep(f=660,d=.12,type='sine',v=.15){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d);}
const sfx={ok(){beep(660,.1);setTimeout(()=>beep(880,.1),90);setTimeout(()=>beep(1320,.18),180)},no(){beep(220,.2,'triangle')},pop(){beep(520,.06,'square',.06)},drop(){beep(900,.08);setTimeout(()=>beep(600,.08),50)},whoosh(){beep(300,.25,'sawtooth',.04)}};
let SUB=null; // {who,text,t0,dur}
const NAMES={fox:'Рыжинка',owl:'Умка',hog:'Тоша',villain:'Хапун',narrator:''};
function say(k){const [who,text]=LINES[k];const v=VOICE[k];const dur=v?v[1]:Math.max(1.6,text.length*.06);
  if(curA){try{curA.pause()}catch(e){}}
  SUB={who,text,t0:now,dur,k};G.lastSay=k;G.said.push(k);
  return new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;if(SUB&&SUB.k===k)SUB.end=now;res();};
    if(v&&voiceOn&&!G.fast){const a=new Audio('assets/voice/'+v[0]);curA=a;a.onended=fin;a.onerror=()=>setTimeout(fin,dur*1000);a.play().catch(()=>setTimeout(fin,dur*1000));setTimeout(fin,dur*1000+1500);}
    else setTimeout(fin,G.fast?30:dur*1000);});}
// ---------- ввод ----------
const P={x:0,y:0,down:false};let handlers=null;
function lp(e){const r=cv.getBoundingClientRect();return{x:((e.clientX-r.left)*DPR-OX)/SC,y:((e.clientY-r.top)*DPR-OY)/SC};}
cv.addEventListener('pointerdown',e=>{unlock();const p=lp(e);P.x=p.x;P.y=p.y;P.down=true;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);tapUI(p)||(scene.down&&scene.down(p));});
cv.addEventListener('pointermove',e=>{const p=lp(e);P.x=p.x;P.y=p.y;scene.move&&scene.move(p);});
cv.addEventListener('pointerup',e=>{const p=lp(e);P.down=false;scene.up&&scene.up(p);});
// кнопки
let BTN=[];function btn(id,x,y,w,h,label,fn,opt={}){BTN.push({id,x,y,w,h,label,fn,...opt});}
function tapUI(p){for(let i=BTN.length-1;i>=0;i--){const b=BTN[i];if(!b.hidden&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h){sfx.pop();b.press=now;b.fn();return true;}}return false;}
function drawBtns(){for(const b of BTN){if(b.hidden)continue;const pr=now-(b.press||-9)<.15?.94:1+Math.sin(now*3)*(b.pulse?.03:0);cx.save();cx.translate(b.x+b.w/2,b.y+b.h/2);cx.scale(pr,pr);
  rr(-b.w/2,-b.h/2+6,b.w,b.h,b.h/2,'rgba(0,0,0,.25)');const g=cx.createLinearGradient(0,-b.h/2,0,b.h/2);g.addColorStop(0,b.c1||'#ffd25a');g.addColorStop(1,b.c2||'#ff8a1f');rr(-b.w/2,-b.h/2,b.w,b.h,b.h/2,g);
  cx.strokeStyle='#fff';cx.lineWidth=4;cx.stroke();txt(b.label,0,2,b.fs||30,'#fff',FU,'center','#7a3300');cx.restore();}}
// ---------- рисование ----------
function rr(x,y,w,h,r,f){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):cx.rect(x,y,w,h);if(f){cx.fillStyle=f;cx.fill();}}
function txt(s,x,y,sz,col,font=FU,al='center',stroke,sw){cx.font=`${sz}px ${font}`;cx.textAlign=al;cx.textBaseline='middle';if(stroke){cx.lineJoin='round';cx.lineWidth=sw||sz/5;cx.strokeStyle=stroke;cx.strokeText(s,x,y);}cx.fillStyle=col;cx.fillText(s,x,y);}
function rainbow(s,x,y,sz){cx.font=`${sz}px ${FT}`;const w=cx.measureText(s).width;const g=cx.createLinearGradient(x-w/2,0,x+w/2,0);['#ff4d6d','#ff9f1c','#ffe14d','#5ee06a','#3fb8ff','#a66bff'].forEach((c,i,a)=>g.addColorStop(i/(a.length-1),c));
  cx.save();cx.shadowColor='rgba(0,0,0,.45)';cx.shadowOffsetY=6;cx.shadowBlur=8;txt(s,x,y,sz,g,FT,'center','#4a1d00',sz/6);cx.restore();txt(s,x,y,sz,g,FT,'center');
  cx.save();cx.globalAlpha=.35;cx.beginPath();cx.rect(x-w/2,y-sz/2,w,sz*.35);cx.clip();txt(s,x,y,sz,'#fff',FT,'center');cx.restore();}
// дробь столбиком: числитель над знаменателем
function frac(n,d,x,y,sz=44,col='#fff',st='#3b1d00'){txt(String(n),x,y-sz*.52,sz,col,FU,'center',st,sz/5);txt(String(d),x,y+sz*.52,sz,col,FU,'center',st,sz/5);
  const w=sz*.42*Math.max(String(n).length,String(d).length)+sz*.3;cx.lineCap='round';cx.strokeStyle=st;cx.lineWidth=sz*.18;cx.beginPath();cx.moveTo(x-w/2,y);cx.lineTo(x+w/2,y);cx.stroke();cx.strokeStyle=col;cx.lineWidth=sz*.09;cx.stroke();}
// круг из parts РАВНЫХ секторов, закрашено shaded
function pie(x,y,r,parts,shaded,col='#ff5a4e',cuts){cx.save();cx.beginPath();cx.arc(x,y,r,0,7);cx.fillStyle='#fff6df';cx.fill();
  const A=cuts||Array.from({length:parts+1},(_,i)=>i/parts);for(let i=0;i<shaded;i++){cx.beginPath();cx.moveTo(x,y);cx.arc(x,y,r,-Math.PI/2+A[i]*Math.PI*2,-Math.PI/2+A[i+1]*Math.PI*2);cx.closePath();cx.fillStyle=col;cx.fill();}
  cx.strokeStyle='#5a2a10';cx.lineWidth=Math.max(3,r/14);for(let i=0;i<A.length-1;i++){const a=-Math.PI/2+A[i]*Math.PI*2;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);cx.stroke();}
  cx.beginPath();cx.arc(x,y,r,0,7);cx.stroke();cx.restore();}
// полоска из РАВНЫХ частей (или cuts — нарочно неравные для «неверных» вариантов)
function bar(x,y,w,h,parts,shaded,col='#ffb02e',cuts){const A=cuts||Array.from({length:parts+1},(_,i)=>i/parts);rr(x,y,w,h,8,'#fff6df');
  for(let i=0;i<shaded;i++){cx.fillStyle=col;cx.fillRect(x+A[i]*w,y,(A[i+1]-A[i])*w,h);}cx.strokeStyle='#5a2a10';cx.lineWidth=4;cx.strokeRect(x,y,w,h);for(let i=1;i<A.length-1;i++){cx.beginPath();cx.moveTo(x+A[i]*w,y);cx.lineTo(x+A[i]*w,y+h);cx.stroke();}}
function apple(x,y,r,col='#e8322f',gold){cx.save();cx.translate(x,y);const g=cx.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r*1.1);g.addColorStop(0,gold?'#fff6a8':'#ff8a7a');g.addColorStop(.5,gold?'#ffc72c':col);g.addColorStop(1,gold?'#b8730a':'#8a1010');
  cx.beginPath();cx.moveTo(0,-r*.7);cx.bezierCurveTo(r*.9,-r*1.2,r*1.4,r*.2,r*.5,r*.95);cx.quadraticCurveTo(0,r*1.1,-r*.5,r*.95);cx.bezierCurveTo(-r*1.4,r*.2,-r*.9,-r*1.2,0,-r*.7);cx.fillStyle=g;cx.fill();
  cx.strokeStyle='#5a3310';cx.lineWidth=r*.12;cx.beginPath();cx.moveTo(0,-r*.65);cx.quadraticCurveTo(r*.1,-r*1.1,r*.25,-r*1.25);cx.stroke();cx.fillStyle='#5cbf3a';cx.beginPath();cx.ellipse(r*.38,-r*1.05,r*.32,r*.14,-.5,0,7);cx.fill();cx.restore();}
function fish(x,y,s,col,flip,t){cx.save();cx.translate(x,y);cx.scale(flip?-s:s,s);const wg=Math.sin(t*10)*.25;cx.fillStyle=col;cx.beginPath();cx.ellipse(0,0,34,20,0,0,7);cx.fill();
  cx.beginPath();cx.moveTo(-28,0);cx.lineTo(-54,-18+wg*20);cx.lineTo(-54,18+wg*20);cx.closePath();cx.fill();cx.fillStyle='rgba(255,255,255,.35)';cx.beginPath();cx.ellipse(4,-7,18,6,0,0,7);cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(18,-4,7,0,7);cx.fill();cx.fillStyle='#222';cx.beginPath();cx.arc(20,-4,3.5,0,7);cx.fill();cx.restore();}
// герои: спрайт + сквош/прыжок/наклон/моргание
const EYES={fox:[[.59,.255],[.80,.25],.05],owl:[[.40,.28],[.63,.28],.07],hog:[[.36,.285],[.53,.285],.04]};
function hero(n,x,y,h,o={}){const im=IMG[n];const t=now+(o.ph||0);let sq=1+Math.sin(t*2.2)*.015,hop=0,tilt=o.tilt||0;
  if(o.talk)sq+=Math.sin(t*14)*.02;if(o.hop){hop=Math.abs(Math.sin(t*6))*24;sq=1+Math.sin(t*12)*.05;}if(o.cheer){hop=Math.abs(Math.sin(t*5))*36;tilt+=Math.sin(t*5)*.08;}
  cx.save();cx.translate(x,y-hop);cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();cx.ellipse(0,hop,h*.28*(1-hop/120),h*.05,0,0,7);cx.fill();cx.rotate(tilt);cx.scale((o.flip?-1:1)/sq,sq);
  if(im){const w=h*im.width/im.height;cx.drawImage(im,-w/2,-h,w,h);
    const e=EYES[n];if(e&&(t%4.1)<.13){cx.fillStyle=n==='owl'?'#8a6a4a':n==='fox'?'#e07a2a':'#e9c49a';for(const p of [e[0],e[1]]){cx.beginPath();cx.ellipse(-w/2+p[0]*w,-h+p[1]*h,e[2]*w,e[2]*w*.85,0,0,7);cx.fill();}}}
  else if(n==='villain')raccoon(h);else{cx.fillStyle='#f80';cx.fillRect(-h/4,-h,h/2,h);}cx.restore();}
// енот Хапун (запасной рисунок, пока нет assets/villain.png)
function raccoon(h){const s=h/300;cx.save();cx.scale(s,s);
  cx.fillStyle='#6d6a78';cx.beginPath();cx.ellipse(70,-90,40,95,.9,0,7);cx.fill();for(let i=0;i<4;i++){cx.fillStyle='#2e2b38';cx.beginPath();cx.ellipse(40+i*22,-120+i*24,10,30,.9,0,7);cx.fill();}
  cx.fillStyle='#8c8898';cx.beginPath();cx.ellipse(0,-90,70,90,0,0,7);cx.fill();cx.fillStyle='#d9d4e0';cx.beginPath();cx.ellipse(0,-70,42,60,0,0,7);cx.fill();
  cx.fillStyle='#8c8898';cx.beginPath();cx.ellipse(0,-205,85,70,0,0,7);cx.fill();for(const sx of[-1,1]){cx.beginPath();cx.moveTo(sx*40,-250);cx.lineTo(sx*80,-300);cx.lineTo(sx*85,-235);cx.fill();}
  cx.fillStyle='#efeaf3';cx.beginPath();cx.ellipse(0,-180,60,40,0,0,7);cx.fill();cx.fillStyle='#24212d';cx.beginPath();cx.ellipse(-35,-210,34,20,-.2,0,7);cx.ellipse(35,-210,34,20,.2,0,7);cx.fill();
  for(const sx of[-1,1]){cx.fillStyle='#fff';cx.beginPath();cx.arc(sx*33,-210,13,0,7);cx.fill();cx.fillStyle='#3a2a1a';cx.beginPath();cx.arc(sx*30,-208,7,0,7);cx.fill();}
  cx.fillStyle='#222';cx.beginPath();cx.ellipse(0,-180,12,8,0,0,7);cx.fill();cx.strokeStyle='#222';cx.lineWidth=5;cx.beginPath();cx.arc(0,-168,20,.3,2.8);cx.stroke();
  cx.fillStyle='#7a4a1a';cx.beginPath();cx.ellipse(-60,-60,30,40,0,0,7);cx.fill();cx.restore();}
// фон: картинка (если есть) с параллаксом, иначе нарисованная сцена
const THEME={title:['#7fd4ff','#ffe9b0','#5cbf3a'],l1:['#8fd8ff','#fff1c4','#4caf38'],l2:['#6cc6ff','#d8f4ff','#2e8fd0'],l3:['#3a2418','#7a4a28','#2a1a10'],l4:['#3b2a6a','#8a5cc8','#2a1d48'],l5:['#0a0630','#3a1a7a','#0a0630'],secret:['#4a1a6a','#c27aff','#2a0d40'],finale:['#ffb27a','#ffe9b0','#5cbf3a']};
const PART=[];function bg(key,par=0){const im=IMG['bg_'+key];const mx=(P.x-W/2)/W,my=(P.y-H/2)/H;
  if(im){const s=1.06;cx.drawImage(im,-W*.03-mx*28*par-Math.sin(now*.1)*6,-H*.03-my*14*par,W*s,H*s);}
  else{const th=THEME[key]||THEME.title;let g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,th[0]);g.addColorStop(1,th[1]);cx.fillStyle=g;cx.fillRect(0,0,W,H);
    for(let l=0;l<3;l++){cx.fillStyle=l===0?'rgba(255,255,255,.25)':th[2];cx.globalAlpha=l===0?1:.45+l*.25;cx.beginPath();cx.moveTo(0,H);for(let x=0;x<=W+40;x+=40)cx.lineTo(x-mx*20*(l+1),H*(.62+l*.1)-Math.sin(x*.006+l*2)*40-Math.sin(x*.017+l)*14);cx.lineTo(W,H);cx.fill();}cx.globalAlpha=1;}
  // свет и частицы
  const lg=cx.createRadialGradient(W*.8,0,10,W*.8,0,700);lg.addColorStop(0,'rgba(255,240,180,.35)');lg.addColorStop(1,'rgba(255,240,180,0)');cx.fillStyle=lg;cx.fillRect(0,0,W,H);
  if(PART.length<40)PART.push({x:Math.random()*W,y:Math.random()*H,v:10+Math.random()*30,s:2+Math.random()*4,p:Math.random()*7});
  for(const p of PART){p.y-=p.v*dt*(key==='l5'?0:1);p.x+=(key==='l5'?-p.v*6:Math.sin(now+p.p)*10)*dt;if(p.y<-10)p.y=H+10;if(p.x<-10)p.x=W+10;
    cx.globalAlpha=.5+.5*Math.sin(now*3+p.p);cx.fillStyle=key==='l2'?'rgba(255,255,255,.8)':key==='l3'?'#ffcf6a':key==='l4'?'#d9a8ff':key==='l1'||key==='finale'?'#ffe680':'#fff';cx.beginPath();cx.arc(p.x,p.y,p.s,0,7);cx.fill();}cx.globalAlpha=1;}
// субтитры
function drawSub(){if(!SUB)return;if(SUB.end&&now-SUB.end>1.2)return;const a=Math.min(1,(now-SUB.t0)*5);cx.save();cx.globalAlpha=a;
  const x=W/2,y=H-70,w=980;rr(x-w/2,y-48,w,96,26,'rgba(255,253,244,.94)');cx.strokeStyle='#ffb02e';cx.lineWidth=5;cx.stroke();
  if(SUB.who!=='narrator'){const im=IMG[SUB.who];rr(x-w/2+12,y-40,80,80,40,'#ffe7b8');if(im){cx.save();cx.beginPath();cx.arc(x-w/2+52,y,40,0,7);cx.clip();const s=200/im.width;cx.drawImage(im,x-w/2+52-100,y-40-(SUB.who==='hog'?18:4),200,im.height*s);cx.restore();}else if(SUB.who==='villain'){cx.save();cx.beginPath();cx.arc(x-w/2+52,y,40,0,7);cx.clip();cx.translate(x-w/2+52,y+120);raccoon(170);cx.restore();}
    txt(NAMES[SUB.who],x-w/2+110,y-26,22,'#c25a00',FU,'left');}
  cx.font=`26px ${FU}`;const words=SUB.text.split(' ');let lines=[''],mw=SUB.who==='narrator'?w-60:w-140;for(const wd of words){const t=(lines[lines.length-1]+' '+wd).trim();if(cx.measureText(t).width>mw)lines.push(wd);else lines[lines.length-1]=t;}
  const tx=SUB.who==='narrator'?x:x-w/2+110,al=SUB.who==='narrator'?'center':'left';lines.slice(0,3).forEach((l,i)=>txt(l,tx,y+(SUB.who==='narrator'?-(lines.length-1)*15:2)+i*30-(lines.length>2?10:0),25,'#3a2410',FU,al));cx.restore();}
// конфетти и вспышки
const FX=[];function burst(x,y,n=30,cols=['#ff4d6d','#ffd23f','#5ee06a','#3fb8ff','#c77dff']){for(let i=0;i<n;i++){const a=Math.random()*7,v=150+Math.random()*350;FX.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,c:cols[i%cols.length],l:1.2,r:Math.random()*7});}}
function drawFX(){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.vy+=600*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.l-=dt;if(f.l<0){FX.splice(i,1);continue;}cx.globalAlpha=Math.min(1,f.l*2);cx.fillStyle=f.c;cx.save();cx.translate(f.x,f.y);cx.rotate(f.r+=dt*8);cx.fillRect(-6,-3,12,6);cx.restore();}cx.globalAlpha=1;}
function hud(title){rr(16,12,370,64,32,'rgba(40,20,0,.45)');txt(title,200,46,34,'#fff',FT,'center','#5a2a00',6);
  for(let i=0;i<4;i++){const g=S.got[i];cx.globalAlpha=g?1:.3;if(!ico('quarter_icon',975+i*58,50,56))quarter(975+i*58,50,26,i);cx.globalAlpha=1;}txt('★ '+S.stars,1210,46,32,'#ffe14d',FU,'center','#5a2a00');}
function qbox(drawer,w=560){rr(W/2-w/2,90,w,120,30,'rgba(255,253,244,.93)');cx.strokeStyle='#ff9f1c';cx.lineWidth=5;cx.stroke();drawer(W/2,150);}
// ---------- движок сцен ----------
let scene={},now=0,dt=0,last=performance.now(),stack=[];
const G={said:[],fast:false,get scene(){return scene.name},answer(){return scene.answer&&scene.answer()},wrong(){return scene.wrong&&scene.wrong()},go(n,a){go(n,a)},S,btns:()=>BTN.filter(b=>!b.hidden).map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2})),get busy(){return !!scene.busy},info:()=>scene.info?scene.info():{r:99,stars:[],fish:[]},secretXY:()=>scene.secret&&!scene.secret.used?{x:scene.secret.x,y:scene.secret.y}:null};G.pg=(x,y)=>({x:(x*SC+OX)/DPR,y:(y*SC+OY)/DPR});window.G=G;
function go(name,arg){BTN=[];SUB=null;FX.length=0;scene=SCENES[name](arg);scene.name=name;scene.t0=now;}
function push(name,arg){stack.push({scene,BTN});BTN=[];SUB=null;scene=SCENES[name](arg);scene.name=name;}
function pop(){const s=stack.pop();scene=s.scene;BTN=s.BTN;SUB=null;scene.resume&&scene.resume();}
function frame(t){dt=Math.min(.05,(t-last)/1000);last=t;now+=dt;cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#1b1030';cx.fillRect(0,0,cv.width,cv.height);
  cx.setTransform(SC,0,0,SC,OX,OY);cx.save();cx.beginPath();cx.rect(0,0,W,H);cx.clip();try{scene.draw&&scene.draw();}catch(e){console.error(e);G.err=String(e)+" @"+scene.name+" "+(e.stack||"").split("\n")[1];}
  if(scene.secret&&!scene.secret.used)drawSecretDoor(scene.secret);drawFX();drawBtns();drawSub();cx.restore();requestAnimationFrame(frame);}
const wait=s=>new Promise(r=>setTimeout(r,G.fast?20:s*1000));
async function sayAll(ks){for(const k of ks)await say(k);}
function praise(){sfx.ok();return say(['ok1','ok2','ok3'][Math.floor(Math.random()*3)]);}
// тайная дверца
function drawSecretDoor(d){const p=1+Math.sin(now*4)*.08;cx.save();cx.translate(d.x,d.y);cx.scale(p,p);cx.globalAlpha=.85;rr(-22,-34,44,64,20,'#7a3fc0');cx.strokeStyle='#ffe14d';cx.lineWidth=4;cx.stroke();cx.fillStyle='#ffe14d';cx.beginPath();cx.arc(10,0,4,0,7);cx.fill();
  for(let i=0;i<4;i++){const a=now*2+i*1.57;cx.fillStyle='#fff6a8';cx.beginPath();cx.arc(Math.cos(a)*40,Math.sin(a)*40,3,0,7);cx.fill();}cx.restore();}
function secretTap(p,lv){const d=scene.secret;if(d&&!d.used&&Math.hypot(p.x-d.x,p.y-d.y)<45&&!scene.busy){d.used=true;say('sec').then(()=>push('secret',lv));return true;}return false;}
// конец уровня
async function levelDone(lv){const sc=scene;sc.busy=true;S.got[lv-1]=1;S.open=Math.max(S.open,lv+1);save();sfx.ok();burst(W/2,H/2,60);sc.won=now;await say('got');await wait(.6);go(lv===5?'finale':'map');}
// ---------- сцены ----------
const SCENES={};
SCENES.title=()=>{btn('play',W/2-150,520,300,90,'Играть',()=>{unlock();go('intro')},{pulse:1,fs:40});return{draw(){bg('title',1);
  hero('fox',250,700,330,{tilt:Math.sin(now)*.03});hero('owl',1060,700,240,{ph:1});hero('hog',820,705,300,{ph:2});hero('villain',1170,330,150,{ph:3,tilt:Math.sin(now*2)*.1});
  apple(W/2,90+Math.sin(now*2)*8,46,'',true);rainbow('Половина яблока',W/2,200,110);txt('Рыжинка и Золотое яблоко',W/2,290,40,'#fff',FU,'center','#5a2a00',8);}};};
SCENES.intro=()=>{const s={busy:true,step:0,draw(){bg('title',1);const c=SUB&&SUB.who;hero('fox',260,660,320,{talk:c==='fox',hop:c==='fox'});hero('owl',560,600,240,{talk:c==='owl',ph:1});hero('hog',850,660,300,{talk:c==='hog',ph:2});
  hero('villain',1120,s.vx??620,190,{tilt:Math.sin(now*3)*.12});if(s.step>=3){for(let i=0;i<4;i++){const a=now*1.5+i*1.57;cx.save();cx.translate(1120+Math.cos(a)*120,420+Math.sin(a)*40);quarter(0,0,30,i);cx.restore();}}else apple(1120,380,50,'',true);}};
  (async()=>{await say('p1');s.step=1;await say('p2');s.step=2;await say('p3');s.step=3;sfx.whoosh();await say('p4');await say('p5');await say('p6');if(scene!==s)return;s.busy=false;btn('go',W/2-150,560,300,90,'В путь!',()=>go('map'),{pulse:1,fs:40});})();
  btn('skip',W-170,20,150,54,'Дальше ›',()=>go('map'),{fs:24,c1:'#9be15d',c2:'#3aa63a'});return s;};
function quarter(x,y,r,i){cx.save();cx.translate(x,y);cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,r,-Math.PI/2+i*Math.PI/2,i*Math.PI/2);cx.closePath();const g=cx.createRadialGradient(-r*.3,-r*.3,2,0,0,r);g.addColorStop(0,'#fff6a8');g.addColorStop(1,'#e0a010');cx.fillStyle=g;cx.fill();cx.strokeStyle='#8a5a00';cx.lineWidth=3;cx.stroke();cx.restore();}
SCENES.map=()=>{const N=[[200,560,'Катапульта'],[430,420,'Рыбалка'],[650,560,'Тележка'],[870,410,'Зелья'],[1090,540,'Ракета']];
  N.forEach((n,i)=>btn('lv'+(i+1),n[0]-70,n[1]-70,140,140,'',()=>{if(i+1<=S.open)go('l'+(i+1));else sfx.no();}));BTN.forEach(b=>b.hidden=false);
  const bs=BTN.slice();for(const b of bs)b.hidden=true; // рисуем сами, кнопки только для нажатия
  const s={draw(){bg('title',1);cx.fillStyle='rgba(30,10,60,.25)';cx.fillRect(0,0,W,H);rainbow('Карта долины',W/2,70,72);
    cx.setLineDash([4,22]);cx.lineCap='round';cx.strokeStyle='#fff';cx.lineWidth=12;cx.beginPath();N.forEach((n,i)=>i?cx.lineTo(n[0],n[1]):cx.moveTo(n[0],n[1]));cx.stroke();cx.setLineDash([]);
    N.forEach((n,i)=>{const op=i+1<=S.open,p=op&&i+1===S.open?1+Math.sin(now*4)*.06:1;cx.save();cx.translate(n[0],n[1]);cx.scale(p,p);cx.globalAlpha=op?1:.5;
      const g=cx.createRadialGradient(-20,-20,5,0,0,70);g.addColorStop(0,op?'#fff3a0':'#ccc');g.addColorStop(1,op?'#ff8a1f':'#777');cx.beginPath();cx.arc(0,0,64,0,7);cx.fillStyle=g;cx.fill();cx.strokeStyle='#fff';cx.lineWidth=6;cx.stroke();
      if(op||!SP.lock)txt(String(i+1),0,-6,58,'#fff',FT,'center','#7a3300',8);if(S.got[i])quarter(30,30,26,i<4?i:0);if(!op&&!ico('lock',0,0,70))txt('🔒',0,0,44,'#fff');cx.restore();txt(n[2],n[0],n[1]+92,28,'#fff',FU,'center','#4a1d00',7);});
    const ch=S.open<=5?N[S.open-1]:N[4];hero('fox',ch[0]-10,ch[1]-62+Math.sin(now*4)*4,130,{});
    rr(W-320,140,300,60,30,'rgba(40,20,0,.5)');txt('★ бонусы: '+S.stars+' из 4',W-170,171,30,'#ffe14d',FU);}};
  if(S.got.slice(0,5).every(x=>x))btn('fin',W-260,220,240,70,'Финал ★',()=>go('finale'),{fs:30,c1:'#ff8ad8',c2:'#c03aa0'});
  for(const b of bs)b.hidden=false,b.label='',b.c1=b.c2='rgba(0,0,0,0)';
  // прозрачные кнопки уровней: перерисовываем без фона
  bs.forEach(b=>b.invis=true);return s;};
// невидимые кнопки не рисуем
const _db=drawBtns;drawBtns=function(){const keep=BTN;BTN=BTN.filter(b=>!b.invis);_db();BTN=keep;};
// ===== Уровень 1: катапульта =====
SCENES.l1=()=>{const R=[{k:'l1q1',h:'l1h1',q:['f',1,2],t:[['pie',2,1],['pie',4,1],['pie',4,3]],ok:0},{k:'l1q2',h:'l1h2',q:['f',1,4],t:[['pie',2,1],['pie',4,3],['pie',4,1]],ok:2},
  {k:'l1q3',h:'l1h3',q:['n','½ от 8'],t:[['n',2],['n',4],['n',6]],ok:1},{k:'l1q4',h:'l1h4',q:['n','¼ от 12'],t:[['n',6],['n',3],['n',4]],ok:1}];
  const C={x:230,y:520},ST=[[820,330],[990,470],[1150,300]];let r=0,drag=null,ball=null,targets=[],tries=0;
  const s={busy:true,secret:{x:90,y:250},info:()=>({r,targets:targets.map(t=>({x:t.x,y:t.y,ok:t.ok}))}),
    draw(){bg('l1',1);hud('1. Катапульта');const q=R[Math.min(r,3)];
      qbox((x,y)=>{if(q.q[0]==='f'){txt('Сбей',x-90,y,40,'#3a2410');frac(q.q[1],q.q[2],x+20,y,40,'#ff6a00');}else{txt('Сбей:',x-150,y,40,'#3a2410');qtxt(q,x+40,y);}},460);
      hero('hog',100,640,200,{flip:false,ph:2,talk:SUB&&SUB.who==='hog'});hero('owl',1200,700,150,{talk:SUB&&SUB.who==='owl',ph:1});
      // катапульта
      shadow(C.x-10,C.y+150,260,.3);if(!spr('catapult',C.x-10,C.y+80,280,0,true)){cx.strokeStyle='#6b3a14';cx.lineWidth=18;cx.beginPath();cx.moveTo(C.x,C.y+130);cx.lineTo(C.x,C.y);cx.stroke();}
      const pp=drag?drag:{x:C.x,y:C.y};if(drag){cx.strokeStyle='rgba(60,25,5,.9)';cx.lineWidth=7;cx.lineCap='round';cx.beginPath();cx.moveTo(C.x-30,C.y);cx.lineTo(pp.x,pp.y);cx.lineTo(C.x+30,C.y);cx.stroke();}
      if(!ball){hero('fox',pp.x-6,pp.y+42,90,{});}
      if(drag){let vx=(C.x-drag.x)*5.2,vy=(C.y-drag.y)*5.2,x=C.x,y=C.y;cx.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<22;i++){for(let k=0;k<3;k++){x+=vx*.016;y+=vy*.016;vy+=900*.016;}cx.beginPath();cx.arc(x,y,6-i*.2,0,7);cx.fill();}}
      for(const t of targets){const w=t.hit?Math.sin((now-t.hit)*30)*.3*Math.max(0,1-(now-t.hit)*2):0;cx.save();cx.translate(t.x,t.y+(t.fall||0));cx.rotate(w);
        const pg=cx.createLinearGradient(-9,0,9,0);pg.addColorStop(0,'#5a3210');pg.addColorStop(.4,'#b07a40');pg.addColorStop(1,'#4a2808');cx.fillStyle=pg;cx.fillRect(-9,60,18,400);
        cx.save();cx.shadowColor='rgba(0,0,0,.4)';cx.shadowBlur=14;cx.shadowOffsetY=8;const tg=cx.createRadialGradient(-25,-25,10,0,0,80);tg.addColorStop(0,'#fff');tg.addColorStop(1,'#f3e6cc');rr(-76,-76,152,152,76,tg);cx.restore();
        const rg=cx.createLinearGradient(0,-76,0,76);rg.addColorStop(0,'#ff6b5e');rg.addColorStop(1,'#b0160f');cx.strokeStyle=rg;cx.lineWidth=11;cx.beginPath();cx.arc(0,0,69,0,7);cx.stroke();cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,72,3.6,5.2);cx.stroke();
        if(t.d[0]==='pie')pie(0,0,54,t.d[1],t.d[2]);else txt(String(t.d[1]),0,4,74,'#e8322f',FU,'center','#fff',8);cx.restore();}
      if(ball){cx.save();cx.translate(ball.x,ball.y);cx.rotate(now*12);hero('fox',0,30,70,{});cx.restore();}},
    down(p){if(secretTap(p,1))return;if(!s.busy&&!ball&&Math.hypot(p.x-C.x,p.y-C.y)<120)drag={x:p.x,y:p.y};},
    move(p){if(drag){const dx=p.x-C.x,dy=p.y-C.y,l=Math.hypot(dx,dy),m=Math.min(l,170)/(l||1);drag={x:C.x+dx*m,y:C.y+dy*m};}},
    up(){if(drag){const d=drag;drag=null;if(Math.hypot(d.x-C.x,d.y-C.y)<25)return;sfx.whoosh();shoot((C.x-d.x)*5.2,(C.y-d.y)*5.2);}},
    answer(){const t=targets.find(t=>t.ok);hit(t);},wrong(){hit(targets.find(t=>!t.ok));}};
  function qtxt(q,x,y){const p=q.q[1].startsWith('½');frac(1,p?2:4,x-40,y,34,'#ff6a00');txt('от '+q.q[1].split('от ')[1],x+60,y,40,'#3a2410');}
  function setup(){const q=R[r];targets=q.t.map((d,i)=>({x:ST[i][0],y:ST[i][1],d,ok:i===q.ok}));tries=0;s.busy=true;say(q.k).then(()=>s.busy=false);}
  function shoot(vx,vy){ball={x:C.x,y:C.y,vx,vy};const step=()=>{if(!ball||scene!==s&&!stack.length)return;for(let k=0;k<3;k++){ball.x+=ball.vx*.016/3*3/3;ball.y+=ball.vy*.016/3*3/3;ball.vy+=900*.016/3;}
      for(const t of targets)if(Math.hypot(ball.x-t.x,ball.y-t.y)<80){ball=null;hit(t);return;}if(ball.y>H+60||ball.x>W+60||ball.x<-60){ball=null;return;}setTimeout(step,16/3);};step();}
  async function hit(t){if(s.busy||!t)return;s.busy=true;t.hit=now;burst(t.x,t.y,t.ok?40:10);if(t.ok){await praise();r++;if(r>=4)return levelDone(1);setup();}else{sfx.no();tries++;await say(tries>1?R[r].h:'no1');s.busy=false;}}
  say('l1i').then(setup);return s;};
// ===== Уровень 2: рыбалка =====
SCENES.l2=()=>{const R=[{k:'l2q1',h:'l2h1',n:8,d:2,ans:4},{k:'l2q2',h:'l2h2',n:8,d:4,ans:2},{k:'l2q3',h:'l2h3',n:10,d:2,ans:5},{k:'l2q4',h:'l2h4',n:16,d:4,ans:4}];
  const COL=['#ff7a3d','#ffd23f','#4fd1ff','#ff5fa2','#8be04f','#b07dff'];let r=0,F=[],net=0,tries=0;const NET={x:1130,y:520};
  const s={busy:true,secret:{x:1210,y:300},info:()=>({r,net,ans:R[r]&&R[r].ans,fish:F.filter(f=>!f.c).map(f=>({x:f.x,y:f.y}))}),
    draw(){bg('l2',1);hud('2. Рыбалка');const q=R[Math.min(r,3)];qbox((x,y)=>{txt('Поймай',x-170,y,40,'#3a2410');frac(1,q.d,x-50,y,40,'#ff6a00');txt('от '+q.n+' рыбок',x+120,y,40,'#3a2410');},560);
      cx.fillStyle='rgba(20,90,170,.35)';cx.fillRect(0,330,W,390);for(let i=0;i<6;i++){cx.strokeStyle='rgba(255,255,255,.3)';cx.lineWidth=3;cx.beginPath();for(let x=0;x<W;x+=20)cx.lineTo(x,340+i*60+Math.sin(x*.02+now*2+i)*6);cx.stroke();}
      for(const f of F){if(f.c)continue;f.x+=f.vx*dt;if(f.x<60||f.x>980)f.vx*=-1;f.y=f.by+Math.sin(now*2+f.p)*14;fish(f.x,f.y,1.1,f.col,f.vx<0,now+f.p);}
      hero('fox',1040,330,180,{tilt:-.1,talk:SUB&&SUB.who==='fox'});hero('owl',90,330,150,{talk:SUB&&SUB.who==='owl',ph:1});
      // сачок/ведро
      if(!SP.net){rr(NET.x-90,NET.y-70,180,140,30,'rgba(255,255,255,.85)');}for(let i=0;i<net;i++)fish(NET.x-50+(i%4)*34,NET.y-18+Math.floor(i/4)*22,.4,i%4,false,now+i);spr('net',NET.x-10,NET.y-10,230,-.15);
      txt('в сачке: '+net,NET.x-10,NET.y-120,26,'#fff',FU,'center','#123',6);},
    down(p){if(secretTap(p,2)||s.busy)return;if(Math.abs(p.x-NET.x)<90&&Math.abs(p.y-NET.y)<70){if(net>0){net--;const f=F.find(f=>f.c);f.c=0;f.x=500;sfx.pop();}return;}
      for(const f of F)if(!f.c&&Math.hypot(p.x-f.x,p.y-f.y)<55){f.c=1;net++;sfx.drop();burst(f.x,f.y,8,['#bfefff','#fff']);if(net>R[r].ans&&!s.warned){s.warned=1;say('l2more');}return;}},
    answer(){F.forEach(f=>{f.c=0});net=0;for(let i=0;i<R[r].ans;i++){F[i].c=1;net++;}check();},wrong(){F.forEach(f=>f.c=0);net=0;F[0].c=1;net=1;check();}};
  function setup(){const q=R[r];net=0;tries=0;s.warned=0;F=Array.from({length:q.n},(_,i)=>({x:100+Math.random()*840,by:390+(i%5)*40,vx:(40+Math.random()*60)*(Math.random()<.5?-1:1),p:i*1.3,col:i%4,c:0}));
    s.busy=true;say(q.k).then(()=>s.busy=false);}
  async function check(){if(s.busy)return;s.busy=true;if(net===R[r].ans){burst(NET.x,NET.y,40);await praise();r++;if(r>=4)return levelDone(2);setup();}else{sfx.no();tries++;await say(tries>1?R[r].h:'no1');s.busy=false;}}
  btn('done',40,500,240,76,'Готово',()=>check(),{fs:34,c1:'#7fe07f',c2:'#2ea84a'});say('l2i').then(setup);return s;};
// ===== Уровень 3: тележка =====
SCENES.l3=()=>{const R=[{k:'l3q1',h:'l3h1',q:[2,'от 6'],o:[['n',2],['n',3],['n',4]],ok:1},{k:'l3q2',h:'l3h2',q:[4,'от 8'],o:[['n',2],['n',4],['n',6]],ok:0},
  {k:'l3q3',h:'l3h3',q:[4,'pic'],o:[['bar',2,1],['bar',4,3],['bar',4,1]],ok:2},{k:'l3q4',h:'l3h4',q:[4,'от 20'],o:[['n',4],['n',10],['n',5]],ok:2}];
  const FK={x:560,y:470},ENDS=[[1150,250],[1150,450],[1150,650]];let r=0,cart={x:-80,y:470,path:null,t:0,mode:'in'},tries=0;
  const s={busy:true,secret:{x:300,y:250},info:()=>({r,mode:cart.mode}),
    draw(){bg('l3',1);hud('3. Тележка');const q=R[Math.min(r,3)];qbox((x,y)=>{if(q.q[1]==='pic'){txt('Где закрашена',x-60,y,38,'#3a2410');frac(1,4,x+150,y,38,'#ff6a00');}else{txt('Сколько это:',x-130,y,38,'#3a2410');frac(1,q.q[0],x+40,y,38,'#ff6a00');txt(q.q[1],x+130,y,38,'#3a2410');}},560);
      // рельсы
      const rail=(pts,hl)=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],an=Math.atan2(b[1]-a[1],b[0]-a[0]);cx.save();cx.translate(a[0],a[1]);cx.rotate(an);const tg=cx.createLinearGradient(0,-14,0,14);tg.addColorStop(0,'#9a6a3a');tg.addColorStop(1,'#4a2a10');cx.fillStyle=tg;cx.fillRect(-5,-16,10,32);cx.restore();}
        const path=()=>{cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));};if(hl){cx.save();cx.shadowColor='#ffe14d';cx.shadowBlur=24;path();cx.strokeStyle='rgba(255,225,77,.8)';cx.lineWidth=26;cx.stroke();cx.restore();}
        for(const off of[-9,9]){cx.save();cx.translate(0,off);path();cx.strokeStyle='#3a3a44';cx.lineWidth=6;cx.stroke();cx.strokeStyle='#d8dae6';cx.lineWidth=2.5;cx.translate(0,-1.5);path();cx.stroke();cx.restore();}};
      rail([[0,FK.y],[FK.x,FK.y]]);ENDS.forEach((e,i)=>rail(pathPts(i),s.sel===i));
      ENDS.forEach((e,i)=>{const o=q.o[i];cx.save();cx.translate(e[0],e[1]-70);cx.save();cx.shadowColor='rgba(0,0,0,.5)';cx.shadowBlur=16;cx.shadowOffsetY=8;const wg=cx.createLinearGradient(0,-56,0,56);wg.addColorStop(0,'#c98a4a');wg.addColorStop(1,'#7a4318');rr(-88,-56,176,112,18,wg);cx.restore();rr(-76,-46,152,92,12,'#fff3d6');cx.strokeStyle='#5a2a08';cx.lineWidth=3;cx.stroke();for(const sx of[-78,78]){cx.fillStyle='#d8d0c0';cx.beginPath();cx.arc(sx,-46,5,0,7);cx.arc(sx,46,5,0,7);cx.fill();}
        if(o[0]==='n')txt(String(o[1]),0,4,64,'#c03a10',FU);else bar(-64,-24,128,48,o[1],o[2]);cx.restore();
        const tn=cx.createRadialGradient(e[0]+90,e[1]-10,5,e[0]+90,e[1]-10,70);tn.addColorStop(0,'rgba(10,5,0,.9)');tn.addColorStop(1,'rgba(10,5,0,0)');cx.fillStyle=tn;cx.beginPath();cx.arc(e[0]+90,e[1]-10,70,0,7);cx.fill();});
      // вагонетка
      let p=cart.path==null?{x:cart.x,y:cart.y}:along(cart.path,cart.t);cx.save();cx.translate(p.x,p.y-40);cx.rotate(Math.sin(now*20)*.02);hero('fox',0,-2,110,{talk:SUB&&SUB.who==='fox'});
      if(!spr('cart',0,14,160)){rr(-60,-30,120,60,10,'#8a4a1a');}cx.restore();
      hero('hog',140,700,150,{talk:SUB&&SUB.who==='hog',ph:2});hero('owl',380,330,110,{talk:SUB&&SUB.who==='owl',ph:1});
      // движение
      if(cart.mode==='in'){cart.x=Math.min(FK.x,cart.x+260*dt);if(cart.x>=FK.x&&s.wait===undefined){s.wait=1;}}
      else if(cart.mode==='go'){cart.t=Math.min(1,cart.t+dt*.7);}else if(cart.mode==='back'){cart.t=Math.max(0,cart.t-dt*.9);}},
    down(p){if(secretTap(p,3)||s.busy)return;ENDS.forEach((e,i)=>{if(Math.hypot(p.x-e[0],p.y-(e[1]-70))<100||distPath(i,p)<40)pick(i);});},
    answer(){pick(R[r].ok);},wrong(){pick((R[r].ok+1)%3);}};
  function pathPts(i){const e=ENDS[i],pts=[];for(let k=0;k<=20;k++){const t=k/20;pts.push([FK.x+(e[0]-FK.x)*t,FK.y+(e[1]-FK.y)*(3*t*t-2*t*t*t)]);}return pts;}
  function along(i,t){const e=ENDS[i];return{x:FK.x+(e[0]-FK.x)*t*.85,y:FK.y+(e[1]-FK.y)*(3*(t*.85)**2-2*(t*.85)**3)};}
  function distPath(i,p){return Math.min(...pathPts(i).map(q=>Math.hypot(q[0]-p.x,q[1]-p.y)));}
  async function pick(i){if(s.busy)return;s.busy=true;s.sel=i;sfx.pop();cart.path=i;cart.t=0;cart.mode='go';await wait(1.3);
    if(i===R[r].ok){await praise();r++;if(r>=4)return levelDone(3);cart={x:-80,y:FK.y,path:null,t:0,mode:'in'};s.sel=undefined;setup();}
    else{sfx.no();burst(ENDS[i][0]-100,ENDS[i][1]-40,12,['#aaa','#ffcf6a']);tries++;await say('l3bump');cart.mode='back';await wait(1.2);cart.path=null;cart.x=FK.x;cart.y=FK.y;cart.mode='wait';s.sel=undefined;await say(tries>1?R[r].h:'no1');s.busy=false;}}
  function setup(){tries=0;s.busy=true;say(R[r].k).then(()=>s.busy=false);}
  say('l3i').then(setup);return s;};
// ===== Уровень 4: зелья =====
SCENES.l4=()=>{const R=[{k:'l4q1',h:'l4h1',n:1,d:2,ans:4,c:'#ff4fa0'},{k:'l4q2',h:'l4h2',n:1,d:4,ans:2,c:'#4fd1ff'},{k:'l4q3',h:'l4h3',n:3,d:4,ans:6,c:'#8be04f'},{k:'l4q4',h:'l4h1',n:1,d:2,ans:4,c:'#ffb02e'}];
  const FL={x:640,y:380,w:200,h:220};let r=0,drops=0,shown=0,tries=0,fall=[];
  const s={busy:true,secret:{x:1200,y:200},info:()=>({r,drops,ans:R[r]&&R[r].ans}),
    draw(){bg('l4',1);hud('4. Зелья');const q=R[Math.min(r,3)];qbox((x,y)=>{txt('Наполни колбу на',x-80,y,38,'#3a2410');frac(q.n,q.d,x+150,y,40,'#ff6a00');},520);
      hero('owl',170,480,180,{talk:SUB&&SUB.who==='owl'});hero('fox',1120,480,180,{ph:1,talk:SUB&&SUB.who==='fox'});
      shown+=(drops-shown)*Math.min(1,dt*6);const lv=shown/8;
      // колба: прямой цилиндр — равные части по высоте
      const {x,y,w,h}=FL;cx.save();rr(x-w/2,y,w,h,24,'rgba(255,255,255,.25)');cx.clip();const ly=y+h-h*lv;const g=cx.createLinearGradient(0,ly,0,y+h);g.addColorStop(0,q.c);g.addColorStop(1,'#2a0d40');cx.fillStyle=g;cx.fillRect(x-w/2,ly+Math.sin(now*3)*2,w,h);
      for(let i=0;i<5;i++){cx.fillStyle='rgba(255,255,255,.5)';cx.beginPath();cx.arc(x-60+i*30,y+h-((now*40+i*50)%(h*Math.max(lv,.01))),4,0,7);cx.fill();}cx.restore();
      cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=6;rr(x-w/2,y,w,h,24);cx.stroke();const gl=cx.createLinearGradient(x-w/2,0,x+w/2,0);gl.addColorStop(0,'rgba(255,255,255,.35)');gl.addColorStop(.18,'rgba(255,255,255,.05)');gl.addColorStop(.8,'rgba(255,255,255,0)');gl.addColorStop(1,'rgba(255,255,255,.3)');rr(x-w/2,y,w,h,24,gl);
      rr(x-w/2+16,y+14,14,h-40,7,'rgba(255,255,255,.45)');const rim=cx.createLinearGradient(0,y-20,0,y+4);rim.addColorStop(0,'#fff');rim.addColorStop(1,'#b8c8e0');rr(x-w/2-14,y-20,w+28,24,10,rim);
      spr('flask',370,560,110);spr('flask',975,610,80,0,true);
      for(let i=1;i<4;i++){const yy=y+h-h*i/4;cx.strokeStyle='#fff';cx.lineWidth=4;cx.setLineDash([12,8]);cx.beginPath();cx.moveTo(x-w/2,yy);cx.lineTo(x+w/2,yy);cx.stroke();cx.setLineDash([]);}
      // пипетка
      const px=x,py=y-110;const pg2=cx.createLinearGradient(px-20,0,px+20,0);pg2.addColorStop(0,'#b0160f');pg2.addColorStop(.4,'#ff8a7a');pg2.addColorStop(1,'#b0160f');rr(px-20,py-60,40,80,16,pg2);cx.fillStyle='rgba(255,255,255,.8)';cx.beginPath();cx.moveTo(px-12,py+20);cx.lineTo(px+12,py+20);cx.lineTo(px,py+60);cx.fill();txt('капать ▸',px-80,py-20,24,'#fff',FU,'right','#2a0d40',6);
      for(let i=fall.length-1;i>=0;i--){const d=fall[i];d.y+=600*dt;if(d.y>ly){fall.splice(i,1);continue;}cx.fillStyle=q.c;cx.beginPath();cx.arc(px,d.y,9,0,7);cx.fill();}
      txt('капель:',x+w/2+90,y+h-60,28,'#fff',FU,'center','#2a0d40',6);txt(drops+' из 8',x+w/2+90,y+h-22,34,'#fff',FU,'center','#2a0d40',6);},
    down(p){if(secretTap(p,4)||s.busy)return;if(Math.abs(p.x-FL.x)<80&&p.y>FL.y-190&&p.y<FL.y)drip();},
    answer(){drops=R[r].ans;shown=drops;check();},wrong(){drops=R[r].ans+1;check();}};
  function drip(){if(drops>=8)return;drops++;fall.push({y:FL.y-50});sfx.drop();if(drops>R[r].ans&&!s.warned){s.warned=1;say('l4more');}}
  async function check(){if(s.busy)return;s.busy=true;if(drops===R[r].ans){burst(FL.x,FL.y+100,40);await praise();r++;if(r>=4)return levelDone(4);setup();}else{sfx.no();tries++;await say(tries>1?R[r].h:'no1');s.busy=false;}}
  function setup(){drops=0;shown=0;tries=0;s.warned=0;s.busy=true;say(R[r].k).then(()=>s.busy=false);}
  btn('done',W-280,500,240,76,'Готово',()=>check(),{fs:34,c1:'#7fe07f',c2:'#2ea84a'});btn('pour',40,500,230,76,'Вылить',()=>{if(!s.busy){drops=0;s.warned=0;}},{fs:32,c1:'#7fd4ff',c2:'#2e6fd0'});
  say('l4i').then(setup);return s;};
// ===== Уровень 5: ракета и босс =====
SCENES.l5=()=>{const R=[{k:'l5q1',h:'l5h1',d:2,n:10,ans:5,o:[4,5,8]},{k:'l5q2',h:'l5h2',d:4,n:16,ans:4,o:[4,8,12]},{k:'l5q3',h:'l5h3',d:4,n:12,ans:3,o:[3,6,4]}];
  let r=0,rk={x:220,y:400,tx:220,ty:400,inv:0},ast=[],stars=[],boss={x:1100,y:360,hp:3,hit:0},tries=0,spawn=0,wave=0;
  const s={busy:true,info:()=>({r,hp:boss.hp,stars:stars.map(t=>({x:t.x,y:t.y,v:t.v,ok:t.v===R[r]?.ans}))}),
    draw(){bg('l5',1);hud('5. Ракета');const q=R[Math.min(r,2)];qbox((x,y)=>{txt('Лови звезду:',x-120,y,38,'#3a2410');frac(1,q.d,x+40,y,38,'#ff6a00');txt('от '+q.n,x+130,y,38,'#3a2410');},520);
      // звёзды-фон
      for(let i=0;i<60;i++){const x=(i*211-now*(40+i%3*60))%W;cx.fillStyle='rgba(255,255,255,'+(.3+i%3*.25)+')';cx.fillRect((x+W)%W,(i*97)%H,2+i%3,2+i%3);}
      if(!s.busy||s.fly){spawn-=dt;if(spawn<0){spawn=1.1;ast.push({x:W+60,y:240+Math.random()*440,v:220+Math.random()*120,r:26+Math.random()*24,a:0});}
        if(!stars.length&&!s.busy){wave++;const o=q.o.slice().sort(()=>Math.random()-.5);o.forEach((v,i)=>stars.push({x:W+80+i*40,y:280+i*150,v,vx:150}));}}
      rk.x+=(rk.tx-rk.x)*Math.min(1,dt*8);rk.y+=(rk.ty-rk.y)*Math.min(1,dt*8);rk.inv-=dt;
      for(let i=ast.length-1;i>=0;i--){const a=ast[i];a.x-=a.v*dt;a.a+=dt;if(a.x<-80){ast.splice(i,1);continue;}cx.save();cx.translate(a.x,a.y);cx.rotate(Math.sin(a.a)*.4);if(!spr('asteroid',0,0,a.r*2.4)){cx.fillStyle='#7a6a5a';cx.beginPath();cx.arc(0,0,a.r,0,7);cx.fill();}cx.restore();
        if(rk.inv<0&&Math.hypot(a.x-rk.x,a.y-rk.y)<a.r+40){rk.inv=1.5;sfx.no();ast.splice(i,1);burst(rk.x,rk.y,10,['#aaa','#ff9f1c']);if(!s.bonked){s.bonked=1;say('l5bonk');}}}
      for(let i=stars.length-1;i>=0;i--){const t=stars[i];t.x-=t.vx*dt;if(t.x<-60){stars.splice(i,1);continue;}star(t.x,t.y,58);txt(String(t.v),t.x,t.y+10,46,'#fff',FU,'center','#7a3300',8);
        if(!s.busy&&Math.hypot(t.x-rk.x,t.y-rk.y)<75){catchStar(t);break;}}
      // босс
      const bh=boss.hit&&now-boss.hit<.6;cx.save();cx.translate(boss.x+Math.sin(now*1.3)*20,boss.y+Math.sin(now*2)*30);if(bh)cx.rotate(Math.sin(now*40)*.2);
      for(let i=0;i<3;i++){cx.strokeStyle='#ddd';cx.lineWidth=2;cx.beginPath();cx.moveTo(-40+i*40,-150);cx.lineTo(0,-30);cx.stroke();const bc=['#ff4d6d','#ffd23f','#3fb8ff'][i],bg2=cx.createRadialGradient(-50+i*40,-192,3,-40+i*40,-180,34);bg2.addColorStop(0,'#fff');bg2.addColorStop(.25,bc);bg2.addColorStop(1,'#3a1a40');cx.fillStyle=bg2;cx.beginPath();cx.ellipse(-40+i*40,-180,26,32,0,0,7);cx.fill();}
      hero('villain',0,120,200,{});quarter(-70,40,30,3);cx.restore();for(let i=0;i<3;i++){cx.globalAlpha=i<boss.hp?1:.25;heart(1040+i*48,240,20);}cx.globalAlpha=1;
      // ракета
      cx.save();cx.translate(rk.x,rk.y);cx.globalAlpha=rk.inv>0&&Math.sin(now*30)>0?.4:1;const fl=1+Math.random()*.3;cx.save();cx.translate(-108,6);cx.scale(fl,1);const fg=cx.createRadialGradient(-10,0,2,-10,0,40);fg.addColorStop(0,'rgba(255,255,220,.9)');fg.addColorStop(.5,'rgba(255,160,40,.6)');fg.addColorStop(1,'rgba(255,80,0,0)');cx.fillStyle=fg;cx.beginPath();cx.ellipse(-14,0,44,20,0,0,7);cx.fill();cx.restore();
      hero('fox',-6,-22,90,{});if(!spr('rocket',0,6,230,Math.sin(now*3)*.04)){cx.fillStyle='#e8322f';cx.fillRect(-70,-30,140,60);}cx.restore();
      hero('hog',70,720,110,{ph:2,talk:SUB&&SUB.who==='hog'});},
    down(p){unlock();rk.tx=Math.min(760,Math.max(80,p.x));rk.ty=Math.min(680,Math.max(240,p.y));},move(p){if(P.down){rk.tx=Math.min(760,Math.max(80,p.x));rk.ty=Math.min(680,Math.max(240,p.y));}},
    answer(){const t=stars.find(t=>t.v===R[r].ans)||{v:R[r].ans,x:600,y:400};catchStar(t);},wrong(){catchStar({v:R[r].o.find(v=>v!==R[r].ans),x:600,y:400});}};
  function star(x,y,rad){cx.save();cx.shadowColor='rgba(255,220,80,.9)';cx.shadowBlur=24;if(spr('star',x,y,rad*2.3,Math.sin(now*3)*.12)){cx.restore();return;}cx.translate(x,y);cx.rotate(Math.sin(now*3)*.15);cx.fillStyle='#ffe14d';cx.strokeStyle='#ff9f1c';cx.lineWidth=5;cx.beginPath();for(let k=0;k<10;k++){const rr2=k%2?rad*.5:rad;cx.lineTo(Math.cos(k*Math.PI/5-Math.PI/2)*rr2,Math.sin(k*Math.PI/5-Math.PI/2)*rr2);}cx.closePath();cx.fill();cx.stroke();cx.restore();}
  async function catchStar(t){if(s.busy)return;s.busy=true;stars.length=0;if(t.v===R[r].ans){burst(t.x,t.y,30);boss.hp--;boss.hit=now;sfx.ok();await say('l5hit');await praise();r++;if(r>=3)return levelDone(5);setup();}
    else{sfx.no();burst(t.x,t.y,10,['#aaa']);tries++;await say(tries>1?R[r].h:'no1');s.busy=false;}}
  function setup(){tries=0;s.busy=true;say(R[r].k).then(()=>s.busy=false);}
  sayAll(['l5i','l5v']).then(setup);return s;};
// ===== Тайные комнаты =====
SCENES.secret=lv=>{const T={1:{k:'s1',o:[['cut',[0,.5,1]],['cut',[0,.3,1]],['cut',[0,.68,1]]],ok:0},2:{k:'s2',o:[['n',2],['n',3],['n',4]],ok:1,shells:6},3:{k:'s3',o:[['bar',[0,.15,.45,.7,1]],['bar',[0,.25,.5,.75,1]],['bar',[0,1/3,2/3,1]]],ok:1},4:{k:'s4',o:[['n',2],['n',3],['n',4]],ok:2,pie:1}}[lv];
  const order=[0,1,2].sort(()=>Math.random()-.5);let done=false;const XS=[340,640,940];
  const s={busy:true,info:()=>({lv,okX:XS[order.indexOf(T.ok)]}),draw(){bg('secret',1);rainbow('Тайная комната',W/2,70,70);hero('owl',130,690,200,{talk:SUB&&SUB.who==='owl'});hero('hog',1160,690,200,{ph:2,cheer:done});
    if(T.shells)for(let i=0;i<6;i++){if(!ico('shell',420+i*88,190,74))txt('🐚',420+i*88,190,54,'#fff');}if(T.pie)pie(W/2,200,70,4,4,'#ffc72c');
    order.forEach((oi,i)=>{const o=T.o[oi],x=XS[i],y=420;cx.save();cx.translate(x,y);rr(-120,-110,240,220,30,'rgba(255,253,244,.95)');cx.strokeStyle=done&&oi===T.ok?'#5ee06a':'#c27aff';cx.lineWidth=8;cx.stroke();
      if(o[0]==='n')txt(String(o[1]),0,6,100,'#7a3fc0',FU);else if(o[0]==='bar')bar(-100,-30,200,60,o[1].length-1,0,'#ffb02e',o[1]);
      else cutApple(0,6,78,o[1][1]);cx.restore();});},
    down(p){if(s.busy)return;order.forEach((oi,i)=>{if(Math.abs(p.x-XS[i])<120&&Math.abs(p.y-420)<110)pick(oi);});},answer(){pick(T.ok)},wrong(){pick((T.ok+1)%3)}};
  async function pick(oi){if(s.busy)return;s.busy=true;if(oi===T.ok){done=true;sfx.ok();burst(W/2,300,50);if(!S.secret[lv-1]){S.secret[lv-1]=1;S.stars++;save();}await say('sok');await wait(.5);pop();}else{sfx.no();await say('sno');s.busy=false;}}
  say(T.k).then(()=>s.busy=false);return s;};
// ===== Финал =====
SCENES.finale=()=>{let k=0;const s={busy:true,draw(){bg('finale',1);const c=SUB&&SUB.who;
    for(let i=0;i<4;i++){const e=Math.min(1,Math.max(0,(now-s.t0-1)/2));const a=i*1.57+now*.5*(1-e);const R=180*(1-e);quarter(W/2+Math.cos(a)*R,250+Math.sin(a)*R,90,i);}
    if(now-s.t0>3)rainbow('4 четверти = целое яблоко!',W/2,440,46);
    hero('fox',260,700,260,{cheer:c==='fox'||k>3,talk:c==='fox'});hero('owl',470,700,200,{talk:c==='owl',ph:1});hero('hog',820,700,250,{talk:c==='hog',ph:2,cheer:k>3});hero('villain',1080,700,240,{talk:c==='villain',tilt:Math.sin(now*2)*.05});
    if(k>4){if(Math.random()<.1)burst(Math.random()*W,0,6);rr(W/2-230,500,460,70,35,'rgba(40,20,0,.5)');txt('Бонусные звёзды: '+S.stars+' из 4',W/2,536,30,'#ffe14d');}}};
  (async()=>{await wait(1);for(const l of ['f1','f2','f3','f4','f5']){k++;await say(l);if(scene!==s)return;}k=5;burst(W/2,250,80);s.busy=false;btn('again',W/2-160,600,320,80,'Играть снова',()=>{S.got=[0,0,0,0,0];S.open=1;save();go('title')},{fs:32,pulse:1});btn('map',W-230,620,200,64,'Карта',()=>go('map'),{fs:26,c1:'#9be15d',c2:'#3aa63a'});})();return s;};
go(new URLSearchParams(location.search).get('scene')||'title');requestAnimationFrame(frame);

function heart(x,y,r){cx.save();cx.translate(x,y);const g=cx.createRadialGradient(-r*.4,-r*.5,2,0,0,r*1.4);g.addColorStop(0,'#ffd0dc');g.addColorStop(.35,'#ff4d6d');g.addColorStop(1,'#a0102a');cx.fillStyle=g;cx.shadowColor='rgba(0,0,0,.35)';cx.shadowBlur=6;cx.shadowOffsetY=3;
  cx.beginPath();cx.moveTo(0,r*.9);cx.bezierCurveTo(-r*1.6,-r*.1,-r*.7,-r*1.3,0,-r*.45);cx.bezierCurveTo(r*.7,-r*1.3,r*1.6,-r*.1,0,r*.9);cx.fill();cx.restore();}
function apple(x,y,r,col,gold){if(spr(gold?'apple_gold':'apple',x,y-r*.15,r*2.3))return;cx.fillStyle=gold?'#ffc72c':'#e8322f';cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();}
// рыба: спрайт (4 цвета), виляет хвостом через сжатие
function fish(x,y,s,col,flip,t){const n=['fish_a','fish_b','fish_c','fish_d'][typeof col==='number'?col%4:Math.abs(String(col).charCodeAt(2)||0)%4];
  cx.save();cx.shadowColor='rgba(0,30,60,.35)';cx.shadowBlur=10;cx.shadowOffsetY=8;if(!spr(n,x,y,120*s,Math.sin(t*3)*.06,flip,1+Math.sin(t*10)*.04)){cx.fillStyle='#ff7a3d';cx.beginPath();cx.ellipse(x,y,34*s,20*s,0,0,7);cx.fill();}cx.restore();}
// четвертинка золотого яблока: ТОЧНЫЙ сектор 90° (i-й), мякоть кремовая, кожура — кольцо из спрайта, линии разреза
function quarter(x,y,r,i){const a0=-Math.PI/2+i*Math.PI/2,a1=a0+Math.PI/2;cx.save();cx.translate(x,y);
  cx.shadowColor='rgba(0,0,0,.35)';cx.shadowBlur=10;cx.shadowOffsetY=5;cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,r,a0,a1);cx.closePath();const fg=cx.createRadialGradient(0,0,2,0,0,r);fg.addColorStop(0,'#fffbe8');fg.addColorStop(1,'#f5e2a8');cx.fillStyle=fg;cx.fill();cx.shadowColor='transparent';
  cx.save();cx.clip();cx.beginPath();cx.arc(0,0,r,0,7);cx.arc(0,0,r*.84,0,7,true);cx.clip();const im=SP.apple_gold;if(im)cx.drawImage(im,-r*1.15,-r*1.2,r*2.3,r*2.3*im.height/im.width);else{cx.fillStyle='#e0a010';cx.fillRect(-r,-r,2*r,2*r);}cx.restore();
  const am=(a0+a1)/2;cx.fillStyle='#5a3310';cx.beginPath();cx.ellipse(Math.cos(am)*r*.3,Math.sin(am)*r*.3,r*.07,r*.12,am,0,7);cx.fill();
  cx.strokeStyle='#8a5a10';cx.lineWidth=Math.max(2,r*.06);cx.beginPath();cx.moveTo(Math.cos(a0)*r,Math.sin(a0)*r);cx.lineTo(0,0);cx.lineTo(Math.cos(a1)*r,Math.sin(a1)*r);cx.stroke();cx.restore();}
// круг-доля для мишеней: ТОЧНЫЕ равные секторы; закрашенные — яблочная кожура с бликом, незакрашенные — кремовая мякоть
function pie(x,y,r,parts,shaded,col='#ff5a4e',cuts){cx.save();const A=cuts||Array.from({length:parts+1},(_,i)=>i/parts);
  const fg=cx.createRadialGradient(x,y,2,x,y,r);fg.addColorStop(0,'#fffbe8');fg.addColorStop(1,'#f3dca0');cx.beginPath();cx.arc(x,y,r,0,7);cx.fillStyle=fg;cx.fill();
  for(let i=0;i<shaded;i++){cx.beginPath();cx.moveTo(x,y);cx.arc(x,y,r,-Math.PI/2+A[i]*Math.PI*2,-Math.PI/2+A[i+1]*Math.PI*2);cx.closePath();const g=cx.createRadialGradient(x-r*.4,y-r*.4,2,x,y,r*1.1);g.addColorStop(0,col==='#ffc72c'?'#fff3a0':'#ff9a8a');g.addColorStop(1,col==='#ffc72c'?'#c08000':'#b0160f');cx.fillStyle=g;cx.fill();}
  cx.strokeStyle='#5a2a10';cx.lineWidth=Math.max(3,r/14);cx.lineCap='round';for(let i=0;i<A.length-1;i++){const a=-Math.PI/2+A[i]*Math.PI*2;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);cx.stroke();}
  cx.beginPath();cx.arc(x,y,r,0,7);cx.stroke();cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=3;cx.beginPath();cx.arc(x,y,r-5,3.7,4.9);cx.stroke();cx.restore();}

// яблоко, разрезанное вертикально в точке cut (0..1 по ширине круга): две части раздвинуты, срез — кремовый
function cutApple(x,y,r,cut){const xc=x-r+cut*2*r;for(const side of[-1,1]){cx.save();cx.translate(side*7,0);cx.beginPath();if(side<0)cx.rect(x-r-2,y-r-40,xc-(x-r-2),2*r+80);else cx.rect(xc,y-r-40,x+r+2-xc,2*r+80);cx.clip();
  cx.beginPath();cx.arc(x,y,r,0,7);cx.save();cx.clip();const im=SP.apple;if(im)cx.drawImage(im,x-r*1.12,y-r*1.25,r*2.24,r*2.24*im.height/im.width);else{cx.fillStyle='#e8322f';cx.fill();}cx.restore();
  const half=Math.sqrt(Math.max(0,r*r-(xc-x)**2));const fg=cx.createLinearGradient(xc-10*side,0,xc,0);fg.addColorStop(0,'rgba(255,248,220,0)');fg.addColorStop(1,'#fff3cf');cx.fillStyle=fg;cx.fillRect(Math.min(xc,xc-12*side),y-half,12,2*half);
  cx.strokeStyle='#8a5a20';cx.lineWidth=3;cx.beginPath();cx.moveTo(xc,y-half);cx.lineTo(xc,y+half);cx.stroke();cx.restore();}}
