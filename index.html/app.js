// ระยะการเจริญเติบโต: t = ระยะเวลา (วินาที) ของแต่ละระยะ — แต่ละพืชมีจำนวนระยะและเวลาต่างกัน
// เรียงตามราคาเมล็ด ตั้งแต่ 1 ถึง 200 💰 (ยิ่งแพง ยิ่งโตนาน ยิ่งขายได้แพง)
const S=(name,emoji,t)=>({name,emoji,t});
const crops = {
  kangkong:{name:"ผักบุ้ง",emoji:"🥬",seed:1,sell:3,stages:[S("เพาะเมล็ด","🌰",3),S("แตกยอด","🌱",5)]},
  cucumber:{name:"แตงกวา",emoji:"🥒",seed:2,sell:5,stages:[S("เพาะเมล็ด","🌰",3),S("งอก","🌱",4),S("เถาเลื้อย","🌿",3)]},
  chili:{name:"พริก",emoji:"🌶️",seed:5,sell:12,stages:[S("เพาะเมล็ด","🌰",4),S("งอก","🌱",5),S("ออกดอก","🌼",5)]},
  carrot:{name:"แครอท",emoji:"🥕",seed:10,sell:24,stages:[S("เพาะเมล็ด","🌰",3),S("งอกราก","🌱",5),S("แตกใบ","🌿",7)]},
  corn:{name:"ข้าวโพด",emoji:"🌽",seed:15,sell:36,stages:[S("เพาะเมล็ด","🌰",4),S("งอก","🌱",6),S("ต้นอ่อน","🌿",7),S("ออกดอก","🌾",8)]},
  tomato:{name:"มะเขือเทศ",emoji:"🍅",seed:20,sell:50,stages:[S("เพาะเมล็ด","🌰",5),S("งอก","🌱",8),S("ออกดอก","🌼",10),S("ผลดิบ","🍏",12)]},
  potato:{name:"มันฝรั่ง",emoji:"🥔",seed:25,sell:60,stages:[S("ลงหัวพันธุ์","🌰",6),S("งอก","🌱",10),S("แตกใบ","🌿",12),S("ลงหัว","🟤",14)]},
  pumpkin:{name:"ฟักทอง",emoji:"🎃",seed:30,sell:75,stages:[S("เพาะเมล็ด","🌰",6),S("งอก","🌱",8),S("เถาเลื้อย","🌿",10),S("ออกดอก","🌼",12),S("ผลอ่อน","🟢",14)]},
  eggplant:{name:"มะเขือม่วง",emoji:"🍆",seed:45,sell:105,stages:[S("เพาะเมล็ด","🌰",8),S("งอก","🌱",12),S("ออกดอก","🌼",18),S("ผลอ่อน","🟣",22)]},
  mushroom:{name:"เห็ดหอม",emoji:"🍄",seed:60,sell:140,stages:[S("เส้นใย","⚪",10),S("ตุ่มดอก","🟤",22),S("ดอกอ่อน","🤎",38)]},
  broccoli:{name:"บรอกโคลี",emoji:"🥦",seed:80,sell:185,stages:[S("เพาะเมล็ด","🌰",10),S("งอก","🌱",15),S("แตกใบ","🌿",25),S("ก้อนดอกอ่อน","🟢",35)]},
  strawberry:{name:"สตรอว์เบอร์รี",emoji:"🍓",seed:100,sell:235,stages:[S("เพาะเมล็ด","🌰",10),S("งอก","🌱",15),S("ออกดอก","🌼",25),S("ผลเขียว","🟢",20),S("ผลกึ่งสุก","🟠",30)]},
  watermelon:{name:"แตงโม",emoji:"🍉",seed:120,sell:285,stages:[S("เพาะเมล็ด","🌰",12),S("งอก","🌱",18),S("เถาเลื้อย","🌿",25),S("ออกดอก","🌼",30),S("ผลอ่อน","🟢",35)]},
  pineapple:{name:"สับปะรด",emoji:"🍍",seed:150,sell:365,stages:[S("ปลูกหน่อ","🌰",15),S("แตกราก","🌱",20),S("แตกใบ","🌿",35),S("ออกดอก","🌼",35),S("ผลอ่อน","🟡",45)]},
  grape:{name:"องุ่น",emoji:"🍇",seed:175,sell:430,stages:[S("ปักชำ","🌰",15),S("แตกตา","🌱",20),S("เถาเลื้อย","🌿",30),S("ออกช่อดอก","🌼",40),S("ผลเขียว","🟢",65)]},
  goldapple:{name:"แอปเปิลทองคำ",emoji:"🍎",seed:200,sell:500,stages:[S("เพาะเมล็ด","🌰",15),S("งอก","🌱",20),S("ต้นอ่อน","🌿",30),S("ออกดอก","🌼",40),S("ผลเขียว","🟢",45),S("ผลเหลืองทอง","🟡",50)]}
};
function totalGrow(c){return c.stages.reduce((a,s)=>a+s.t*1000,0)}
// คำนวณระยะปัจจุบันของแปลงที่กำลังปลูก
function getStage(p){
  const c=crops[p.id], elapsed=Date.now()-p.plantedAt, total=totalGrow(c);
  let acc=0;
  for(let i=0;i<c.stages.length;i++){
    const s=c.stages[i], dur=s.t*1000;
    if(elapsed<acc+dur) return {ready:false,idx:i,count:c.stages.length,stage:s,stageRemain:acc+dur-elapsed,remain:total-elapsed,progress:elapsed/total};
    acc+=dur;
  }
  return {ready:true,idx:c.stages.length,count:c.stages.length,remain:0,progress:1};
}
// ธีมตกแต่งฟาร์ม: ของตกแต่งจะอยู่ "รอบๆ" แปลงผัก ไม่ได้ไปแทนที่แปลงปลูก
// top/bottom = 7 ชิ้น, side = 3 ชิ้น (ซ้าย-ขวา), fx = เอฟเฟกต์ลอยในฉาก
const themes = {
  meadow:{sound:"ลมอ่อนๆ และนกร้อง",name:"ทุ่งหญ้าสดใส",emoji:"🌳",price:0,desc:"ธีมเริ่มต้น ทุ่งหญ้าเขียวและดอกไม้",
    ground:["#c4ec96","#93d364"],edge:"#6fae45",soil:["#a8754a","#8d603e"],soilEdge:"#7a5738",
    top:["🌳","🌷","🌻","🐝","🌻","🌷","🌳"],side:["🌼","🐇","🌷"],bottom:["🌷","🌿","🐥","🌼","🐥","🌿","🌷"],fx:{e:"🦋",dir:"float"}},
  sakura:{sound:"พิณโคโตะ ระฆังลม",name:"สวนซากุระ",emoji:"🌸",price:80,desc:"สวนสไตล์ญี่ปุ่น โคมไฟ ประตูโทริอิ และกลีบซากุระร่วง",
    ground:["#ffe6ef","#f5b6ce"],edge:"#e58aa9",soil:["#9c6a58","#82503f"],soilEdge:"#6e4335",
    top:["🌸","🌺","🏮","🌸","🏮","🌺","🌸"],side:["🌸","🏮","🎋"],bottom:["🪷","🌸","🎏","🌸","⛩️","🌸","🪷"],fx:{e:"🌸",dir:"down"}},
  thai:{sound:"ระนาดไทย จิ้งหรีด เสียงน้ำ",name:"ฟาร์มไทยริมคลอง",emoji:"🛖",price:120,desc:"กระท่อมไทย ต้นมะพร้าว ควาย และบัวในคลอง",
    ground:["#dcf3a6","#a5d468"],edge:"#5f9e3e",soil:["#a5734a","#8a5b38"],soilEdge:"#734a2c",
    top:["🌴","🥥","🛖","🌾","🛖","🥥","🌴"],side:["🐃","🌾","🪷"],bottom:["🪷","🌾","🐟","🌾","🛶","🌾","🪷"],fx:{e:"🦋",dir:"float"}},
  beach:{sound:"คลื่นทะเล นกนางนวล",name:"ฟาร์มริมทะเล",emoji:"🏝️",price:150,desc:"ทรายขาว คลื่นทะเล ปูและปลาโลมา",
    ground:["#fff0bd","#f2d488"],edge:"#4fc3f7",soil:["#b98454","#9c6a40"],soilEdge:"#84562f",
    top:["🌴","🌊","🏖️","🌊","⛱️","🌊","🌴"],side:["🐚","🦀","🪸"],bottom:["🌊","🐠","🌊","⛵","🌊","🐬","🌊"],fx:{e:"🫧",dir:"up"}},
  winter:{sound:"ลมหนาว กล่องดนตรี",name:"ทุ่งหิมะ",emoji:"⛄",price:180,desc:"หิมะขาวโพลน ต้นสน มนุษย์หิมะ และภูเขาน้ำแข็ง",
    ground:["#f4faff","#cfe4f5"],edge:"#8fc1e3",soil:["#7d5c47","#634633"],soilEdge:"#4f382a",
    top:["🌲","⛄","🌲","🎿","🌲","⛄","🌲"],side:["❄️","🛷","🌲"],bottom:["🌲","🧊","⛷️","🧊","🏔️","🧊","🌲"],fx:{e:"❄️",dir:"down"}},
  autumn:{sound:"ใบไม้เสียดสี นกฮูก",name:"ฤดูใบไม้ร่วง",emoji:"🍂",price:200,desc:"ใบไม้สีทอง เห็ด กระรอก และเม่นน้อย",
    ground:["#ffdca4","#e8a458"],edge:"#c4741f",soil:["#94623a","#7a4d2b"],soilEdge:"#633d20",
    top:["🍁","🌰","🍂","🎃","🍂","🌰","🍁"],side:["🍄","🐿️","🍂"],bottom:["🍁","🍄","🌾","🦔","🌾","🍄","🍁"],fx:{e:"🍂",dir:"down"}},
  halloween:{sound:"ดนตรีหลอน ค้างคาว ฟ้าร้อง",name:"ฮาโลวีนสุดหลอน",emoji:"👻",price:250,desc:"ค้างคาว ผี หลุมศพ และฟักทองยิ้มแสยะ",
    ground:["#6a4a8c","#2f2046"],edge:"#ff8f1f",soil:["#54392b","#3d291f"],soilEdge:"#2a1c15",
    top:["🦇","🎃","🕸️","👻","🕸️","🎃","🦇"],side:["🪦","🕯️","💀"],bottom:["🕷️","🍬","🎃","🪦","🎃","🍬","🕷️"],fx:{e:"🦇",dir:"float"}},
  christmas:{sound:"เพลง Jingle Bells กระดิ่งเลื่อน",name:"คริสต์มาสสุขสันต์",emoji:"🎄",price:250,desc:"ต้นคริสต์มาส ของขวัญ ซานตาครอส และกวางเรนเดียร์",
    ground:["#eaf7ec","#b9dfc0"],edge:"#c62828",soil:["#8a5a3c","#6f452b"],soilEdge:"#5a3721",
    top:["🎄","🎁","🔔","🎅","🔔","🎁","🎄"],side:["⭐","🎁","🕯️"],bottom:["🦌","🍪","🎄","🛷","🎄","🍪","🦌"],fx:{e:"❄️",dir:"down"}},
  desert:{sound:"ลมทะเลทราย พิณอู๊ด",name:"โอเอซิสทะเลทราย",emoji:"🏜️",price:300,desc:"กระบองเพชร อูฐ และบ่อน้ำกลางทะเลทราย",
    ground:["#fbe0a2","#e2a95c"],edge:"#c9873a",soil:["#a86a3f","#8c5330"],soilEdge:"#754225",
    top:["🌵","🐪","🌵","🏜️","🌵","🐪","🌵"],side:["🦎","🌵","🦂"],bottom:["🪨","🌵","🌴","💧","🌴","🌵","🪨"],fx:null},
  enchanted:{sound:"พิณเวทมนตร์ ประกายระยิบ",name:"ป่าเวทมนตร์",emoji:"🧚",price:350,desc:"เห็ดเรืองแสง นางฟ้า ยูนิคอร์น และผีเสื้อวิเศษ",
    ground:["#3f7d63","#1f4a3c"],edge:"#b388ff",soil:["#6d4a38","#563a2b"],soilEdge:"#3f2a1f",
    top:["🍄","🌳","🧚","🌳","🦄","🌳","🍄"],side:["🦋","🍄","✨"],bottom:["🍄","🔮","🌿","🧚","🌿","🔮","🍄"],fx:{e:"✨",dir:"float"}},
  space:{sound:"เสียงอวกาศ สัญญาณวิทยุ",name:"ฟาร์มบนดาวอังคาร",emoji:"🚀",price:450,desc:"จานบิน ดาวเคราะห์ มนุษย์ต่างดาว และหุ่นยนต์เกษตร",
    ground:["#2f3466","#12143a"],edge:"#5c6bc0",soil:["#8a4b3a","#6e3a2c"],soilEdge:"#552a20",
    top:["🪐","🛸","⭐","🌙","⭐","🛸","🪐"],side:["👽","🚀","🛰️"],bottom:["🌠","🔭","🌟","🤖","🌟","🔭","🌠"],fx:{e:"⭐",dir:"float"}},
  royal:{sound:"ฮาร์ปซิคอร์ดในวัง น้ำพุ",name:"ฟาร์มราชสำนัก",emoji:"🏰",price:500,desc:"ปราสาท ธง น้ำพุ หงส์ และดอกกุหลาบ",
    ground:["#e3dcff","#b7a2e6"],edge:"#7e57c2",soil:["#94643f","#7a4f2f"],soilEdge:"#633f22",
    top:["🚩","🏰","🌹","👑","🌹","🏰","🚩"],side:["🛡️","🐎","⚔️"],bottom:["🌹","⛲","🦢","⛲","🦢","⛲","🌹"],fx:{e:"✨",dir:"float"}}
};
// ราคาของตกแต่งแบบเก่า (ใช้คืนเงินตอนย้ายเซฟเก่า)
const oldDecorPrice = {"ต้นไม้":45,"แปลงดอกไม้":35,"รั้วไม้":60,"บ่อน้ำ":90,"โรงนา":150,"รถแทรกเตอร์":220};

