/* HOLY // app logic — vanilla, no dependencies */
(function(){
"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- render from config ---------- */
function statusBadge(s){
  const m={"VERIFIED":"b-verified","IN PROGRESS":"b-progress","PLANNED":"b-planned","SOON":"b-soon","TARGET":"b-soon"};
  const icon={"VERIFIED":"✓ ","IN PROGRESS":"◐ ","PLANNED":"→ ","SOON":"⚡ ","TARGET":"◎ "}[s]||"";
  return `<span class="badge ${m[s]||"b-planned"}">${icon}${s}</span>`;
}
function renderCerts(){
  $("#credGrid").innerHTML=HOLY_CERTS.map(c=>`
    <article class="card cred ${c.spotlight?"spot":""} reveal">
      <div class="idx">CERTIFICATION ${c.index} · ${c.track}</div>
      <h3>${c.short}</h3><div class="full">${c.name}</div>
      <ul>${c.focus.map(f=>`<li>${f}</li>`).join("")}</ul>
      <div style="font-size:13px;color:var(--muted)">${c.note}</div>
      <div>${statusBadge(c.status)}</div>
    </article>`).join("");
}
function renderRoad(){
  const order=["ccna","secplus","ejpt","pnpt","ceh","crto","oswe"];
  $("#road").innerHTML=order.map(id=>{
    const c=HOLY_CERTS.find(x=>x.id===id); if(!c) return "";
    return `<div class="rstep"><small>${c.track}</small><h4>${c.short} — ${c.name}</h4><p>Status: ${c.status} · ${c.note}</p></div>`;
  }).join("")+`<div class="rstep"><small>FOREVER</small><h4>CONTINUOUS SECURITY RESEARCH</h4><p>The roadmap never ends — learn, build, test, document.</p></div>`;
}
function renderExp(){
  $("#expList").innerHTML=HOLY_EXPERIENCE.map(e=>`
    <div class="titem reveal">
      <h3>${e.org}</h3>
      <div style="color:var(--accent2);font-family:var(--mono);font-size:12px;margin-top:4px">${e.role}</div>
      <div class="tmeta"><span class="pill cy">${e.type}</span><span class="pill ${e.status==="TARGET"||e.status==="PLANNED"?"warn":""}">${e.status}</span><span class="pill">${e.date}</span><span class="pill">${e.location}</span></div>
      <p>${e.description}</p>
      <div class="tags">${e.technologies.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <ul>${e.achievements.map(a=>`<li>${a}</li>`).join("")}</ul>
    </div>`).join("");
}
function renderArsenal(){
  $("#arsGrid").innerHTML=HOLY_ARSENAL.map(g=>`
    <div class="card reveal"><h3>${g.category}</h3>
      <div class="skills">${g.items.map(([n,l])=>{
        const cls=l==="ADVANCED"?"l-ADVANCED":(l==="WORKING KNOWLEDGE"?"l-WORKING":(l==="PRACTICING"?"l-PRACTICING":""));
        return `<span class="skill ${cls}">${n}<i>${l}</i></span>`;}).join("")}
      </div></div>`).join("");
}
function renderOps(){
  $("#opsGrid").innerHTML=HOLY_METHODOLOGY.map((m,i)=>`
    <button class="op reveal" data-op="${i}"><b>${m.n}</b><span>${m.title}</span></button>`).join("");
  $$("#opsGrid .op").forEach(b=>b.onclick=()=>openOps(+b.dataset.op));
}
function renderLabs(){
  $("#labGrid").innerHTML=HOLY_LABS.map((l,i)=>`
    <article class="card lab ${l.concept?"concept":""} reveal" data-lab="${i}" tabindex="0" role="button" aria-label="Open ${l.title}">
      <div class="idx">${l.index}${l.concept?" · CONCEPT":""}</div>
      <h3>${l.title}</h3><p><em style="color:var(--accent2)">${l.tagline}</em></p>
      ${l.category?`<div class="mono" style="font-size:10.5px;color:var(--muted);letter-spacing:.1em">${l.category}</div>`:""}
      <div class="tags">${l.focus.map(f=>`<span class="tag">${f}</span>`).join("")}</div>
      <div class="mono" style="font-size:11px;color:var(--accent)">OPEN CASE STUDY →</div>
    </article>`).join("");
  $$("#labGrid .lab").forEach(el=>{
    el.onclick=()=>openLab(+el.dataset.lab);
    el.onkeydown=e=>{if(e.key==="Enter")openLab(+el.dataset.lab);};
  });
}
function renderResearch(){
  const cls={"LEARNING":"st-LEARNING","DEEP DIVE":"st-DIVE","EXPERIMENT":"st-EXP","DOCUMENTED":"st-DOC"};
  $("#resGrid").innerHTML=HOLY_RESEARCH.map(r=>`
    <div class="card reveal"><small class="${cls[r.stage]||""}">${r.stage}</small>
    <h4 style="margin:12px 0 6px">${r.topic}</h4><p style="color:var(--muted);font-size:13.5px;margin:0">${r.note}</p></div>`).join("");
}
function renderNotes(){
  const badge=s=>s==="PUBLISHED"?`<span class="badge b-verified">✓ PUBLISHED</span>`:s==="DOCUMENTING"?`<span class="badge b-progress">◐ DOCUMENTING</span>`:`<span class="badge b-soon">⚡ SOON</span>`;
  $("#notesGrid").innerHTML=HOLY_WRITEUPS.map((w,i)=>`
    <article class="card note ${w.article?"clickable":""}" ${w.article?`data-note="${i}" tabindex="0" role="button" aria-label="Open ${w.title}"`:""}><div class="idx">${w.index}</div>
      <div class="track">${w.track}</div><h4>${w.title}</h4><p>${w.summary}</p>
      <div>${badge(w.status)}</div>
      ${w.article?'<div class="mono" style="font-size:11px;color:var(--accent);margin-top:10px;letter-spacing:.1em">OPEN NOTE →</div>':'<div class="mono" style="font-size:10.5px;color:var(--muted);margin-top:10px;letter-spacing:.1em">FULL NOTE PUBLISHING SOON</div>'}
    </article>`).join("");
  $$("#notesGrid .note[data-note]").forEach(el=>{
    el.onclick=()=>openNote(+el.dataset.note);
    el.onkeydown=e=>{if(e.key==="Enter")openNote(+el.dataset.note);};
  });
}
function openNote(i){
  const w=HOLY_WRITEUPS[i], body=(typeof HOLY_ARTICLES!=="undefined"&&HOLY_ARTICLES[w.article])||"<p>Article body missing.</p>";
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">${w.index} // ${w.track} · AUTHORIZED LAB / EDUCATIONAL</div>
  <h3 style="font-size:28px;margin:8px 0 4px">${w.title}</h3>
  <p style="color:var(--muted);font-size:14px">${w.summary}</p>${body}
  <br><button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button>`);
}
function renderQuotes(){
  $("#quotes").innerHTML=HOLY_QUOTES.length?HOLY_QUOTES.map(q=>`
    <figure class="quote reveal" style="margin:0"><p>"${q.quote}"</p>
    <cite>— ${q.name} · ${q.role}, ${q.org}</cite></figure>`).join(""):
    `<div class="quote-await reveal">◇ AWAITING FIRST RECOMMENDATION<br>Supervised Khalifa's work? Your words — with your permission — belong here.<br>Contact: ${HOLY_SOCIALS.emailLabel}</div>`;
}
function renderMind(){
  $("#mind").innerHTML=HOLY_MINDSET.map((t,i)=>`<div class="${i===6?"hl":""}">${t}</div>`).join("");
}

/* ---------- modals ---------- */
/* interactive quizzes — spot-the-vuln + security quiz */
const QUIZ_VULN=[
 {code:'query = "SELECT * FROM users WHERE id = \'" + user_input + "\'";',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:0,
  exp:"Untrusted input is concatenated straight into SQL. Parameterize queries — never build them with string glue."},
 {code:'commentBox.innerHTML = userComment; // render instantly, no sanitization',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:1,
  exp:"Attacker HTML/JS lands in a live DOM sink. Use textContent or sanitize — innerHTML with user data is a loaded gun."},
 {code:'GET /api/invoices/1024   →   change to /1025, no ownership check, data leaks',
  q:"What vulnerability is this?",opts:["SQL Injection","XSS","IDOR / BOLA","CSRF"],a:2,
  exp:"Object reference with no authorization check. Verify ownership server-side on every object access."}
];
const QUIZ_SEC=[
 {q:"Which CIA-triad property guarantees data is unaltered?",opts:["Confidentiality","Integrity","Availability","Authenticity"],a:1,exp:"Integrity = unaltered. Hashes and signatures enforce it."},
 {q:"First move on any new device or account?",opts:["Install themes","Change default credentials","Disable logging","Share access"],a:1,exp:"Defaults are public knowledge. Change them before anything else."},
 {q:"What does Nmap -sV do?",opts:["OS detection","Port knocking","Service/version detection","Packet crafting"],a:2,exp:"-sV probes open ports to fingerprint service names and versions."},
 {q:"Least privilege means…",opts:["Everyone gets admin","Minimum access to function","No passwords needed","Log everything"],a:1,exp:"Only the access required — nothing more. Shrinks blast radius."},
 {q:"Burp Repeater is for…",opts:["Auto-scanning","Manual request modification","Password cracking","Traffic shaping"],a:1,exp:"Craft, tweak and resend requests by hand. Understanding beats automation."},
 {q:"Phishing is primarily…",opts:["A firewall flaw","Social engineering","A malware family","A routing attack"],a:1,exp:"It hacks the human, not the machine. Verify sender, hover links."}
];
let quiz={set:null,i:0,score:0};
function quizRank(pct,top){
  if(pct>=1) return top;
  if(pct>=0.66) return quiz.set===QUIZ_VULN?"SHARP EYE":"OPERATOR";
  if(pct>=0.33) return quiz.set===QUIZ_VULN?"KEEP PRACTICING":"ANALYST TRAINEE";
  return "CURIOUS NEWBIE — keep learning";
}
function quizStart(set){quiz={set:set,i:0,score:0};quizRender();}
function quizRender(){
  const box=document.getElementById("quizBox"); if(!box) return;
  const Q=quiz.set[quiz.i];
  if(!Q){const pct=quiz.score/quiz.set.length;
    if(pct>=1) unlockAch("researcher","SECURITY RESEARCHER");
    box.innerHTML=`<div class="qprog">FINAL SCORE</div><div class="qscore">${quiz.score} / ${quiz.set.length}</div>
    <div class="qrank">RANK: ${quizRank(pct,"RED TEAM MATERIAL")}</div>
    <div class="btnrow" style="margin-top:16px"><button class="btn btn-p" id="qretry">RETRY →</button></div>`;
    document.getElementById("qretry").onclick=()=>quizStart(quiz.set); return;}
  box.innerHTML=`<div class="qprog">QUESTION ${quiz.i+1} / ${quiz.set.length} · SCORE ${quiz.score}</div>
  ${Q.code?`<pre class="qcode">${Q.code}</pre>`:""}
  <h4 class="qq">${Q.q}</h4>
  <div class="qopts">${Q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>
  <div class="qexp" hidden></div>`;
  box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const ok=+b.dataset.i===Q.a;
    box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.i===Q.a)x.classList.add("ok");});
    if(!ok) b.classList.add("no"); else quiz.score++;
    const ex=box.querySelector(".qexp"); ex.hidden=false;
    ex.innerHTML=`<b>${ok?"✓ CORRECT":"✗ NOT QUITE"}</b> — ${Q.exp}<br><br><button class="btn btn-p" id="qnext">${quiz.i+1>=quiz.set.length?"SEE SCORE":"NEXT →"}</button>`;
    document.getElementById("qnext").onclick=()=>{quiz.i++;quizRender();};
    box.querySelector(".qprog").textContent=`QUESTION ${quiz.i+1} / ${quiz.set.length} · SCORE ${quiz.score}`;
  });
}
function openModal(html){ $("#sheet").innerHTML=html; $("#modal").classList.add("open"); document.body.style.overflow="hidden"; }
function closeModal(){ $("#modal").classList.remove("open"); document.body.style.overflow=""; }
function openOps(i){
  const m=HOLY_METHODOLOGY[i];
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">${m.n} // SECURITY OPERATIONS</div>
  <h3 style="font-size:30px;margin:8px 0">${m.title}</h3>
  <div class="kv"><b>OBJECTIVE</b><span>${m.objective}</span></div>
  <div class="kv"><b>TOOLS</b><span>${m.tools}</span></div>
  <div class="kv"><b>KEY QUESTIONS</b><span>${m.questions}</span></div>
  <div class="kv"><b>METHODOLOGY</b><span>${m.methodology}</span></div>
  <div class="kv"><b>OUTPUT</b><span>${m.output}</span></div>
  <div class="kv"><b>DEFENSIVE VIEW</b><span>${m.defense}</span></div>
  <p class="ethics" style="margin-top:18px">All testing demonstrated through this portfolio is performed only against authorized, owned, intentionally vulnerable, or controlled environments.</p>
  <button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button>`);
}
function openLab(i){
  const l=HOLY_LABS[i];
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">${l.index} // AUTHORIZED LAB / EDUCATIONAL ENVIRONMENT</div>
  <h3 style="font-size:28px;margin:8px 0">${l.title}</h3>
  <p style="color:var(--accent2)"><em>${l.tagline}</em></p>
  ${l.category?`<div class="mono" style="font-size:11px;color:var(--muted)">${l.category}</div>`:""}
  <div class="kv"><b>OBJECTIVE</b><span>${l.objective}</span></div>
  <div class="kv"><b>ENVIRONMENT</b><span>${l.environment}</span></div>
  <div class="kv"><b>TOOLS</b><span>${l.tools}</span></div>
  <div class="kv"><b>METHODOLOGY</b><span>${l.methodology}</span></div>
  <div class="kv"><b>CHALLENGE</b><span>${l.challenge}</span></div>
  <div class="kv"><b>APPROACH</b><span>${l.approach}</span></div>
  <div class="kv"><b>RESULT</b><span>${l.result}</span></div>
  <div class="kv"><b>LESSONS</b><span>${l.lessons}</span></div>
  <div class="kv"><b>IMPROVEMENTS</b><span>${l.improvements}</span></div>
  <br><button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button>`);
}

