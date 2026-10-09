/* HOLY // TRAINING GROUND logic — self-contained (main site logic lives in app.js).
   Progress shares localStorage with the main page (same origin). */
(function(){
"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function toast(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600);}
function safe(fn){try{fn()}catch(e){if(window.console)console.error(e);}}
/* lazy Supabase loader — never blocks page render */
const SB_CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.min.js";
function loadSbLib(){
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
const ACH_LABELS={term:"TERMINAL ACCESS",first:"FIRST FLAG",flagc:"FLAG CAPTURED",recon:"RECON COMPLETE",root:"ROOT ACCESS",researcher:"SECURITY RESEARCHER",pgp:"PGP VERIFIED",holy:"HOLY BADGE"};
const BADGE_META={
 term:{n:"TERMINAL ACCESS",d:"Ran your first terminal command. The rabbit hole opens.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='16' rx='2'/><path d='M7 9l3 3-3 3M12 15h5'/></svg>",c:"b-term"},
 first:{n:"FIRST FLAG",d:"Captured your first hidden flag. Hunter confirmed.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 21V4'/><path d='M5 4h12l-2 4 2 4H5'/></svg>",c:"b-first"},
 flagc:{n:"FLAG CAPTURED",d:"All 5 hidden flags. Nothing on this site hides from you.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z'/><path d='M9 12l2 2 4-4'/></svg>",c:"b-flagc"},
 recon:{n:"RECON COMPLETE",d:"Five distinct terminal commands. Enumeration discipline.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><circle cx='12' cy='12' r='7'/><circle cx='12' cy='12' r='1.5' fill='currentColor'/><path d='M12 2v3M12 19v3M2 12h3M19 12h3'/></svg>",c:"b-recon"},
 root:{n:"ROOT ACCESS",d:"Survived Operation Midnight and wore the gold.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 18l1.2-9L9 13l3-8 3 8 4.8-4L21 18z'/><path d='M4 21h16'/></svg>",c:"b-root"},
 researcher:{n:"SECURITY RESEARCHER",d:"Perfect quiz score. Publish-worthy instincts.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 3h6M10 3v6l-5.2 9.4A2 2 0 006.6 21h10.8a2 2 0 001.8-2.6L14 9V3'/><path d='M7.5 15h9'/></svg>",c:"b-res"},
 pgp:{n:"PGP VERIFIED",d:"Copied or downloaded the PGP key. Encrypted and verified.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 018 0v3'/></svg>",c:"b-pgp"},
 holy:{n:"HOLY BADGE",d:"ULTIMATE — all flags, perfect quizzes, midnight survived, PGP verified. The complete operator.",i:"<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 18l1.2-9L9 13l3-8 3 8 4.8-4L21 18z'/><path d='M4 21h16'/><circle cx='12' cy='10' r='1.4' fill='currentColor'/></svg>",c:"b-holy"}};
function getAch(){try{return JSON.parse(localStorage.getItem("holy_ach")||"{}")}catch(e){return{}}}
function unlockAch(k,label){const a=getAch();if(a[k])return;a[k]=1;
  try{localStorage.setItem("holy_ach",JSON.stringify(a))}catch(e){}
  toast("🏅 ACHIEVEMENT — "+label);renderTrophies();syncAch(k);}
/* achievements → cloud (per-account sync, best-effort) */
async function syncAch(k){
  try{
    if(!SB||!sbUser) return;
    await SB.from("achievements").upsert({user_id:sbUser.id,badge:k},{onConflict:"user_id,badge"});
  }catch(e){}
}
function seals(){try{return JSON.parse(localStorage.getItem("holy_seals")||"{}")}catch(e){return{}}}
function foundFlags(){try{return JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){return[]}}

/* ---------- quizzes ---------- */
const QUIZ_VULN=[
 {code:'query = "SELECT * FROM users WHERE id = \'" + user_input + "\'";',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:0,
  exp:"Untrusted input is concatenated straight into SQL. Parameterize queries — never build them with string glue."},
 {code:'commentBox.innerHTML = userComment; // render instantly, no sanitization',
  q:"What vulnerability is this?",opts:["SQL Injection","Cross-Site Scripting","IDOR","CSRF"],a:1,
  exp:"Attacker HTML/JS lands in a live DOM sink. Use textContent or sanitize — innerHTML with user data is a loaded gun."},
 {code:'GET /api/invoices/1024   →   change to /1025, no ownership check, data leaks',
  q:"What vulnerability is this?",opts:["SQL Injection","XSS","IDOR / BOLA","CSRF"],a:2,
  exp:"Object reference with no authorization check. Verify ownership server-side on every object access."},
 {code:'<img src="https://bank.local/transfer?to=attacker&amt=1000">  <!-- hidden on evil page -->',
  q:"What vulnerability is this?",opts:["SQL Injection","XSS","IDOR","CSRF"],a:3,
  exp:"Victim's browser fires a state-changing GET carrying cookies. Per-session tokens plus SameSite cookies stop it."},
 {code:'if (!userExists) return "User not found";\nelse if (!validPass) return "Wrong password";',
  q:"What flaw is this?",opts:["User Enumeration","SQL Injection","XSS","CSRF"],a:0,
  exp:"Different errors reveal valid usernames. One generic message for both cases — always."},
 {code:'fetch("/fetch?url=" + userUrl)  // server fetches any URL the user names',
  q:"What vulnerability is this?",opts:["SSRF","XSS","SQL Injection","CSRF"],a:0,
  exp:"The server becomes your proxy into internal networks. Allowlist destinations, block metadata IPs."},
 {code:'Set-Cookie: session=abc123; Path=/   // no Secure, HttpOnly, or SameSite',
  q:"What's wrong here?",opts:["Insecure Cookie Config","SQL Injection","XSS","IDOR"],a:0,
  exp:"Missing flags invite theft and cross-site abuse. Secure + HttpOnly + SameSite, always on session cookies."},
 {code:'exec("ping " + host)  // host comes straight from the request',
  q:"What vulnerability is this?",opts:["Command Injection","XSS","CSRF","IDOR"],a:0,
  exp:"Shell metacharacters break out. Never pass user input to a shell — use safe APIs."},
 {code:'parseXML(userXml)  // external entities left enabled',
  q:"What vulnerability is this?",opts:["XXE","XSS","SQL Injection","CSRF"],a:0,
  exp:"External entities read server files or pivot internally. Disable DTDs, use hardened parsers."},
 {code:'redirect(req.query.next)  // destination never validated',
  q:"What vulnerability is this?",opts:["Open Redirect","XSS","IDOR","SQL Injection"],a:0,
  exp:"Victims trust your domain and land on evil. Allowlist URLs or use indirect references."},
 {code:'if (token.alg === "none") skipVerify()  // client picks the algorithm',
  q:"What flaw is this?",opts:["Auth Bypass","XSS","CSRF","IDOR"],a:0,
  exp:"Never let the client choose 'none'. Enforce the expected algorithm server-side."},
 {code:'readFile("/var/www/" + req.query.page)  // try: ../../etc/passwd',
  q:"What vulnerability is this?",opts:["Path Traversal","XSS","CSRF","IDOR"],a:0,
  exp:"Dot-dot sequences escape the web root. Canonicalize paths, allowlist, never concatenate."},
 {code:'save(upload, "/uploads/" + upload.name)  // shell.php welcome',
  q:"What vulnerability is this?",opts:["Unrestricted File Upload","XSS","SQL Injection","CSRF"],a:0,
  exp:"Executable uploads become shells. Validate server-side, rename, store outside webroot, strip exec."},
 {code:'500: "SQLSTATE password=secret conn=db01"  // shown to users',
  q:"What flaw is this?",opts:["Information Disclosure","XSS","IDOR","CSRF"],a:0,
  exp:"Stack traces arm attackers. Generic errors outside, details in logs only."},
 {code:'user.update(req.body)  // body smuggles role:"admin"',
  q:"What vulnerability is this?",opts:["Mass Assignment","XSS","SQL Injection","CSRF"],a:0,
  exp:"Raw input bound to models flips protected fields. Allowlist assignable attributes."},
 {code:'db.users.find({user: u, pass: p})  // p = {"$ne": null}',
  q:"What vulnerability is this?",opts:["NoSQL Injection","XSS","IDOR","CSRF"],a:0,
  exp:"Operators smuggle logic into queries. Validate types, never pass raw objects."},
 {code:'pickle.loads(session_cookie)  // trusted? never.',
  q:"What vulnerability is this?",opts:["Insecure Deserialization","XSS","CSRF","IDOR"],a:0,
  exp:"Deserializing attacker data runs code. Sign it — or avoid native formats."},
 {code:'el.innerHTML = "<b>" + location.hash.slice(1) + "</b>"  // hash-fed',
  q:"What vulnerability is this?",opts:["DOM XSS","SQL Injection","IDOR","CSRF"],a:0,
  exp:"Client-side sink fed by the URL. Encode output, never innerHTML location data."}
];
const QUIZ_SEC=[
 {q:"Which CIA-triad property guarantees data is unaltered?",opts:["Confidentiality","Integrity","Availability","Authenticity"],a:1,exp:"Integrity = unaltered. Hashes and signatures enforce it."},
 {q:"First move on any new device or account?",opts:["Install themes","Change default credentials","Disable logging","Share access"],a:1,exp:"Defaults are public knowledge. Change them before anything else."},
 {q:"What does Nmap -sV do?",opts:["OS detection","Port knocking","Service/version detection","Packet crafting"],a:2,exp:"-sV probes open ports to fingerprint service names and versions."},
 {q:"Least privilege means…",opts:["Everyone gets admin","Minimum access to function","No passwords needed","Log everything"],a:1,exp:"Only the access required — nothing more. Shrinks blast radius."},
 {q:"Burp Repeater is for…",opts:["Auto-scanning","Manual request modification","Password cracking","Traffic shaping"],a:1,exp:"Craft, tweak and resend requests by hand. Understanding beats automation."},
 {q:"Phishing is primarily…",opts:["A firewall flaw","Social engineering","A malware family","A routing attack"],a:1,exp:"It hacks the human, not the machine. Verify sender, hover links."},
 {q:"SMS 2FA codes are weak to…",opts:["SIM swapping","Long passwords","Firewalls","Updates"],a:0,exp:"Number port-outs bypass SMS codes. Prefer app/hardware factors."},
 {q:"First action on a suspected breach?",opts:["Pull every plug","Isolate and contain the system","Delete suspicious files","Wait and watch"],a:1,exp:"Contain first — stop the spread, preserve evidence."},
 {q:"Burp Suite's core job?",opts:["Crack Wi-Fi","Intercept and inspect web traffic","Scan ports","Mine crypto"],a:1,exp:"A proxy between browser and app: see it, touch it, test it."},
 {q:"Reused passwords fall to…",opts:["Phishing","Credential stuffing","DDoS","XSS"],a:1,exp:"One leak becomes every account. Unique passwords only."},
 {q:"Public Wi-Fi's real danger?",opts:["Eavesdropping / MITM","Faster speeds","Better privacy","Nothing much"],a:0,exp:"Open airwaves invite snoopers. VPN on untrusted nets."},
 {q:"A strong password starts at…",opts:["4 characters","8 characters","12+ unique characters","Your birthday"],a:2,exp:"Length beats complexity. 12+ unique, ideally in a manager."},
 {q:"Backup codes for 2FA exist to…",opts:["Share with friends","Recover access if factors are lost","Skip passwords","Speed up login"],a:1,exp:"Lost phone without backups means lost account. Store them offline."},
 {q:"Someone watching your screen is called…",opts:["Sniffing","Shoulder surfing","Pharming","Spoofing"],a:1,exp:"Privacy screens and awareness beat curious eyes."},
 {q:"What does a VPN hide from your ISP?",opts:["Destinations and content","Your OS","Your passwords","Nothing"],a:0,exp:"The tunnel shifts visibility from ISP to VPN provider."},
 {q:"Passwords should be stored…",opts:["Plaintext for recovery","Reversibly encrypted","Hashed with salt (bcrypt/argon2)","Inside cookies"],a:2,exp:"One-way salted hashing — breaches leak puzzles, not keys."},
 {q:"Tailgating means…",opts:["Fast driving","Following someone through a secure door","Email spam","Wi-Fi theft"],a:1,exp:"Physical breach, zero exploit needed. Challenge strangers politely."},
 {q:"Security is whose job?",opts:["Only the SOC","Everyone touching the system","The firewall vendor","Nobody"],a:1,exp:"Culture beats tooling. Every commit, every click."},
 {q:"Download pages list hashes so you can…",opts:["Look technical","Verify file integrity","Get support","Unlock premium"],a:1,exp:"Compare before you run it. Mismatched hash — delete it."},
 {q:"Covering the laptop camera helps against…",opts:["Hackers","Spyware peeking","Slow Wi-Fi","Overheating"],a:1,exp:"Cheap privacy. Malware can't see through tape."},
 {q:"Work laptop on hotel guest Wi-Fi?",opts:["Fine, it's Wi-Fi","Avoid it or VPN up","Faster actually","Required"],a:1,exp:"Shared airwaves, unknown neighbors. VPN or hotspot."},
 {q:"Sharing your screen? First…",opts:["Open everything","Hide sensitive tabs and notifications","Turn volume up","Share faster"],a:1,exp:"Audiences remember secrets. Declutter before you broadcast."}
];
let quiz={set:null,i:0,score:0};
function quizRank(pct,top){
  if(pct>=1) return top;
  if(pct>=0.66) return quiz.set===QUIZ_VULN?"SHARP EYE":"OPERATOR";
  if(pct>=0.33) return quiz.set===QUIZ_VULN?"KEEP PRACTICING":"ANALYST TRAINEE";
  return "CURIOUS NEWBIE — keep learning";
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
function bestOf(b,k){const v=b[k];return (v&&typeof v==="object")?{best:v.best||0,plays:v.plays||0,sum:v.sum||0}:{best:v||0,plays:0,sum:0};}
function quizStart(set,game){quiz={game:game||(set===QUIZ_VULN?"vuln":"sec"),
  set:shuffle(set.map(q=>{const ord=shuffle(q.opts.map((o,i)=>i));return{...q,opts:ord.map(i=>q.opts[i]),a:ord.indexOf(q.a)};})),
  i:0,score:0};quizRender();}
function quizRender(){
  const box=document.getElementById("quizBox"); if(!box) return;
  const Q=quiz.set[quiz.i];
  if(!Q){const pct=quiz.score/quiz.set.length;
    if(pct>=1) unlockAch("researcher","SECURITY RESEARCHER");
    submitScore(quiz.game,quiz.score,quiz.set.length);
    try{const b=JSON.parse(localStorage.getItem("holy_best")||"{}");
      const cur=bestOf(b,quiz.game); cur.plays++;
      if(quiz.score>cur.best)cur.best=quiz.score; cur.sum+=quiz.score;
      b[quiz.game]=cur; localStorage.setItem("holy_best",JSON.stringify(b));
    }catch(e){}
    box.innerHTML=`<div class="qprog">FINAL SCORE</div><div class="qscore">${quiz.score} / ${quiz.set.length}</div>
    <div class="qrank">RANK: ${quizRank(pct,quiz.game==="vuln"?"EAGLE EYE":"RED TEAM MATERIAL")}</div>
    <div class="btnrow" style="margin-top:16px"><button class="btn btn-p" id="qretry">RETRY →</button></div>`;
    document.getElementById("qretry").onclick=()=>quizStart(quiz.set,quiz.game); return;}
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

const VULNLAB=[
 {t:"Cross-Site Scripting (XSS)",v:"Untrusted input lands in innerHTML with no encoding.",c:"Attacker markup executes in the victim's session.",i:"Session theft, defacement, actions performed as the victim.",f:"Output-encode by context; prefer textContent; enforce Content-Security-Policy."},
 {t:"SQL Injection (SQLi)",v:"User input concatenated directly into SQL strings.",c:"Crafted input alters query logic or stacks commands.",i:"Data theft, authentication bypass, sometimes RCE.",f:"Parameterized queries; least-privilege database accounts."},
 {t:"Insecure Direct Object Reference (IDOR)",v:"Object IDs accepted with no ownership check.",c:"Swap IDs to reach other users' objects.",i:"Exposure or modification of someone else's data.",f:"Server-side authorization on every single object access."},
 {t:"Cross-Site Request Forgery (CSRF)",v:"State-changing requests without anti-CSRF tokens.",c:"Victim's browser fires forged requests carrying cookies.",i:"Unwanted actions executed as the victim.",f:"POST + per-session tokens, SameSite cookies, re-auth for sensitive acts."},
 {t:"Authentication Flaws",v:"No rate limiting, verbose errors, weak lockout.",c:"Credential stuffing plus user enumeration at scale.",i:"Account takeover, one inbox at a time.",f:"Rate limits, generic errors, MFA, breach-corpus password checks."},
 {t:"Server-Side Request Forgery (SSRF)",v:"Server fetches arbitrary user-supplied URLs.",c:"Attacker pivots through the server into internal networks and cloud metadata.",i:"Internal service access, credential theft, cloud takeover.",f:"Allowlist destinations; block metadata/link-local IPs; no redirects to internal."},
 {t:"Security Misconfiguration",v:"Defaults, verbose banners, open debug endpoints left live.",c:"Attackers fingerprint and walk through open doors.",i:"Easy foothold with zero cleverness required.",f:"Harden baselines, strip banners, disable debug in production, review often."},
 {t:"Sensitive Data Exposure",v:"Secrets, keys or PII in repos, logs or URLs.",c:"Attackers harvest what you published yourself.",i:"Credential leaks, impersonation, full compromise.",f:"Vaults for secrets, redacted logs, pre-commit scanning, rotate on leak."},
 {t:"XML External Entities (XXE)",v:"XML parsers resolving external entities.",c:"Malicious XML reads server files or pivots internally.",i:"File disclosure, internal network probing.",f:"Disable DTDs and external entities; use hardened parsers."},
 {t:"Open Redirect",v:"Redirect destinations never validated.",c:"Victims trust your domain, land on an evil twin.",i:"Credential phishing wearing your logo.",f:"Allowlist URLs or use indirect reference maps."},
 {t:"Path Traversal",v:"User input joined into filesystem paths.",c:"Dot-dot sequences escape the web root.",i:"Arbitrary file read, config and secret theft.",f:"Canonicalize paths, strict allowlists, jail the process."},
 {t:"Unrestricted File Upload",v:"Uploads saved with attacker-controlled names, executable.",c:"Upload a web shell, then visit its URL.",i:"Remote code execution on the server.",f:"Validate type server-side, randomize names, store outside webroot."},
 {t:"Mass Assignment",v:"Raw request bodies bound straight to data models.",c:"Extra fields like role overwrite protected attributes.",i:"Privilege escalation via a signup form.",f:"Allowlist assignable fields; guard sensitive attributes server-side."},
 {t:"Insecure Deserialization",v:"Untrusted bytes fed to native deserializers.",c:"Crafted objects execute during parsing.",i:"Remote code execution.",f:"Avoid native formats for input; sign and verify when unavoidable."}
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

/* ---------- toolkit ---------- */
function toolOut(t){const o=document.getElementById("toolOut"); if(o) o.textContent=t;}
async function doHash(alg){
  const el=document.getElementById("tin"); const v=el?el.value:"";
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
  wireTools(name);
}
function wireTools(name){
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
window.doHash=doHash;

/* ---------- daily + mini-ctf ---------- */
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
 {q:"DNS over HTTPS mainly protects…",opts:["Queries from snooping","Against phishing","From malware","From updates"],a:0,exp:"It encrypts your lookups — snoopers can't read them."},
 {q:"A VPN primarily gives you…",opts:["An encrypted tunnel to its server","Built-in antivirus","Faster internet","Anonymity from everyone"],a:0,exp:"Encrypted pipe to the VPN server — trust shifts, doesn't vanish."},
 {q:"Best ransomware defense?",opts:["Pay quickly","Offline tested backups","Longer passwords","Hide the server"],a:1,exp:"Tested, offline backups turn disaster into inconvenience."},
 {q:"Unpatched services are dangerous because…",opts:["They run slowly","Known exploits are public","They use RAM","They log too much"],a:1,exp:"Public exploits + scanner bots. Patch windows are race windows."},
 {q:"Pretexting targets…",opts:["Firewalls","Humans, with a story","Routers","Databases"],a:1,exp:"A convincing scenario beats a firewall. Verify identities."},
 {q:"Stepping away from your desk?",opts:["Lock it (Win+L)","Leave it open","Monitor off is enough","Trust coworkers"],a:0,exp:"Seconds unattended is all it takes. Lock, always."},
 {q:"Ransomware does what?",opts:["Speeds up the PC","Encrypts data for payment","Deletes cookies","Updates drivers"],a:1,exp:"Backups plus patching beat paying criminals."},
 {q:"A honeypot is…",opts:["Sweet malware","A decoy system that detects attackers","A firewall brand","A type of VPN"],a:1,exp:"Fake targets, real alerts."},
 {q:"The S in HTTPS stands for…",opts:["Speed","Secure (TLS)","Simple","Standard"],a:1,exp:"Encrypted HTTP — look for it before typing secrets."},
 {q:"App-based 2FA beats SMS because…",opts:["Prettier","Immune to SIM swapping","Faster","Free"],a:1,exp:"No number to port out. Secrets stay on your device."},
 {q:"Malware is…",opts:["Broken hardware","Malicious software","Slow internet","Old files"],a:1,exp:"Code with hostile intent. Least privilege limits its blast radius."},
 {q:"Posting your boarding pass leaks…",opts:["Nothing","Barcodes with PII and booking refs","Seat comfort","Flight snacks"],a:1,exp:"Barcodes decode to names, numbers, itineraries. Keep them private."},
 {q:"Unsubscribe link in obvious spam?",opts:["Click it","Don't — it confirms your address","Forward to all","Reply angrily"],a:1,exp:"Clicks tell spammers you're real. Delete and report instead."},
 {q:"Updates asking for a reboot?",opts:["Later, forever","Reboot — patches need it","Delete them","Ignore"],a:1,exp:"Many fixes activate at boot. Pending reboot, pending vulnerable."},
 {q:"Bluetooth always-on in public?",opts:["Harmless","Tracking + Bluejacking surface","Boosts signal","Saves battery"],a:1,exp:"Silent pairing requests and trackers. Off when unused."},
 {q:"Password spraying means…",opts:["Water-cooling","One password across many accounts","Fast typing","Long passwords"],a:1,exp:"Dodges lockouts by spreading guesses. MFA plus monitoring stop it."},
 {q:"QR code on a random flyer?",opts:["Scan it","Could be quishing — verify first","Tasty","Always safe"],a:1,exp:"QR hides the URL. Preview before you open."}
];
function renderDaily(){
  const box=document.getElementById("dailyBox"); if(!box) return;
  const day=Math.floor(Date.now()/864e5);
  const _Q=DAILY[day%DAILY.length], _ord=shuffle([0,1,2,3]);
  const Q={..._Q,opts:_ord.map(i=>_Q.opts[i]),a:_ord.indexOf(_Q.a)};
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
    try{localStorage.setItem("holy_daily",JSON.stringify({day:day,streak:ns,ok:ok}))}catch(e){}
    const ex=box.querySelector(".qexp"); ex.hidden=false;
    ex.innerHTML=`<b>${ok?"✓ CORRECT":"✗ NOT QUITE"}</b> — ${Q.exp}<br><span class="qrank">STREAK: ${ns} 🔥</span>`;
  });
}

const CTF_STEPS=[
 {t:"Exhibit A — the token",body:`Intercepted: <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmVjcnVpdCIsInJvbGUiOiJhZG1pbiIsImN0ZiI6MX0.xxx</code><br>Paste it into the JWT tool above. What is the <b>role</b>?`,answers:["admin"],hint:"Decode the middle segment."},
 {t:"Exhibit B — the encoding",body:`Recovered string: <code>%46%4C%41%47%7Burl_m4st3r%7D</code><br>Decode it (URL tool). Enter the flag:`,answers:["flag{url_m4st3r}"],hint:"%46 is F, %7B is { …"},
 {t:"Exhibit C — the pattern",body:`Which string matches <code>^FLAG\\{[a-z]+_[0-9]+\\}$</code>?`,opts:["FLAG{abc_123}","FLAG{ABC_123}","flag{abc_123}","FLAG{abc}"],answers:["FLAG{abc_123}"],hint:"Lowercase letters, underscore, digits."},
 {t:"Exhibit D — the cipher",body:`Recovered note: <code>IODJ{fdhvdu_wklqj}</code><br>Each letter shifted forward. Shift them back (hint: 3). Enter the flag:`,answers:["flag{caesar_thing}"],hint:"Caesar -3: I→F, O→L, D→A, J→G…"}
];
let ctf={i:0};
function renderCtf(){
  const box=document.getElementById("ctfBox"); if(!box) return;
  const S=CTF_STEPS[ctf.i];
  if(!S){box.innerHTML=`<div class="qprog">MINI-CTF COMPLETE</div>
    <div class="qscore">${CTF_STEPS.length} / ${CTF_STEPS.length}</div><div class="qrank">RANK: RECRUITER-GRADE INSTINCTS</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn btn-g" id="ctfAgain">REPLAY →</button></div>`;
    document.getElementById("ctfAgain").onclick=()=>{ctf={i:0};renderCtf();};
    toast("◉ MINI-CTF COMPLETE"); return;}
  box.innerHTML=`<div class="qprog">STEP ${ctf.i+1} / ${CTF_STEPS.length}</div>
  <h4 class="qq">${S.t}</h4><p style="color:#c6cfd8;font-size:14px">${S.body}</p>
  ${S.opts?`<div class="qopts">${shuffle(S.opts.slice()).map(o=>`<button class="opt" data-v="${o}">${o}</button>`).join("")}</div>`
    :`<input class="tfield" id="ctfIn" placeholder="your answer…" autocomplete="off" spellcheck="false">
      <div class="btnrow" style="margin-top:10px"><button class="btn btn-p" id="ctfGo">SUBMIT →</button></div>`}
  <div class="qexp" hidden></div>`;
  const good=()=>{ctf.i++;renderCtf();};
  const bad=()=>{const ex=box.querySelector(".qexp");ex.hidden=false;
    ex.innerHTML=`<b>✗ Not quite.</b> Hint: ${S.hint}`;};
  if(S.opts){box.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    (S.answers.includes(b.dataset.v)?good:bad)();});}
  else{document.getElementById("ctfGo").onclick=()=>{
    const v=document.getElementById("ctfIn").value.trim().toLowerCase();
    (S.answers.includes(v)?good:bad)();};}
}

/* ---------- trophies + dashboard ---------- */
function renderTrophies(){
  evaluateHoly();
  const el=document.getElementById("trophyCase"); if(!el) return;
  const a=getAch();
  el.innerHTML='<div class="bgrid">'+Object.keys(BADGE_META).map((k,ix)=>{
    const m=BADGE_META[k], won=!!a[k];
    return `<div class="bcard ${m.c} ${won?"won":""}" style="animation-delay:${ix*70}ms"><div class="bicon">${m.i}</div><div><b>${m.n}</b><p>${m.d}</p></div><span class="bstate">${won?"◉":"○"}</span></div>`;}).join("")+'</div>'+holyProgress();
}
function holyProgress(){
  const a=getAch(), f=foundFlags(); let best={}, mid=0;
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{mid=localStorage.getItem("holy_midnight")==="1"?1:0}catch(e){}
  const parts=[["FLAGS",f.length,5],["QUIZZES",(bestOf(best,"vuln").best>=QUIZ_VULN.length?1:0)+(bestOf(best,"sec").best>=QUIZ_SEC.length?1:0),2],["MIDNIGHT",mid,1],["PGP",a.pgp?1:0,1]];
  const got=parts.reduce((x,p)=>x+Math.min(p[1],p[2]),0), need=parts.reduce((x,p)=>x+p[2],0);
  return `<div class="holybar">👑 HOLY BADGE PROGRESS: ${got}/${need} — `+parts.map(p=>`${p[0]} ${Math.min(p[1],p[2])}/${p[2]}`).join(" · ")+`</div>`;
}
function evaluateHoly(){
  const a=getAch(); if(a.holy) return;
  const f=foundFlags(); let best={}, mid=false;
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{mid=localStorage.getItem("holy_midnight")==="1"}catch(e){}
  if(f.length>=5&&(best.vuln||0)>=QUIZ_VULN.length&&(best.sec||0)>=QUIZ_SEC.length&&mid&&a.pgp){
    unlockAch("holy","HOLY BADGE"); toast("👑 THE HOLY BADGE IS YOURS — complete operator.");}
}
function getProfile(){try{return JSON.parse(localStorage.getItem("holy_profile")||"null")}catch(e){return null}}
function renderDashboard(){
  const p=document.getElementById("dashProfile"); if(!p) return;
  const prof=getProfile(), a=getAch(), s=seals(), f=foundFlags();
  let best={}, st={}, vault="LOCKED";
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  try{vault=localStorage.getItem("holy_vault")==="1"?"OPEN":"LOCKED"}catch(e){}
  document.getElementById("callsignRow").style.display=prof?"none":"";
  p.innerHTML=prof
    ?`<div style="font-size:26px;font-weight:900">◉ ${escapeHtml(prof.callsign)}</div><div class="mono" style="font-size:11px;color:var(--muted)">LOCAL OPERATIVE · THIS BROWSER ONLY</div>`
    :`<div class="mono" style="font-size:12px;color:var(--muted)">No operative yet — pick a callsign to open your record.</div>`;
  document.getElementById("dashStats").innerHTML=
   `<div class="kv"><b>BADGES</b><span>${Object.keys(ACH_LABELS).filter(k=>a[k]).length} / ${Object.keys(ACH_LABELS).length}</span></div>
    <div class="kv"><b>SEALS</b><span>${["e1","e2","e3","e4"].filter(k=>s[k]).length} / 4</span></div>
    <div class="kv"><b>FLAGS</b><span>${f.length} / 5</span></div>
    <div class="kv"><b>QUIZ BEST</b><span>vuln ${bestOf(best,"vuln").best} / 18 · sec ${bestOf(best,"sec").best} / 26</span></div>
    <div class="kv"><b>STREAK</b><span>${st.streak||0} 🔥</span></div>
    <div class="kv"><b>VAULT</b><span>${vault}</span></div>`;
}

/* ---------- cloud accounts + leaderboard (Supabase, optional) ---------- */
let SB=null, sbUser=null;
function sbStatus(t){const el=document.getElementById("sbStatus");if(el)el.textContent="CLOUD: "+t;}
async function sbInit(){
  if(typeof HOLY_SUPABASE==="undefined"||!HOLY_SUPABASE.url||!HOLY_SUPABASE.key){
    sbStatus("off — add project keys (config.js → HOLY_SUPABASE, see SUPABASE_SETUP.md).");return;}
  if(typeof supabase==="undefined"){
    sbStatus("loading cloud library…");
    if(!(await loadSbLib())){
      sbStatus("library blocked — CDN unreachable (adblock/VPN?) — allow jsdelivr.");return;}}
  try{
    SB=supabase.createClient(HOLY_SUPABASE.url,HOLY_SUPABASE.key);
    const {data}=await SB.auth.getSession();
    sbUser=(data&&data.session&&data.session.user)||null;
    sbPaint(); loadBoard("sec");
  }catch(e){sbStatus("failed to reach project — check URL/key.");}
}
function sbPaint(){
  const on=!!sbUser;
  document.getElementById("sbForm").hidden=on;
  document.getElementById("sbOut").hidden=!on;
  renderPersonal();
  sbStatus(on?("online as "+(sbUser.user_metadata&&sbUser.user_metadata.callsign?sbUser.user_metadata.callsign:sbUser.email)):"logged out.");
}
async function sbCallsign(){
  if(!sbUser) return "";
  try{const r=await SB.from("profiles").select("callsign").eq("id",sbUser.id).single();
    if(r.data&&r.data.callsign) return r.data.callsign;}catch(e){}
  return (sbUser.user_metadata&&sbUser.user_metadata.callsign)||sbUser.email.split("@")[0];
}
async function submitScore(game,score,total){
  if(!SB||!sbUser) return;
  try{
    const call=await sbCallsign();
    const {error}=await SB.from("scores").insert({user_id:sbUser.id,callsign:call,game:game,score:score,total:total});
    if(error) throw error;
    toast("◉ Score posted — "+call+" "+score+"/"+total);
    loadBoard(game);
  }catch(e){toast("Score post failed: "+(e.message||"check RLS policies"));}
}
let boardGame="sec";
async function loadBoard(game){
  boardGame=game||boardGame;
  const box=document.getElementById("boardBox"); if(!box) return;
  const bS=document.getElementById("boardSec"), bV=document.getElementById("boardVuln");
  if(bS){bS.className="btn "+(boardGame==="sec"?"btn-p":"btn-g");bV.className="btn "+(boardGame==="vuln"?"btn-p":"btn-g");}
  if(!SB){box.textContent="Connect a cloud project to light up this board.";return;}
  box.textContent="Loading…";
  try{
    const r=await SB.from("scores").select("user_id,callsign,score,total").eq("game",boardGame).order("score",{ascending:false}).limit(10);
    if(r.error) throw r.error;
    if(!r.data.length){box.textContent="No scores yet — be the first legend.";return;}
    let avm={};
    try{const pr=await SB.from("profiles").select("id,avatar");(pr.data||[]).forEach(x=>avm[x.id]=x.avatar||0);}catch(e){}
    box.innerHTML=r.data.map((row,i)=>{
      const cls=i===0?"r1":(i===1?"r2":(i===2?"r3":""));
      return `<div class="brow ${cls}"><span>${String(i+1).padStart(2,"0")}</span><span class="bav">${avatarSVG(avm[row.user_id]||0,22)}</span><span>${escapeHtml(row.callsign)}</span><span>${row.score}/${row.total}</span></div>`;}).join("");
  }catch(e){box.textContent="Board unreadable: "+(e.message||"check RLS policies");}
}

/* personal board — the logged-in operative, from the cloud */
async function renderPersonal(){
  const box=document.getElementById("personalBox"); if(!box) return;
  if(!SB||!sbUser){box.innerHTML="<span style='color:var(--muted)'>Log in above to see your board.</span>";return;}
  box.textContent="Loading your record…";
  try{
    const call=await sbCallsign();
    const prof=await SB.from("profiles").select("created_at").eq("id",sbUser.id).single();
    const sc=await SB.from("scores").select("game,score,total").eq("user_id",sbUser.id);
    const ac=await SB.from("achievements").select("badge").eq("user_id",sbUser.id);
    let best={sec:0,vuln:0}, bt={sec:0,vuln:0};
    (sc.data||[]).forEach(r=>{if(r.score>(best[r.game]||0)){best[r.game]=r.score;bt[r.game]=r.total;}});
    let rank="—";
    try{
      const all=await SB.from("scores").select("user_id,score").eq("game","sec").limit(500);
      const mx={}; (all.data||[]).forEach(r=>{mx[r.user_id]=Math.max(mx[r.user_id]||0,r.score);});
      const mine=mx[sbUser.id]||0;
      rank="#"+(Object.values(mx).filter(v=>v>mine).length+1)+" of "+Object.keys(mx).length;
    }catch(e){}
    box.innerHTML=
     `<div class="kv"><b>OPERATIVE</b><span>${escapeHtml(call)}</span></div>
      <div class="kv"><b>ENLISTED</b><span>${prof.data?new Date(prof.data.created_at).toISOString().slice(0,10):"—"}</span></div>
      <div class="kv"><b>BEST SEC</b><span>${best.sec}/${bt.sec||QUIZ_SEC.length}</span></div>
      <div class="kv"><b>BEST VULN</b><span>${best.vuln}/${bt.vuln||QUIZ_VULN.length}</span></div>
      <div class="kv"><b>SEC RANK</b><span>${rank}</span></div>
      <div class="kv"><b>CLOUD BADGES</b><span>${(ac.data||[]).length} synced</span></div>
      <div class="mono" style="font-size:11px;letter-spacing:.16em;color:var(--muted);margin-top:10px">MY SCORES — TAP ✕ TO DELETE</div>
      <div id="myScores" class="mono" style="font-size:12px;line-height:2">—</div>`;
    try{
      const ms=await SB.from("scores").select("id,game,score,total,created_at").eq("user_id",sbUser.id).order("created_at",{ascending:false}).limit(20);
      const mel=box.querySelector("#myScores");
      if(ms.error) throw ms.error;
      mel.innerHTML=(ms.data||[]).length?ms.data.map(r=>
        `${r.game} ${r.score}/${r.total} <button class="mini" data-mdel="${r.id}" style="background:none;border:1px solid #FF3B30;color:#FF8FA3;border-radius:6px;font-size:10px;padding:1px 8px;cursor:pointer">✕</button>`
      ).join("<br>"):"no scores posted yet — go play.";
      mel.querySelectorAll("[data-mdel]").forEach(b=>b.onclick=async ()=>{
        try{
          const d=await SB.from("scores").delete().eq("id",+b.dataset.mdel);
          if(d.error) throw d.error;
          toast("Score deleted."); renderPersonal(); loadBoard();
        }catch(e){toast("Blocked — run the section-7 SQL for self-delete.");}
      });
    }catch(e){/* listed inline above */}
  }catch(e){box.textContent="Board unreadable — check connection.";}
}
/* operative file — personal performance tab */
function renderProfile(){
  const box=document.getElementById("quizBox"); if(!box) return;
  const prof=getProfile(); let best={}, st={}, f=[];
  try{best=JSON.parse(localStorage.getItem("holy_best")||"{}")}catch(e){}
  try{st=JSON.parse(localStorage.getItem("holy_daily")||"{}")}catch(e){}
  try{f=JSON.parse(localStorage.getItem("holy_flags")||"[]")}catch(e){}
  const a=getAch(), nb=Object.keys(ACH_LABELS).filter(k=>a[k]).length;
  const v=bestOf(best,"vuln"), s=bestOf(best,"sec");
  const avg=x=>x.plays?((x.sum/x.plays).toFixed(1)+" avg"):"—";
  box.innerHTML=`<div class="qprog">OPERATIVE FILE // ${(prof?escapeHtml(prof.callsign):"UNLISTED").toUpperCase()}</div>
  <div class="kv"><b>VULN RECORD</b><span>${v.plays} plays · best ${v.best}/${QUIZ_VULN.length} · ${avg(v)}</span></div>
  <div class="kv"><b>SEC RECORD</b><span>${s.plays} plays · best ${s.best}/${QUIZ_SEC.length} · ${avg(s)}</span></div>
  <div class="kv"><b>DAILY STREAK</b><span>${st.streak||0} 🔥</span></div>
  <div class="kv"><b>FLAGS</b><span>${f.length} / 5</span></div>
  <div class="kv"><b>BADGES</b><span>${nb} / ${Object.keys(ACH_LABELS).length}</span></div>
  <div class="kv"><b>PACKET BEST</b><span>${gameBest()}</span></div>
  <p class="mono" style="font-size:11px;color:var(--muted)">Full record lives in the dashboard below. Cloud bests sync when logged in.</p>`;
}
/* packet defender — 2d arcade */
let G=null;
function gameBest(){try{return parseInt(localStorage.getItem("holy_packet_best")||"0",10)||0}catch(e){return 0}}
function gameHud(over){
  const el=document.getElementById("gameHud"); if(!el||!G) return;
  el.textContent=`SCORE ${G.score} · LIVES ${G.lives} · BEST ${G.best}${over?" — BREACHED. RETRY.":""}`;
}
function toggleGame(){
  const cv=document.getElementById("gameCv"); if(!cv) return;
  if(!G){G={cv:cv,ctx:cv.getContext("2d"),W:cv.width,H:cv.height,run:false,score:0,lives:3,best:gameBest(),items:[],px:320,dir:0,t:0};}
  const btn=document.getElementById("gameBtn");
  if(G.run){G.run=false;btn.textContent="RESUME →";return;}
  if(G.lives<=0){G.score=0;G.lives=3;G.items=[];}
  G.run=true;btn.textContent="PAUSE";gameHud(false);
  requestAnimationFrame(gameTick);
}
function gameTick(){
  if(!G||!G.run) return;
  const ctx=G.ctx,W=G.W,H=G.H; G.t++;
  ctx.fillStyle="#04070b";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="rgba(255,51,85,.12)";ctx.lineWidth=1;
  for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  if(G.t%42===0){const r=Math.random();
    G.items.push({x:20+Math.random()*(W-40),y:-16,k:r<.68?"ok":(r<.93?"bad":"gold"),v:1.4+Math.random()*1.2+G.score/900});}
  G.px=Math.max(30,Math.min(W-30,G.px+(G.dir||0)*5));
  ctx.fillStyle="#FF3355";ctx.fillRect(G.px-34,H-16,68,10);
  ctx.fillStyle="rgba(255,51,85,.35)";ctx.fillRect(G.px-34,H-26,68,4);
  G.items=G.items.filter(p=>{
    p.y+=p.v;
    const caught=p.y>H-26&&p.y<H-4&&Math.abs(p.x-G.px)<38;
    if(caught){
      if(p.k==="ok")G.score+=10;
      else if(p.k==="gold")G.score+=50;
      else{G.lives--;
        const cv=document.getElementById("gameCv");
        cv.classList.remove("hit");void cv.offsetWidth;cv.classList.add("hit");}
      gameHud(false);return false;
    }
    if(p.y>H+20)return false;
    ctx.fillStyle=p.k==="ok"?"#00ffa3":(p.k==="gold"?"#FFB020":"#FF3B30");
    ctx.fillRect(p.x-7,p.y-7,14,14);
    ctx.fillStyle="#04070b";ctx.font="9px monospace";ctx.textAlign="center";
    ctx.fillText(p.k==="ok"?"01":(p.k==="gold"?"◉":"×"),p.x,p.y+3);
    return true;
  });
  if(G.lives<=0){G.run=false;
    if(G.score>G.best){G.best=G.score;try{localStorage.setItem("holy_packet_best",G.best)}catch(e){}toast("◉ NEW PACKET RECORD — "+G.best);}
    document.getElementById("gameBtn").textContent="RETRY →";gameHud(true);}
  requestAnimationFrame(gameTick);
}
function gameInput(){
  const cv=document.getElementById("gameCv"); if(!cv||cv.dataset.wired) return;
  cv.dataset.wired="1";
  const move=e=>{if(!G)return;const r=cv.getBoundingClientRect();
    const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
    G.px=Math.max(30,Math.min(G.W-30,x/r.width*G.W));};
  cv.addEventListener("mousemove",move);
  cv.addEventListener("touchmove",e=>{e.preventDefault();move(e);},{passive:false});
  addEventListener("keydown",e=>{
    if(!G||!G.run)return;
    const t=document.activeElement;
    if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return;
    if(e.key==="ArrowLeft")G.dir=-1; if(e.key==="ArrowRight")G.dir=1;});
  addEventListener("keyup",()=>{if(G)G.dir=0;});
}
document.addEventListener("DOMContentLoaded",()=>{
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("vis");io.unobserve(e.target);}}),{threshold:.12});
  $$(".reveal").forEach(el=>io.observe(el));
  $("#burger").onclick=()=>$("#mmenu").classList.add("open");
  $("#mclose").onclick=()=>$("#mmenu").classList.remove("open");
  $$("#mmenu a.big").forEach(a=>a.onclick=()=>$("#mmenu").classList.remove("open"));
  const tV=$("#tabVuln"), tS=$("#tabSec"), tL=$("#tabLab"), tP=$("#tabProfile");
  const paint=which=>{tV.className="btn "+(which==="vuln"?"btn-p":"btn-g");
    tS.className="btn "+(which==="sec"?"btn-p":"btn-g");
    tL.className="btn "+(which==="lab"?"btn-p":"btn-g");
    tP.className="btn "+(which==="prof"?"btn-p":"btn-g");};
  tV.onclick=()=>{paint("vuln");quizStart(QUIZ_VULN,"vuln");};
  tS.onclick=()=>{paint("sec");quizStart(QUIZ_SEC,"sec");};
  tL.onclick=()=>{paint("lab");renderVulnLab();};
  tP.onclick=()=>{paint("prof");renderProfile();};
  safe(()=>quizStart(QUIZ_VULN));
  safe(()=>{$$("#toolTabs .btn").forEach(b=>b.onclick=()=>renderTool(b.dataset.tool));});
  safe(()=>renderTool("hash")); safe(()=>renderDaily()); safe(()=>renderCtf()); safe(()=>renderPersonal());
  safe(()=>renderTrophies()); safe(()=>renderDashboard());
  safe(()=>{gameInput();const gb=document.getElementById("gameBtn");if(gb)gb.onclick=toggleGame;});
  safe(()=>sbInit());
  $("#boardSec").onclick=()=>loadBoard("sec");
  $("#boardVuln").onclick=()=>loadBoard("vuln");
  $("#boardGo").onclick=()=>loadBoard();