const initial = {
  money:100, day:1, plots:Array(9).fill(null), inventory:{},
  selectedSeed:null, theme:"meadow", themes:["meadow"], sound:true, lastDay:Date.now()
};
let state = Object.assign(structuredClone(initial), JSON.parse(localStorage.getItem("farmSave") || "null") || {});
// ย้ายเซฟเก่า: เอาของตกแต่งที่เคยวางในแปลงออก แล้วคืนเงินให้
state.plots = state.plots.map(p=>{ if(p && p.type==="decor"){ state.money += oldDecorPrice[p.name]||0; return null; } return p; });
delete state.selectedDecor;
if(!themes[state.theme]) state.theme="meadow";
if(typeof state.sound!=="boolean") state.sound=true;
Sfx.init(state.sound,state.theme);
let seedFilter="all";
if(!Array.isArray(state.themes)||!state.themes.includes("meadow")) state.themes=["meadow",...(state.themes||[])];
let deferredPrompt = null;

function save(){ localStorage.setItem("farmSave",JSON.stringify(state)); }
function fmt(ms){ if(ms<=0)return "พร้อมเก็บ!"; let s=Math.ceil(ms/1000); let m=Math.floor(s/60); s%=60; return `${m}:${String(s).padStart(2,"0")}`; }
function showMessage(t){document.getElementById("message").textContent=t; clearTimeout(showMessage.t); showMessage.t=setTimeout(()=>document.getElementById("message").textContent="แตะแปลงเพื่อปลูกผัก",2500)}