/* ---------- resume ---------- */
function openResume(){
  const certs=HOLY_CERTS.map(c=>`${c.short} — ${c.name} [${c.status}]`).join("<br>");
  const exp=HOLY_EXPERIENCE.map(e=>`<b>${e.org}</b> · ${e.role} · ${e.type} · ${e.status}<br><span style="color:#445">${e.date} — ${e.location}</span><br>${e.description}<br><br>`).join("");
  const ars=HOLY_ARSENAL.map(g=>`<b>${g.category}:</b> ${g.items.map(x=>x[0]+" ("+x[1]+")").join(", ")}`).join("<br><br>");
  const res=HOLY_RESEARCH.map(r=>`${r.topic} [${r.stage}]`).join(" · ");
  openModal(`<div class="resume">
    <div class="mono" style="font-size:11px;letter-spacing:.2em;color:#A01025">HOLY // SECURITY PROFILE — DIGITAL RESUME (SIMULATION)</div>
    <h2>${HOLY_PROFILE.name}</h2><div class="mono" style="font-size:12px">${HOLY_PROFILE.realName} — working as ${HOLY_PROFILE.name}</div><div class="mono" style="font-size:12px">${HOLY_PROFILE.identity}</div>
    <p><em>"${HOLY_PROFILE.slogan}"</em><br>${HOLY_PROFILE.aboutSupport}</p>
    <h4>PROFILE</h4><p>Focus: ${HOLY_PROFILE.focus}<br>Specialization: ${HOLY_PROFILE.specialization}<br>Interests: ${HOLY_PROFILE.interests.join(", ")}<br>Mode: ${HOLY_PROFILE.modes.join(" · ")}<br>Open to: ${HOLY_PROFILE.openTo.join(", ")}</p>
    <h4>CERTIFICATIONS</h4><p>${certs}</p>
    <h4>TECHNICAL ARSENAL</h4><p>${ars}</p>
    <h4>EXPERIENCE</h4><p>${exp}</p>
    <h4>LABS</h4><p>${HOLY_LABS.map(l=>l.index+" — "+l.title).join("<br>")}</p>
    <h4>RESEARCH</h4><p>${res}</p>
    <h4>CONTACT</h4><p>${HOLY_SOCIALS.emailLabel}<br>GitHub: ${HOLY_SOCIALS.github}<br>LinkedIn: ${HOLY_SOCIALS.linkedin}</p>
  </div><br><div style="display:flex;gap:10px;flex-wrap:wrap">
  <button class="btn btn-p" id="printBtn">PRINT / SAVE PDF</button>
  <button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button></div>`);
  $("#printBtn").onclick=()=>window.print();
}

