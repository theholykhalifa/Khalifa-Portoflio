/* HOLY // live visits pill — counts page loads in Supabase, fails silent. */
(function(){
"use strict";
const SB_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
function loadLib(){
  return new Promise(res=>{
    if(typeof supabase!=="undefined") return res(true);
    let done=false;
    const fin=ok=>{if(!done){done=true;res(ok);}};
    const s=document.createElement("script");
    s.src=SB_CDN; s.async=true;
    s.onload=()=>fin(typeof supabase!=="undefined");
    s.onerror=()=>fin(false);
    document.head.appendChild(s);
    setTimeout(()=>fin(typeof supabase!=="undefined"),10000);
  });
}
document.addEventListener("DOMContentLoaded",async ()=>{
  const pill=document.getElementById("visitPill");
  if(!pill) return;
  try{
    if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url) throw 0;
    if(!(await loadLib())) throw 0;
    const SB=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    try{await SB.from("visits").insert({path:location.pathname.slice(0,120)});}catch(e){}
    const r=await SB.from("visits").select("id",{count:"exact",head:true});
    if(r.error) throw 0;
    pill.innerHTML="◉ "+Number(r.count||0).toLocaleString()+" VISITS";
    pill.title="Total visits since launch (all pages)";
  }catch(e){pill.style.display="none";}
});
})();
