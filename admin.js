var BADGES={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED",holy:"HOLY BADGE"};
var SEALS={e1:"Egg 1 — HOLY ×3",e2:"Egg 2 — Red Team",e3:"Egg 3 — Breach",e4:"Egg 4 — Prank"};
function store(k,v){if(v===undefined){try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return{}}}try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
async function sha(s){var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
function authed(){try{return sessionStorage.getItem("holy_admin")==="1"}catch(e){return false}}
function show(){var on=authed();
  document.getElementById("loginBox").hidden=on;
  document.getElementById("panel").hidden=!on;
  if(on) render(); else lockTick();}
function render(){
  var a=store("holy_ach"), s=store("holy_seals");
  document.getElementById("whoLine").textContent="◉ LOGGED IN AS "+HOLY_ADMIN.user+" (this browser session)";
  document.getElementById("badgeList").innerHTML=Object.keys(BADGES).map(function(k){
    return "<label class='row'><input type='checkbox' data-b='"+k+"'"+(a[k]?" checked":"")+"> "+BADGES[k]+"</label>"}).join("");
  document.getElementById("sealList").innerHTML=Object.keys(SEALS).map(function(k){
    return "<label class='row'><input type='checkbox' data-s='"+k+"'"+(s[k]?" checked":"")+"> "+SEALS[k]+"</label>"}).join("");
  var f=[];try{f=JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){}
  var best=store("holy_best");
  document.getElementById("statLine").textContent="flags "+f.length+"/5 · quiz best vuln "+(function(){var v=best.vuln;return(v&&typeof v==="object")?v.best:(v||0)}())+"/49 · sec "+(function(){var v=best.sec;return(v&&typeof v==="object")?v.best:(v||0)}())+"/53 · vault "+(function(){try{return localStorage.getItem("holy_vault")==="1"?"OPEN":"LOCKED"}catch(e){return"? "}}());
  var og=document.getElementById("ovGrid");
  if(og){var aa=store("holy_ach"),ss=store("holy_seals");
    var nb=Object.keys(BADGES).filter(function(k){return aa[k]}).length;
    var ns=["e1","e2","e3","e4"].filter(function(k){return ss[k]}).length;
    var vo="?",po="—";
    try{vo=localStorage.getItem("holy_vault")==="1"?"OPEN":"LOCKED"}catch(e){}
    try{var pp=JSON.parse(localStorage.getItem("holy_profile")||"{}");po=pp.callsign?("◉ "+pp.callsign):"— none —"}catch(e){}
    og.innerHTML=[["BADGES",nb+"/8"],["SEALS",ns+"/4"],["FLAGS",f.length+"/5"],["VAULT",vo]].map(function(x){
      return `<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`}).join("");
    document.getElementById("ovCall").textContent=po;}
}
document.getElementById("aGo").onclick=function(){
  if(lockUntil>Date.now()){lockTick();return;}
  var u=document.getElementById("aUser").value.trim(), p=document.getElementById("aPass").value;
  sha(p).then(function(h){
var U=HOLY_ADMIN.user,H=HOLY_ADMIN.passHash;
    try{var ov=JSON.parse(localStorage.getItem("holy_admin_cred")||"null");if(ov&&ov.user&&ov.passHash){U=ov.user;H=ov.passHash;}}catch(e){}
    if(u===U&&h===H){
      try{localStorage.setItem("holy_alock",JSON.stringify({fails:0,until:0}))}catch(e){}
      try{sessionStorage.setItem("holy_admin","1")}catch(e){}audit("login","success");show();}
    else{
      var lk=lockState(); lk.fails++;
      if(lk.fails>=3){lk.until=Date.now()+60000;
        document.getElementById("aErr").textContent="✗ ACCESS DENIED — 3 strikes. Cooling down 60s.";}
      else{document.getElementById("aErr").textContent="✗ ACCESS DENIED — attempt "+lk.fails+"/3.";}
      try{localStorage.setItem("holy_alock",JSON.stringify(lk))}catch(e){}
      lockTick();
    }
  }).catch(function(){document.getElementById("aErr").textContent="✗ Crypto unavailable in this browser.";});
};
var lockUntil=0, lockIv=null;
function lockState(){try{return JSON.parse(localStorage.getItem("holy_alock")||'{"fails":0,"until":0}')}catch(e){return{fails:0,until:0}}}
function lockTick(){
  var lk=lockState(); lockUntil=lk.until;
  var pop=document.getElementById("lockPop"), left=Math.ceil((lockUntil-Date.now())/1000);
  ["aUser","aPass","aGo"].forEach(function(id){document.getElementById(id).disabled=left>0;});
  if(left<=0){pop.hidden=true;if(lk.fails>=3){try{localStorage.setItem("holy_alock",JSON.stringify({fails:0,until:0}))}catch(e){}}
    if(lockIv){clearInterval(lockIv);lockIv=null;}return;}
  pop.hidden=false; document.getElementById("lockT").textContent=left;
  if(lockIv) clearInterval(lockIv);
  lockIv=setInterval(function(){
    var l=Math.ceil((lockUntil-Date.now())/1000);
    if(l<=0){lockTick();}else{document.getElementById("lockT").textContent=l;}
  },500);
}
document.getElementById("aOut").onclick=function(){try{sessionStorage.removeItem("holy_admin")}catch(e){}show();};
document.getElementById("bApply").onclick=function(){
  var a={};document.querySelectorAll("#badgeList input").forEach(function(c){if(c.checked)a[c.dataset.b]=1;});
  store("holy_ach",a);render();audit("badges",Object.keys(a).length+"/8");};
document.getElementById("sApply").onclick=function(){
  var s={};document.querySelectorAll("#sealList input").forEach(function(c){if(c.checked)s[c.dataset.s]=1;});
  store("holy_seals",s);render();audit("seals","updated");};
document.getElementById("vOpen").onclick=function(){try{localStorage.setItem("holy_vault","1")}catch(e){}render();audit("vault","unlocked");};
document.getElementById("vLock").onclick=function(){try{localStorage.removeItem("holy_vault")}catch(e){}render();audit("vault","relocked");};
document.getElementById("oUnlock").onclick=function(){try{localStorage.setItem("holy_owner","1")}catch(e){}toast2("◉ OWNER hero unlocked on this browser.");audit("owner-unlock","");};
document.getElementById("xQuiz").onclick=function(){store("holy_best",{});try{localStorage.removeItem("holy_daily")}catch(e){}render();audit("quiz-reset","");};
document.getElementById("xExport").onclick=function(){
  var d={};["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily"].forEach(function(k){d[k]=store(k);});
  var b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});var a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download="holy-record.json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);};
document.getElementById("xNuke").onclick=function(){
  if(!confirm("Wipe ALL local demo data in this browser?"))return;
  ["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily","holy_vault","holy_rec"].forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
  render();audit("NUKE","all local data");};
var SBN=null;
function loadSbLibAdmin(){
  return new Promise(function(res){
    if(typeof supabase!=="undefined") return res(true);
    var done=false;
    var fin=function(ok){if(!done){done=true;res(ok);}};
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
    if(typeof HOLY_SRI!=="undefined"&&HOLY_SRI){s.integrity=HOLY_SRI;s.crossOrigin="anonymous";}
    s.async=true;
    s.onload=function(){fin(typeof supabase!=="undefined");};
    s.onerror=function(){fin(false);};
    document.head.appendChild(s);
    setTimeout(function(){fin(typeof supabase!=="undefined");},10000);
  });
}
async function cloudRefresh(){
  var st=document.getElementById("cloudStatus"), stats=document.getElementById("cloudStats"), feed=document.getElementById("cloudFeed");
  if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url||!HOLY_SUPABASE.key){
    st.textContent="CLOUD: off — add project keys."; stats.textContent=""; feed.textContent=""; return;}
  if(typeof supabase==="undefined"){
    st.textContent="CLOUD: loading library…";
    var ok=await loadSbLibAdmin();
    if(!ok){st.textContent="CLOUD: library blocked — allow jsdelivr CDN."; return;}}
  try{
    if(!SBN) SBN=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    st.textContent="CLOUD: connected — "+HOLY_SUPABASE.url;
    var pc=await SBN.from("profiles").select("id",{count:"exact",head:true});
    var sc=await SBN.from("scores").select("id",{count:"exact",head:true});
    stats.textContent="operatives: "+(pc.count||0)+" · posted scores: "+(sc.count||0);
    var u=await SBN.from("profiles").select("id,callsign,avatar,created_at").order("created_at",{ascending:false}).limit(30);
    if(u.error) throw u.error;
    document.getElementById("userFeed").innerHTML=u.data.length?u.data.map(function(x){
      return escapeHtml(x.callsign)+" · hero"+(x.avatar||0)+" · "+new Date(x.created_at).toISOString().slice(0,10)+
      ` <button class="mini" data-wipe="${x.id}">WIPE SCORES</button>`;}).join("<br>"):"no operatives yet.";
    document.querySelectorAll("#userFeed [data-wipe]").forEach(function(b){b.onclick=function(){
      if(!confirm("Wipe ALL scores of this operative?"))return;
      adminAct({action:"wipe_scores",user_id:b.dataset.wipe},cloudRefresh);};});
    var r=await SBN.from("scores").select("id,callsign,game,score,total,created_at").order("created_at",{ascending:false}).limit(12);
    if(r.error) throw r.error;
    feed.innerHTML=r.data.length?r.data.map(function(x){
      return new Date(x.created_at).toISOString().slice(5,16).replace("T"," ")+" · "+escapeHtml(x.callsign)+" · "+x.game+" "+x.score+"/"+x.total+
      ` <button class="mini" data-del="${x.id}">✕</button>`;}).join("<br>"):"no scores yet.";
    feed.querySelectorAll("[data-del]").forEach(function(b){b.onclick=function(){
      if(!confirm("Delete this score row?"))return;
      adminAct({action:"delete_score",score_id:+b.dataset.del},cloudRefresh);};});
  }catch(e){st.textContent="CLOUD ERROR: "+(e.message||"unreachable");}
}
/* tabbed console: groups cards, adds overview + callsign override */
const TABDEF=[["overview","◉ OVERVIEW"],["security","SECURITY"],["visitors","VISITORS"],["audit","AUDIT"],["badges","BADGES"],["seals","SEALS + VAULT"],["record","RECORD"],["cloud","CLOUD"]];
(function buildTabs(){
  const panel=document.getElementById("panel");
  const cards=[...panel.querySelectorAll(":scope > .card")];
  const bar=document.createElement("div"); bar.className="tabbar";
  TABDEF.forEach(([k,label],i)=>{
    const b=document.createElement("button");
    b.textContent=label; b.dataset.tab=k;
    if(i===0)b.classList.add("on");
    b.onclick=()=>showTab(k);
    bar.appendChild(b);
  });
  panel.insertBefore(bar,panel.firstChild);
  const panes={};
  TABDEF.forEach(([k])=>{
    const d=document.createElement("div"); d.dataset.pane=k;
    if(k!=="overview")d.hidden=true;
    panel.appendChild(d); panes[k]=d;
  });
  const map={overview:[6],security:[0,9],visitors:[7],audit:[8],badges:[1],seals:[2],record:[3],cloud:[4],bans:[5]};
  Object.keys(map).forEach(k=>map[k].forEach(ix=>{if(cards[ix])panes[k].appendChild(cards[ix]);}));
  panes.overview.innerHTML=`<div class="statgrid" id="ovGrid"></div>
    <div class="card" style="margin:12px 0 0"><div class="mono" style="font-size:11px;letter-spacing:.18em;color:#FFD88A">OPERATIVE CALLSIGN (LOCAL OVERRIDE)</div>
    <div class="mono" id="ovCall" style="font-size:13px;margin:6px 0"></div>
    <input id="ovCallIn" placeholder="set callsign…" maxlength="20">
    <button id="ovCallSet">SET CALLSIGN</button></div>`;
  document.getElementById("ovCallSet").onclick=()=>{
    const v=document.getElementById("ovCallIn").value.replace(/[<>&"]/g,"").trim().slice(0,20);
    if(!/^[A-Za-z0-9_-]{2,20}$/.test(v)){toast2("2-20 chars.");return;}
    try{const p=JSON.parse(localStorage.getItem("holy_profile")||"{}");p.callsign=v;
      if(!p.since)p.since=Date.now();localStorage.setItem("holy_profile",JSON.stringify(p));}catch(e){}
    render();toast2("Callsign set → "+v);audit("callsign",v);};
})();
function showTab(k){
  document.querySelectorAll("#panel .tabbar button").forEach(b=>b.classList.toggle("on",b.dataset.tab===k));
  document.querySelectorAll("#panel [data-pane]").forEach(p=>p.hidden=p.dataset.pane!==k);
}
function toast2(t){var s=document.getElementById("statLine"); if(s) s.textContent=t;}
function audit(act,d){try{var l=JSON.parse(localStorage.getItem("holy_audit")||"[]");l.unshift({t:new Date().toISOString(),act:act,d:d||""});localStorage.setItem("holy_audit",JSON.stringify(l.slice(0,100)));}catch(e){} renderAudit();}
function renderAudit(){var el=document.getElementById("auditBody");if(!el)return;var l=[];try{l=JSON.parse(localStorage.getItem("holy_audit")||"[]")}catch(e){}
  el.innerHTML=l.length?l.map(function(x){return x.t.slice(0,16).replace("T"," ")+" · <b>"+x.act+"</b> "+(x.d||"")}).join("<br>"):"no entries yet — admin actions log here.";}
document.getElementById("cRefresh").onclick=cloudRefresh;
document.getElementById("xImport").onclick=function(){
  var f=document.getElementById("xFile").files[0]; if(!f)return;
  var rd=new FileReader();
  rd.onload=function(){try{
    var d=JSON.parse(rd.result);
    ["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily"].forEach(function(k){
      if(d[k]!==undefined) localStorage.setItem(k,JSON.stringify(d[k]));});
    render(); toast2("Record imported.");audit("import","record JSON");
  }catch(e){toast2("Invalid record file.");}};
  rd.readAsText(f);
};
document.getElementById("bestApply").onclick=function(){
  var v=parseInt(document.getElementById("bestV").value,10),
      s=parseInt(document.getElementById("bestS").value,10);
  var b=store("holy_best");
  if(!isNaN(v)) b.vuln=Math.max(0,Math.min(49,v));
  if(!isNaN(s)) b.sec=Math.max(0,Math.min(53,s));
  store("holy_best",b); render(); toast2("Quiz bests set.");audit("bests","manual set");
};
async function banAct(action){
  var msg=document.getElementById("banMsg");
  var url=document.getElementById("fnUrl").value.trim(),
      sec=document.getElementById("fnSecret").value,
      id=document.getElementById("banId").value.trim();
  try{localStorage.setItem("holy_fnurl",url);sessionStorage.setItem("holy_fnsec",sec);}catch(e){}
  if(!url||!sec||!id){msg.textContent="Need function URL + secret + user UUID.";return;}
  msg.textContent="sending…";
  try{
    var r=await fetch(url,{method:"POST",
      headers:{"Content-Type":"application/json","x-admin-secret":sec},
      body:JSON.stringify({action:action,user_id:id,
        hours:parseFloat(document.getElementById("banHrs").value)||0,
        reason:document.getElementById("banWhy").value})});
    var j=await r.json().catch(function(){return{}});
    msg.textContent=r.ok?("◉ "+(j.result||"done")):("✗ "+(j.error||("HTTP "+r.status)));
    cloudRefresh();
  }catch(e){msg.textContent="✗ unreachable — function deployed? URL correct?";}
}
document.getElementById("banGo").onclick=function(){banAct("ban");};
document.getElementById("unbanGo").onclick=function(){banAct("unban");};
document.getElementById("luGo").onclick=async ()=>{
  const out=document.getElementById("luOut"), v=document.getElementById("luCall").value.trim();
  out.dataset.uuid="";
  if(!SBN){out.textContent="Cloud off — refresh cloud first.";return;}
  try{const r=await SBN.from("profiles").select("id,callsign").ilike("callsign",v).limit(5);
    if(r.error) throw r.error;
    out.innerHTML=r.data.length?r.data.map(x=>escapeHtml(x.callsign)+" → "+x.id).join("<br>"):"no match.";
    if(r.data[0]) out.dataset.uuid=r.data[0].id;
  }catch(e){out.textContent="Lookup failed.";}
};
document.getElementById("luCopy").onclick=()=>{
  const u=document.getElementById("luOut").dataset.uuid||"";
  if(!u){toast2("Lookup first.");return;}
  document.getElementById("banId").value=u;
  if(navigator.clipboard) navigator.clipboard.writeText(u).catch(()=>{});
  toast2("UUID loaded into ban field.");
};
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
async function sysCheck(){
  var el=document.getElementById("sysBody"); if(!el) return;
  var rows=[];
  try{var t0=performance.now();var r=await fetch("favicon.svg",{method:"HEAD",cache:"no-store"});
    rows.push(["SITE (PAGES)",r.ok?("ONLINE · "+Math.round(performance.now()-t0)+"ms"):("HTTP "+r.status)]);}
  catch(e){rows.push(["SITE (PAGES)","UNREACHABLE"]);}
  if(typeof supabase!=="undefined"&&typeof HOLY_SUPABASE!=="undefined"&&HOLY_SUPABASE.url){
    try{if(!SBN)SBN=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
      var t1=performance.now();
      await SBN.from("profiles").select("id",{count:"exact",head:true});
      rows.push(["CLOUD DB","ONLINE · "+Math.round(performance.now()-t1)+"ms"]);}
    catch(e){rows.push(["CLOUD DB","ERROR"]);}
  } else rows.push(["CLOUD DB","OFF — no keys/lib"]);
  try{localStorage.setItem("__t","1");localStorage.removeItem("__t");
    rows.push(["BROWSER STORE","OK · "+(JSON.stringify(localStorage).length/1024).toFixed(1)+"KB"]);}
  catch(e){rows.push(["BROWSER STORE","BLOCKED"]);}
  el.innerHTML=rows.map(function(x){return x[0]+" — <b>"+x[1]+"</b>"}).join("<br>");
  var lk=lockState(), left=Math.ceil((lk.until-Date.now())/1000);
  document.getElementById("lockInfo").textContent=left>0?("LOCKED OUT — "+left+"s left · fails: "+lk.fails):("Lockout clear · recorded fails: "+lk.fails);
}
async function visitors(){
  var box=document.getElementById("visBody"); if(!box) return;
  if(typeof supabase==="undefined"||!SBN){box.textContent="Cloud off — connect to see visitors.";return;}
  try{
    var days=[...Array(7)].map(function(_,i){return new Date(Date.now()-i*864e5).toISOString().slice(0,10)}).reverse();
    var pr=await SBN.from("profiles").select("created_at").limit(1000);
    if(pr.error) throw pr.error;
    var sc=await SBN.from("scores").select("game,created_at").limit(1000);
    if(sc.error) throw sc.error;
    var grp=function(rows){var m={};days.forEach(function(d){m[d]=0});rows.forEach(function(r){var d=(r.created_at||"").slice(0,10);if(d in m)m[d]++;});return m;};
    var su=grp(pr.data||[]), ss=grp(sc.data||[]);
    var mx=Math.max(1,...Object.values(su),...Object.values(ss));
    var bar=function(v){return `<div class="bar"><i style="width:${Math.round(v/mx*100)}%"></i></div>`;};
    var games={};(sc.data||[]).forEach(function(r){games[r.game]=(games[r.game]||0)+1;});
    box.innerHTML="<b>SIGNUPS / DAY</b>"+days.map(function(d){return d.slice(5)+" · "+su[d]+bar(su[d])}).join("")+
     "<b>SCORES / DAY</b>"+days.map(function(d){return d.slice(5)+" · "+ss[d]+bar(ss[d])}).join("")+
     "<b>BY GAME</b> "+(Object.keys(games).map(function(g){return g+": "+games[g]}).join(" · ")||"—");
  }catch(e){box.textContent="Visitor feed failed: "+(e.message||"unreachable");}
}
async function adminAct(payload,done){
  const fnUrl=(document.getElementById("fnUrl")||{}).value||"";
  const sec=(document.getElementById("fnSecret")||{}).value||"";
  if(!fnUrl||!sec){toast2("Set function URL + secret (ban card) first.");return;}
  try{
    const r=await fetch(fnUrl,{method:"POST",
      headers:{"Content-Type":"application/json","x-admin-secret":sec},
      body:JSON.stringify(payload)});
    const j=await r.json().catch(function(){return{}});
    toast2(r.ok?("◉ "+(j.result||"done")):("✗ "+(j.error||("HTTP "+r.status))));
    if(r.ok&&done)done();
  }catch(e){toast2("✗ function unreachable — deployed?");}
}
  try{const u=localStorage.getItem("holy_fnurl"),s=sessionStorage.getItem("holy_fnsec");
    if(u)document.getElementById("fnUrl").value=u;
    if(s)document.getElementById("fnSecret").value=s;}catch(e){}
document.getElementById("sysGo").onclick=sysCheck;
document.getElementById("auditClear").onclick=function(){try{localStorage.removeItem("holy_audit")}catch(e){}renderAudit();};
document.getElementById("lockReset").onclick=function(){try{localStorage.setItem("holy_alock",JSON.stringify({fails:0,until:0}))}catch(e){}lockTick();sysCheck();toast2("Lockout cleared.");audit("lockout-cleared","");};
document.getElementById("rotGo").onclick=async function(){
  var u=document.getElementById("nuUser").value.trim(), p=document.getElementById("nuPass").value;
  if(u.length<3||p.length<8){toast2("Username 3+, password 8+.");return;}
  const hh=await sha(p);
  try{localStorage.setItem("holy_admin_cred",JSON.stringify({user:u,passHash:hh}))}catch(e){}
  document.getElementById("nuUser").value="";document.getElementById("nuPass").value="";
  audit("creds-rotated",u); toast2("Credentials rotated — old login dead after logout.");
};
show();
cloudRefresh();
renderAudit(); sysCheck(); visitors();