/* ---------- terminal ---------- */
const hist=[]; let hi=-1;
function tout(html){ const b=$("#tout"); b.insertAdjacentHTML("beforeend",html); b.parentElement.scrollTop=1e6; }
function runCmd(raw){
  const cmd=raw.trim(); if(!cmd) return;
  hist.push(cmd); hi=hist.length;
  try{const arr=JSON.parse(localStorage.getItem("holy_cmds")||"[]");
    const base=cmd.split(/\s+/)[0].toLowerCase();
    if(base&&!arr.includes(base)){arr.push(base);
      try{localStorage.setItem("holy_cmds",JSON.stringify(arr))}catch(e){}}
    unlockAch("term","TERMINAL ACCESS");
    if(arr.length>=5) unlockAch("recon","RECON COMPLETE");
  }catch(e){}
  tout(`<div class="term-line"><span class="prompt">$</span> ${escapeHtml(cmd)}</div>`);
  const c=cmd.toLowerCase();
  const out=(t)=>tout(`<div class="term-line" style="color:#9fb3c8">${t}</div>`);
  if(c==="help") out("commands: whoami · about · skills · certs · experience · projects · arsenal · status · contact · seals · achievements · flag · clear · sudo curiosity · sudo security<br><span style='color:var(--muted)'>whispers: the giant name likes attention ×3 · the midnight door keeps count · a flag sleeps in the page source</span>");
  else if(c==="whoami") out("HOLY<br>CYBERSECURITY<br>PENETRATION TESTING<br>SECURITY RESEARCH");
  else if(c==="about") out(escapeHtml(HOLY_PROFILE.heroSupport));
  else if(c==="skills") out(HOLY_ARSENAL.map(g=>g.category+": "+g.items.map(x=>x[0]).join(", ")).join("<br><br>"));
  else if(c==="certs") out(HOLY_CERTS.map(x=>`${x.short} — ${x.name} [${x.status}]`).join("<br>"));
  else if(c==="experience") out(HOLY_EXPERIENCE.map(e=>`${e.org} · ${e.type} · ${e.status}`).join("<br>"));
  else if(c==="projects"||c==="arsenal") out(HOLY_LABS.map(l=>`${l.index} — ${l.title}`).join("<br>"));
  else if(c==="status") out("SYSTEM ........ ONLINE<br>LAB ........... ACTIVE<br>RESEARCH ...... ACTIVE<br>MODE .......... AUTHORIZED (simulation)");
  else if(c==="contact") out(`github: ${HOLY_SOCIALS.github}<br>linkedin: ${HOLY_SOCIALS.linkedin}<br>email: ${HOLY_SOCIALS.emailLabel}`);
  else if(c==="redteam"){ redteam(); out("RED TEAM MODE engaged for 12s.<br>Watch the walls. (simulation)"); }
  else if(c==="breach"){ breachDrill(); out("Drill started. Watch the SOC log.<br>Every line is simulated."); }
  else if(c==="hack"){
    const seq=["[!] target acquired: visitor","[+] bypassing firewall… OK","[+] escalating privileges… OK","[+] downloading secrets… 100%"];
    seq.forEach((s,i)=>setTimeout(()=>tout(`<div class="term-line" style="color:#9fb3c8">${s}</div>`),500*(i+1)));
    setTimeout(hackPrank,500*(seq.length+1));
    return;
  }
  else if(c==="clear") $("#tout").innerHTML="";
  else if(c==="sudo root"){
    const s=seals(), n=["e1","e2","e3","e4"].filter(k=>s[k]).length;
    if(n>=4){ finale(); out("Elevating… watch closely. (simulation)"); }
    else out(`ACCESS DENIED — the midnight door demands 4 seals. (${n}/4)<br>Something here likes triple-clicks… old codes open red doors…<br>The ground remembers. Check 'seals'.`);
  }
  else if(c==="sudo curiosity") out('"Permission granted." — stay curious, stay authorized.');
  else if(c==="sudo security") out('"Security is not a command.<br>It\'s a process."<br><br><span style="color:var(--muted)">rumor: the midnight door knows its master… (root)</span>');
  else if(c==="seals"||c==="seals reset"){
    if(c==="seals reset"){try{localStorage.removeItem("holy_seals")}catch(e){}
      out("Seals shattered. The midnight door forgets you.");}
    else{const s=seals(), n=["e1","e2","e3","e4"].filter(k=>s[k]).length;
      out(`MIDNIGHT SEALS: ${"■".repeat(n)}${"□".repeat(4-n)} (${n}/4)<br>The midnight door opens only for the thorough.`);}
  }
/* terminal achievements (helpers live top-level — see seals section) */
  else if(c==="achievements"||c==="badges"){const a=getAch();
    out(Object.keys(ACH_LABELS).map(k=>`${a[k]?"✓":"□"} ${ACH_LABELS[k]}`).join("<br>")+
    "<br><span style='color:var(--muted)'>Use the terminal. Find the flag. Go midnight.</span>");
  }
  else if(c==="flag"){out("Usage: flag FLAG{...} — 5 flags sleep across this site (source files included).");}
  else if(c.startsWith("flag ")){const v=cmd.slice(5).trim();
    if(FLAGS[v]!==undefined){
      const f=foundFlags();
      if(!f.includes(v)){f.push(v);try{localStorage.setItem("holy_flags",JSON.stringify(f))}catch(e){}}
      unlockAch("first","FIRST FLAG");
      if(f.length>=5) unlockAch("flagc","FLAG CAPTURED");
      if(FLAGS[v]==="vault"){try{localStorage.setItem("holy_vault","1")}catch(e){}}
      out(`◉ FLAG ACCEPTED (${f.length}/5)${FLAGS[v]==="vault"?' — the vault is open: <a href="vault.html" style="color:var(--accent)">vault.html ↗</a>':" — keep hunting."}`);
    } else out("✗ Wrong flag. Dig deeper — page sources included.");
  }
  else if(c.startsWith("sudo")) out("sudo: this is a simulated terminal. Try 'sudo curiosity'.");
  else out(`command not found: ${escapeHtml(cmd)} — try 'help'`);
}
function escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

/* midnight seals — eggs 1-4 each grant one; egg 5 needs all four (persisted) */
function seals(){try{return JSON.parse(localStorage.getItem("holy_seals")||"{}")}catch(e){return{}}}
function setSeal(k){const s=seals(); if(s[k]) return; s[k]=1;
  try{localStorage.setItem("holy_seals",JSON.stringify(s))}catch(e){}
  toast("◉ SEAL ACQUIRED ("+Object.keys(s).length+"/4)");}
/* terminal achievements */
function getAch(){try{return JSON.parse(localStorage.getItem("holy_ach")||"{}")}catch(e){return{}}}
function unlockAch(k,label){const a=getAch(); if(a[k]) return; a[k]=1;
  try{localStorage.setItem("holy_ach",JSON.stringify(a))}catch(e){}
  toast("🏅 ACHIEVEMENT — "+label);}
const ACH_LABELS={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED"};

/* RED TEAM MODE — 12s site-wide alert pulse (simulation) */
let rtT=null;
function redteam(){
  document.body.classList.remove("redteam"); void document.body.offsetWidth;
  document.body.classList.add("redteam");
  toast("◉ RED TEAM MODE ENGAGED — simulation, 12s"); setSeal("e2");
  clearTimeout(rtT); rtT=setTimeout(()=>document.body.classList.remove("redteam"),12000);
}

/* synthesized two-tone siren — no audio files, created on user gesture */
let AC=null;
/* tiny synth — tones, sweeps, fanfares. No audio files. */
function tone(f,d,type,v,when){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    const t=AC.currentTime+(when||0);
    const o=AC.createOscillator(), g=AC.createGain();
    o.type=type||"square"; o.frequency.value=f;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v||.05,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+.05);
  }catch(e){}
}
function sweep(f0,f1,dur,when){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    const t=AC.currentTime+(when||0);
    const o=AC.createOscillator(), g=AC.createGain();
    o.type="sawtooth"; o.frequency.setValueAtTime(f0,t);
    o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(.045,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+.05);
  }catch(e){}
}
function siren(dur){
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    const o=AC.createOscillator(), g=AC.createGain();
    o.type="sawtooth"; o.frequency.value=520; g.gain.value=.04;
    o.connect(g); g.connect(AC.destination); o.start();
    const iv=setInterval(()=>{o.frequency.value=o.frequency.value>600?440:700;},380);
    setTimeout(()=>{clearInterval(iv); try{o.stop();}catch(e){}},dur||6500);
  }catch(e){}
}

/* INTRUSION DRILL — multi-stage fake incident (all fictional, auto-contained) */
function breachDrill(){
  if(document.querySelector(".drill")) return;
  document.body.classList.add("breach");
  toast("⚠ SIMULATED INTRUSION DRILL — all fictional"); setSeal("e3");
  siren(6500);
  const strobe=document.createElement("div"); strobe.className="strobe";
  const beacon=document.createElement("div"); beacon.className="beacon";
  document.body.append(strobe,beacon);
  // escalate visible metrics, restore afterwards
  const touched=[];
  document.querySelectorAll(".scell,.tcell").forEach(c=>{
    const k=c.querySelector("small"), v=c.querySelector("strong");
    if(!k||!v) return; const key=k.textContent.trim();
    if(key==="THREAT LEVEL"){touched.push([v,v.textContent,v.style.color]);v.textContent="HIGH";v.style.color="var(--crit)";}
    if(key==="ALERTS"){touched.push([v,v.textContent,v.style.color]);v.textContent="07";v.style.color="var(--crit)";}
  });
  const b=document.createElement("div"); b.className="drill";
  const msg="⚠ INTRUSION DRILL · SIMULATION · CONTAINMENT EXERCISE · ";
  b.innerHTML=`<span class="drill-in">${msg.repeat(6)}${msg.repeat(6)}</span>`;
  document.body.appendChild(b);
  requestAnimationFrame(()=>b.classList.add("show"));
  const lines=[["CRIT","Simulated C2 beacon (lab)"],["WARN","Isolating lab segment…"],
    ["INFO","Firewall rule staged (drill)"],["OK","Segment isolated"],
    ["OK","Drill contained — no real systems involved"]];
  lines.forEach((l,i)=>setTimeout(()=>{
    const el=document.getElementById("socLog"); if(!el) return;
    const t=new Date().toTimeString().slice(0,8);
    el.insertAdjacentHTML("afterbegin",`<div><b>${t}</b><span class="lv-${l[0]}">[${l[0]}]</span> ${l[1]} <span style="color:#3a4653">(drill)</span></div>`);
    while(el.children.length>8) el.lastChild.remove();
  },900*(i+1)));
  setTimeout(()=>{document.body.classList.remove("breach");
    touched.forEach(([v,t,col])=>{v.textContent=t;v.style.color=col;});
    strobe.remove(); beacon.remove();
    b.classList.remove("show"); setTimeout(()=>b.remove(),500);},7000);
}