function localAv(){try{const p=JSON.parse(localStorage.getItem("holy_profile")||"null");return (p&&p.avatar)||0}catch(e){return 0}}
  $("#sbUp").onclick=async ()=>{
    if(!SB){toast("Cloud off — add project keys first.");return;}
    const call=document.getElementById("sbCall").value.replace(/[<>&"]/g,"").trim().slice(0,20);
    const em=document.getElementById("sbEmail").value.trim(), pw=document.getElementById("sbPass").value;
    if(!call){toast("Pick a public callsign first.");return;}
    if(!em||pw.length<8){toast("Email + 8-char password required.");return;}
    try{
      const r=await SB.auth.signUp({email:em,password:pw,options:{data:{callsign:call}}});
      if(r.error) throw r.error;
      if(r.data.session){sbUser=r.data.session.user;
        const up=await SB.from("profiles").upsert({id:sbUser.id,callsign:call,avatar:localAv()});
        if(up.error) throw up.error;
        sbPaint(); toast("◉ ACCOUNT LIVE — welcome, "+call);
      } else {sbStatus("account created — confirm via inbox (or disable confirm-email), then LOG IN.");toast("Check your inbox, then log in.");}
    }catch(e){toast("Signup failed: "+(e.message||"unknown"));}
  };
  $("#sbIn").onclick=async ()=>{
    if(!SB){toast("Cloud off — add project keys first.");return;}
    try{
      const r=await SB.auth.signInWithPassword({email:document.getElementById("sbEmail").value.trim(),password:document.getElementById("sbPass").value});
      if(r.error) throw r.error;
      sbUser=r.data.user; sbPaint(); loadBoard(); toast("◉ LOGGED IN");
      try{await SB.from("profiles").update({avatar:localAv()}).eq("id",sbUser.id);}catch(e){}
    }catch(e){toast("Login failed: "+(e.message||"unknown"));}
  };
  $("#sbOut").onclick=async ()=>{if(SB) await SB.auth.signOut(); sbUser=null; sbPaint();};
  $("#callsignBtn").onclick=()=>{
    const v=document.getElementById("callsignIn").value.replace(/[<>&"]/g,"").trim().slice(0,24);
    if(!v){toast("Pick a callsign first.");return;}
    if(["holy","holysec","khalifa","administrator","admin","root","system","moderator","official","support","security","owner"].includes(v.toLowerCase())){toast("That callsign is reserved.");return;}
    try{localStorage.setItem("holy_profile",JSON.stringify({callsign:v,since:Date.now()}))}catch(e){}
    document.getElementById("callsignIn").value="";
    renderDashboard(); toast("◉ OPERATIVE "+v+" ENLISTED");
  };
  $("#dashExport").onclick=()=>{
    const d={};["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily"].forEach(k=>{try{d[k]=JSON.parse(localStorage.getItem(k)||"{}")}catch(e){}});
    const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="holy-record.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000); toast("Record exported.");
  };
  $("#dashReset").onclick=()=>{
    if(!confirm("Wipe this browser's service record?"))return;
    ["holy_profile","holy_ach","holy_seals","holy_flags","holy_best","holy_cmds","holy_daily","holy_vault"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
    renderDashboard(); renderTrophies(); toast("Record wiped. Fresh start.");
  };
});
})();
