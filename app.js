
const KEY="pixelgotchi_pwa_mobile_v1";
const MAX=100;
const stages=["egg","baby","teen","adult"];
const stageNames={egg:"Trứng",baby:"Bé",teen:"Thiếu niên",adult:"Trưởng thành"};
// demo nhanh (phút)
const EVOLVE_AT_MINUTES={egg:0.5,baby:3,teen:8};

function load(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch{return null}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}

let state=load()||{bornAt:Date.now(),ageMinutes:0,stage:"egg",hunger:60,happy:70,clean:80,health:80,energy:70,sleeping:false,lightsOff:false,poops:0,lastTick:Date.now()};

// UI refs
const lcd=document.getElementById("lcd"); const ctx=lcd.getContext("2d");
const bars={hunger:$("#bar-hunger"),happy:$("#bar-happy"),clean:$("#bar-clean"),health:$("#bar-health"),energy:$("#bar-energy")};
const screen=$("#screen"), clockEl=$("#clock"), ageEl=$("#age"), stageEl=$("#stage"), poopsEl=$("#poops"), app=$(".app");
$("#btn-feed").onclick=onFeed; $("#btn-clean").onclick=onClean; $("#btn-med").onclick=onMedicate; $("#btn-lights").onclick=toggleLights; $("#btn-sleep").onclick=toggleSleep; $("#btn-play").onclick=onPlay; $("#btn-reset").onclick=()=>{localStorage.removeItem(KEY);location.reload()};
function $(s){return document.querySelector(s)}

// Drawing helpers
function clearLCD(c="#9fbfb0"){ctx.fillStyle=c;ctx.fillRect(0,0,32,32)}
function px(x,y,c="#243c5a"){ctx.fillStyle=c;ctx.fillRect(x,y,1,1)}
function drawPetBase(x,y,w,h){for(let j=0;j<h;j++){for(let i=0;i<w;i++)px(x+i,y+j)} px(x+1,y+h);px(x+w-2,y+h)}
function face(cx,cy,adult=false){px(cx-2,cy);px(cx+2,cy);adult?px(cx,cy+2):px(cx,cy+1)}
function ear(x,y){px(x,y);px(x,y+1)} function tail(x,y){px(x,y);px(x+1,y);px(x+1,y+1)}
const Sprites={
  egg:[(t)=>{for(let y=6;y<26;y++){for(let x=10;x<22;x++){const e=Math.pow((x-16)/6,2)+Math.pow((y-16)/10,2)<=1;if(e)px(x,y)}}px(13,10,"#1e293b");px(14,9,"#1e293b");px(12,11,"#1e293b")},
       (t)=>{for(let y=6;y<26;y++){for(let x=10;x<22;x++){const e=Math.pow((x-16)/6,2)+Math.pow((y-16)/10,2)<=1;if(e)px(x,y)}}for(let i=0;i<8;i++)px(15+i%2,14+i,"#0f172a")}],
  baby:[(t)=>{drawPetBase(14,14,6,6);face(16,16);tail(22,18)},(t)=>{drawPetBase(14,13,6,6);face(16,15);tail(22,17)}],
  teen:[(t)=>{drawPetBase(13,13,7,7);ear(12,11);ear(23,11);face(16,16);tail(24,18)},(t)=>{drawPetBase(13,12,7,7);ear(12,10);ear(23,10);face(16,15);tail(24,17)}],
  adult:[(t)=>{drawPetBase(12,12,8,8);ear(11,10);ear(24,10);face(16,16,true);tail(26,18)},(t)=>{drawPetBase(12,11,8,8);ear(11,9);ear(24,9);face(16,15,true);tail(26,17)}],
  poop:(x,y)=>{["#1f2937","#0f172a"].forEach((c)=>{px(x+0,y+3,c);px(x+1,y+3,c);px(x+2,y+3,c);px(x+1,y+2,c);px(x+2,y+2,c);px(x+2,y+1,c)})},
  zzz:()=>{px(24,6);px(25,5);px(26,6);}
};