/* fake-hack prank — "hacks" the visitor, then reveals the joke (always harmless) */
function hackPrank(){
  if(document.querySelector(".prank")) return;
  document.body.classList.add("hackflash"); setSeal("e4");
  setTimeout(()=>document.body.classList.remove("hackflash"),1100);
  const p=document.createElement("div"); p.className="prank";
  p.innerHTML=`<div><div class="prank-big"><span class="glitch" data-text="YOU HAVE BEEN HACKED">YOU HAVE BEEN HACKED</span></div><div class="prank-sub">SIMULATION · THIS IS A JOKE · BREATHE</div></div>`;
  document.body.appendChild(p);
  setTimeout(()=>{
    p.innerHTML=`<div class="prank-ok"><h3>✓ SIMULATED</h3><p>…by your own curiosity. No systems were harmed.<br>Nothing was accessed, nothing was taken.<br>Curiosity looks good on you. Stay authorized.<br><br>Click anywhere to close.</p></div>`;
  },2600);
  let gone=false;
  const kill=()=>{ if(gone) return; gone=true; p.classList.add("out"); setTimeout(()=>p.remove(),400); };
  p.addEventListener("click",kill); setTimeout(kill,7000);
}

/* engagement workflow + document previews */
function openWorkflow(){
  const steps=[
    ["01 CONTACT","You describe the need — scope guess, timeline, concerns."],
    ["02 SCOPING","Targets, exclusions, timing and constraints agreed in writing."],
    ["03 AUTHORIZATION","Signed rules of engagement. No signature, no test. Ever."],
    ["04 TESTING","Methodical work inside the authorized scope only."],
    ["05 REPORTING","Severity-ranked findings with evidence + remediation."],
    ["06 RETEST","Fixes verified within the agreed window."],
    ["07 INVOICE","Billed against the engagement and authorization refs."],
  ];
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">ENGAGEMENT WORKFLOW // AUTHORIZATION IS NEVER OPTIONAL</div>
  <h3 style="font-size:28px;margin:8px 0">How an Engagement Runs</h3>
  ${steps.map(s=>`<div class="kv"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("")}
  <br><button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button>`);
}
function openSample(){
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">SAMPLE // ALL FINDINGS FICTIONAL — LAB.LOCAL</div>
  <h3 style="font-size:28px;margin:8px 0">Pentest Report Sample</h3>
  <div class="article"><table><tr><th>ID</th><th>Finding (example)</th><th>Severity</th></tr>
  <tr><td>F-01</td><td>Missing security headers</td><td>Low</td></tr>
  <tr><td>F-02</td><td>Verbose error messages</td><td>Medium</td></tr>
  <tr><td>F-03</td><td>Weak lab password policy</td><td>High</td></tr></table>
  <p>Each finding ships with observation, impact, remediation and evidence. Full structure — scope, ROE, executive summary, methodology — is in the downloadable file.</p></div>
  <div class="btnrow"><a class="btn btn-p" href="assets/pentest-report-sample.md" download>⤓ DOWNLOAD FULL .MD</a>
  <button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button></div>`);
}
function openInvoice(){
  openModal(`<div class="mono" style="font-size:11px;color:var(--accent);letter-spacing:.2em">TEMPLATE // BLANK — FILL BEFORE USE</div>
  <h3 style="font-size:28px;margin:8px 0">Invoice Template</h3>
  <div class="article"><p>Sections: bill-to, engagement + authorization refs, testing period, line items, totals, payment terms, retest window. Every value is a <code>[BRACKETED]</code> placeholder — nothing filled, nothing implied.</p></div>
  <div class="btnrow"><a class="btn btn-p" href="assets/invoice-template.md" download>⤓ DOWNLOAD .MD</a>
  <button class="btn btn-g" onclick="document.getElementById('modal').classList.remove('open');document.body.style.overflow=''">CLOSE</button></div>`);
}

/* low dread-drone: deep thump loop for scary sequences */
function thump(dur){const iv=setInterval(()=>tone(52,.35,"sine",.09),480);setTimeout(()=>clearInterval(iv),dur);}
/* OPERATION MIDNIGHT — the ultimate egg: blackout boot → golden HOLY MODE */
function finale(){
  if(document.querySelector(".finale")) return;
  const f=document.createElement("div"); f.className="finale";
  f.innerHTML=`<div class="fin-box"><div class="mono fin-k">OPERATION MIDNIGHT // ULTIMATE EGG</div><div class="fin-log"></div><div class="fin-bar"><i></i></div></div>`;
  document.body.appendChild(f);
  f.classList.add("flick"); thump(5600);
  const log=f.querySelector(".fin-log"), bar=f.querySelector(".fin-bar i");
  const lines=["$ sudo root --force","[sudo] credentials harvested …",
    "[+] disabling tripwires …","[+] dumping credential store …",
    "[+] routing through 14 exit nodes …","[+] wiping footprints …"];
  lines.forEach((l,i)=>setTimeout(()=>{
    log.innerHTML+=l+"<br>"; bar.style.width=((i+1)/(lines.length+1)*100)+"%";
    tone(220+i*40,.09,"sawtooth",.05);
  },650*(i+1)));
  const lastLine=650*lines.length+1600;
  setTimeout(()=>{
    log.innerHTML+="⚠ COUNTER-TRACE DETECTED<br>";
    let n=10;
    const iv=setInterval(()=>{
      log.innerHTML+=`&gt; trace distance: ${n} hops<br>`;
      tone(300+(10-n)*110,.09,"sawtooth",.05); n--;
      if(n<0){clearInterval(iv);
        log.innerHTML+="TRACE TERMINATED — ghost protocol. You were never here.<br>";}
    },130);
  },lastLine-1400);
  setTimeout(()=>{ sweep(200,1400,1.0); },lastLine+150);
  setTimeout(()=>{
    log.innerHTML+="ROOT ACCESS GRANTED — welcome back, operator.<br>";
    bar.style.width="100%";
    [523,659,784,1046].forEach((fr,i)=>tone(fr,.24,"triangle",.06,i*.13));
    const fl=document.createElement("div"); fl.className="fin-flash";
    f.appendChild(fl); setTimeout(()=>fl.remove(),600);
    document.body.classList.add("grant");
    setTimeout(()=>document.body.classList.remove("grant"),900);
  },lastLine+1150);
  setTimeout(()=>{
    f.querySelector(".fin-box").style.display="none";
    const st=document.createElement("div"); st.className="fin-stamp";
    st.innerHTML=`<h2>ROOT ACCESS</h2><div>HOLY MODE ENGAGING // 20-SECOND CLEARANCE</div>`;
    f.appendChild(st);
    tone(1568,.4,"sine",.05);
  },lastLine+1350);
  setTimeout(()=>{
    f.classList.add("out"); setTimeout(()=>f.remove(),500);
    document.body.classList.add("gold"); unlockAch("root","ROOT ACCESS");
    toast("◉ HOLY MODE — golden clearance, 20s");
    embers(20000);
    const pill=document.createElement("div"); pill.className="gold-pill";
    document.body.appendChild(pill);
    let left=20; pill.textContent="◉ HOLY MODE // 0:"+left;
    const iv=setInterval(()=>{
      left--; if(left<=0){clearInterval(iv);return;}
      pill.textContent="◉ HOLY MODE // 0:"+String(left).padStart(2,"0");
    },1000);
    setTimeout(()=>{
      document.body.classList.remove("gold"); pill.remove();
      tone(660,.2,"square",.05); tone(440,.35,"square",.05,.22);
      toast("Session expired. Back to red.");
    },20000);
  },lastLine+3700);
}
function embers(ms){
  const cv=document.createElement("canvas"); cv.className="embers";
  document.body.appendChild(cv);
  const ctx=cv.getContext("2d"); let dead=false;
  let W,H; function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
  size(); addEventListener("resize",size);
  const P=Array(70).fill(0).map(()=>({x:Math.random()*W,y:innerHeight+Math.random()*200,
    s:1+Math.random()*2.4,v:.4+Math.random()*1.2,a:.3+Math.random()*.6,ph:Math.random()*6}));
  const t0=performance.now();
  (function tick(t){
    if(dead) return;
    ctx.clearRect(0,0,W,H);
    P.forEach(p=>{p.y-=p.v; p.x+=Math.sin(t/900+p.ph)*.4;
      if(p.y<-10){p.y=H+10;p.x=Math.random()*W;}
      ctx.globalAlpha=p.a*(.6+.4*Math.sin(t/200+p.ph));
      ctx.fillStyle=Math.random()>.5?"#ffb020":"#ff3355";
      ctx.fillRect(p.x,p.y,p.s,p.s);});
    if(t-t0<ms) requestAnimationFrame(tick);
    else{dead=true;removeEventListener("resize",size);cv.remove();}
  })(0);
}

/* ---------- SOC sim ---------- */
const LOGS=[
  ["12:41:02","INFO","Lab environment initialized"],
  ["12:41:09","INFO","Network baseline established"],
  ["12:41:16","WARN","Simulated suspicious request"],
  ["12:41:20","INFO","Request analyzed"],
  ["12:41:25","OK","Event contained"],
  ["12:41:31","INFO","Endpoint heartbeat verified (08/08)"],
  ["12:41:38","INFO","DNS baseline nominal"],
  ["12:41:44","WARN","Simulated brute-force pattern (lab)"],
  ["12:41:50","OK","Pattern blocked + logged"],
];
function drawSpark(id,seed,color){
  const cv=document.getElementById(id); if(!cv) return;
  const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth||300, h=90;
  cv.width=w*dpr; cv.height=h*dpr;
  const x=cv.getContext("2d"); x.scale(dpr,dpr);
  x.clearRect(0,0,w,h); x.strokeStyle=color; x.lineWidth=1.6; x.beginPath();
  let v=seed;
  for(let i=0;i<=60;i++){ v=(v*9301+49297)%233280; const y=h/2+Math.sin(i/5+seed)*18*((v/233280)-.3);
    i?x.lineTo(i/60*w,y):x.moveTo(0,y); }
  x.stroke();
  x.lineTo(w,h); x.lineTo(0,h); x.closePath();
  const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,color.replace("1)",".25)")); g.addColorStop(1,color.replace("1)","0)"));
  x.fillStyle=g; x.fill();
}
function tickSoc(){
  const el=$("#socLog"); if(!el) return;
  const l=LOGS[Math.floor(Math.random()*LOGS.length)];
  const t=new Date().toTimeString().slice(0,8);
  el.insertAdjacentHTML("afterbegin",`<div><b>${t}</b><span class="lv-${l[1]}">[${l[1]}]</span> ${l[2]} <span style="color:#3a4653">(simulated)</span></div>`);
  while(el.children.length>8) el.lastChild.remove();
  const pk=$("#mPackets"); if(pk){ const n=parseInt(pk.textContent.replace(/,/g,""))||12842; pk.textContent=(n+Math.floor(Math.random()*17)).toLocaleString(); }
}