function render(){
  document.getElementById("money").textContent=state.money;
  document.getElementById("dayText").textContent=`วันที่ ${state.day} • ฟาร์มของฉัน`;
  let empty=0,ready=0;
  const farm=document.getElementById("farm"); farm.innerHTML="";
  state.plots.forEach((p,i)=>{
    const el=document.createElement("div");
    if(!p){empty++;el.className="plot empty";el.innerHTML="<div class='crop'>➕</div><div class='name'>ปลูก</div>";el.onclick=()=>openPlot(i)}
    else{
      const st=getStage(p), done=st.ready;
      if(done)ready++;
      el.className="plot "+(done?"ready":"growing");
      const emoji=done?p.emoji:st.stage.emoji;
      const label=done?"ระยะ: พร้อมเก็บเกี่ยว":`ระยะ ${st.idx+1}/${st.count} • ${st.stage.name}`;
      el.innerHTML=`<div class="crop ${done?"":"stage-"+st.idx}">${emoji}</div><div class="name">${p.name}</div><div class="stage-label">${label}</div><div class="bar"><i style="width:${Math.round(st.progress*100)}%"></i></div><div class="timer">${done?"✨ แตะเพื่อเก็บ":fmt(st.remain)}</div>`;
      el.onclick=()=>done?harvest(i):openGrowth(i);
    }
    farm.appendChild(el);
  });
  document.getElementById("emptyCount").textContent=empty;
  document.getElementById("readyCount").textContent=ready;
  if(render.prevReady!==undefined && ready>render.prevReady) Sfx.play("ready");
  render.prevReady=ready;
}
const seedTiers=[["all","ทั้งหมด",0,999],["t1","1-10 💰",1,10],["t2","15-30 💰",15,30],["t3","45-100 💰",45,100],["t4","120-200 💰",120,200]];
function renderSeeds(){
 const bar=document.getElementById("seedFilters"); bar.innerHTML="";
 seedTiers.forEach(([id,label])=>{const b=document.createElement("button");b.className="chip"+(seedFilter===id?" on":"");b.textContent=label;b.onclick=()=>{seedFilter=id;Sfx.play("tap");renderSeeds()};bar.appendChild(b)});
 const [,, lo,hi]=seedTiers.find(t=>t[0]===seedFilter);
 const box=document.getElementById("seedShop"); box.innerHTML="";
 Object.entries(crops).filter(([,c])=>c.seed>=lo&&c.seed<=hi).forEach(([id,c])=>{
  const n=state.inventory[id]||0;
  const el=document.createElement("div"); el.className="card";
  el.innerHTML=`<div class="emoji">${c.emoji}</div><h3>${c.name}</h3><p>โต ${Math.round(totalGrow(c)/1000)} วินาที • ขาย ${c.sell} 💰 (กำไร ${c.sell-c.seed})</p><p class="stages-line">${c.stages.map(s=>s.emoji+"<small>"+s.t+"s</small>").join(" › ")} › ${c.emoji}</p><p>มี ${n} เมล็ด</p><div class="buy-row"><button class="buy b1">ซื้อ ${c.seed} 💰</button><button class="buy b5">×5 (${c.seed*5} 💰)</button></div>`;
  el.querySelector(".b1").onclick=()=>buySeed(id,1); el.querySelector(".b5").onclick=()=>buySeed(id,5); box.appendChild(el);
 });
}
function ring(arr,cls){return arr.map((e,i)=>`<span class="deco ${cls}" style="animation-delay:${(i*0.37)%2}s">${e}</span>`).join("")}
// วาดฉากฟาร์มรอบๆ แปลง (เรียกเฉพาะตอนเปลี่ยนธีม เพื่อไม่ให้แอนิเมชันสะดุด)
function renderScene(){
  const t=themes[state.theme], sc=document.getElementById("scene");
  sc.style.setProperty("--ground1",t.ground[0]);sc.style.setProperty("--ground2",t.ground[1]);sc.style.setProperty("--edge",t.edge);
  sc.style.setProperty("--soil1",t.soil[0]);sc.style.setProperty("--soil2",t.soil[1]);sc.style.setProperty("--soilEdge",t.soilEdge);
  document.getElementById("decoTop").innerHTML=ring(t.top,"h");
  document.getElementById("decoBottom").innerHTML=ring(t.bottom,"h");
  document.getElementById("decoLeft").innerHTML=ring(t.side,"v");
  document.getElementById("decoRight").innerHTML=ring([...t.side].reverse(),"v");
  document.getElementById("themeBadge").textContent=`${t.emoji} ${t.name}`;
  const fx=document.getElementById("fx");fx.innerHTML="";
  if(t.fx){for(let i=0;i<9;i++){const s=document.createElement("span");s.className="fx-item fx-"+t.fx.dir;s.textContent=t.fx.e;
    s.style.left=(4+i*11+Math.random()*6)+"%";s.style.animationDelay=(-Math.random()*9)+"s";s.style.animationDuration=(7+Math.random()*6)+"s";s.style.fontSize=(12+Math.random()*8)+"px";fx.appendChild(s)}}
}
function renderThemes(){
 const box=document.getElementById("themeShop"); box.innerHTML="";
 Object.entries(themes).forEach(([id,t])=>{
  const owned=state.themes.includes(id), active=state.theme===id;
  const el=document.createElement("div"); el.className="card theme-card"+(active?" active":"");
  const btnText=active?"✔ กำลังใช้อยู่":owned?"ใช้ธีมนี้":`ซื้อธีม ${t.price} 💰`;
  el.innerHTML=`<div class="theme-preview" style="background:linear-gradient(${t.ground[0]},${t.ground[1]});border-color:${t.edge}"><div>${t.top.slice(0,5).join("")}</div><div class="big">${t.emoji}</div><div>${t.bottom.slice(1,6).join("")}</div></div><h3>${t.name}</h3><p>${t.desc}</p><p class="snd">🔊 ${t.sound}</p><button class="buy">${btnText}</button>`;
  const b=el.querySelector("button"); b.disabled=active; b.onclick=()=>owned?equipTheme(id):buyTheme(id);
  box.appendChild(el);
 });
}
function buyTheme(id){const t=themes[id];if(state.money<t.price){Sfx.play("error");showMessage("เงินไม่พอ 💸");return}
 state.money-=t.price;state.themes.push(id);state.theme=id;save();render();renderScene();renderThemes();Sfx.setTheme(id);Sfx.play("theme");showMessage(`ซื้อและใช้ธีม${t.name}แล้ว ${t.emoji}`)}
