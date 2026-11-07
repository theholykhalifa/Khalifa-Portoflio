/* HOLY // live visits pill — counts page loads in Supabase, fails silent.
   THIRD-PARTY REQUEST: loads supabase-js from a CDN and records one page path,
   so it only runs with consent — "all" stored, or after the visitor presses
   ACCEPT ALL (holy:consent event). Without consent no request is made and the
   pill stays hidden: essential-only really means zero external requests.
   Guard state lives at IIFE scope so the arming path is idempotent no matter
   how many times the readiness events arrive. */
(function(){
"use strict";
const SB_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
let started=false;
function pillEl(){return document.getElementById("visitPill");}
function hide(){const p=pillEl();if(p)p.style.display="none";}
function loadLib(){
  return new Promise(res=>{
    if(typeof supabase!=="undefined") return res(true);
    let done=false;
    const fin=ok=>{if(!done){done=true;res(ok);}};
    const s=document.createElement("script");
    s.src=SB_CDN; s.async=true;
    if(typeof HOLY_SRI!=="undefined"&&HOLY_SRI){s.integrity=HOLY_SRI;s.crossOrigin="anonymous";}
    s.onload=()=>fin(typeof supabase!=="undefined");
    s.onerror=()=>fin(false);
    document.head.appendChild(s);
    setTimeout(()=>fin(typeof supabase!=="undefined"),10000);
  });
}
async function start(){
  const p=pillEl();
  if(!p||started) return;
  started=true;
  p.style.display=""; // consent exists — the pill may show a real number
  try{
    if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url) throw 0;
    if(!(await loadLib())) throw 0;
    const SB=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    try{await SB.from("visits").insert({path:location.pathname.slice(0,120)});}catch(e){}
    const r=await SB.from("visits").select("id",{count:"exact",head:true});
    if(r.error) throw 0;
    p.innerHTML="◉ "+Number(r.count||0).toLocaleString()+" VISITS";
    p.title="Total visits since launch (all pages)";
  }catch(e){hide();}
}
function arm(choice){
  if(choice==="all") start(); else hide();
}
document.addEventListener("DOMContentLoaded",()=>{
  if(!pillEl()) return;
  const choice=(window.HOLY_CONSENT&&HOLY_CONSENT.get)?HOLY_CONSENT.get():null;
  arm(choice); // stored "all" starts; "essential"/none keeps it hidden
});
// fires the moment permission exists (or is revoked) — before or after DCL
document.addEventListener("holy:consent",e=>arm(e.detail));
})();