/* ---------- command palette ---------- */
const PAL=[
  ["About","Who is Holy","#about"],["Credentials","Certification roadmap","#credentials"],
  ["Experience","Industry exposure","#experience"],["Arsenal","Skill matrix","#arsenal"],
  ["Operations","Pentest methodology","#operations"],["SOC","Operations center","#soc"],
  ["Lab","Case studies","#lab"],["Notes","Field write-ups","#notes"],["Reports","Samples & workflow","#reports"],["Toolkit","Browser utilities","#toolkit"],["Challenge","Daily + mini-CTF","#challenge"],["Research","Currently exploring","#research"],
  ["Terminal","Interactive console","#terminal"],["Contact","Let's talk","#contact"],
];
let palSel=0;
function openPal(){ $("#pal").classList.add("open"); $("#palInput").value=""; palList(""); setTimeout(()=>$("#palInput").focus(),30); }
function closePal(){ $("#pal").classList.remove("open"); }
function palList(q){
  const f=PAL.filter(p=>(p[0]+p[1]).toLowerCase().includes(q.toLowerCase()));
  $("#palList").innerHTML=f.map((p,i)=>`<button data-t="${p[2]}" class="${i===palSel?"sel":""}"><small>→</small><b>${p[0]}</b><small>${p[1]}</small></button>`).join("")||`<div style="padding:16px;color:var(--muted)" class="mono">no match</div>`;
  $$("#palList button").forEach(b=>b.onclick=()=>{closePal();document.querySelector(b.dataset.t)?.scrollIntoView({behavior:"smooth"});});
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  // entry sequence — hack-style login, skippable
  const intro=document.getElementById("intro");
  function introDone(){ if(!document.getElementById("intro")) return;
    intro.classList.add("out"); document.body.classList.add("ready");
    document.body.style.overflow=""; setTimeout(()=>intro.remove(),650); }
  if(intro){
    document.body.style.overflow="hidden";
    const ilog=document.getElementById("introLog"), ibar=document.getElementById("introBar");
    const blines=["$ initiating secure channel…","[+] handshake accepted",
      "[+] verifying clearance…","[+] loading security profile: KHALIFA",
      "[+] channel encrypted — identify yourself, operator."];
    blines.forEach((l,i)=>setTimeout(()=>{
      if(!document.getElementById("intro")) return;
      ilog.innerHTML+=l+"<br>"; ibar.style.width=((i+1)/blines.length*100)+"%";
      tone(500+i*60,.06,"square",.03);
    },650*(i+1)));
    setTimeout(()=>{ if(!document.getElementById("intro")) return;
      document.getElementById("introForm").hidden=false;
      document.getElementById("introIn").focus(); },650*blines.length+300);
    document.getElementById("introForm").addEventListener("submit",e=>{
      e.preventDefault();
      document.getElementById("introForm").hidden=true;
      const g=document.getElementById("introGrant"); g.hidden=false;
      tone(880,.3,"triangle",.05);
      setTimeout(()=>{ if(!document.getElementById("intro")) return;
        g.hidden=true; document.getElementById("introWel").hidden=false;
        [523,659,784,1046].forEach((fr,i)=>tone(fr,.22,"triangle",.05,i*.12));
        setTimeout(introDone,2200);
      },1300);
    });
    document.getElementById("introSkip").onclick=introDone;
    addEventListener("keydown",function esck(e){
      if(e.key==="Escape") introDone(); });
  } else { document.body.classList.add("ready"); }

  renderCerts(); renderRoad(); renderExp(); renderArsenal(); renderOps(); renderLabs(); renderResearch(); renderMind(); renderNotes(); renderQuotes();
  $$(".avail-fill").forEach(el=>el.textContent=HOLY_PROFILE.openTo.join(" · "));
  $("#year").textContent=new Date().getFullYear();
  $("#ghBtn").href=HOLY_SOCIALS.github; $("#liBtn").href=HOLY_SOCIALS.linkedin; $("#mailBtn").href=HOLY_SOCIALS.email;
  $("#ghBtn2").href=HOLY_SOCIALS.github; $("#liBtn2").href=HOLY_SOCIALS.linkedin;

  // reveal on scroll
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target);}}),{threshold:.12});
  $$(".reveal,.rstep,.mind div").forEach(el=>io.observe(el));
  // re-observe dynamically added
  const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io2.unobserve(e.target);}}),{threshold:.1});
  $$("#credGrid .reveal,#arsGrid .reveal,#opsGrid .reveal,#labGrid .reveal,#resGrid .reveal,#expList .reveal,#notesGrid .reveal,#quotes .reveal").forEach(el=>io2.observe(el));

  // nav active
  const secs=["home","about","credentials","experience","arsenal","lab","research","contact"];
  addEventListener("scroll",()=>{
    let cur="home";
    secs.forEach(id=>{const s=document.getElementById(id); if(s&&scrollY>s.offsetTop-220) cur=id;});
    $$(".links a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+cur));
  },{passive:true});

  // mobile menu
  $("#burger").onclick=()=>$("#mmenu").classList.add("open");
  $("#mclose").onclick=()=>$("#mmenu").classList.remove("open");
  $$("#mmenu a.big").forEach(a=>a.onclick=()=>$("#mmenu").classList.remove("open"));

  // modal close
  $("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal();});
  $("#mclose2").onclick=closeModal;
  addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closePal();}});

  // resume
  $("#resumeBtn").onclick=openResume; $("#resumeBtn2").onclick=openResume;

  // easter egg 2: konami code → RED TEAM MODE
  const KON=["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
  let kpos=0;
  addEventListener("keydown",e=>{
    if(e.target&&e.target.id==="tinput") return;
    const k=e.key.toLowerCase();
    kpos=(k===KON[kpos])?kpos+1:(k===KON[0]?1:0);
    if(kpos===KON.length){kpos=0;redteam();}
  });

  // easter egg 3: triple-click the SOC ALERTS cell → intrusion drill
  const ac=document.getElementById("alertCell");
  if(ac){ let n=0,tm=null; ac.style.cursor="pointer"; ac.title="restless. it counts in threes.";
    ac.addEventListener("click",()=>{ n++; clearTimeout(tm); tm=setTimeout(()=>n=0,2000);
      if(n>=3){ n=0; breachDrill(); } }); }

  // easter egg 4: triple-click the footer brand → fake-hack prank
  const fb=document.getElementById("footBrand");
  if(fb){ let m=0,tm2=null; fb.style.cursor="pointer"; fb.title="the ground remembers.";
    fb.addEventListener("click",()=>{ m++; clearTimeout(tm2); tm2=setTimeout(()=>m=0,2000);
      if(m>=3){ m=0; hackPrank(); } }); }

  // easter egg 1: triple-click the giant HOLY (within 2s)
  const giant=document.querySelector("h1.giant");
  if(giant){
    giant.style.cursor="pointer"; giant.title="psst… click 3 times";
    let clicks=0, timer=null;
    giant.addEventListener("click",()=>{
      clicks++; clearTimeout(timer); timer=setTimeout(()=>clicks=0,2000);
      if(clicks>=3){ clicks=0; eggBurst(); }
    });
  }
  function eggBurst(){
    if(document.querySelector(".egg")) return; setSeal("e1");
    const d=document.createElement("div");
    d.className="egg";
    d.innerHTML=`<canvas class="egg-canvas"></canvas><div class="egg-ring"></div><div class="egg-stamp"><div class="mono egg-k">◉ ACCESS GRANTED</div><div class="egg-t"><span class="glitch" data-text="CURIOSITY PROTOCOL">CURIOSITY PROTOCOL</span><br><span class="glitch" data-text="ENGAGED">ENGAGED</span></div><div class="mono egg-s">3/3 — you think like an attacker.<br>Stay authorized. Click anywhere to dismiss.</div></div>`;
    document.body.appendChild(d);
    // falling code rain (red, easter-egg only)
    const cv=d.querySelector(".egg-canvas"), ctx=cv.getContext("2d");
    const chars="01ABCDEF$#/*<>+|0123456789";
    let W,H,drops,raf=0,dead=false;
    function size(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;
      const n=Math.max(1,Math.floor(W/18));drops=Array(n).fill(0).map(()=>Math.random()*-40);}
    size(); addEventListener("resize",size);
    ctx.font="15px monospace";
    (function tick(){
      if(dead) return;
      ctx.fillStyle="rgba(3,5,8,.12)"; ctx.fillRect(0,0,W,H);
      drops.forEach((y,i)=>{
        ctx.globalAlpha=.22+Math.random()*.6; ctx.fillStyle="#ff3355";
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*18,y*18);
        if(Math.random()>.985){ctx.fillStyle="#fff";ctx.globalAlpha=.9;
          ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*18,y*18);}
        drops[i]=y*18>H&&Math.random()>.975?0:y+.6;
      });
      ctx.globalAlpha=1; raf=requestAnimationFrame(tick);
    })();
    let gone=false;
    function kill(){ if(gone) return; gone=true; dead=true;
      cancelAnimationFrame(raf); removeEventListener("resize",size); d.remove(); }
    d.addEventListener("click",kill);
    setTimeout(()=>{d.classList.add("out"); setTimeout(kill,400);},4200);
  }

  // terminal
  const inp=$("#tinput");
  tout(`<div class="term-line" style="color:var(--accent)">HOLY // secure shell (simulation) — type 'help'</div>`);
  $("#termForm").addEventListener("submit",e=>{e.preventDefault();runCmd(inp.value);inp.value="";inp.focus();});
  inp.addEventListener("keydown",e=>{
    if(e.key==="ArrowUp"){e.preventDefault();if(hi>0){hi--;inp.value=hist[hi]||"";}}
    if(e.key==="ArrowDown"){e.preventDefault();if(hi<hist.length-1){hi++;inp.value=hist[hi];}else{hi=hist.length;inp.value="";}}
    if(e.key==="Tab"){e.preventDefault();
      const cmds=["help","whoami","about","skills","certs","experience","projects","arsenal","status","contact","clear"];
      const m=cmds.find(c=>c.startsWith(inp.value.toLowerCase()));
      if(m)inp.value=m;}
  });
  $$("[data-cmd]").forEach(b=>b.onclick=()=>{inp.value=b.dataset.cmd;runCmd(b.dataset.cmd);document.getElementById("terminal").scrollIntoView({behavior:"smooth"});});

  // palette
  $("#palBtn").onclick=openPal;

  // language + pgp
  let initLang="en"; try{initLang=localStorage.getItem("holy_lang")||"en"}catch(e){}
  applyLang(initLang);
  $("#langBtn").onclick=()=>applyLang(holyLang==="ar"?"en":"ar");
  renderPgp();
  $("#repView").onclick=openSample; $("#wfOpen").onclick=openWorkflow; $("#invView").onclick=openInvoice;
  const tV=$("#tabVuln"), tS=$("#tabSec");
  const tL=document.createElement("button");
  tL.className="btn btn-g"; tL.textContent="VULN LAB";
  const paintTabs=which=>{tV.className="btn "+(which==="vuln"?"btn-p":"btn-g");
    tS.className="btn "+(which==="sec"?"btn-p":"btn-g");
    tL.className="btn "+(which==="lab"?"btn-p":"btn-g");};
  tV.onclick=()=>{paintTabs("vuln");quizStart(QUIZ_VULN);};
  tS.onclick=()=>{paintTabs("sec");quizStart(QUIZ_SEC);};
  tL.onclick=()=>{paintTabs("lab");renderVulnLab();};
  document.querySelector("#quiz .btnrow").appendChild(tL);
  quizStart(QUIZ_VULN);
  $$("#toolTabs .btn").forEach(b=>b.onclick=()=>renderTool(b.dataset.tool));
  renderTool("hash"); renderDaily(); renderCtf();
  $("#vcfBtn").onclick=downloadVcf;
  $("#recBtn").onclick=()=>setRecruiter(true);
  $("#recExit").onclick=()=>setRecruiter(false);
  let rec="0"; try{rec=localStorage.getItem("holy_rec")||"0"}catch(e){}
  if(rec==="1") document.body.classList.add("recruiter");
  $("#pgpCopy").onclick=copyPgp;
  $("#pgpShow").onclick=()=>{
    const el=document.getElementById("pgpKey"), hid=el.hidden;
    el.hidden=!hid;
    document.getElementById("pgpShow").textContent=hid?"HIDE PUBLIC KEY":"VIEW PUBLIC KEY";
    if(hid) el.scrollIntoView({behavior:"smooth",block:"nearest"});
  };
  $("#pgpDl").onclick=()=>{
    const t=(typeof HOLY_PGP!=="undefined")?HOLY_PGP.trim():""; if(!t) return;
    const b=new Blob([t],{type:"text/plain"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(b);
    a.download="HVoid9-protonme-publickey.asc"; a.click();
    unlockAch("pgp","PGP VERIFIED");
    setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    toast("Public key downloaded.");
  };
  $("#pgpFpBtn").onclick=()=>{
    const fp=(typeof HOLY_PGP_FP!=="undefined")?HOLY_PGP_FP:"";
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(fp).then(()=>toast("Fingerprint copied — verify before trusting."));}
    else toast(fp);
  };
  $("#palInput").addEventListener("input",e=>{palSel=0;palList(e.target.value);});
  $("#palInput").addEventListener("keydown",e=>{
    const items=$$("#palList button");
    if(e.key==="ArrowDown"){e.preventDefault();palSel=Math.min(palSel+1,items.length-1);palList($("#palInput").value);}
    if(e.key==="ArrowUp"){e.preventDefault();palSel=Math.max(palSel-1,0);palList($("#palInput").value);}
    if(e.key==="Enter"){e.preventDefault();items[palSel]?.click();}
  });
  $("#pal").addEventListener("click",e=>{if(e.target.id==="pal")closePal();});
  addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPal();}});

  // contact form → delivered to HVoid9@proton.me via FormSubmit (AJAX, mailto fallback)
  $("#cform").addEventListener("submit",e=>{
    e.preventDefault();
    const form=e.target, btn=form.querySelector("button[type=submit]");
    const n=$("#cname").value.trim(), m=$("#cemail").value.trim(), t=$("#cmsg").value.trim();
    if(!n||!m||!t) return;
    btn.disabled=true; const old=btn.textContent; btn.textContent="SENDING…";
    fetch("https://formsubmit.co/ajax/HVoid9@proton.me",{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({name:n,email:m,message:t,_subject:"Portfolio contact — "+n})
    }).then(r=>{ if(!r.ok) throw 0;
      toast("Message sent — Holy will reply soon."); form.reset();
    }).catch(()=>{
      location.href=`mailto:HVoid9@proton.me?subject=${encodeURIComponent("Portfolio contact — "+n)}&body=${encodeURIComponent(t+"\n\n— "+n+" ("+m+")")}`;
      toast("Direct send failed — opening your email app instead.");
    }).finally(()=>{btn.disabled=false; btn.textContent=old;});
  });

  // pentest phase ticker (duplicated for seamless loop)
  const phases=HOLY_METHODOLOGY.map(m=>` <b>${m.n}</b> ${m.title} <span style="color:var(--accent)">→</span>`).join(" · ");
  $("#ticker").innerHTML=`&nbsp;SCOPE: AUTHORIZED LAB ONLY · ROE: OWNED TARGETS · ${phases} · <b>∞</b> CONTINUOUS RESEARCH · ${phases} · `;

  // charts + soc loop
  function charts(){ drawSpark("spark1",7,"rgba(255,51,85,1)"); drawSpark("spark2",21,"rgba(0,255,163,1)"); }
  charts(); addEventListener("resize",charts);
  if(!reduced) setInterval(tickSoc,3200);

  // packet counter
  if(!reduced) setInterval(()=>{const p=$("#hPackets"); if(p)p.textContent=(parseInt(p.textContent.replace(/,/g,""))+Math.floor(Math.random()*23)).toLocaleString();},2000);
});
function toast(t){ const el=document.getElementById("toast"); el.textContent=t; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2600); }