function equipTheme(id){state.theme=id;save();renderScene();renderThemes();Sfx.setTheme(id);Sfx.play("equip");showMessage(`เปลี่ยนเป็นธีม${themes[id].name} ${themes[id].emoji}`)}
function buySeed(id,q=1){let c=crops[id],cost=c.seed*q;if(state.money<cost){Sfx.play("error");showMessage("เงินไม่พอ 💸");return}state.money-=cost;state.inventory[id]=(state.inventory[id]||0)+q;save();render();renderSeeds();Sfx.play("buy");showMessage(`ซื้อเมล็ด${c.name} ${q} เมล็ดแล้ว 🌱`)}
function openPlot(i){
 Sfx.play("tap");
 document.getElementById("modalTitle").textContent="🌱 เลือกเมล็ดพันธุ์";
 const content=document.getElementById("modalContent");content.innerHTML="";
 const owned=Object.entries(crops).filter(([id])=>(state.inventory[id]||0)>0);
 if(!owned.length){content.innerHTML="<p class='hint' style='margin:12px 0'>ยังไม่มีเมล็ดพันธุ์ ไปซื้อที่ร้านด้านล่างก่อนนะ 🛒</p>"}
 owned.forEach(([id,c])=>{
  const n=state.inventory[id];const b=document.createElement("button");b.className="action";b.textContent=`${c.emoji} ${c.name} (${n})`;
  b.onclick=()=>plant(i,id);content.appendChild(b);
 });
 document.getElementById("modal").classList.remove("hidden");
}
function plant(i,id){if(!state.inventory[id])return;state.inventory[id]--;let c=crops[id];state.plots[i]={type:"crop",id,name:c.name,emoji:c.emoji,plantedAt:Date.now()};closeModal();save();render();renderSeeds();Sfx.play("plant");showMessage(`ปลูก${c.name}แล้ว 🌱`)}
function openGrowth(i){
 const p=state.plots[i],c=crops[p.id],st=getStage(p);
 document.getElementById("modalTitle").textContent=`${c.emoji} ระยะการเจริญของ${c.name}`;
 const content=document.getElementById("modalContent");
 let rows=c.stages.map((s,k)=>{
  const cls=k<st.idx?"done":k===st.idx?"current":"todo";
  const mark=k<st.idx?"✅":k===st.idx?"⏳":"⚪";
  const extra=k===st.idx?` (เหลือ ${fmt(st.stageRemain)})`:"";
  return `<li class="${cls}"><span>${mark} ${s.emoji} ระยะ ${k+1}: ${s.name}</span><b>${s.t} วิ${extra}</b></li>`;
 }).join("");
 rows+=`<li class="todo"><span>🎉 ${c.emoji} พร้อมเก็บเกี่ยว</span><b>ขาย ${c.sell} 💰</b></li>`;
 content.innerHTML=`<ul class="stage-list">${rows}</ul><p class="hint">รวมทั้งหมด ${Math.round(totalGrow(c)/1000)} วินาที • เหลืออีก ${fmt(st.remain)}</p>`;
 document.getElementById("modal").classList.remove("hidden");
}
function harvest(i){let p=state.plots[i],c=crops[p.id];state.money+=c.sell;state.plots[i]=null;save();render();Sfx.play("harvest");showMessage(`เก็บ${c.name} ได้ +${c.sell} 💰`)}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};

setInterval(()=>{render()},1000);

// วันใหม่ทุก 3 นาทีสำหรับเดโม
setInterval(()=>{if(Date.now()-state.lastDay>=180000){state.day++;state.lastDay=Date.now();save();render();}},5000);

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").classList.remove("hidden")});
document.getElementById("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").classList.add("hidden")};

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(console.error))}
const soundBtn=document.getElementById("soundBtn");
function updateSoundBtn(){soundBtn.textContent=state.sound?"🔊":"🔇";soundBtn.title=state.sound?"ปิดเสียง":"เปิดเสียง"}
soundBtn.onclick=()=>{state.sound=Sfx.toggle();save();updateSoundBtn();showMessage(state.sound?"เปิดเสียงแล้ว 🔊":"ปิดเสียงแล้ว 🔇")};
updateSoundBtn();
render();renderSeeds();renderScene();renderThemes();