function drawBars(){bars.hunger.style.width=state.hunger+"%";bars.happy.style.width=state.happy+"%";bars.clean.style.width=state.clean+"%";bars.health.style.width=state.health+"%";bars.energy.style.width=state.energy+"%"}
function syncTexts(){ageEl.textContent=Math.floor(state.ageMinutes/60/24);stageEl.textContent=stageNames[state.stage];poopsEl.textContent=state.poops}
function updateClock(){const d=new Date();clockEl.textContent=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}

function evolveIfNeeded(){const m=state.ageMinutes; if(state.stage==="egg"&&m>=EVOLVE_AT_MINUTES.egg)state.stage="baby"; else if(state.stage==="baby"&&m>=EVOLVE_AT_MINUTES.baby)state.stage="teen"; else if(state.stage==="teen"&&m>=EVOLVE_AT_MINUTES.teen)state.stage="adult";}

function tick(){
  const dt=(Date.now()-state.lastTick)/1000; state.lastTick=Date.now();
  const awake=!state.sleeping;
  const decay=awake?0.6:0.2;
  state.hunger=clamp(state.hunger-decay,0,MAX);
  state.clean=clamp(state.clean-(state.poops>0?0.9:0.3),0,MAX);
  state.energy=clamp(state.energy+(state.sleeping?1.2:-0.6),0,MAX);
  state.happy=clamp(state.happy-(state.poops>0?0.6:0.3)+(state.sleeping?0.2:0),0,MAX);
  const healthDelta=(state.clean>60)+(state.hunger>40)+(state.energy>40)-2;
  state.health=clamp(state.health+healthDelta*0.5-(state.poops>1?0.5:0),0,MAX);
  if(Math.random()<0.018+(state.hunger>70?0.02:0)){state.poops=Math.min(9,state.poops+1);buzz()}
  if(Math.random()<0.012&&(state.clean<30||state.hunger<20||state.energy<20)){state.health=Math.max(10,state.health-20);buzz()}
  state.ageMinutes+=dt/60; evolveIfNeeded();
  if(state.sleeping&&state.energy>95)state.sleeping=false;
  save(); drawBars();
}

function render(){
  clearLCD(state.lightsOff||state.sleeping?"#6c8076":"#9fbfb0");
  const frame=Math.floor(Date.now()/300)%2;
  (Sprites[state.stage][frame])(Date.now());
  for(let i=0;i<state.poops;i++) Sprites.poop(2+i*3,29);
  if(state.sleeping) Sprites.zzz();
  if(state.health<30||state.clean<30||state.hunger<20){app.classList.add("bad");setTimeout(()=>app.classList.remove("bad"),260)}
  syncTexts(); screen.classList.toggle("sleep",state.lightsOff||state.sleeping);
}

function onFeed(){state.hunger=clamp(state.hunger+25,0,MAX);state.happy=clamp(state.happy+5,0,MAX)}
function onClean(){if(state.poops>0){state.poops=0;state.clean=clamp(state.clean+30,0,MAX)}else{state.clean=clamp(state.clean+10,0,MAX)}}
function onMedicate(){if(state.health<85){state.health=clamp(state.health+25,0,MAX);state.happy=clamp(state.happy-5,0,MAX)}}
function toggleLights(){state.lightsOff=!state.lightsOff}
function toggleSleep(){state.sleeping=!state.sleeping}
function onPlay(){if(state.energy<10)return;state.happy=clamp(state.happy+12,0,MAX);state.energy=clamp(state.energy-8,0,MAX)}

function $(s){return document.querySelector(s)}
function buzz(){app.classList.add("bad");setTimeout(()=>app.classList.remove("bad"),260)}

setInterval(tick,1000); setInterval(render,150); setInterval(updateClock,1000);
drawBars(); render(); updateClock();