/* Arabic chrome — technical body copy stays English by design */
/* ---- flags (5 hidden) + toolkit + vuln lab + daily + mini-ctf + vcf + recruiter ---- */
const FLAGS={"FLAG{H0LY_v4ult_hunt3r}":"vault","FLAG{CSS_sp3ctre}":null,"FLAG{c0nf1g_r34d3r}":null,"FLAG{404_gh0st}":null,"FLAG{d1scl0sur3_p34c3}":null};
function foundFlags(){try{return JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){return[]}}

const VULNLAB=[
 {t:"Cross-Site Scripting (XSS)",v:"Untrusted input lands in innerHTML with no encoding.",c:"Attacker markup executes in the victim's session.",i:"Session theft, defacement, actions performed as the victim.",f:"Output-encode by context; prefer textContent; enforce Content-Security-Policy."},
 {t:"SQL Injection (SQLi)",v:"User input concatenated directly into SQL strings.",c:"Crafted input alters query logic or stacks commands.",i:"Data theft, authentication bypass, sometimes RCE.",f:"Parameterized queries; least-privilege database accounts."},
 {t:"Insecure Direct Object Reference (IDOR)",v:"Object IDs accepted with no ownership check.",c:"Swap IDs to reach other users' objects.",i:"Exposure or modification of someone else's data.",f:"Server-side authorization on every single object access."},
 {t:"Cross-Site Request Forgery (CSRF)",v:"State-changing requests without anti-CSRF tokens.",c:"Victim's browser fires forged requests carrying cookies.",i:"Unwanted actions executed as the victim.",f:"POST + per-session tokens, SameSite cookies, re-auth for sensitive acts."},
 {t:"Authentication Flaws",v:"No rate limiting, verbose errors, weak lockout.",c:"Credential stuffing plus user enumeration at scale.",i:"Account takeover, one inbox at a time.",f:"Rate limits, generic errors, MFA, breach-corpus password checks."}
];
function renderVulnLab(){
  const box=document.getElementById("quizBox"); if(!box) return;
  box.innerHTML=`<div class="qprog">CONCEPT LAB // READ-ONLY — AUTHORIZED LABS ONLY</div>`+
  VULNLAB.map(v=>`<div class="card" style="margin-bottom:12px"><h4 class="qq" style="margin-top:0">${v.t}</h4>
  <div class="kv"><b>VULNERABILITY</b><span>${v.v}</span></div>
  <div class="kv"><b>EXPLOIT CONCEPT</b><span>${v.c}</span></div>
  <div class="kv"><b>IMPACT</b><span>${v.i}</span></div>
  <div class="kv"><b>FIX</b><span>${v.f}</span></div></div>`).join("");
}

