/* HOLY // header profile dropdown — identity lives in the nav, no separate page. */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const RESERVED=["holy","holysec","khalifa","administrator","admin","root","system","moderator","mod","official","support","security","owner"];
const ACHN={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED",holy:"HOLY BADGE"};
function toast(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600);}
function getP(){try{return JSON.parse(localStorage.getItem("holy_profile")||"null")}catch(e){return null}}
function isAdmin(){try{return sessionStorage.getItem("holy_admin")==="1"}catch(e){return false}}
function num(o){return (o&&typeof o==="object")?{best:o.best||0,plays:o.plays||0}:{best:o||0,plays:0};}
let newAv=0, SBC=null;
async function sbClient(){
  try{
    if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url) return null;
    if(typeof supabase==="undefined"){
      await new Promise(res=>{const s=document.createElement("script");
        s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
        s.onload=()=>res(); s.onerror=()=>res(); document.head.appendChild(s);});
      if(typeof supabase==="undefined") return null;
    }
    if(!SBC) SBC=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    return SBC;
  }catch(e){return null}
}
async function nameTaken(v){
  try{
    const c=await sbClient(); if(!c) return null;
    const r=await c.from("profiles").select("id").ilike("callsign",v).limit(1);
    if(r.error) return null;
    return r.data&&r.data.length>0;
  }catch(e){return null}
}
function paintPicker(el,sel,fn){
  const adm=isAdmin();
  el.innerHTML=AVATARS.map((a,i)=>{
    const locked=a.admin&&!adm;
    return `<button class="avpick ${i===sel?"sel":""}" data-i="${i}">${avatarSVG(i,72)}<small>${locked?"🔒 "+a.name:a.name}</small></button>`;}).join("");
  el.querySelectorAll(".avpick").forEach(b=>b.onclick=e=>{e.stopPropagation();
    const i=+b.dataset.i;
    if(AVATARS[i].admin&&!isAdmin()){toast("OWNER hero unlocks with an admin session.");return;}
    fn(i);});
}
function renderDrop(){
  const p=getP();
  const has=!!(p&&p.callsign);
  $("#pdEnlist").hidden=has; $("#pdMain").hidden=!has;
  $("#pname").textContent=has?p.callsign:"PROFILE";
  $("#pavatar").innerHTML=has?avatarSVG(p.avatar||0,26):"◉";
  if(has){
    $("#pdAv").innerHTML=avatarSVG(p.avatar||0,84);
    $("#pdName").textContent=p.callsign.toUpperCase();
    let since=""; try{since=new Date(p.since).toISOString().slice(0,10)}catch(e){}
    $("#pdSince").textContent="ENLISTED "+since+" · USERNAME PERMANENT";
    paintPicker($("#pdGrid"),p.avatar||0,i=>{
      const q=getP(); if(!q) return;
      q.avatar=i; try{localStorage.setItem("holy_profile",JSON.stringify(q))}catch(e){}
      renderDrop(); toast("Hero updated → "+AVATARS[i].name);
    });
    let best={},st={},f=[],a={};
    try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
    try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
    try{f=JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){}
    try{a=JSON.parse(localStorage.getItem("holy_ach")||"{}")}catch(e){}
    const v=num(best.vuln), s=num(best.sec);
    const nb=Object.keys(ACHN).filter(k=>a[k]).length;
    $("#pdStats").innerHTML=
     `<div class="kv"><b>QUIZZES</b><span>v ${v.best} · s ${s.best}</span></div>
      <div class="kv"><b>STREAK</b><span>${st.streak||0} 🔥</span></div>
      <div class="kv"><b>FLAGS</b><span>${f.length}/5</span></div>
      <div class="kv"><b>BADGES</b><span>${nb}/8</span></div>`;
  } else {
    paintPicker($("#pdNew"),newAv,i=>{newAv=i;
      paintPicker($("#pdNew"),newAv,j=>{newAv=j;});});
  }
}
async function enlist(){
  const v=$("#pdInput").value.replace(/[<>&"]/g,"").trim().slice(0,20);
  if(!/^[A-Za-z0-9_-]{2,20}$/.test(v)){toast("2-20 chars: letters, numbers, _ -");return;}
  if(RESERVED.includes(v.toLowerCase())){toast("That callsign is reserved.");return;}
  if(AVATARS[newAv].admin&&!isAdmin()){toast("OWNER hero needs an admin session.");return;}
  toast("Checking availability…");
  if(await nameTaken(v)===true){toast("Taken — choose another operative name.");return;}
  try{localStorage.setItem("holy_profile",JSON.stringify({callsign:v,avatar:newAv,since:Date.now()}))}catch(e){}
  $("#pdInput").value="";
  renderDrop(); toast("◉ OPERATIVE "+v+" ENLISTED — welcome.");
}
document.addEventListener("DOMContentLoaded",()=>{
  const chip=$("#pchip"), drop=$("#pdrop");
  if(!chip||!drop) return;
  renderDrop();
  chip.addEventListener("click",e=>{e.stopPropagation();drop.hidden=!drop.hidden;if(!drop.hidden)renderDrop();});
  document.addEventListener("click",e=>{if(!drop.hidden&&!drop.contains(e.target))drop.hidden=true;});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")drop.hidden=true;});
  $("#pdGo").onclick=enlist;
  $("#pdInput").addEventListener("keydown",e=>{if(e.key==="Enter")enlist();});
});
})();