function toolOut(t){const o=document.getElementById("toolOut"); if(o) o.textContent=t;}
async function doHash(alg){
  const v=(document.getElementById("tin")||{}).value||"";
  try{const b=await crypto.subtle.digest(alg,new TextEncoder().encode(v));
    toolOut([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""));
  }catch(e){toolOut("Hashing unavailable in this browser context.");}
}
function b64u(s){s=s.replace(/-/g,"+").replace(/_/g,"/");while(s.length%4)s+="=";return decodeURIComponent(escape(atob(s)));}
function renderTool(name){
  const box=document.getElementById("toolBox"); if(!box) return;
  $$("#toolTabs .btn").forEach(b=>{b.className="btn "+(b.dataset.tool===name?"btn-p":"btn-g");});
  if(name==="hash") box.innerHTML=`<div class="tlab">INPUT TEXT</div>
    <input class="tfield" id="tin" placeholder="type here…" autocomplete="off">
    <div class="btnrow"><button class="btn btn-p" onclick="doHash('SHA-256')">SHA-256</button>
    <button class="btn btn-g" onclick="doHash('SHA-512')">SHA-512</button>
    <button class="btn btn-g" onclick="doHash('SHA-1')">SHA-1</button></div>
    <div class="tout2" id="toolOut">hash appears here — computed locally</div>`;
  if(name==="b64") box.innerHTML=`<div class="tlab">TEXT / BASE64</div>
    <textarea class="tfield" id="tin2" placeholder="paste here…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bEnc">ENCODE →</button>
    <button class="btn btn-g" id="bDec">DECODE →</button></div>
    <div class="tout2" id="toolOut">result appears here</div>`;
  if(name==="url") box.innerHTML=`<div class="tlab">TEXT / URL-ENCODED</div>
    <textarea class="tfield" id="tin2" placeholder="paste here…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bEnc">ENCODE →</button>
    <button class="btn btn-g" id="bDec">DECODE →</button></div>
    <div class="tout2" id="toolOut">result appears here</div>`;
  if(name==="jwt") box.innerHTML=`<div class="tlab">PASTE JWT (decoded locally, never sent)</div>
    <textarea class="tfield" id="tin2" placeholder="eyJhbGciOi…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bGo">INSPECT →</button></div>
    <div class="tout2" id="toolOut">header + payload appear here</div>`;
  if(name==="time") box.innerHTML=`<div class="tlab">UNIX TIMESTAMP (SECONDS)</div>
    <input class="tfield" id="tinE" placeholder="1700000000" inputmode="numeric">
    <div class="tlab">ISO DATETIME</div>
    <input class="tfield" id="tinI" placeholder="2025-01-01T00:00:00Z">
    <div class="btnrow"><button class="btn btn-p" id="bE2I">EPOCH → ISO</button>
    <button class="btn btn-g" id="bI2E">ISO → EPOCH</button>
    <button class="btn btn-t" id="bNow">NOW</button></div>
    <div class="tout2" id="toolOut">converted value appears here</div>`;
  if(name==="regex") box.innerHTML=`<div class="tlab">PATTERN</div>
    <input class="tfield" id="tinP" placeholder="FLAG\\{[a-z]+_[0-9]+\\}">
    <div class="tlab">FLAGS (default g)</div>
    <input class="tfield" id="tinF" placeholder="g" autocomplete="off">
    <div class="tlab">TEST STRING</div>
    <textarea class="tfield" id="tin2" placeholder="paste text…"></textarea>
    <div class="btnrow"><button class="btn btn-p" id="bGo">TEST →</button></div>
    <div class="tout2" id="toolOut">matches appear here</div>`;
  const enc=document.getElementById("bEnc"), dec=document.getElementById("bDec"),
        go=document.getElementById("bGo"), inp=document.getElementById("tin2");
  if(enc) enc.onclick=()=>{
    const v=inp.value;
    try{toolOut(name==="b64"?btoa(unescape(encodeURIComponent(v))):encodeURIComponent(v));}
    catch(e){toolOut("Cannot encode this input.");}};
  if(dec) dec.onclick=()=>{
    const v=inp.value.trim();
    try{toolOut(name==="b64"?decodeURIComponent(escape(atob(v))):decodeURIComponent(v));}
    catch(e){toolOut("Invalid "+(name==="b64"?"Base64":"URL-encoded")+" input.");}};
  if(go&&name==="jwt") go.onclick=()=>{
    try{const p=inp.value.trim().split(".");
      if(p.length!==3) throw 0;
      toolOut("HEADER:\n"+JSON.stringify(JSON.parse(b64u(p[0])),null,2)+
        "\n\nPAYLOAD:\n"+JSON.stringify(JSON.parse(b64u(p[1])),null,2)+
        "\n\nSIGNATURE: present ("+p[2].length+" chars) — verify server-side, never trust client-side.");
    }catch(e){toolOut("Invalid JWT — need header.payload.signature");}};
  if(go&&name==="regex") go.onclick=()=>{
    const p=document.getElementById("tinP").value, fl=document.getElementById("tinF").value||"g";
    try{const m=[...inp.value.matchAll(new RegExp(p,fl))].slice(0,20);
      toolOut(m.length?("MATCHES: "+m.length+"\n"+m.map(x=>x[0]).join("\n")):"NO MATCH");
    }catch(e){toolOut("Invalid pattern: "+e.message);}};
  const e2i=document.getElementById("bE2I"), i2e=document.getElementById("bI2E"), now=document.getElementById("bNow");
  if(e2i) e2i.onclick=()=>{const v=parseInt(document.getElementById("tinE").value,10);
    toolOut(isNaN(v)?"Enter a numeric epoch.":new Date(v*1000).toISOString());};
  if(i2e) i2e.onclick=()=>{const v=Date.parse(document.getElementById("tinI").value.trim());
    toolOut(isNaN(v)?"Enter a parseable datetime.":String(Math.floor(v/1000)));};
  if(now) now.onclick=()=>{const s=Math.floor(Date.now()/1000);
    document.getElementById("tinE").value=s;
    document.getElementById("tinI").value=new Date(s*1000).toISOString();
    toolOut("NOW → "+s);};
}

const DAILY=[
 {q:"Salting stored passwords mainly defeats…",opts:["Phishing","Rainbow-table attacks","DDoS","XSS"],a:1,exp:"Unique salts make precomputed hash tables useless."},
 {q:"HTTPS protects traffic against…",opts:["Endpoint malware","Eavesdropping in transit","Weak passwords","Malicious admins"],a:1,exp:"TLS encrypts the pipe — not the endpoints."},
 {q:"Strongest MFA factor?",opts:["SMS code","Email link","Hardware security key","Security question"],a:2,exp:"Phishing-resistant hardware keys beat codes and questions."},
 {q:"Nmap -sn performs…",opts:["Port scan","Host discovery","OS detection","Exploitation"],a:1,exp:"-sn finds live hosts without port-scanning."},
 {q:"X-Frame-Options mitigates…",opts:["SQLi","Clickjacking","CSRF","RCE"],a:1,exp:"It stops your pages being framed by attackers."},
 {q:"A password manager's main win?",opts:["Faster typing","Unique passwords everywhere","Free VPN","Antivirus"],a:1,exp:"Unique + long per site. Reuse is the real vulnerability."},
 {q:"A JWT signature guarantees…",opts:["Encryption","Integrity + authenticity","Anonymity","Availability"],a:1,exp:"It proves untampered + signed — payload itself isn't secret."},
 {q:"Clear least-privilege violation?",opts:["Shared admin account","MFA enforced","Logging enabled","Patched servers"],a:0,exp:"Shared all-powerful accounts destroy accountability."},
 {q:"Wireshark shows you…",opts:["Source code","Packets on the wire","Passwords in vaults","CPU temps"],a:1,exp:"Packet-level truth of what the network carries."},
 {q:"SMS 2FA codes are weak to…",opts:["SIM swapping","Long passwords","Firewalls","Updates"],a:0,exp:"Number port-outs bypass SMS codes. Prefer app/hardware factors."}
];
function renderDaily(){
  const box=document.getElementById("dailyBox"); if(!box) return;
  const day=Math.floor(Date.now()/864e5), Q=DAILY[day%DAILY.length];
  let st={}; try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  const streak=st.streak||0;
  if(st.day===day){
    box.innerHTML=`<div class="qprog">TODAY'S CHALLENGE — ANSWERED</div>
    <p style="color:var(--muted);font-size:14px">${st.ok?"✓ Solved. Sharp.":"✗ Missed — the answer was: <b style='color:var(--text)'>"+Q.opts[Q.a]+"</b>"}</p>
    <div class="qrank">STREAK: ${streak} 🔥 · NEW ONE TOMORROW</div>`; return;}
  box.innerHTML=`<div class="qprog">TODAY'S CHALLENGE · STREAK ${streak} 🔥</div>
  <h4 class="qq">${Q.q}</h4>
  <div class="qopts">${Q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>
  <div class="qexp" hidden></div>`;
  box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const ok=+b.dataset.i===Q.a;
    box.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.i===Q.a)x.classList.add("ok");});
    if(!ok) b.classList.add("no");
    const ns=ok?((st.day===day-1)?streak+1:1):0;
    try{localStorage.setItem("holy_daily",JSON.stringify({day:day,streak:ns}))}catch(e){}
    const ex=box.querySelector(".qexp"); ex.hidden=false;
    ex.innerHTML=`<b>${ok?"✓ CORRECT":"✗ NOT QUITE"}</b> — ${Q.exp}<br><span class="qrank">STREAK: ${ns} 🔥</span>`;
  });
}

const CTF_STEPS=[
 {t:"Exhibit A — the token",body:`Intercepted: <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmVjcnVpdCIsInJvbGUiOiJhZG1pbiIsImN0ZiI6MX0.xxx</code><br>Paste it into the JWT tool above. What is the <b>role</b>?`,answers:["admin"],hint:"Decode the middle segment."},
 {t:"Exhibit B — the encoding",body:`Recovered string: <code>%46%4C%41%47%7Burl_m4st3r%7D</code><br>Decode it (URL tool). Enter the flag:`,answers:["flag{url_m4st3r}"],hint:"%46 is F, %7B is { …"},
 {t:"Exhibit C — the pattern",body:`Which string matches <code>^FLAG\\{[a-z]+_[0-9]+\\}$</code>?`,opts:["FLAG{abc_123}","FLAG{ABC_123}","flag{abc_123}","FLAG{abc}"],answers:["FLAG{abc_123}"],hint:"Lowercase letters, underscore, digits."}
];
let ctf={i:0};
function renderCtf(){
  const box=document.getElementById("ctfBox"); if(!box) return;
  const S=CTF_STEPS[ctf.i];
  if(!S){box.innerHTML=`<div class="qprog">MINI-CTF COMPLETE</div>
    <div class="qscore">3 / 3</div><div class="qrank">RANK: RECRUITER-GRADE INSTINCTS</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn btn-g" id="ctfAgain">REPLAY →</button></div>`;
    document.getElementById("ctfAgain").onclick=()=>{ctf={i:0};renderCtf();};
    toast("◉ MINI-CTF COMPLETE"); return;}
  box.innerHTML=`<div class="qprog">STEP ${ctf.i+1} / ${CTF_STEPS.length}</div>
  <h4 class="qq">${S.t}</h4><p style="color:#c6cfd8;font-size:14px">${S.body}</p>
  ${S.opts?`<div class="qopts">${S.opts.map(o=>`<button class="opt" data-v="${o}">${o}</button>`).join("")}</div>`
    :`<input class="tfield" id="ctfIn" placeholder="your answer…" autocomplete="off" spellcheck="false">
      <div class="btnrow" style="margin-top:10px"><button class="btn btn-p" id="ctfGo">SUBMIT →</button></div>`}
  <div class="qexp" hidden></div>`;
  const good=()=>{ctf.i++;renderCtf();};
  const bad=(el)=>{const ex=box.querySelector(".qexp");ex.hidden=false;
    ex.innerHTML=`<b>✗ Not quite.</b> Hint: ${S.hint}`;};
  if(S.opts){box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    (S.answers.includes(b.dataset.v)?good:bad)();});}
  else{document.getElementById("ctfGo").onclick=()=>{
    const v=document.getElementById("ctfIn").value.trim().toLowerCase();
    (S.answers.includes(v)?good:bad)();};}
}

function downloadVcf(){
  const v=["BEGIN:VCARD","VERSION:3.0","N:Khalifa;Holy;;;","FN:Holy (Khalifa)",
  "TITLE:Cybersecurity Specialist","EMAIL;TYPE=INTERNET:HVoid9@proton.me",
  "URL:https://github.com/theholykhalifa","URL:https://theholykhalifa.github.io/Khalifa-Portoflio/",
  "NOTE:Think like an attacker. Build like a defender.","END:VCARD"].join("\n");
  const b=new Blob([v],{type:"text/vcard"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(b);
  a.download="holy-contact.vcf"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast("Contact card downloaded.");
}
function setRecruiter(on){
  document.body.classList.toggle("recruiter",on);
  try{localStorage.setItem("holy_rec",on?"1":"0")}catch(e){}
  if(on){scrollTo({top:0,behavior:"smooth"});toast("◉ RECRUITER VIEW — clean profile");}
}
let holyLang="en";
const I18N_MAP=[
 ["header .kicker","kicker",1],["header .hero-sub","heroSub",1],["header p.lead","heroLead",1],
 [".hero a[href='#lab']","enterLab",0],[".hero a[href='#credentials']","viewCreds",0],
 ["#termBtn","openTerm",0],["#resumeBtn","resume",0],["#resumeBtn2","resume",0],["#palBtn","palette",0],
 [".avail span:nth-child(2)","avail",0],["#mailBtn","mailBtn",0],
 ["#cform button[type=submit]","contactBtn",0],
 ["#about .sec-label","secAbout",0],["#about h2.head","headAbout",1],
 ["#credentials .sec-label","secCreds",0],["#credentials h2.head","headCreds",1],
 ["#experience .sec-label","secExp",0],["#experience h2.head","headExp",1],
 ["#arsenal .sec-label","secArs",0],["#arsenal h2.head","headArs",1],
 ["#operations .sec-label","secOps",0],["#operations h2.head","headOps",1],
 ["#soc .sec-label","secSoc",0],
 ["#lab .sec-label","secLab",0],["#lab h2.head","headLab",1],
 ["#notes .sec-label","secNotes",0],["#notes h2.head","headNotes",1],
 ["#research .sec-label","secRes",0],["#research h2.head","headRes",1],
 ["#terminal .sec-label","secTerm",0],["#terminal h2.head","headTerm",1],
 ["#contact .sec-label","secContact",0],["#contact h2.head","headContact",1]
];
const I18N_PH=[["cname","cName"],["cemail","cEmail"],["cmsg","cMsg"],["tinput","tInput"]];
function applyLang(l){
  holyLang=(l==="ar")?"ar":"en";
  try{localStorage.setItem("holy_lang",holyLang)}catch(e){}
  document.documentElement.lang=holyLang;
  document.documentElement.dir=holyLang==="ar"?"rtl":"ltr";
  $$(".links a,.mmenu a.big").forEach(a=>{
    if(!a.dataset.orig) a.dataset.orig=a.innerHTML;
    if(holyLang==="ar"){const f=a.querySelector("em,small");
      a.innerHTML=(f?f.outerHTML:"")+(NAV_AR[a.getAttribute("href")]||"");}
    else a.innerHTML=a.dataset.orig;
  });
  I18N_MAP.forEach(([sel,key,isHTML])=>{
    const el=document.querySelector(sel); if(!el) return;
    if(el.dataset.orig===undefined) el.dataset.orig=isHTML?el.innerHTML:el.textContent;
    if(holyLang==="ar"){ if(isHTML) el.innerHTML=HOLY_I18N[key]; else el.textContent=HOLY_I18N[key]; }
    else{ if(isHTML) el.innerHTML=el.dataset.orig; else el.textContent=el.dataset.orig; }
  });
  I18N_PH.forEach(([id,key])=>{
    const el=document.getElementById(id); if(!el) return;
    if(el.dataset.orig===undefined) el.dataset.orig=el.placeholder;
    el.placeholder=holyLang==="ar"?HOLY_I18N[key]:el.dataset.orig;
  });
  const lb=document.getElementById("langBtn"); if(lb) lb.textContent=holyLang==="ar"?"EN":"عربي";
}

/* PGP public key block + copy */
function renderPgp(){
  const el=document.getElementById("pgpKey"); if(!el) return;
  const b=document.getElementById("pgpCopy");
  const fp=document.getElementById("pgpFp");
  if(fp&&typeof HOLY_PGP_FP!=="undefined") fp.textContent=HOLY_PGP_FP;
  if(typeof HOLY_PGP!=="undefined"&&HOLY_PGP.trim()){el.textContent=HOLY_PGP.trim();b.disabled=false;b.style.opacity="";}
  else{el.textContent="PUBLIC KEY PUBLISHING SOON — config.js → HOLY_PGP";b.disabled=true;b.style.opacity=".45";}
}
function copyPgp(){
  const t=(typeof HOLY_PGP!=="undefined")?HOLY_PGP.trim():"";
  if(!t) return;
  const done=()=>{unlockAch("pgp","PGP VERIFIED");toast("Public key copied.");};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(()=>toast("Copy failed — select manually."));}
  else{const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");done();}catch(e){}ta.remove();}
}
})();
